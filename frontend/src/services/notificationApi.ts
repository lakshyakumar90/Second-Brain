const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export interface Notification {
  _id: string;
  userId: string;
  type: 'collaboration' | 'system' | 'reminder' | 'workspace';
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  relatedId?: string;
  relatedType?: string;
  senderId?: string;
  actionUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetNotificationsResponse {
  message: string;
  notifications: Notification[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface NotificationPreferences {
  emailNotifications: boolean;
}

class NotificationApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}/notifications${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Get notifications with pagination and filters
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
    type?: string;
  }): Promise<GetNotificationsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.isRead !== undefined) searchParams.append('isRead', params.isRead.toString());
    if (params?.type) searchParams.append('type', params.type);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<GetNotificationsResponse>(`/${query}`);
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<{ message: string; notification: Notification }> {
    return this.request<{ message: string; notification: Notification }>(`/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/read-all', {
      method: 'PATCH',
    });
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/${notificationId}`, {
      method: 'DELETE',
    });
  }

  // Get unread notifications count
  async getUnreadCount(): Promise<{ message: string; count: number }> {
    return this.request<{ message: string; count: number }>('/unread/count');
  }

  // Update notification preferences
  async updatePreferences(preferences: NotificationPreferences): Promise<{ message: string; preferences: NotificationPreferences }> {
    return this.request<{ message: string; preferences: NotificationPreferences }>('/preferences', {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    });
  }
}

export const notificationApi = new NotificationApiService();
