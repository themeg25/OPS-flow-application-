import { api } from './apiClient';

export const notificationService = {
  list() {
    return api.get('listNotifications');
  },

  markRead(id) {
    return api.post('markNotificationRead', {
      id,
    });
  },

  markAllRead() {
    return api.post(
      'markAllNotificationsRead'
    );
  },
};