import { CarbonModel, ICarbon } from './carbon.model.js';
import { OrganizationAuditModel } from '../organizations/audit.model.js';
import { Types } from 'mongoose';
import {
  getEmissionFactors,
  DEFAULT_EF_FREIGHT_PER_TONNE_KM,
  DEFAULT_LOAD_FACTOR,
  METHODOLOGY_VERSION,
} from './carbon.factors.js';

export interface CarbonCalculationInput {
  materialCategory: string;
  materialSubtype?: string;
  massKg: number;
  distanceKm?: number;
  totalShipmentMassKg?: number;
  efFreight?: number;
  loadFactor?: number;
}

export interface CarbonMetrics {
  massKg: number;
  distanceKm: number;
  efVirgin: number;
  efReprocess: number;
  efFreight: number;
  loadFactor: number;
  allocatedKm: number;
  grossAvoidedKg: number;
  reprocessKg: number;
  transportEmissionsKg: number;
  netSavedKg: number;
  breakEvenRadiusKm: number;
  classification: 'carbon-positive' | 'marginal' | 'carbon-negative';
  methodologyVersion: string;
}

/**
 * Deterministic Circular Economy Carbon Engine
 * Implements exact PRD formulas:
 *   gross_avoided_kg = mass_kg * EF_virgin
 *   reprocess_kg = mass_kg * EF_reprocess
 *   allocated_km = distance_km * (mass_kg / total_shipment_mass_kg)
 *   transport_kg = (mass_kg / 1000) * allocated_km * EF_freight / load_factor
 *   net_saved_kg = gross_avoided_kg - reprocess_kg - transport_kg
 *   breakeven_radius_km = ((gross_avoided_kg - reprocess_kg) * load_factor) / ((mass_kg / 1000) * EF_freight)
 */
export class CarbonService {
  /**
   * Deterministic calculation of avoided vs generated emissions
   */
  calculateMetrics(input: CarbonCalculationInput): CarbonMetrics {
    const factors = getEmissionFactors(input.materialCategory, input.materialSubtype);
    const massKg = Math.max(0, input.massKg || 0);
    const distanceKm = Math.max(0, input.distanceKm || 0);
    const totalShipmentMassKg = Math.max(massKg, input.totalShipmentMassKg || massKg);

    const efVirgin = factors.efVirgin;
    const efReprocess = factors.efReprocess;
    const efFreight = input.efFreight ?? DEFAULT_EF_FREIGHT_PER_TONNE_KM;
    const loadFactor = Math.max(0.1, Math.min(1.0, input.loadFactor ?? DEFAULT_LOAD_FACTOR));

    // 1. Gross avoided virgin emissions (Scope 3 Category 1)
    const grossAvoidedKg = Number((massKg * efVirgin).toFixed(3));

    // 2. Reprocessing / refurbishing emissions
    const reprocessKg = Number((massKg * efReprocess).toFixed(3));

    // 3. Freight distance allocation: allocated_km = distance_km * (mass_kg / total_shipment_mass_kg)
    const massRatio = totalShipmentMassKg > 0 ? massKg / totalShipmentMassKg : 1.0;
    const allocatedKm = Number((distanceKm * massRatio).toFixed(2));

    // 4. Transport emissions: (mass_kg / 1000) * allocated_km * EF_freight / load_factor
    const tonnes = massKg / 1000;
    const transportEmissionsKg = Number(((tonnes * allocatedKm * efFreight) / loadFactor).toFixed(3));

    // 5. Net saved CO2e
    const netSavedKg = Number((grossAvoidedKg - reprocessKg - transportEmissionsKg).toFixed(3));

    // 6. Break-even radius calculation (in km):
    // Net saved = 0 => transportEmissions = grossAvoided - reprocess
    // (mass/1000) * radius * efFreight / loadFactor = (grossAvoided - reprocess)
    // radius = ((grossAvoided - reprocess) * loadFactor) / ((mass/1000) * efFreight)
    let breakEvenRadiusKm = 0;
    const netProductionBenefit = grossAvoidedKg - reprocessKg;
    if (netProductionBenefit > 0 && tonnes > 0 && efFreight > 0) {
      breakEvenRadiusKm = Number(((netProductionBenefit * loadFactor) / (tonnes * efFreight)).toFixed(1));
    }

    // 7. Classification
    let classification: 'carbon-positive' | 'marginal' | 'carbon-negative' = 'carbon-positive';
    if (netSavedKg <= 0) {
      classification = 'carbon-negative';
    } else if (netSavedKg < 0.05 * grossAvoidedKg) {
      classification = 'marginal';
    }

    return {
      massKg,
      distanceKm,
      efVirgin,
      efReprocess,
      efFreight,
      loadFactor,
      allocatedKm,
      grossAvoidedKg,
      reprocessKg,
      transportEmissionsKg,
      netSavedKg,
      breakEvenRadiusKm,
      classification,
      methodologyVersion: METHODOLOGY_VERSION,
    };
  }

  /**
   * Calculates carbon metrics and persists the auditable record in MongoDB
   */
  async calculateAndSave(
    entityId: Types.ObjectId,
    entityType: string,
    quantityOrMassKg: number,
    extra?: {
      materialCategory?: string;
      materialSubtype?: string;
      distanceKm?: number;
      actorId?: string | Types.ObjectId;
      organizationId?: string | Types.ObjectId;
      [key: string]: unknown;
    }
  ): Promise<ICarbon> {
    const category = extra?.materialCategory || 'cardboard';
    const subtype = extra?.materialSubtype;
    const distanceKm = Number(extra?.distanceKm) || 0;

    const metrics = this.calculateMetrics({
      materialCategory: category,
      materialSubtype: subtype,
      massKg: quantityOrMassKg,
      distanceKm,
    });

    const carbonRecord = await CarbonModel.create({
      entityId,
      entityType,
      carbonKg: metrics.netSavedKg,
      grossAvoidedKg: metrics.grossAvoidedKg,
      reprocessKg: metrics.reprocessKg,
      transportKg: metrics.transportEmissionsKg,
      netSavedKg: metrics.netSavedKg,
      breakEvenRadiusKm: metrics.breakEvenRadiusKm,
      classification: metrics.classification,
      materialCategory: category,
      materialSubtype: subtype,
      massKg: metrics.massKg,
      distanceKm: metrics.distanceKm,
      efVirgin: metrics.efVirgin,
      efReprocess: metrics.efReprocess,
      efFreight: metrics.efFreight,
      loadFactor: metrics.loadFactor,
      methodologyVersion: METHODOLOGY_VERSION,
      metadata: extra,
    });

    // Safe audit logging: ensure valid ObjectId for actor & organization
    const validActorId = extra?.actorId && Types.ObjectId.isValid(extra.actorId.toString())
      ? new Types.ObjectId(extra.actorId.toString())
      : entityId;
    const validOrgId = extra?.organizationId && Types.ObjectId.isValid(extra.organizationId.toString())
      ? new Types.ObjectId(extra.organizationId.toString())
      : validActorId;

    await OrganizationAuditModel.create({
      actorId: validActorId,
      organizationId: validOrgId,
      action: 'CARBON_CALCULATION',
      target: entityId.toHexString(),
      metadata: {
        entityType,
        massKg: metrics.massKg,
        netSavedKg: metrics.netSavedKg,
        classification: metrics.classification,
        breakEvenRadiusKm: metrics.breakEvenRadiusKm,
      },
    });

    return carbonRecord;
  }

  /**
   * Record actual carbon after logistics completion (actual measured vehicle telemetry)
   */
  async recordActualCarbon(
    entityId: Types.ObjectId,
    actualKg: number,
    extra?: {
      actorId?: string | Types.ObjectId;
      organizationId?: string | Types.ObjectId;
      [key: string]: unknown;
    }
  ): Promise<ICarbon> {
    const carbon = await CarbonModel.findOneAndUpdate(
      { entityId },
      {
        carbonKg: actualKg,
        netSavedKg: actualKg,
        $set: { metadata: extra },
      },
      { new: true }
    );
    if (!carbon) {
      throw new Error('Carbon record not found for entity');
    }

    const validActorId = extra?.actorId && Types.ObjectId.isValid(extra.actorId.toString())
      ? new Types.ObjectId(extra.actorId.toString())
      : entityId;
    const validOrgId = extra?.organizationId && Types.ObjectId.isValid(extra.organizationId.toString())
      ? new Types.ObjectId(extra.organizationId.toString())
      : validActorId;

    await OrganizationAuditModel.create({
      actorId: validActorId,
      organizationId: validOrgId,
      action: 'CARBON_ACTUAL_RECORDED',
      target: entityId.toHexString(),
      metadata: { actualKg },
    });

    return carbon;
  }
}

export const carbonService = new CarbonService();
