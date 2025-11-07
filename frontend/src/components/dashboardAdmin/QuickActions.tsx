// src/components/dashboard/QuickActions.tsx
import { FileText, Map, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function QuickActions() {
  const navigate = useNavigate();

  return (
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
        onClick={() => navigate("/landstaff")}
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
  );
}