// src/components/page/staff/LandDetailStaff.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { landApi } from "../../../api/landApi";
import type  { LandParcel } from "../../../api/types";
import ParcelMap from "../../common/ParcelMap";

export default function LandDetailStaff() {
  const { id } = useParams<{ id: string }>();
  const [land, setLand] = useState<LandParcel | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadLand();
  }, [id]);

  const loadLand = async () => {
    try {
      const res = await landApi.getById(id!);
      setLand(res.data.data);
    } catch (err) {
      alert("Không tải được thông tin thửa đất");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Đang tải...</div>;
  if (!land) return <div className="p-6 text-center text-red-600">Không tìm thấy thửa đất</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
        >
          ← Quay lại
        </button>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-blue-900">Chi tiết thửa đất</h1>
              <p className="text-lg text-gray-600 mt-1">Mã: {land.parcel_code}</p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                land.registration_status === "Đã cấp"
                  ? "bg-green-100 text-green-800"
                  : land.registration_status === "Chưa cấp"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {land.registration_status || "Chưa xác định"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Thông tin thửa đất */}
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-blue-900 border-b pb-2">Thông tin thửa đất</h2>
              <div>
                <p className="text-sm text-gray-600">Địa chỉ</p>
                <p className="font-medium">{land.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Diện tích</p>
                <p className="font-medium">{land.area} m²</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Loại đất</p>
                <p className="font-medium">{land.land_type || "Chưa xác định"}</p>
              </div>
            </div>

            {/* Chủ sở hữu */}
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-blue-900 border-b pb-2">Chủ sở hữu</h2>
              {land.owner ? (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Họ tên</p>
                    <p className="font-medium">{land.owner.UserProfile?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Số điện thoại</p>
                    <p className="font-medium">{land.owner.UserProfile?.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{land.owner.UserProfile?.email}</p>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 italic">Chưa có chủ sở hữu</p>
              )}
            </div>
            
          </div>
              {(land.latitude || land.longitude) && (
                <div className="mt-8">
                    <h3 className="text-xl font-bold text-blue-900 mb-4">Vị trí trên bản đồ</h3>
                    <ParcelMap land={land} />
                </div>
            )}
          {/* GCN */}
          {(land.certificate_number || land.certificate_issue_date) && (
            <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="text-lg font-bold text-blue-900 mb-3">Giấy chứng nhận QSDĐ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Số GCN</p>
                  <p className="font-medium">{land.certificate_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày cấp</p>
                  <p className="font-medium">
                    {land.certificate_issue_date
                      ? new Date(land.certificate_issue_date).toLocaleDateString("vi-VN")
                      : "Chưa có"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}