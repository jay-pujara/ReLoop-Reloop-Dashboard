import { api } from './apiClient';

export const circularityService = {
  async fetchLedger(orgId) {
    const endpoint = orgId ? `/circularity/ledger/${orgId}` : '/circularity/ledger';
    const res = await api.get(endpoint);
    return res.data;
  },

  async fetchEsgReport(orgId) {
    const endpoint = orgId ? `/experience/esg-report/${orgId}` : '/experience/esg-report';
    const res = await api.get(endpoint);
    return res.data;
  },

  async verifyChain() {
    const res = await api.get('/impact/verify');
    return res.data;
  },
};

export default circularityService;
