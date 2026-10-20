import mongoose from 'mongoose';
import { ListingModel, IListing } from '../listings/listing.model.js';
import { RequirementModel, RequirementGrade } from '../requirements/requirement.model.js';
import { FacilityModel } from '../facilities/facilities.model.js';
import { gradeMeetsMinimum } from '../requirements/grade.utils.js';
import { carbonService } from '../carbon/carbon.service.js';

export interface MatchingCriteria {
  requirementId?: string;
  listingId?: string;
  materialCategory?: string;
  materialSubtype?: string;
  materialType?: string; // backwards compatibility
  requiredQuantity?: number;
  massKg?: number;
  minGrade?: 'A' | 'B' | 'C' | 'reject';
  buyerLocation?: {
    longitude: number;
    latitude: number;
  };
  maxDistanceKm?: number;
  maxPricePerUnit?: number;
  maxPricePerKg?: number;
  preferredCondition?: string;
  includeCarbonNegative?: boolean;
}

export interface MatchResultItem {
  score: number;
  subscores: {
    semanticFit: number;
    gradeFit: number;
    priceFit: number;
    carbonScore: number;
    timingFit: number;
  };
  carbonMetrics: {
    grossAvoidedKg: number;
    reprocessKg: number;
    transportEmissionsKg: number;
    netSavedKg: number;
    breakEvenRadiusKm: number;
    classification: string;
  };
  distanceKm: number;
  listing: IListing;
}

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 1.2 * 10) / 10; // Driving factor ~1.2
}

export class MatchingService {
  /**
   * Deterministic Multi-Criteria Matching Engine (PRD Tier 3)
   * Formula:
   *   score = 0.25 * semantic_fit + 0.20 * grade_fit + 0.15 * price_fit + 0.30 * carbon_score + 0.10 * timing_fit
   * Hard filters:
   *   - Material category compatibility
   *   - Grade floor check (listing.grade meets requirement.minGrade)
   *   - Geographic feasibility & max haul distance
   *   - Carbon Negative Suppression: net_saved_kg > 0 and distance <= breakEvenRadiusKm
   */
  async findMatches(criteria: MatchingCriteria): Promise<MatchResultItem[]> {
    let targetCategory = criteria.materialCategory || criteria.materialType;
    let targetSubtype = criteria.materialSubtype;
    let targetMinGrade: RequirementGrade = (criteria.minGrade as RequirementGrade) || 'C';
    let targetMass = criteria.massKg || criteria.requiredQuantity || 1000;
    let targetMaxPrice = criteria.maxPricePerKg ?? criteria.maxPricePerUnit;
    let buyerCoords = criteria.buyerLocation;
    let maxDistance = criteria.maxDistanceKm ?? 500;
    let buyerOrganizationId: mongoose.Types.ObjectId | undefined;

    // If requirementId is provided, pull exact criteria from the persisted requirement
    if (criteria.requirementId && mongoose.isValidObjectId(criteria.requirementId)) {
      const requirement = await RequirementModel.findById(criteria.requirementId);
      if (requirement) {
        buyerOrganizationId = requirement.organizationId;
        targetCategory = requirement.materialCategory;
        targetSubtype = requirement.materialSubtype;
        targetMinGrade = requirement.minGrade;
        targetMass = requirement.massKgPerPeriod;
        targetMaxPrice = requirement.maxPricePerKg;
        if (requirement.maxDistanceKm) maxDistance = requirement.maxDistanceKm;

        const buyerFacility = await FacilityModel.findById(requirement.facilityId);
        if (buyerFacility?.location?.coordinates) {
          buyerCoords = {
            longitude: buyerFacility.location.coordinates[0],
            latitude: buyerFacility.location.coordinates[1],
          };
        }
      }
    }

    // Normalized category
    const normCategory = targetCategory ? targetCategory.toLowerCase().trim() : undefined;

    // Build listing query: published, not deleted
    const listingQuery: Record<string, any> = {
      isDeleted: false,
      status: 'published',
    };

    if (normCategory) {
      // Map 'plastic' -> 'plastics'
      const catVal = normCategory === 'plastic' ? 'plastics' : normCategory;
      listingQuery.materialCategory = catVal;
    }
    if (targetSubtype) listingQuery.materialSubtype = targetSubtype.toLowerCase().trim();
    if (buyerOrganizationId) listingQuery.organizationId = { $ne: buyerOrganizationId };

    const candidateListings = await ListingModel.find(listingQuery)
      .populate('facilityId')
      .populate('organizationId', 'name verified address contactEmail')
      .limit(100);

    const matches: MatchResultItem[] = [];

    for (const listing of candidateListings) {
      // 1. HARD FILTER: Grade floor check
      if (listing.grade && !gradeMeetsMinimum(listing.grade as RequirementGrade, targetMinGrade)) {
        continue;
      }

      // 2. Determine physical distance between buyer and listing facility
      let distanceKm = 25; // Default local radius if coordinates not specified
      const listingFacility = listing.facilityId as any;
      if (
        buyerCoords &&
        listingFacility?.location?.coordinates &&
        Array.isArray(listingFacility.location.coordinates)
      ) {
        const [listingLon, listingLat] = listingFacility.location.coordinates;
        distanceKm = calculateDistanceKm(buyerCoords.latitude, buyerCoords.longitude, listingLat, listingLon);
      }

      if (maxDistance && distanceKm > maxDistance) {
        continue;
      }

      // 3. HARD FILTER: Deterministic Carbon Check & Negative Avoidance Suppression
      const effectiveMass = Math.min(listing.massKg, targetMass);
      const carbonMetrics = carbonService.calculateMetrics({
        materialCategory: listing.materialCategory,
        materialSubtype: listing.materialSubtype,
        massKg: effectiveMass,
        distanceKm,
      });

      // Strict PRD Requirement: suppress any trade where transport emissions erase avoided emissions unless user explicitly enabled toggle
      if (!criteria.includeCarbonNegative) {
        if (carbonMetrics.netSavedKg <= 0 || (carbonMetrics.breakEvenRadiusKm > 0 && distanceKm > carbonMetrics.breakEvenRadiusKm)) {
          continue;
        }
      }

      // 4. MULTI-CRITERIA SCORING CALCULATIONS

      // A. Semantic Fit (25% weight): Subtype alignment & keyword overlap
      let semanticFit = 70;
      if (targetSubtype) {
        const tSub = targetSubtype.toLowerCase();
        const lSub = (listing.materialSubtype || '').toLowerCase();
        if (tSub === lSub) {
          semanticFit = 100;
        } else if (lSub.includes(tSub) || tSub.includes(lSub)) {
          semanticFit = 85;
        }
      }

      // B. Grade Fit (20% weight):
      // Exact grade match = 100; Listing grade exceeds requirement = 90; Lower = 70
      let gradeFit = 80;
      if (listing.grade === targetMinGrade) {
        gradeFit = 100;
      } else if (gradeMeetsMinimum(listing.grade as RequirementGrade, targetMinGrade)) {
        gradeFit = 90;
      }

      // C. Price Fit (15% weight):
      let priceFit = 80;
      const listingPrice = listing.askingPrice?.amount;
      if (listingPrice === undefined || listingPrice === 0) {
        priceFit = 100; // Free circular claim gets maximum score
      } else if (targetMaxPrice !== undefined && targetMaxPrice > 0) {
        if (listingPrice <= targetMaxPrice) {
          priceFit = Math.min(100, Math.round((targetMaxPrice / Math.max(0.01, listingPrice)) * 80));
        } else {
          priceFit = Math.max(20, Math.round((targetMaxPrice / listingPrice) * 60));
        }
      }

      // D. Carbon Score (30% weight):
      // Ratio of net saved CO2 to gross avoided emissions (penalizes long haul distances)
      const carbonEfficiency = carbonMetrics.grossAvoidedKg > 0
        ? Math.max(0, Math.min(1.0, carbonMetrics.netSavedKg / carbonMetrics.grossAvoidedKg))
        : 0.5;
      const carbonScore = Math.round(carbonEfficiency * 100);

      // E. Timing Fit (10% weight):
      // Check if listing is currently available
      const now = new Date();
      let timingFit = 80;
      if (listing.availableFrom <= now && listing.availableUntil >= now) {
        timingFit = 100;
      }

      // Composite Deterministic Score:
      const compositeScore = Math.round(
        0.25 * semanticFit +
        0.20 * gradeFit +
        0.15 * priceFit +
        0.30 * carbonScore +
        0.10 * timingFit
      );

      matches.push({
        score: compositeScore,
        subscores: {
          semanticFit,
          gradeFit,
          priceFit,
          carbonScore,
          timingFit,
        },
        carbonMetrics: {
          grossAvoidedKg: carbonMetrics.grossAvoidedKg,
          reprocessKg: carbonMetrics.reprocessKg,
          transportEmissionsKg: carbonMetrics.transportEmissionsKg,
          netSavedKg: carbonMetrics.netSavedKg,
          breakEvenRadiusKm: carbonMetrics.breakEvenRadiusKm,
          classification: carbonMetrics.classification,
        },
        distanceKm,
        listing,
      });
    }

    // Sort descending by highest composite multi-criteria match score
    return matches.sort((a, b) => b.score - a.score);
  }
}

export const matchingService = new MatchingService();
