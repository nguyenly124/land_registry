// src/pages/CanBoDashboard.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../../../context/authContext";
import { dossierApi } from "../../../api/dossierApi";
import { landApi } from "../../../api/landApi";
import { userApi } from "../../../api";
import { AlertCircle } from "lucide-react";
import { formatDateVN } from "../../../../utils/date";
import Header from "../../dashboardAdmin/Header";
import QuickActions from "../../dashboardAdmin/QuickActions";
import StatsCards from "../../dashboardAdmin/StatsCards";
import DossierStatus from "../../dashboardAdmin/DossierStatus";
import StatusChart from "../../dashboardAdmin/StatusChart";

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
  

  useEffect(() => {
    const fetchStats = async () => {
      if (user?.role !== "Cán bộ") return;
      try {
        setLoading(true);

        const [dossierRes, landRes, userRes] = await Promise.all([
          dossierApi.getAll(),
          landApi.getAll(),
          userApi.getUsersByRole(),
        ]);

        const dossiers = dossierRes.data || [];
        const lands = landRes.data || [];
        const users = userRes.data || [];

        const today = formatDateVN(new Date());

        const todayDossiers = dossiers.filter(
          (d: any) => d.created_at && formatDateVN(d.created_at) === today
        ).length;

        setStats({
          totalDossiers: dossiers.length,
          pendingDossiers: dossiers.filter((d: any) => d.status === "Chờ xử lý").length,
          processingDossiers: dossiers.filter((d: any) => d.status === "Đang xử lý").length,
          approvedDossiers: dossiers.filter((d: any) => d.status === "Đã duyệt").length,
          rejectedDossiers: dossiers.filter((d: any) => d.status === "Từ chối").length,
          totalLands: lands.length,
          totalUsers: users.length,
          todayDossiers,
        });
      } catch {
        setError("Không thể tải dữ liệu thống kê.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
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
        <Header username={user.username} />
        <QuickActions />

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center font-medium">
            {error}
          </div>
        )}

        {stats && (
          <>
            <StatsCards stats={stats} />
            <DossierStatus
              pending={stats.pendingDossiers}
              processing={stats.processingDossiers}
              approved={stats.approvedDossiers}
              rejected={stats.rejectedDossiers}
            />
            <StatusChart
              pending={stats.pendingDossiers}
              processing={stats.processingDossiers}
              approved={stats.approvedDossiers}
              rejected={stats.rejectedDossiers}
            />
          </>
        )}
      </div>
    </div>
  );
}