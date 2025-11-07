// src/components/dossier/detail/Header.tsx
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  dossierId: string;
}

export default function Header({ dossierId }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-3">
            CHI TIẾT HỒ SƠ
          </h1>
          <p className="text-gray-600 mt-1">
            Mã hồ sơ: <span className="font-mono font-bold text-blue-700">#{dossierId}</span>
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>
      </div>
    </div>
  );
}