import { api } from './apiClient';

export const trustService = {
  async fetchVerification(orgId) {
    const res = await api.get(`/trust/verification/${orgId}`);
    return res.data;
  },

  async fetchDisputes() {
    const res = await api.get('/trust/disputes');
    return res.data;
  },

  async fileDispute(data) {
    const res = await api.post('/trust/disputes', data);
    return res.data;
  },
};

export default trustService;
