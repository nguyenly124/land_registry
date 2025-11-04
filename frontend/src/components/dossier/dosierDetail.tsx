// src/pages/DossierDetail.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import  { dossierApi } from "../../api/dossierApi";
import type { HoSo } from "../../api/types";
import { formatDate } from "../../../utils/date";

const statusColorMap: Record<HoSo["status"], string> = {
  "Chờ xử lý": "yellow",
  "Đang xử lý": "blue",
  "Đã duyệt": "green",
  "Từ chối": "red",
};

function StatusBadge({ status }: { status: HoSo["status"] }) {
  const color = statusColorMap[status] || "gray";
  return (
    <span className={`px-4 py-2 rounded-full text-sm font-semibold bg-${color}-100 text-${color}-700`}>
      {status}
    </span>
  );
}

export default function DossierDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [dossier, setDossier] = useState<HoSo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    
    const fetchDossier = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const response = await dossierApi.getdetail(id);
        setDossier(response.data);
    
      } catch (err: any) {
        const msg = err.response?.hoso?.message || "Không thể tải chi tiết hồ sơ.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchDossier();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  const handleEdit = async () => {
  if (!dossier) return;
  try {
    const updatedData = {
      hosoId: dossier.hoso_id,
      type: dossier.type, 
    };

    const res = await dossierApi.edit(updatedData);
    alert(res.message || "Cập nhật hồ sơ thành công!");
    window.location.reload();
  } catch (err: any) {
    alert(err.response?.data?.message || "Không thể chỉnh sửa hồ sơ.");
  }
};

const handleCancel = async () => {
  if (!dossier) return;
  const confirmCancel = window.confirm("Bạn có chắc muốn hủy hồ sơ này?");
  if (!confirmCancel) return;

  try {
    const res = await dossierApi.cancel({ hosoId: dossier.hoso_id });
    alert(res.message || "Hồ sơ đã được hủy thành công!");
    window.location.reload();
  } catch (err: any) {
    alert(err.response?.data?.message || "Không thể hủy hồ sơ.");
  }
};
  if (error || !dossier) {
    return (
        
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center">
          <p className="font-semibold text-lg">{error || "Hồ sơ không tồn tại."}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
        
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg my-10">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            
        <div>
          <h1 className="text-3xl font-bold text-blue-900">CHI TIẾT HỒ SƠ</h1>
          <p className="text-gray-600 mt-1">Mã hồ sơ: <span className="font-mono font-bold text-blue-700">#{dossier.hoso_id}</span></p>
        </div>
        
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </button>
      </div>

      {/* Thông tin chính */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Cột 1 */}
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-gray-500">Loại hồ sơ</p>
            <p className="text-lg font-semibold text-gray-900">{dossier.type}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Trạng thái</p>
            <div className="mt-1">
              <StatusBadge status={dossier.status} />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Ngày nộp</p>
            <p className="text-gray-900">{formatDate(dossier.created_at)}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Cập nhật lần cuối</p>
            <p className="text-gray-900">{formatDate(dossier.updated_at)}</p>
          </div>
        </div>

        {/* Cột 2 - Thửa đất */}
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-gray-500">Thửa đất</p>
            {dossier.parcel ? (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="font-bold text-blue-900">{dossier.parcel.parcel_code}</p>
                <p className="text-sm text-gray-700 mt-1">{dossier.parcel.address}</p>
              </div>
            ) : (
              <p className="text-gray-500 italic">Không có thửa đất liên kết</p>
            )}
          </div>
        </div>
      </div>
            
      {/* Người nộp */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-bold text-blue-900 mb-4">THÔNG TIN NGƯỜI NỘP</h3>
        <div className="bg-gray-50 p-5 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Họ tên</p>
              <p className="font-semibold text-gray-900">
                {dossier.account?.UserProfile?.full_name || "Không có"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Số điện thoại</p>
              <p className="text-gray-900">
                {dossier.account?.UserProfile?.phone || "Không có"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-gray-900">
                {dossier.account?.UserProfile?.email || "Không có"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tài khoản</p>
              <p className="text-gray-900">{dossier.account?.username}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tài liệu đính kèm (nếu có) */}

      {dossier.HoSoDocuments && dossier.HoSoDocuments.length > 0 && (
        <div className="border-t mt-6 pt-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">TÀI LIỆU ĐÍNH KÈM</h3>
          <div className="space-y-3">
            {dossier.HoSoDocuments.map((doc) => (
              <div
                key={doc.doc_id}
                className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">{doc.doc_name}</p>
                    <p className="text-xs text-gray-500">Tải lên: {formatDate(doc.uploaded_at)}</p>
                  </div>
                </div>
                <a
                  href={doc.file_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  Xem
                </a>
              </div>
            ))}
          </div>
        </div>
        
      )}
      {dossier.status === "Chờ xử lý" && (
          <div className="flex justify-end gap-3 mt-8  ">
            <button
              onClick={() => handleEdit()}
              className="px-5 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
            >
              Chỉnh sửa hồ sơ
            </button>
            <button
              onClick={() => handleCancel()}
              className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Yêu cầu hủy hồ sơ
            </button>
          </div>
        )}
    </div>
  );
}
