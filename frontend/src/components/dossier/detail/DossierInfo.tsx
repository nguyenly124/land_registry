// src/components/dossier/detail/DossierInfo.tsx
import { formatDate } from "../../../../utils/date";

interface DossierInfoProps {
  type: string;
  created_at: string;
  updated_at: string;
}

export default function DossierInfo({ type, created_at, updated_at }: DossierInfoProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold text-blue-900 mb-4">THÔNG TIN HỒ SƠ</h3>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Loại hồ sơ</p>
          <p className="text-lg font-semibold text-gray-900">{type}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Ngày nộp</p>
          <p className="text-gray-900">{formatDate(created_at)}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Cập nhật lần cuối</p>
          <p className="text-gray-900">{formatDate(updated_at)}</p>
        </div>
      </div>
    </div>
  );
}