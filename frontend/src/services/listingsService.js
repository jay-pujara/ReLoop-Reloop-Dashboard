import { api } from './apiClient';

const DEFAULT_PHOTOS = [
  'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&auto=format&fit=crop&q=80',
];

/**
 * Normalizes backend IListing model into the format expected by the frontend pages
 */
export function normalizeListing(raw) {
  if (!raw) return null;
  const id = raw._id ? raw._id.toString() : raw.id;
  const facility = raw.facilityId || {};
  const org = raw.organizationId || {};
  const massKg = raw.massKg ?? raw.mass_kg ?? 1000;
  const price = raw.askingPrice?.amount ?? raw.price_per_kg ?? 0;
  const grade = raw.grade?.startsWith('Grade') ? raw.grade : `Grade ${raw.grade || 'A'}`;

  return {
    id,
    _id: id,
    title: raw.title || 'Secondary Packaging Lot',
    materialCategory: raw.materialCategory || 'plastic',
    materialType: raw.materialCategory || 'plastic',
    materialSubtype: raw.materialSubtype || 'regrind',
    subType: raw.materialSubtype || raw.subType || 'Industrial Scrap',
    grade,
    gradeSource: raw.gradeSource ? (raw.gradeSource === 'ai' ? 'AI (Confidence 95%)' : 'Seller Self-Reported') : 'AI (Confidence 95%)',
    mass_kg: massKg,
    massKg,
    price_per_kg: price,
    unitCount: raw.unitCount || Math.ceil(massKg / 50),
    unit_count: raw.unitCount || Math.ceil(massKg / 50),
    currency: raw.askingPrice?.currency === 'USD' ? '$' : '€',
    carbon_class: raw.carbon_class || (raw.grade === 'reject' ? 'carbon_negative' : 'carbon_positive'),
    net_co2e_saved_kg: raw.net_co2e_saved_kg || Math.round(massKg * 1.34),
    distance_km: raw.distance_km || 35,
    breakeven_radius_km: raw.breakeven_radius_km || 320,
    facilityName: facility.name || raw.facilityName || 'Rotterdam Circular Hub',
    sellerOrg: org.name || raw.sellerOrg || 'BioPolymer Labs Europe',
    isVerified: org.verified ?? raw.isVerified ?? true,
    openToOffers: raw.openToOffers ?? true,
    available_from: raw.availableFrom || raw.available_from || '2026-09-15',
    available_until: raw.availableUntil || raw.available_until || '2026-10-15',
    unit_dimensions: raw.unit_dimensions || '120x100x110 cm',
    photos: (raw.media && raw.media.length > 0) ? raw.media.map(m => m.url || m.downloadUrl) : (raw.photos && raw.photos.length > 0 ? raw.photos : DEFAULT_PHOTOS),
    hotspots: raw.hotspots || [
      { id: 'h1', region: 'top_deck_left', type: 'Surface Cleanliness', severity: 'optimal', x: -0.3, y: 0.5, z: 0.2 },
      { id: 'h2', region: 'center_core', type: 'Density Uniformity', severity: 'optimal', x: 0.0, y: 0.0, z: 0.0 },
    ],
    status: raw.status || 'published',
    gradingStatus: raw.gradingStatus || 'completed',
  };
}

export const listingsService = {
  async fetchListings(queryParams = {}) {
    const searchParams = new URLSearchParams();
    if (queryParams.materialCategory && queryParams.materialCategory !== 'all') {
      searchParams.set('materialCategory', queryParams.materialCategory);
    }
    if (queryParams.grade) searchParams.set('grade', queryParams.grade);
    if (queryParams.limit) searchParams.set('limit', String(queryParams.limit));
    if (queryParams.cursor) searchParams.set('cursor', queryParams.cursor);

    const queryString = searchParams.toString();
    const endpoint = `/listings${queryString ? `?${queryString}` : ''}`;
    const res = await api.get(endpoint);
    
    const rawList = Array.isArray(res.data) ? res.data : (res.data?.items || []);
    return rawList.map(normalizeListing);
  },

  async fetchListingById(id) {
    const res = await api.get(`/listings/${id}`);
    const normalized = normalizeListing(res.data);

    // Also try to fetch breakeven & grading in parallel
    try {
      const [breakEvenRes, gradingRes] = await Promise.allSettled([
        api.get(`/listings/${id}/breakeven`),
        api.get(`/listings/${id}/grading`),
      ]);

      if (breakEvenRes.status === 'fulfilled' && breakEvenRes.value?.success) {
        normalized.breakeven_radius_km = breakEvenRes.value.data?.breakEvenRadiusKm || normalized.breakeven_radius_km;
        normalized.net_co2e_saved_kg = breakEvenRes.value.data?.co2AvoidedKg || normalized.net_co2e_saved_kg;
      }

      if (gradingRes.status === 'fulfilled' && gradingRes.value?.success && gradingRes.value.data) {
        normalized.aiGrading = gradingRes.value.data;
        if (gradingRes.value.data.predictedGrade) {
          normalized.grade = `Grade ${gradingRes.value.data.predictedGrade}`;
          normalized.gradeSource = `AI (Confidence ${Math.round(gradingRes.value.data.confidenceScore * 100)}%)`;
        }
      }
    } catch (_err) {
      // Fallback is gracefully preserved
    }

    return normalized;
  },

  async createListing(data) {
    let cat = (data.materialCategory || data.materialType || 'plastics').toLowerCase();
    if (cat === 'plastic') cat = 'plastics';
    if (cat.includes('pallet')) cat = 'pallets';
    if (cat.includes('cardboard') || cat.includes('occ')) cat = 'cardboard';
    if (cat.includes('drum') || cat.includes('steel')) cat = 'drums';
    if (cat.includes('gaylord') || cat.includes('box')) cat = 'gaylords';
    if (!['cardboard', 'plastics', 'pallets', 'drums', 'gaylords'].includes(cat)) {
      cat = 'plastics';
    }

    let grade = 'A';
    if (data.grade) {
      const g = data.grade.replace('Grade', '').trim().toUpperCase();
      if (['A', 'A+'].includes(g)) grade = 'A';
      else if (['B', 'B+'].includes(g)) grade = 'B';
      else if (['C', 'C+'].includes(g)) grade = 'C';
      else if (g === 'REJECT') grade = 'reject';
    }

    const payload = {
      facilityId: data.facilityId || 'fac-01',
      materialCategory: cat,
      materialSubtype: data.materialSubtype || data.subType || 'regrind',
      title: data.title || 'Secondary Feedstock Lot',
      description: data.description || 'Verified industrial circular feedstock lot inspected via Reloop Vision AI.',
      grade,
      gradeSource: data.gradeSource?.toLowerCase().includes('ai') ? 'ai' : (data.gradeSource?.toLowerCase().includes('manual') ? 'manual' : 'seller'),
      massKg: Math.max(1, Number(data.mass_kg || data.massKg || 1000)),
      unitCount: data.unit_count ? Number(data.unit_count) : (data.unitCount ? Number(data.unitCount) : 1),
      packagingState: data.packagingState || 'reusable',
      availableFrom: data.available_from ? new Date(data.available_from).toISOString() : new Date().toISOString(),
      availableUntil: data.available_until ? new Date(data.available_until).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString(),
      askingPrice: {
        amount: Math.max(0, Number(data.price_per_kg || data.price || 0)),
        currency: data.currency === '$' ? 'USD' : 'EUR',
      },
      openToOffers: data.openToOffers ?? true,
      pickupConstraints: {
        dockHours: { opens: '08:00', closes: '18:00' },
        hasForklift: data.hasForklift ?? true,
        packagingMode: data.packagingMode || 'palletised',
      },
    };

    const res = await api.post('/listings', payload);
    const created = normalizeListing(res.data);

    if (data.photos && data.photos.length > 0) {
      created.photos = data.photos;
    }

    // Auto publish
    try {
      await api.post(`/listings/${created.id}/publish`, {});
    } catch (_err) {
      // Ignore if auto-published
    }

    return created;
  },

  async evaluatePhotos(metadata, files = []) {
    const formData = new FormData();
    if (metadata.materialCategory) formData.append('materialCategory', metadata.materialCategory);
    if (metadata.materialSubtype) formData.append('materialSubtype', metadata.materialSubtype);
    if (metadata.title) formData.append('title', metadata.title);
    if (metadata.description) formData.append('description', metadata.description);

    for (const file of files) {
      formData.append('photos', file);
    }

    const res = await api.post('/listings/evaluate-photos', formData);
    return res.data;
  },

  async triggerAiGrading(listingId) {
    const res = await api.post(`/listings/${listingId}/grade`, {});
    return res.data;
  },

  async uploadMedia(listingId, file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/listings/${listingId}/media`, formData);
    return res.data;
  },
};

export default listingsService;
