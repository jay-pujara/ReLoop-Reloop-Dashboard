import { api } from './apiClient';

export function normalizeNotification(raw) {
  if (!raw) return null;
  const id = raw._id ? raw._id.toString() : raw.id;
  return {
    id,
    type: raw.type || 'match',
    title: raw.title || 'System Update',
    desc: raw.message || raw.desc || 'Notification details',
    link: raw.link || '/matches',
    date: raw.createdAt ? new Date(raw.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
    unread: !raw.read,
  };
}

export const notificationsService = {
  async fetchNotifications() {
    const res = await api.get('/notifications');
    const items = Array.isArray(res.data) ? res.data : [];
    return items.map(normalizeNotification);
  },

  async markAsRead(id) {
    const res = await api.patch(`/notifications/${id}/read`, {});
    return res.data;
  },

  async sendEmailNotification({ to = 'xyz30102111@gmail.com', title, desc, link, date }) {
    try {
      const res = await api.post('/notifications/send-email', { to, title, desc, link, date });
      return res.data;
    } catch (err) {
      console.warn('Backend email dispatch warning:', err);
      return { success: false };
    }
  },
};

export default notificationsService;
