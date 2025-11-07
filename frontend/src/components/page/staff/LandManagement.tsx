// src/components/page/staff/LandManagement.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { landApi } from "../../../api/landApi";
import type { LandParcel } from "../../../api/types";
import { useAuth } from "../../../context/authContext";
import { format } from "date-fns";

export default function LandManagement() {
  const [lands, setLands] = useState<LandParcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const isStaff = user?.role === "Cán bộ";
  const isUser = user?.role === "Người dân";

  useEffect(() => {
    loadLands();
  }, []);

  const loadLands = async () => {
    try {
      const res = await landApi.getAll();
      setLands(res.data);
    } catch (err) {
      alert("Lỗi tải danh sách thửa đất");
    } finally {
      setLoading(false);
    }
  };

  const filtered = isStaff
    ? lands.filter(
        (l) =>
          l.parcel_code.toLowerCase().includes(search.toLowerCase()) ||
          l.address.toLowerCase().includes(search.toLowerCase())
      )
    : lands;

  const handleViewDetail = (id: string) => {
    navigate(`/landstaff/${id}`);
  };

  const handleCreate = () => {
    navigate("/landstaff/create");
  };

  if (loading) return <div className="p-6 text-center">Đang tải...</div>;

  return (
    <div className=" bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {isStaff && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-blue-900">Quản lý thửa đất</h1>
              <button
                onClick={handleCreate}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                + Tạo thửa đất
              </button>
            </div>

            <input
              type="text"
              placeholder="Tìm theo mã hoặc địa chỉ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        )}


        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">
                    Mã thửa
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">
                    Địa chỉ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">
                    Diện tích
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">
                    Chủ sở hữu
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-blue-900 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((land) => (
                  <tr key={land.parcel_id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {land.parcel_code}
                    </td>
                    <td className="px-6 py-4 text-gray-700 max-w-xs truncate">
                      {land.address}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {land.area} m²
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {land.owner?.UserProfile?.full_name || "Chưa có"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          land.registration_status === "Đã cấp"
                            ? "bg-green-100 text-green-800"
                            : land.registration_status === "Chưa cấp"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {land.registration_status || "Chưa xác định"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewDetail(land.parcel_id)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Không tìm thấy thửa đất nào.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}