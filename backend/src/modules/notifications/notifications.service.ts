import { NotificationModel } from './notifications.model.js';

export class NotificationsService {
  async getForUser(userId: string) {
    return NotificationModel.find({ recipientUserId: userId }).sort({ createdAt: -1 }).limit(30);
  }

  async markAsRead(id: string, userId: string) {
    return NotificationModel.findOneAndUpdate(
      { _id: id, recipientUserId: userId },
      { read: true },
      { new: true }
    );
  }
}

export const notificationsService = new NotificationsService();
