// src/components/NotificationDropdown.tsx
import { Bell, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { notificationApi } from "../../../api/notificationApi";
import type { Notification } from "../../../api/types";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/authContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const LIMIT = 10;
  const userRole = user?.role;

  // === XỬ LÝ CLICK THÔNG BÁO (CÓ LOG) ===
  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.hoso_id) {
      return;
    }
    // 1. Đánh dấu đã đọc
    if (!notif.is_read) {
      try {
        await notificationApi.markAsRead(notif.notification_id);

        setNotifications((prev) =>
          prev.map((n) =>
            n.notification_id === notif.notification_id
              ? { ...n, is_read: true }
              : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {

      }
    }

    // 2. Chuyển trang
    const path =
      userRole === "Cán bộ"
        ? `/dossierstaff/${notif.hoso_id}`
        : `/dossier/${notif.hoso_id}`;
    setOpen(false);
    navigate(path);
  };

  // === TẢI THÔNG BÁO ===
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
        setUnreadCount(newNotifs.filter((n) => !n.is_read).length);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // === TẢI THÊM ===
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, true);
  };

  // === XÓA THÔNG BÁO (CÓ LOG) ===
  const deleteNotification = async (id: number) => {
      try {
      await notificationApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.notification_id !== id));
      const wasUnread = notifications.find(n => n.notification_id === id)?.is_read === false;
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      
    } catch (err) {
     
    }
  };

  // === KẾT NỐI SOCKET.IO (CÓ LOG) ===
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !user) {
     
      return;
    }

   

    const socket = io(API_URL, {
      autoConnect: false,
      transports: ["websocket"],
    });

    socket.auth = { token };
    socket.connect();
    socketRef.current = socket;

    socket.on("connect", () => {
     
    });

    socket.on("new_notification", (payload: Notification) => {
     
      setNotifications((prev) => [payload, ...prev]);
      if (!payload.is_read) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    socket.on("disconnect", () => {
     
    });

    return () => {
      
      socket.disconnect();
    };
  }, [user]);

  // === TẢI LẦN ĐẦU ===
  useEffect(() => {
    if (user) {
     
      fetchNotifications();
    }
  }, [fetchNotifications, user]);

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => {
         
          setOpen(!open);
        }}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 w-80 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Thông báo</h3>
              {unreadCount > 0 && (
                <span className="text-sm font-medium text-blue-600">
                  {unreadCount} chưa đọc
                </span>
              )}
            </div>

            {/* Body */}
            <div className="max-h-96 overflow-y-auto">
              {loading && page === 1 ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 mx-auto animate-spin text-blue-600" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Chưa có thông báo nào</p>
                </div>
              ) : (
                <>
                  {notifications.map((notif) => (
                    <div
                      key={notif.notification_id}
                      onClick={() => handleNotificationClick(notif)}
                      className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition group"
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {notif.is_read ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notif.created_at).toLocaleString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </p>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notif.notification_id);
                            }}
                            className="mt-2 text-xs text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition"
                          >
                            Xóa
                          </button>

                          {!notif.is_read && (
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {hasMore && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        loadMore();
                      }}
                      disabled={loading}
                      className="w-full p-3 text-center text-sm text-blue-600 hover:bg-gray-50 disabled:opacity-50 transition"
                    >
                      {loading ? "Đang tải..." : "Tải thêm"}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => {
                  
                  setOpen(false);
                  navigate("/notifications");
                }}
                className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 transition"
              >
                Xem tất cả thông báo
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}