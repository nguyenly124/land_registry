// src/components/dashboard/StatsCards.tsx
import { FileText, Clock, Map, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Stats {
  totalDossiers: number;
  todayDossiers: number;
  totalLands: number;
  totalUsers: number;
}

interface StatsCardsProps {
  stats: Stats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const navigate = useNavigate();

  return (
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
        onClick={() => navigate("/landstaff")}
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
  );
}