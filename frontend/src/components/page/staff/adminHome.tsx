// src/pages/CanBoDashboard.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/authContext";
import { dossierApi } from "../../../api/dossierApi";
import { landApi } from "../../../api/landApi";
import { format } from "date-fns";
import { FileText, Clock, Map, Users, AlertCircle, CheckCircle, XCircle, Activity } from "lucide-react";

interface Stats {
  totalDossiers: number;
  pendingDossiers: number;
  processingDossiers: number;
  approvedDossiers: number;
  rejectedDossiers: number;
  totalLands: number;
  totalUsers: number;
  todayDossiers: number;
}

export default function CanBoDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const [dossierRes, landRes] = await Promise.all([
          dossierApi.getAll(),
          landApi.getAll(),
        ]);

        const dossiers = dossierRes.data || [];
        const lands = landRes.items || [];

        const today = format(new Date(), "yyyy-MM-dd");
        const todayDossiers = dossiers.filter((d: any) =>
          format(new Date(d.created_at), "yyyy-MM-dd") === today
        ).length;

        const newStats: Stats = {
          totalDossiers: dossiers.length,
          pendingDossiers: dossiers.filter((d: any) => d.status === "Chờ xử lý").length,
          processingDossiers: dossiers.filter((d: any) => d.status === "Đang xử lý").length,
          approvedDossiers: dossiers.filter((d: any) => d.status === "Đã duyệt").length,
          rejectedDossiers: dossiers.filter((d: any) => d.status === "Từ chối").length,
          totalLands: lands.length,
          totalUsers: new Set(dossiers.map((d: any) => d.account_id)).size,
          todayDossiers,
        };

        setStats(newStats);
      } catch (err: any) {
        setError("Không thể tải dữ liệu thống kê.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "Cán bộ") {
      fetchStats();
    }
  }, [user]);

  if (!user || user.role !== "Cán bộ") {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl font-semibold text-red-600">Truy cập bị từ chối</p>
          <p className="text-gray-600 mt-2">Bạn không có quyền truy cập trang này.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-blue-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-blue-900 flex items-center gap-3">
                <Activity className="w-10 h-10 text-blue-600" />
                TRANG CHỦ CÁN BỘ
              </h1>
              <p className="text-gray-600 mt-2">
                Chào mừng <span className="font-semibold text-blue-700">{user.username}</span> - Quản lý hệ thống địa chính
              </p>
            </div>
            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              {format(new Date(), "EEEE, dd 'tháng' MM, yyyy")}
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <button
            onClick={() => navigate("/dossierstaff")}
            className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 text-left"
          >
            <div className="bg-white/20 p-3 rounded-xl group-hover:scale-110 transition">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold text-lg">Quản lý hồ sơ</p>
              <p className="text-sm opacity-90">Xem & xử lý hồ sơ</p>
            </div>
          </button>

          <button
            onClick={() => navigate("/lands")}
            className="group bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 text-left"
          >
            <div className="bg-white/20 p-3 rounded-xl group-hover:scale-110 transition">
              <Map className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold text-lg">Quản lý thửa đất</p>
              <p className="text-sm opacity-90">Thông tin thửa đất</p>
            </div>
          </button>

          <button
            onClick={() => navigate("/users")}
            className="group bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 text-left"
          >
            <div className="bg-white/20 p-3 rounded-xl group-hover:scale-110 transition">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold text-lg">Quản lý người dùng</p>
              <p className="text-sm opacity-90">Tài khoản & quyền</p>
            </div>
          </button>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center font-medium">
            {error}
          </div>
        )}

        {/* MAIN STATS */}
        {stats && (
          <>
            {/* 4 Ô CHÍNH */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <button
                onClick={() => navigate("/dossiers")}
                className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Tổng hồ sơ</p>
                    <p className="text-4xl font-bold mt-1">{stats.totalDossiers.toLocaleString()}</p>
                  </div>
                  <FileText className="w-12 h-12 opacity-80" />
                </div>
              </button>

              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Hồ sơ hôm nay</p>
                    <p className="text-4xl font-bold mt-1">+{stats.todayDossiers}</p>
                  </div>
                  <Clock className="w-12 h-12 opacity-80" />
                </div>
              </div>

              <button
                onClick={() => navigate("/lands")}
                className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Tổng thửa đất</p>
                    <p className="text-4xl font-bold mt-1">{stats.totalLands.toLocaleString()}</p>
                  </div>
                  <Map className="w-12 h-12 opacity-80" />
                </div>
              </button>

              <button
                onClick={() => navigate("/users")}
                className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg transform hover:scale-105 transition text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Người dùng</p>
                    <p className="text-4xl font-bold mt-1">{stats.totalUsers}</p>
                  </div>
                  <Users className="w-12 h-12 opacity-80" />
                </div>
              </button>
            </div>

            {/* TRẠNG THÁI HỒ SƠ */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
                <Activity className="w-7 h-7 text-blue-600" />
                TRẠNG THÁI HỒ SƠ
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <button
                  onClick={() => navigate("/dossiers?status=pending")}
                  className="bg-yellow-50 border-2 border-yellow-300 p-5 rounded-xl text-center hover:shadow-md transition"
                >
                  <AlertCircle className="w-10 h-10 text-yellow-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-yellow-800">Chờ xử lý</p>
                  <p className="text-3xl font-bold text-yellow-900 mt-1">{stats.pendingDossiers}</p>
                </button>

                <button
                  onClick={() => navigate("/dossiers?status=processing")}
                  className="bg-blue-50 border-2 border-blue-300 p-5 rounded-xl text-center hover:shadow-md transition"
                >
                  <Clock className="w-10 h-10 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-blue-800">Đang xử lý</p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">{stats.processingDossiers}</p>
                </button>

                <button
                  onClick={() => navigate("/dossiers?status=approved")}
                  className="bg-green-50 border-2 border-green-300 p-5 rounded-xl text-center hover:shadow-md transition"
                >
                  <div className="w-10 h-10 text-green-600 mx-auto mb-2">
                    <CheckCircle className="w-full h-full" />
                  </div>
                  <p className="text-sm font-semibold text-green-800">Đã duyệt</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">{stats.approvedDossiers}</p>
                </button>

                <button
                  onClick={() => navigate("/dossiers?status=rejected")}
                  className="bg-red-50 border-2 border-red-300 p-5 rounded-xl text-center hover:shadow-md transition"
                >
                  <XCircle className="w-10 h-10 text-red-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-red-800">Từ chối</p>
                  <p className="text-3xl font-bold text-red-900 mt-1">{stats.rejectedDossiers}</p>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
