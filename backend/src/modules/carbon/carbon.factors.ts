/**
 * Standardized Circular Packaging Emission Factors Library
 * Derived from GHG Protocol Scope 3 (Category 1 & 4), EPA WARM, and DEFRA emissions databases.
 * Version: 2026.1-ghg-lca
 */

export interface MaterialEmissionFactor {
  category: string;
  subtype: string;
  efVirgin: number;      // kg CO2e / kg material (virgin production avoided)
  efReprocess: number;   // kg CO2e / kg material (collection, sorting, cleaning, reprocessing)
  typicalPalletKg?: number; // typical unit weight if applicable
}

export const METHODOLOGY_VERSION = 'GHG-Protocol-Scope3-v2026.1';

/**
 * Standard DEFRA / EPA freight emissions factor for heavy goods vehicles (HGV / diesel rigid & articulated)
 * Unit: kg CO2e per tonne-km
 * Default: 0.105 kg CO2e / (tonne * km)
 */
export const DEFAULT_EF_FREIGHT_PER_TONNE_KM = 0.105;

/**
 * Default truck capacity utilization factor (e.g., 80% full load on average)
 */
export const DEFAULT_LOAD_FACTOR = 0.80;

/**
 * Comprehensive emission factors mapped by material category and subtype
 */
export const MATERIAL_EMISSION_FACTORS: Record<string, MaterialEmissionFactor> = {
  // Cardboard & Paper packaging
  'cardboard:occ': {
    category: 'cardboard',
    subtype: 'occ',
    efVirgin: 1.15,
    efReprocess: 0.18,
  },
  'cardboard:die-cut': {
    category: 'cardboard',
    subtype: 'die-cut',
    efVirgin: 1.10,
    efReprocess: 0.16,
  },
  'cardboard:rolls': {
    category: 'cardboard',
    subtype: 'rolls',
    efVirgin: 1.05,
    efReprocess: 0.15,
  },
  'cardboard:default': {
    category: 'cardboard',
    subtype: 'default',
    efVirgin: 1.10,
    efReprocess: 0.18,
  },

  // Plastics (Films, Totes, Strapping, Drums)
  'plastics:ldpe': {
    category: 'plastics',
    subtype: 'ldpe',
    efVirgin: 2.15,
    efReprocess: 0.42,
  },
  'plastics:hdpe': {
    category: 'plastics',
    subtype: 'hdpe',
    efVirgin: 1.95,
    efReprocess: 0.38,
  },
  'plastics:pp': {
    category: 'plastics',
    subtype: 'pp',
    efVirgin: 1.90,
    efReprocess: 0.36,
  },
  'plastics:default': {
    category: 'plastics',
    subtype: 'default',
    efVirgin: 2.00,
    efReprocess: 0.40,
  },

  // Pallets (Wooden & Plastic)
  'pallets:wood-48x40': {
    category: 'pallets',
    subtype: 'wood-48x40',
    efVirgin: 0.48, // kg CO2e/kg timber extraction & milling
    efReprocess: 0.06, // refurbishment & inspection
    typicalPalletKg: 20,
  },
  'pallets:wood-epal': {
    category: 'pallets',
    subtype: 'wood-epal',
    efVirgin: 0.50,
    efReprocess: 0.07,
    typicalPalletKg: 25,
  },
  'pallets:plastic-hdpe': {
    category: 'pallets',
    subtype: 'plastic-hdpe',
    efVirgin: 2.05,
    efReprocess: 0.35,
    typicalPalletKg: 15,
  },
  'pallets:default': {
    category: 'pallets',
    subtype: 'default',
    efVirgin: 0.50,
    efReprocess: 0.08,
    typicalPalletKg: 20,
  },

  // Drums & Containers
  'drums:steel-55gal': {
    category: 'drums',
    subtype: 'steel-55gal',
    efVirgin: 2.80,
    efReprocess: 0.45,
  },
  'drums:plastic-55gal': {
    category: 'drums',
    subtype: 'plastic-55gal',
    efVirgin: 2.10,
    efReprocess: 0.40,
  },
  'drums:default': {
    category: 'drums',
    subtype: 'default',
    efVirgin: 2.40,
    efReprocess: 0.42,
  },

  // Gaylords (Heavy duty bulk corrugated boxes)
  'gaylords:heavy-corrugated': {
    category: 'gaylords',
    subtype: 'heavy-corrugated',
    efVirgin: 1.25,
    efReprocess: 0.20,
  },
  'gaylords:default': {
    category: 'gaylords',
    subtype: 'default',
    efVirgin: 1.20,
    efReprocess: 0.20,
  },
};

/**
 * Resolve emission factors for a given material category and subtype
 */
export function getEmissionFactors(category: string, subtype?: string): MaterialEmissionFactor {
  const normCat = (category || 'cardboard').toLowerCase().trim();
  const normSub = (subtype || '').toLowerCase().trim();

  // Try exact match e.g. "plastics:ldpe"
  if (normSub) {
    const key = `${normCat}:${normSub}`;
    if (MATERIAL_EMISSION_FACTORS[key]) {
      return MATERIAL_EMISSION_FACTORS[key];
    }
    // Partial substring match in subtype
    for (const [k, factor] of Object.entries(MATERIAL_EMISSION_FACTORS)) {
      if (k.startsWith(`${normCat}:`) && (normSub.includes(factor.subtype) || factor.subtype.includes(normSub))) {
        return factor;
      }
    }
  }

  // Fallback to category default
  const defaultKey = `${normCat}:default`;
  if (MATERIAL_EMISSION_FACTORS[defaultKey]) {
    return MATERIAL_EMISSION_FACTORS[defaultKey];
  }

  // Global conservative fallback
  return {
    category: normCat,
    subtype: normSub || 'general',
    efVirgin: 1.0,
    efReprocess: 0.2,
  };
}
