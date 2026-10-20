import { routingService } from '../../services/routing.service.js';
import { carbonService } from '../carbon/carbon.service.js';
import { RouteModel } from './route.model.js';
import { OrganizationAuditModel } from '../organizations/audit.model.js';
import { Types } from 'mongoose';

export interface RouteShipmentInput {
  shipmentId?: string;
  origin: { longitude: number; latitude: number; address?: string };
  destination: { longitude: number; latitude: number; address?: string };
  weightKg?: number;
  pallets?: number;
}

export interface PlanOptions {
  vehicleCapacityKg?: number;
  vehiclePalletCapacity?: number;
  actorId?: string;
  organizationId?: string;
}

/**
 * Service handling logistics consolidation & route optimization (PRD Tier 5 / F8)
 */
export class RouteService {
  /**
   * Generate an optimized route plan for a list of shipments with payload capacity and consolidation
   */
  async plan(shipments: RouteShipmentInput[], options?: PlanOptions) {
    const maxCapacityKg = options?.vehicleCapacityKg || 18000; // Standard 24ft box / 53ft trailer
    const maxPallets = options?.vehiclePalletCapacity || 26;

    let totalWeightKg = 0;
    let totalPallets = 0;
    const planSegments = [];
    const shipmentIds: Types.ObjectId[] = [];

    for (const shipment of shipments) {
      if (shipment.shipmentId && Types.ObjectId.isValid(shipment.shipmentId)) {
        shipmentIds.push(new Types.ObjectId(shipment.shipmentId));
      }

      const weight = shipment.weightKg || 1000;
      const pallets = shipment.pallets || Math.ceil(weight / 500);

      totalWeightKg += weight;
      totalPallets += pallets;

      const estimate = await routingService.calculateRoute(
        { longitude: shipment.origin.longitude, latitude: shipment.origin.latitude },
        { longitude: shipment.destination.longitude, latitude: shipment.destination.latitude }
      );

      planSegments.push({
        ...shipment,
        weightKg: weight,
        pallets,
        estimate,
      });
    }

    // Compute vehicle capacity utilization / load factor
    const weightUtilization = Math.min(1.0, totalWeightKg / maxCapacityKg);
    const volumeUtilization = Math.min(1.0, totalPallets / maxPallets);
    const estimatedLoadFactor = Number(Math.max(0.2, Math.max(weightUtilization, volumeUtilization)).toFixed(2));

    const totalDistanceKm = planSegments.reduce((acc, s) => acc + (s.estimate?.distanceKm || 0), 0);
    const totalDurationMinutes = planSegments.reduce((acc, s) => acc + (s.estimate?.durationMinutes || 0), 0);

    const consolidatedPlan = {
      segments: planSegments,
      summary: {
        totalShipments: shipments.length,
        totalWeightKg,
        totalPallets,
        totalDistanceKm,
        totalDurationMinutes,
        vehicleCapacityKg: maxCapacityKg,
        vehiclePalletCapacity: maxPallets,
        loadFactor: estimatedLoadFactor,
        isCapacityExceeded: totalWeightKg > maxCapacityKg || totalPallets > maxPallets,
      },
    };

    const route = await RouteModel.create({
      shipmentIds,
      plan: consolidatedPlan,
      status: 'planned',
    });

    // Valid audit context
    const auditActorId = options?.actorId && Types.ObjectId.isValid(options.actorId)
      ? new Types.ObjectId(options.actorId)
      : route._id;
    const auditOrgId = options?.organizationId && Types.ObjectId.isValid(options.organizationId)
      ? new Types.ObjectId(options.organizationId)
      : auditActorId;

    await OrganizationAuditModel.create({
      actorId: auditActorId,
      organizationId: auditOrgId,
      action: 'ROUTE_PLANNED',
      target: route._id.toHexString(),
      metadata: {
        segmentCount: planSegments.length,
        totalWeightKg,
        totalDistanceKm,
        loadFactor: estimatedLoadFactor,
      },
    });

    return route;
  }

  /**
   * Mark a route as completed and record actual carbon emissions
   */
  async complete(routeId: string, actualKg: number, options?: { actorId?: string; organizationId?: string }) {
    const route = await RouteModel.findByIdAndUpdate(
      routeId,
      { status: 'completed' },
      { new: true }
    );
    if (!route) {
      throw new Error('Route not found');
    }

    const validActorId = options?.actorId && Types.ObjectId.isValid(options.actorId)
      ? new Types.ObjectId(options.actorId)
      : route._id;
    const validOrgId = options?.organizationId && Types.ObjectId.isValid(options.organizationId)
      ? new Types.ObjectId(options.organizationId)
      : validActorId;

    // Record actual carbon – associate with the route entity
    await carbonService.recordActualCarbon(new Types.ObjectId(routeId), actualKg, {
      actorId: validActorId,
      organizationId: validOrgId,
    });

    await OrganizationAuditModel.create({
      actorId: validActorId,
      organizationId: validOrgId,
      action: 'ROUTE_COMPLETED',
      target: routeId,
      metadata: { actualKg },
    });

    return route;
  }
}

export const routeService = new RouteService();
