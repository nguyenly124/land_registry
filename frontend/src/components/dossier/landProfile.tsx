import React, { useEffect, useState } from "react";
import { dossierApi } from "../../api/dossierApi";
import type { HoSo, SubmitHoSoRequest } from "../../api/types";
import { formatDate } from "../../../utils/date";
import { useNavigate } from "react-router-dom";
// Màu trạng thái
const statusColorMap: Record<HoSo["status"], string> = {
  "Chờ xử lý": "yellow",
  "Đang xử lý": "blue",
  "Đã duyệt": "green",
  "Từ chối": "red",
};

function StatusBadge({ status }: { status: HoSo["status"] }) {
  const color = statusColorMap[status] || "gray";
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${color}-100 text-${color}-700`}>
      {status}
    </span>
  );
}

export default function LandProfile() {
  const navigate = useNavigate()
  const [dossiers, setDossiers] = useState<HoSo[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form tạo hồ sơ mới
  const [form, setForm] = useState<SubmitHoSoRequest>({
    type: "",
    parcelId: "",
  });

  // Lấy danh sách hồ sơ của người dùng hiện tại
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

  // Xử lý thay đổi form
  const handleChange = (field: keyof SubmitHoSoRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Gửi hồ sơ mới
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.type.trim()) {
      alert("Vui lòng nhập loại hồ sơ.");
      return;
    }

    setSubmitting(true);
    try {
      const newDossier = await dossierApi.submit({
        type: form.type.trim(),
        parcelId: form.parcelId || undefined,
      });
      setDossiers((prev) => [newDossier.data, ...prev]);
      setShowCreateModal(false);
      setForm({ type: "", parcelId: "" });
      alert("Nộp hồ sơ thành công!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Lỗi khi nộp hồ sơ.");
    } finally {
      setSubmitting(false);
    }
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
                <tr key={dossier.hoso_id} 
                onClick={() => handleRowClick(dossier.hoso_id.toString())}
                className="hover:bg-gray-50 transition"
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

      {/* MODAL TẠO HỢ SƠ MỚI */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold text-blue-900 mb-6">Tạo hồ sơ mới</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Loại hồ sơ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại hồ sơ <span className="text-red-500">*</span>
                </label>
                <select
                   aria-label="Loại hồ sơ"
                  value={form.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                >
                  <option value="">-- Chọn loại hồ sơ --</option>
                  <option value="Cấp GCN lần đầu">Cấp GCN lần đầu</option>
                  <option value="Chuyển nhượng">Chuyển nhượng</option>
                  <option value="Thế chấp">Thế chấp</option>
                  <option value="Tách thửa">Tách thửa</option>
                  <option value="Hợp thửa">Hợp thửa</option>
                </select>
              </div>

              {/* Mã thửa đất (tùy chọn) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã thửa đất (nếu có)
                </label>
                <input
                  type="text"
                  value={form.parcelId}
                  onChange={(e) => handleChange("parcelId", e.target.value)}
                  placeholder="Nhập mã thửa đất"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Nút */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2.5 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-md transition disabled:opacity-70"
                >
                  {submitting ? "Đang gửi..." : "Nộp hồ sơ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}