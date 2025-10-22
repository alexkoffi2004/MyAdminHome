import api from '../config/api';

export interface Notification {
  _id: string;
  user: string;
  type: 'request_created' | 'request_updated' | 'request_completed' | 'request_rejected' | 
        'request_assigned' | 'request_reassigned' | 'request_status_updated' | 
        'payment_received' | 'document_generated' | 'system_alert';
  title: string;
  message: string;
  request?: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  totalCount: number;
  unreadCount: number;
  currentPage: number;
  totalPages: number;
}

class NotificationService {
  async getNotifications(params?: { 
    page?: number; 
    limit?: number; 
    unreadOnly?: boolean 
  }): Promise<NotificationResponse> {
    const response = await api.get('/notifications', { params });
    return response.data.data;
  }

  async markAsRead(id: string): Promise<Notification> {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data.data;
  }

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  }

  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  }

  async getUnreadCount(): Promise<number> {
    const response = await api.get('/notifications', { 
      params: { unreadOnly: true, limit: 1 } 
    });
    return response.data.data.unreadCount || 0;
  }
}

export default new NotificationService();
