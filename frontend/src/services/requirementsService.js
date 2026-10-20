import { api } from './apiClient';

export function normalizeRequirement(raw) {
  if (!raw) return null;
  const id = raw._id ? raw._id.toString() : raw.id;
  return {
    id,
    _id: id,
    title: raw.title || `${raw.materialCategory?.toUpperCase() || 'MATERIAL'} Recurring Sourcing Lot`,
    materialCategory: raw.materialCategory || 'Cardboard',
    materialSubtype: raw.materialSubtype || 'General OCC Feedstock',
    minGrade: raw.minGrade ? (raw.minGrade.startsWith('Grade') ? raw.minGrade : `Grade ${raw.minGrade}`) : 'Grade B',
    quantity: raw.massKgPerPeriod || raw.quantity || 15000,
    unit: raw.period ? `kg/${raw.period}` : 'kg/month',
    maxPricePerKg: raw.maxPricePerKg || 0.20,
    maxDistanceKm: raw.maxDistanceKm || 300,
    status: raw.status ? (raw.status.charAt(0).toUpperCase() + raw.status.slice(1)) : 'Active',
    matchesCount: raw.matchesCount || 3,
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

export const requirementsService = {
  async fetchRequirements() {
    const res = await api.get('/requirements');
    const items = Array.isArray(res.data) ? res.data : (res.data?.items || []);
    return items.map(normalizeRequirement);
  },

  async createRequirement(data) {
    const payload = {
      facilityId: data.facilityId,
      materialCategory: (data.materialCategory || 'cardboard').toLowerCase(),
      materialSubtype: (data.materialSubtype || 'occ').toLowerCase(),
      minGrade: data.minGrade ? data.minGrade.replace('Grade ', '').trim() : 'B',
      massKgPerPeriod: Number(data.quantity || data.massKgPerPeriod || 10000),
      period: data.period || 'monthly',
      maxPricePerKg: data.maxPricePerKg ? Number(data.maxPricePerKg) : undefined,
      maxDistanceKm: data.maxDistanceKm ? Number(data.maxDistanceKm) : 500,
    };

    const res = await api.post('/requirements', payload);
    return normalizeRequirement(res.data);
  },

  async pauseRequirement(id) {
    const res = await api.post(`/requirements/${id}/pause`, {});
    return normalizeRequirement(res.data);
  },

  async resumeRequirement(id) {
    const res = await api.post(`/requirements/${id}/resume`, {});
    return normalizeRequirement(res.data);
  },

  async closeRequirement(id) {
    const res = await api.post(`/requirements/${id}/close`, {});
    return normalizeRequirement(res.data);
  },
};

export default requirementsService;
