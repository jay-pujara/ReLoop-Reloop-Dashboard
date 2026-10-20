import { api } from './apiClient';

export function normalizeOrder(raw) {
  if (!raw) return null;
  const id = raw._id ? raw._id.toString() : raw.id;
  const buyer = raw.buyerOrganizationId || {};
  const seller = raw.sellerOrganizationId || {};
  const listing = raw.listingId || raw.materialId || {};
  const qty = raw.quantity ?? 1000;
  const price = raw.totalPrice ? Number((raw.totalPrice / Math.max(1, qty)).toFixed(2)) : 1.12;

  return {
    id: raw.orderNumber || `ORD-${id.slice(-6).toUpperCase()}`,
    _id: id,
    orderId: id,
    listingId: (listing._id ? listing._id.toString() : listing.id) || 'L-101',
    listingTitle: listing.title || 'Secondary Materials Lot',
    buyerOrg: buyer.name || 'BioPolymer Labs Europe',
    sellerOrg: seller.name || 'Rotterdam Recovery Hub',
    quantity_kg: qty,
    proposed_price_per_kg: price,
    price_per_kg: price,
    total_amount: raw.totalPrice || Math.round(qty * price),
    order_type: raw.orderType === 'free_claim' ? 'free_claim' : 'buy_now',
    status: raw.status || 'pending',
    deliveryNotes: raw.deliveryNotes || '',
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

export function normalizeNegotiation(raw) {
  if (!raw) return null;
  const id = raw._id ? raw._id.toString() : raw.id;
  const buyer = raw.buyerOrganizationId || {};
  const seller = raw.sellerOrganizationId || {};
  const listing = raw.listingId || raw.materialId || {};
  const qty = raw.offeredQuantity ?? 1000;
  const price = raw.offeredPricePerUnit ?? 1.10;

  return {
    id: `NEG-${id.slice(-6).toUpperCase()}`,
    _id: id,
    listingId: (listing._id ? listing._id.toString() : listing.id) || 'L-101',
    listingTitle: listing.title || 'Secondary Material Procurement',
    buyerOrg: buyer.name || 'BioPolymer Labs Europe',
    sellerOrg: seller.name || 'Rotterdam Recovery Hub',
    quantity_kg: qty,
    proposed_price_per_kg: price,
    total_amount: Math.round(qty * price),
    order_type: 'negotiate',
    status: raw.status === 'counter_offered' ? 'countered' : (raw.status || 'pending'),
    counterOffer: raw.counterPricePerUnit ? {
      counter_price_per_kg: raw.counterPricePerUnit,
      counter_quantity_kg: raw.counterQuantity || qty,
      total_counter_amount: Math.round((raw.counterQuantity || qty) * raw.counterPricePerUnit),
      note: raw.notes || 'Seller counter-proposal',
    } : null,
    deliveryNotes: raw.notes || '',
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

export const commerceService = {
  async fetchOrders() {
    const res = await api.get('/orders');
    const items = Array.isArray(res.data) ? res.data : [];
    return items.map(normalizeOrder);
  },

  async createOrder(orderData) {
    const payload = {
      listingId: orderData.listingId,
      materialId: orderData.materialId,
      quantity: Number(orderData.quantity_kg || orderData.quantity || 1000),
      orderType: orderData.order_type === 'free_claim' ? 'free_claim' : 'paid_purchase',
      deliveryNotes: orderData.deliveryNotes || '',
    };
    const res = await api.post('/orders', payload);
    return normalizeOrder(res.data);
  },

  async fetchNegotiations() {
    const res = await api.get('/negotiations');
    const items = Array.isArray(res.data) ? res.data : [];
    return items.map(normalizeNegotiation);
  },

  async submitNegotiation(data) {
    const payload = {
      listingId: data.listingId,
      materialId: data.materialId,
      sellerOrganizationId: data.sellerOrganizationId,
      offeredPricePerUnit: Number(data.proposed_price_per_kg || data.offeredPricePerUnit || 1.0),
      offeredQuantity: Number(data.quantity_kg || data.offeredQuantity || 1000),
      notes: data.deliveryNotes || data.notes || '',
    };
    const res = await api.post('/negotiations', payload);
    return normalizeNegotiation(res.data);
  },

  async counterNegotiation(negotiationId, counterData) {
    const payload = {
      counterPricePerUnit: Number(counterData.counter_price_per_kg),
      counterQuantity: Number(counterData.counter_quantity_kg),
      status: 'counter_offered',
      notes: counterData.note || '',
    };
    const res = await api.patch(`/negotiations/${negotiationId}`, payload);
    return normalizeNegotiation(res.data);
  },

  async acceptNegotiation(negotiationId) {
    const res = await api.patch(`/negotiations/${negotiationId}`, { status: 'accepted' });
    return normalizeNegotiation(res.data);
  },

  async fetchCertificate(orderId) {
    const res = await api.get(`/circularity/certificate/${orderId}`);
    return res.data;
  },
};

export default commerceService;
