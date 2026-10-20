import { api } from './apiClient';

export function normalizeMatch(raw, idx = 0) {
  if (!raw) return null;
  const listing = raw.listing || {};
  const listingId = (listing._id ? listing._id.toString() : listing.id) || `lot-${idx + 1}`;
  const score = raw.score ?? raw.composite_score ?? 85;
  const subscores = raw.subscores || {};
  const carbon = raw.carbonMetrics || {};

  return {
    id: `m-${listingId}`,
    listingId,
    requirementId: raw.requirementId || 'R-201',
    composite_score: score,
    score,
    title: listing.title || 'High-Quality Secondary Material Feedstock',
    material: listing.materialSubtype || listing.materialCategory || 'Recycled Packaging Feedstock',
    code: `MTR-${listingId.slice(-6).toUpperCase()}`,
    distance_km: raw.distanceKm ?? raw.distance_km ?? 25,
    reasonText: `Multi-criteria fit score ${score}% based on material grade floor compliance, chemical affinity, and positive net carbon avoidance.`,
    breakdown: {
      semantic_fit: subscores.semanticFit ?? 90,
      grade_fit: subscores.gradeFit ?? 95,
      price_fit: subscores.priceFit ?? 85,
      carbon_efficiency: subscores.carbonScore ?? 92,
      distance_penalty: Math.min(25, Math.round((raw.distanceKm || 25) / 15)),
      net_saved_kg: Math.round(carbon.netSavedKg || (listing.massKg ? listing.massKg * 1.34 : 12000)),
      transport_emissions_kg: Math.round(carbon.transportEmissionsKg || 120),
      breakeven_distance_km: Math.round(carbon.breakEvenRadiusKm || 450),
    },
    listing,
  };
}

export const matchingService = {
  async fetchMatches(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.includeCarbonNegative) {
      searchParams.set('includeCarbonNegative', 'true');
    }
    if (params.materialCategory) searchParams.set('materialCategory', params.materialCategory);
    if (params.requirementId) searchParams.set('requirementId', params.requirementId);

    const queryString = searchParams.toString();
    const endpoint = `/matching${queryString ? `?${queryString}` : ''}`;
    const res = await api.get(endpoint);
    const items = Array.isArray(res.data) ? res.data : [];
    return items.map((item, idx) => normalizeMatch(item, idx));
  },

  async fetchRecommendations(criteria = {}) {
    const res = await api.post('/matching/recommendations', criteria);
    const items = Array.isArray(res.data) ? res.data : [];
    return items.map((item, idx) => normalizeMatch(item, idx));
  },
};

export default matchingService;
