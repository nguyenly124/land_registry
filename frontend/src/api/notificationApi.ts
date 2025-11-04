import axiosClient from './axiosClient';
import type { 
  GetNotificationsResponse, 
  GetUnreadNotificationsResponse,
  MarkAsReadResponse ,
  ApiResponse
} from './types';

export const notificationApi = {
  /** Lấy danh sách thông báo (phân trang) */
  getNotifications: (page = 1, limit = 10) =>
    axiosClient
      .get<GetNotificationsResponse>('/notifications', { params: { page, limit } })
      .then(r => r.data),

  /** Lấy thông báo chưa đọc */
  getUnreadNotifications: () =>
    axiosClient
      .get<GetUnreadNotificationsResponse>('/notifications/unread')
      .then(r => r.data),

  /** Đánh dấu 1 thông báo đã đọc */
  markAsRead: (notificationId: number) =>
    axiosClient
      .put<MarkAsReadResponse>('/notifications/mark-as-read', { notificationId })
      .then(r => r.data),

  /** Đánh dấu tất cả đã đọc */
  markAllAsRead: () =>
    axiosClient
      .put<ApiResponse>('/notifications/mark-all-read')
      .then(r => r.data),

  /** Xóa thông báo */
  deleteNotification: (notificationId: number) =>
    axiosClient
      .delete<ApiResponse>(`/notifications/${notificationId}`)
      .then(r => r.data),
};