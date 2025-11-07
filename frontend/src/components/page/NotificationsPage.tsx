// src/components/page/NotificationsPage.tsx
import { Bell, Loader2, Filter } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { notificationApi } from "../../api";
import type { Notification } from "../../api";
import { formatDate } from "../../../utils/date";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [marking, setMarking] = useState<Set<number>>(new Set());
  const socketRef = useRef<Socket | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const LIMIT = 15;
  const userRole = user?.role; // 'Cán bộ' | 'Người dân'

  // === XỬ LÝ CLICK THÔNG BÁO ===
  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.hoso_id) return;

    // 1. Đánh dấu đã đọc nếu chưa đọc
    if (!notif.is_read) {
      setMarking((prev) => new Set(prev).add(notif.notification_id));
      try {
        await notificationApi.markAsRead(notif.notification_id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.notification_id === notif.notification_id
              ? { ...n, is_read: true }
              : n
          )
        );
      } catch (error) {
        console.error("Lỗi đánh dấu đã đọc:", error);
      } finally {
        setMarking((prev) => {
          const next = new Set(prev);
          next.delete(notif.notification_id);
          return next;
        });
      }
    }

    // 2. Chuyển trang theo role
    const path =
      userRole === "Cán bộ"
        ? `/dossierstaff/${notif.hoso_id}`
        : `/dossier/${notif.hoso_id}`;

    navigate(path);
  };

  // === LẤY THÔNG BÁO ===
  const fetchNotifications = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      try {
        setLoading(pageNum === 1);
        const res = await notificationApi.getNotifications(pageNum, LIMIT);

        const newNotifs = res.data;
        const filtered =
          filter === "unread"
            ? newNotifs.filter((n: Notification) => !n.is_read)
            : newNotifs;

        setNotifications((prev) => (append ? [...prev, ...filtered] : filtered));
        setHasMore(res.pagination.page < res.pagination.totalPages);
      } catch (error) {
        console.error("Lỗi tải thông báo:", error);
      } finally {
        setLoading(false);
      }
    },
    [filter]
  );

  // === KHỞI TẠO ===
  useEffect(() => {
    fetchNotifications(1, false);
  }, [fetchNotifications]);

  // === SOCKET.IO REALTIME ===
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !user) return;

    const socket = io(API_URL, {
      autoConnect: false,
      transports: ["websocket"],
    });

    socket.auth = { token };
    socket.connect();

    socket.on("connect", () => {
      const payload = JSON.parse(atob(token.split(".")[1]));
      socket.emit("join", payload.id);
    });

    socket.on("notification", (newNotif: Notification) => {
      if (filter === "all" || !newNotif.is_read) {
        setNotifications((prev) => [newNotif, ...prev]);
      }
    });

    socketRef.current = socket;
    return () => {
      socket.disconnect();
    };
  }, [filter, user]);

  // === ĐÁNH DẤU ĐÃ ĐỌC (NÚT RIÊNG) ===
  const markAsRead = async (id: number) => {
    setMarking((prev) => new Set(prev).add(id));
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.notification_id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error("Lỗi đánh dấu đã đọc:", error);
    } finally {
      setMarking((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // === XÓA THÔNG BÁO ===
  const deleteNotification = async (id: number) => {
    try {
      await notificationApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.notification_id !== id));
    } catch (error) {
      console.error("Lỗi xóa thông báo:", error);
    }
  };

  // === TẢI THÊM ===
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, true);
  };

  // === ĐÁNH DẤU TẤT CẢ ===
  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Lỗi đánh dấu tất cả:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Bell className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Thông báo</h1>
          {unreadCount > 0 && (
            <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
              {unreadCount} chưa đọc
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
            >
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="flex items-center gap-2 mb-6 bg-white p-2 rounded-lg shadow-sm border">
        <Filter className="w-5 h-5 text-gray-500" />
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            filter === "unread"
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          Chưa đọc
        </button>
      </div>

      {/* Danh sách thông báo */}
      <div className="space-y-3">
        {notifications.length === 0 && !loading ? (
          <div className="text-center py-12 text-gray-500">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">Không có thông báo nào.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.notification_id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-lg ${
                notif.is_read
                  ? "bg-white border-gray-200 hover:border-gray-300"
                  : "bg-blue-50 border-blue-200 hover:border-blue-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 font-medium">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDate(notif.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-3 ml-4">
                  {!notif.is_read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notif.notification_id);
                      }}
                      disabled={marking.has(notif.notification_id)}
                      className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
                    >
                      {marking.has(notif.notification_id) ? "..." : "Đọc"}
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
              </div>

              {!notif.is_read && (
                <div className="flex justify-end mt-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Tải thêm */}
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang tải...
              </>
            ) : (
              "Tải thêm thông báo"
            )}
          </button>
        </div>
      )}
    </div>
  );
}