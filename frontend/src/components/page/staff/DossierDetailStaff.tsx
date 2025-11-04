// src/pages/staff/DossierDetailStaff.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { dossierApi } from "../../../api/dossierApi";
import type { HoSo } from "../../../api/types";
import { formatDate } from "../../../../utils/date";
import { Loader2, AlertCircle, CheckCircle, XCircle, FilePlus, MessageSquare, ArrowLeft } from "lucide-react";

interface ActionModal {
  type: "approve" | "request" | "reject" | null;
  open: boolean;
  note?: string;
}

export default function DossierDetailStaff() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [dossier, setDossier] = useState<HoSo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<ActionModal>({ type: null, open: false });

  useEffect(() => {
    const fetchDossier = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await dossierApi.getdetail(id);
        setDossier(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Không thể tải chi tiết hồ sơ.");
      } finally {
        setLoading(false);
      }
    };
    fetchDossier();
  }, [id]);

  const openModal = (type: "approve" | "request" | "reject") => {
    setActionModal({ type, open: true, note: "" });
  };

  const closeModal = () => {
    setActionModal({ type: null, open: false });
  };

  const handleAction = async () => {
    if (!dossier || !actionModal.type) return;

    const payload: any = {
      hosoId: dossier.hoso_id,
    };

    if (actionModal.type === "request" || actionModal.type === "reject") {
      payload.note = actionModal.note;
    }

    try {
      let res;
      switch (actionModal.type) {
        case "approve":
          res = await dossierApi.approve(payload);
          break;
        case "request":
        if (!actionModal.note?.trim()) return alert("Vui lòng nhập nội dung!");
        res = await dossierApi.requestSupplement(dossier.hoso_id, actionModal.note);
        break;

        case "reject":
        if (!actionModal.note?.trim()) return alert("Vui lòng nhập lý do!");
        res = await dossierApi.reject(dossier.hoso_id, actionModal.note);
        break;
      }
      alert(res.data.message || "Thao tác thành công!");
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.message || "Thao tác thất bại.");
    }
  };

  const getStatusConfig = (status: HoSo["status"]) => {
    const map = {
      "Chờ xử lý": { bg: "yellow-100", text: "yellow-800", icon: <AlertCircle className="w-4 h-4" /> },
      "Đang xử lý": { bg: "blue-100", text: "blue-800", icon: <Loader2 className="w-4 h-4 animate-spin" /> },
      "Đã duyệt": { bg: "green-100", text: "green-800", icon: <CheckCircle className="w-4 h-4" /> },
      "Từ chối": { bg: "red-100", text: "red-800", icon: <XCircle className="w-4 h-4" /> },
      "Yêu cầu bổ sung": { bg: "orange-100", text: "orange-800", icon: <FilePlus className="w-4 h-4" /> },
    };
    return map[status] || { bg: "gray-100", text: "gray-800", icon: null };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !dossier) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center">
          <p className="font-semibold text-lg">{error || "Hồ sơ không tồn tại."}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(dossier.status);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-3">
              CHI TIẾT HỒ SƠ
            </h1>
            <p className="text-gray-600 mt-1">
              Mã hồ sơ: <span className="font-mono font-bold text-blue-700">#{dossier.hoso_id}</span>
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

      {/* Trạng thái nổi bật */}
      <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {statusConfig.icon}
            <div>
              <p className="text-sm font-medium text-gray-500">Trạng thái hiện tại</p>
              <p className={`text-xl font-bold text-${statusConfig.text}`}>{dossier.status}</p>
            </div>
          </div>
          <span className={`px-6 py-3 rounded-full font-bold text-${statusConfig.text} bg-${statusConfig.bg} border-2 border-${statusConfig.text.replace("800", "300")}`}>
            {dossier.status}
          </span>
        </div>
      </div>

      {/* Thông tin chính */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột 1 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-4">THÔNG TIN HỒ SƠ</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Loại hồ sơ</p>
                <p className="text-lg font-semibold text-gray-900">{dossier.type}</p>
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
          </div>

          {/* Thửa đất */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-4">THÔNG TIN THỬA ĐẤT</h3>
            {dossier.parcel ? (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-5 rounded-lg border border-blue-200">
                <p className="font-bold text-xl text-blue-900">{dossier.parcel.parcel_code}</p>
                <p className="text-gray-700 mt-1 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {dossier.parcel.address}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 italic">Không có thửa đất liên kết</p>
            )}
          </div>
        </div>

        {/* Cột 2 - Người nộp */}
        <div className="bg-white rounded-xl shadow-md p-6 h-fit">
          <h3 className="text-lg font-bold text-blue-900 mb-4">NGƯỜI NỘP HỒ SƠ</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                {dossier.account?.UserProfile?.full_name?.[0] || "U"}
              </div>
              <div>
                <p className="font-bold text-gray-900">
                  {dossier.account?.UserProfile?.full_name || "Không có"}
                </p>
                <p className="text-sm text-gray-500">@{dossier.account?.username}</p>
              </div>
            </div>
            <div className="border-t pt-4 space-y-2">
              <p className="text-sm"><strong>SĐT:</strong> {dossier.account?.UserProfile?.phone || "—"}</p>
              <p className="text-sm"><strong>Email:</strong> {dossier.account?.UserProfile?.email || "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tài liệu */}
      {dossier.HoSoDocuments && dossier.HoSoDocuments.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">TÀI LIỆU ĐÍNH KÈM</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dossier.HoSoDocuments.map((doc) => (
              <a
                key={doc.doc_id}
                href={doc.file_path}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">{doc.doc_name}</p>
                    <p className="text-xs text-gray-500">Tải lên: {formatDate(doc.uploaded_at)}</p>
                  </div>
                </div>
                <span className="text-blue-600 font-medium">Xem</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Hành động (chỉ hiển thị nếu Chờ xử lý) */}
      {dossier.status === "Chờ xử lý" && (
        <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-600">
          <h3 className="text-xl font-bold text-blue-900 mb-6">HÀNH ĐỘNG XỬ LÝ</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => openModal("approve")}
              className="p-6 bg-green-50 border-2 border-green-300 rounded-xl hover:bg-green-100 transition flex flex-col items-center gap-3"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
              <span className="font-bold text-green-800">Xác nhận xử lý</span>
              <p className="text-sm text-green-600">Chuyển sang "Đang xử lý"</p>
            </button>

            <button
              onClick={() => openModal("request")}
              className="p-6 bg-orange-50 border-2 border-orange-300 rounded-xl hover:bg-orange-100 transition flex flex-col items-center gap-3"
            >
              <FilePlus className="w-10 h-10 text-orange-600" />
              <span className="font-bold text-orange-800">Yêu cầu bổ sung</span>
              <p className="text-sm text-orange-600">Gửi yêu cầu cho người nộp</p>
            </button>

            <button
              onClick={() => openModal("reject")}
              className="p-6 bg-red-50 border-2 border-red-300 rounded-xl hover:bg-red-100 transition flex flex-col items-center gap-3"
            >
              <XCircle className="w-10 h-10 text-red-600" />
              <span className="font-bold text-red-800">Từ chối hồ sơ</span>
              <p className="text-sm text-red-600">Cần lý do cụ thể</p>
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {actionModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {actionModal.type === "approve" && "Xác nhận xử lý hồ sơ"}
                {actionModal.type === "request" && "Yêu cầu bổ sung tài liệu"}
                {actionModal.type === "reject" && "Từ chối hồ sơ"}
              </h3>
              <button title="close" onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {(actionModal.type === "request" || actionModal.type === "reject") && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {actionModal.type === "request" ? "Nội dung yêu cầu" : "Lý do từ chối"}
                </label>
                <textarea
                  value={actionModal.note || ""}
                  onChange={(e) => setActionModal({ ...actionModal, note: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={4}
                  placeholder="Nhập chi tiết..."
                />
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleAction}
                className={`px-6 py-2 rounded-lg text-white font-medium transition ${
                  actionModal.type === "approve" ? "bg-green-600 hover:bg-green-700" :
                  actionModal.type === "request" ? "bg-orange-600 hover:bg-orange-700" :
                  "bg-red-600 hover:bg-red-700"
                }`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}