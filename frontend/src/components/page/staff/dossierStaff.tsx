// src/pages/DossierManagement.tsx
import  { useEffect, useState, useMemo } from "react";
import { dossierApi } from "../../../api/dossierApi";
import type { HoSo } from "../../../api/types";
import { formatDate } from "../../../../utils/date";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/authContext";
import {
  Search, Filter, FileText, User, MapPin, Calendar, Eye, Loader2, AlertCircle
} from "lucide-react";

// Màu trạng thái
const statusColorMap: Record<HoSo["status"], { bg: string; text: string; border: string }> = {
  "Chờ xử lý": { bg: "yellow-50", text: "yellow-800", border: "yellow-300" },
  "Đang xử lý": { bg: "blue-50", text: "blue-800", border: "blue-300" },
  "Đã duyệt": { bg: "green-50", text: "green-800", border: "green-300" },
  "Từ chối": { bg: "red-50", text: "red-800", border: "red-300" },
};

function StatusBadge({ status }: { status: HoSo["status"] }) {
  const colors = statusColorMap[status] || { bg: "gray-50", text: "gray-800", border: "gray-300" };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${colors.bg} text-${colors.text} border-${colors.border}`}>
      {status}
    </span>
  );
}

export default function DossierManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dossiers, setDossiers] = useState<HoSo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tìm kiếm & Lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<HoSo["status"] | "">("");

  // Phân trang
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Lấy dữ liệu
  useEffect(() => {
    let isMounted = true;

    const fetchDossiers = async () => {
      if (user?.role !== "Cán bộ") return;
      if (!isMounted) return;

      try {
        setLoading(true);
        setError(null);

        const res = await dossierApi.getAll({
          page,
          limit,
          status: statusFilter || undefined,
          search: searchTerm || undefined,
        });

        if (isMounted) {
          setDossiers(res.data);
          setTotalPages(res.pagination.totalPages);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.response?.data?.message || "Không thể tải dữ liệu");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDossiers();

    return () => {
      isMounted = false;
    };
  }, [page, statusFilter, searchTerm]);

  // Lọc & Tìm kiếm
  const filteredDossiers = useMemo(() => {
    return dossiers.filter((d) => {
      const matchesSearch =
        d.hoso_id.toString().includes(searchTerm) ||
        d.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.parcel?.parcel_code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.account?.username || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !statusFilter || d.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [dossiers, searchTerm, statusFilter]);

  const paginatedDossiers = filteredDossiers.slice((page - 1) * limit, page * limit);

  const handleViewDetail = (hosoId: number) => {
    navigate(`/dossierstaff/${hosoId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-blue-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-blue-900 flex items-center gap-3">
                <FileText className="w-10 h-10 text-blue-600" />
                QUẢN LÝ HỒ SƠ
              </h1>
              <p className="text-gray-600 mt-2">Theo dõi và xử lý tất cả hồ sơ người dùng</p>
            </div>
            <div className="text-sm text-gray-500">
              Tổng: <span className="font-bold text-blue-700">{dossiers.length}</span> hồ sơ
            </div>
          </div>
        </div>

        {/* Tìm kiếm & Lọc */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tìm kiếm */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm theo mã, loại, thửa đất, người dùng..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Lọc trạng thái */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                aria-label="Lọc theo trạng thái"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as HoSo["status"] | "");
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition appearance-none"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="Chờ xử lý">Chờ xử lý</option>
                <option value="Đang xử lý">Đang xử lý</option>
                <option value="Đã duyệt">Đã duyệt</option>
                <option value="Từ chối">Từ chối</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center font-medium flex items-center justify-center gap-2">
            <AlertCircle className="w-6 h-6" />
            {error}
          </div>
        )}

        {/* Danh sách hồ sơ */}
        {!loading && !error && (
          <>
            {paginatedDossiers.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-16 text-center">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 mx-auto mb-4" />
                <p className="text-xl font-medium text-gray-600">Không tìm thấy hồ sơ nào</p>
                <p className="text-gray-500 mt-2">Thử thay đổi từ khóa hoặc bộ lọc.</p>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                      <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                        <tr>
                          <th className="px-4 py-3 text-center text-xs font-bold text-blue-900 uppercase tracking-wider">
                            Mã HS
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-blue-900 uppercase tracking-wider">
                            Người nộp
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-blue-900 uppercase tracking-wider">
                            Loại hồ sơ
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-blue-900 uppercase tracking-wider">
                            Thửa đất
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-blue-900 uppercase tracking-wider">
                            Trạng thái
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-blue-900 uppercase tracking-wider">
                            Ngày nộp
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-blue-900 uppercase tracking-wider">
                            Hành động
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {paginatedDossiers.map((d) => (
                          <tr key={d.hoso_id} className="hover:bg-gray-50 transition">
                            {/* Mã HS */}
                            <td className="px-4 py-4">
                              <span className="font-mono text-sm font-bold text-blue-700">
                                #{d.hoso_id}
                              </span>
                            </td>

                            {/* Người nộp */}
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center">
                                  <User className="w-4 h-4 text-gray-500" />
                                </div>
                                <span className="font-medium text-gray-900">{d.account?.username || "—"}</span>
                              </div>
                            </td>

                            {/* Loại hồ sơ */}
                            <td className="px-4 py-4">
                              <p className="font-medium text-gray-900 line-clamp-2 max-w-xs">
                                {d.type}
                              </p>
                            </td>

                            {/* Thửa đất */}
                            <td className="px-4 py-4">
                              {d.parcel ? (
                                <div className="max-w-xs">
                                  <p className="font-semibold text-sm text-gray-900">
                                    {d.parcel.parcel_code}
                                  </p>
                                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                    <MapPin className="w-3 h-3" />
                                    {d.parcel.address}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">—</span>
                              )}
                            </td>

                            {/* Trạng thái */}
                            <td className="px-4 py-4 text-center">
                              <StatusBadge status={d.status} />
                            </td>

                            {/* Ngày nộp */}
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(d.created_at)}</span>
                              </div>
                            </td>

                            {/* Hành động */}
                            <td className="px-4 py-4 text-right">
                              <button
                                onClick={() => handleViewDetail(d.hoso_id)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm transition transform hover:scale-105"
                              >
                                <Eye className="w-4 h-4" />
                                Xem chi tiết
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Phân trang */}
                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                    >
                      Trước
                    </button>
                    <span className="px-4 py-2 font-medium">
                      Trang {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => p + 1)}
                      disabled={page >= totalPages}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}