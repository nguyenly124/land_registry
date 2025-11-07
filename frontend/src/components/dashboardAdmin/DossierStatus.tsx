// src/components/dashboard/DossierStatus.tsx
import { AlertCircle, Clock, CheckCircle, XCircle,Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DossierStatusProps {
  pending: number;
  processing: number;
  approved: number;
  rejected: number;
}

export default function DossierStatus({ pending, processing, approved, rejected }: DossierStatusProps) {
  const navigate = useNavigate();

  return (
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
          <p className="text-3xl font-bold text-yellow-900 mt-1">{pending}</p>
        </button>

        <button
          onClick={() => navigate("/dossiers?status=processing")}
          className="bg-blue-50 border-2 border-blue-300 p-5 rounded-xl text-center hover:shadow-md transition"
        >
          <Clock className="w-10 h-10 text-blue-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-blue-800">Đang xử lý</p>
          <p className="text-3xl font-bold text-blue-900 mt-1">{processing}</p>
        </button>

        <button
          onClick={() => navigate("/dossiers?status=approved")}
          className="bg-green-50 border-2 border-green-300 p-5 rounded-xl text-center hover:shadow-md transition"
        >
          <div className="w-10 h-10 text-green-600 mx-auto mb-2">
            <CheckCircle className="w-full h-full" />
          </div>
          <p className="text-sm font-semibold text-green-800">Đã duyệt</p>
          <p className="text-3xl font-bold text-green-900 mt-1">{approved}</p>
        </button>

        <button
          onClick={() => navigate("/dossiers?status=rejected")}
          className="bg-red-50 border-2 border-red-300 p-5 rounded-xl text-center hover:shadow-md transition"
        >
          <XCircle className="w-10 h-10 text-red-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-red-800">Từ chối</p>
          <p className="text-3xl font-bold text-red-900 mt-1">{rejected}</p>
        </button>
      </div>
    </div>
  );
}