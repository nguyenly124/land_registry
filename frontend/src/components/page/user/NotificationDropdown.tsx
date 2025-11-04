// src/components/NotificationDropdown.tsx
import { Bell, CheckCircle, XCircle, AlertCircle, Info, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {notificationApi} from "../../../api/notificationApi";
import type {
  Notification
} from "../../../api/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  const LIMIT = 10;

  // === GỌI API LẤY THÔNG BÁO ===
  const fetchNotifications = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      try {
        setLoading(true);
        const res = await notificationApi.getNotifications(pageNum, LIMIT);

        const newNotifs = res.data;
        setNotifications((prev) =>
          append ? [...prev, ...newNotifs] : newNotifs
        );
        setHasMore(res.pagination.page < res.pagination.totalPages);
        setUnreadCount(res.data.filter((n) => !n.is_read).length);
      } catch (error) {
        console.error("Lỗi tải thông báo:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // === KẾT NỐI SOCKET.IO ===
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(API_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      const payload = JSON.parse(atob(token.split(".")[1]));
      socket.emit("join", payload.id);
    });

    socket.on("new_notification", (noti: Notification) => {
      setNotifications((prev) => [noti, ...prev]);
      setUnreadCount((c) => c + 1);
    });

    socketRef.current = socket;
    return () => {
      socket.close();
    };
  }, []);

  // === TẢI LẦN ĐẦU ===
  useEffect(() => {
    fetchNotifications(1, false);
  }, [fetchNotifications]);

  // === ĐÁNH DẤU ĐÃ ĐỌC ===
  const markAsRead = async (notificationId: number) => {
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.notification_id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (error) {
      console.error("Lỗi đánh dấu đã đọc:", error);
    }
  };

  // === ĐÁNH DẤU TẤT CẢ ===
  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Lỗi đánh dấu tất cả:", error);
    }
  };

  // === XÓA THÔNG BÁO ===
  const deleteNotification = async (notificationId: number) => {
    try {
      await notificationApi.deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((n) => n.notification_id !== notificationId)
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (error) {
      console.error("Lỗi xóa:", error);
    }
  };

  // === TẢI THÊM KHI CUỘN ===
  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage, true);
    }
  };

  // === ĐỊNH DẠNG THỜI GIAN ===
  const formatTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  // === ICON THEO LOẠI ===
  const getIcon = (message: string) => {
    const lower = message.toLowerCase();
    if (lower.includes("duyệt") || lower.includes("thành công")) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    if (lower.includes("từ chối") || lower.includes("lỗi")) {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }
    if (lower.includes("cảnh báo") || lower.includes("bảo trì")) {
      return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
    return <Info className="w-5 h-5 text-blue-600" />;
  };

  return (
    <div className="relative">
      {/* Chuông */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-gray-800">Thông báo</h3>
                <p className="text-sm text-gray-500">
                  {unreadCount > 0
                    ? `${unreadCount} chưa đọc`
                    : "Không có thông báo mới"}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Đánh dấu tất cả
                </button>
              )}
            </div>

            {/* Danh sách */}
            <div className="max-h-96 overflow-y-auto">
              {loading && page === 1 ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  <p className="text-gray-500 mt-2">Đang tải...</p>
                </div>
              ) : notifications.length === 0 ? (
                <p className="p-8 text-center text-gray-500">Chưa có thông báo</p>
              ) : (
                <>
                  {notifications.map((notif) => (
                    <div
                      key={notif.notification_id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer group ${
                        !notif.is_read ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getIcon(notif.message)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">
                            {notif.message.split(".")[0]}
                          </p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatTime(notif.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                          {!notif.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notif.notification_id);
                              }}
                              className="text-xs text-blue-600 hover:text-blue-700"
                            >
                              Đọc
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notif.notification_id);
                            }}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            Xóa
                          </button>
                        </div>
                        {!notif.is_read && (
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        )}
                      </div>
                    </div>
                  ))}

                  {hasMore && (
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="w-full p-3 text-center text-blue-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {loading ? "Đang tải..." : "Tải thêm"}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <a
                href="/notifications"
                className="block text-center text-blue-600 font-medium hover:text-blue-700 transition"
                onClick={() => setOpen(false)}
              >
                Xem tất cả thông báo
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}