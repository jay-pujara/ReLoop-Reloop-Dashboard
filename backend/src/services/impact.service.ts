export interface ImpactCalculationInput {
  materialType: 'cardboard' | 'plastic' | 'pallets' | string;
  quantity: number;
  unit: string;
}

export interface ImpactMetrics {
  wasteDivertedKg: number;
  virginMaterialAvoidedKg: number;
  co2SavedKg: number;
}

export class ImpactService {
  /**
   * Domain calculation service. Modularized so scientific LCA factors can be plugged in later.
   */
  calculateImpact(input: ImpactCalculationInput): ImpactMetrics {
    let massKg = input.quantity;
    if (input.unit === 'tonnes' || input.unit === 'tons') {
      massKg = input.quantity * 1000;
    } else if (input.unit === 'pallets') {
      massKg = input.quantity * 20; // Average wooden pallet ~20kg
    }

    // Baseline heuristic factors for Phase 1 scaffolding
    const co2Factor = input.materialType.toLowerCase() === 'plastic' ? 1.8 : 0.9;

    return {
      wasteDivertedKg: Math.round(massKg * 10) / 10,
      virginMaterialAvoidedKg: Math.round(massKg * 0.95 * 10) / 10,
      co2SavedKg: Math.round(massKg * co2Factor * 10) / 10,
    };
  }
}

export const impactService = new ImpactService();
