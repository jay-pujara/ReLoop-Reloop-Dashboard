import { api, setAccessToken } from './apiClient';

export const authService = {
  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data?.accessToken) {
      setAccessToken(res.data.accessToken);
    }
    return res.data;
  },

  async register(registrationData) {
    const payload = {
      email: registrationData.email,
      password: registrationData.password,
      name: registrationData.name || registrationData.legalName || 'Operations Lead',
      organizationName: registrationData.organizationName || registrationData.legalName || 'Circular Partner Corp',
      organizationType: registrationData.organizationType || 'manufacturer',
      city: registrationData.city || 'Rotterdam',
      country: registrationData.country || 'Netherlands',
    };

    const res = await api.post('/auth/register', payload);
    if (res.success && res.data?.accessToken) {
      setAccessToken(res.data.accessToken);
    }
    return res.data;
  },

  async getMe() {
    const userRes = await api.get('/users/me');
    let orgData = null;
    try {
      const orgRes = await api.get('/organizations/me');
      if (orgRes.success) {
        orgData = orgRes.data;
      }
    } catch (_err) {
      // Organization might not be populated or available
    }
    return { user: userRes.data, org: orgData };
  },

  async updateOrganization(data) {
    const res = await api.patch('/organizations/me', data);
    return res.data;
  },

  async fetchFacilities() {
    const res = await api.get('/facilities');
    return res.data;
  },

  async createFacility(facilityData) {
    const payload = {
      name: facilityData.name,
      facilityType: facilityData.facilityType || 'warehouse',
      address: {
        street: facilityData.street || facilityData.address || 'Maashaven Zuidzijde 12',
        city: facilityData.city || 'Rotterdam',
        state: facilityData.state || '',
        country: facilityData.country || 'Netherlands',
        postalCode: facilityData.postalCode || '3072 AE',
      },
      location: {
        type: 'Point',
        coordinates: [Number(facilityData.lng || 4.4842), Number(facilityData.lat || 51.9054)],
      },
      operatingHours: {
        monday: { closed: false, opens: '08:00', closes: '17:00' },
      },
      hasForklift: facilityData.hasForklift ?? true,
    };
    const res = await api.post('/facilities', payload);
    return res.data;
  },

  async submitVerification(documents = []) {
    const res = await api.post('/organizations/me/verification', { documents });
    return res.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout', {});
    } catch (_err) {
      // Ignore network errors on logout
    } finally {
      setAccessToken(null);
    }
  },
};

export default authService;
