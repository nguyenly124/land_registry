// src/components/page/user/LandProfile.tsx
import React, { useEffect, useState } from "react";
import { dossierApi } from "../../api/dossierApi";
import type { HoSo } from "../../api/types";
import { formatDate } from "../../../utils/date";
import { useNavigate } from "react-router-dom";
import CreateDossierModal from "../dossier/CreateDossierModal";
import LandManagement from "../page/staff/LandManagement";

function StatusBadge({ status }: { status: HoSo["status"] }) {
  const colorMap: Record<HoSo["status"], string> = {
    "Chờ xử lý": "yellow",
    "Đang xử lý": "blue",
    "Đã duyệt": "green",
    "Từ chối": "red",
  };
  const color = colorMap[status] || "gray";
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${color}-100 text-${color}-700`}>
      {status}
    </span>
  );
}

export default function LandProfile() {
  const navigate = useNavigate();
  const [dossiers, setDossiers] = useState<HoSo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchDossiers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await dossierApi.getAll();
        setDossiers(response.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || "Không thể tải danh sách hồ sơ.");
      } finally {
        setLoading(false);
      }
    };
    fetchDossiers();
  }, []);

  const handleSuccess = (newHoSo: HoSo) => {
    setDossiers(prev => [newHoSo, ...prev]);
  };

  const handleRowClick = (hosoId: string) => {
    navigate(`/dossier/${hosoId}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg my-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-blue-900">HỒ SƠ ĐÃ NỘP</h2>
          <p className="text-gray-600 mt-1">Quản lý và theo dõi trạng thái hồ sơ đất đai</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-md transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H-4" />
          </svg>
          Tạo hồ sơ mới
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Danh sách hồ sơ */}
      {!loading && !error && dossiers.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 mx-auto mb-4" />
          <p className="text-xl text-gray-600 font-medium">Chưa có hồ sơ nào</p>
          <p className="text-gray-500 mt-2">Nhấn "Tạo hồ sơ mới" để bắt đầu.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-50 text-left text-blue-900 font-semibold">
                <th className="p-3 border-b">Mã hồ sơ</th>
                <th className="p-4 border-b">Loại hồ sơ</th>
                <th className="p-4 border-b">Thửa đất</th>
                <th className="p-4 border-b">Trạng thái</th>
                <th className="p-4 border-b">Ngày nộp</th>
                <th className="p-4 border-b">Cập nhật</th>
              </tr>
            </thead>
            <tbody>
              {dossiers.map((dossier) => (
                <tr
                  key={dossier.hoso_id}
                  onClick={() => handleRowClick(dossier.hoso_id.toString())}
                  className="hover:bg-gray-50 transition cursor-pointer"
                >
                  <td className="p-4 border-b font-mono text-sm">{dossier.hoso_id}</td>
                  <td className="p-4 border-b font-medium">{dossier.type}</td>
                  <td className="p-4 border-b">
                    {dossier.parcel ? (
                      <div>
                        <p className="font-medium">{dossier.parcel.parcel_code}</p>
                        <p className="text-sm text-gray-600">{dossier.parcel.address}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400">--</span>
                    )}
                  </td>
                  <td className="p-4 border-b">
                    <StatusBadge status={dossier.status} />
                  </td>
                  <td className="p-4 border-b text-sm">{formatDate(dossier.created_at)}</td>
                  <td className="p-4 border-b text-sm">{formatDate(dossier.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL TẠO HỒ SƠ */}
      {showCreateModal && (
        <CreateDossierModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleSuccess}
        />
      )}

      {/* DANH SÁCH THỬA ĐẤT */}
      <div className="mt-12">
        <h2 className="text-3xl font-bold text-blue-900 mb-6">DANH SÁCH THỬA ĐẤT</h2>
        <LandManagement />
      </div>
    </div>
  );
}