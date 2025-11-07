// src/pages/staff/DossierDetailStaff.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { dossierApi } from "../../../api/dossierApi";
import type { HoSo } from "../../../api/types";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import ParcelMap from "../../common/ParcelMap";
import Header from "../../../components/dossier/detail/Header";
import StatusBadge from "../../../components/dossier/detail/StatusBadge";
import DossierInfo from "../../../components/dossier/detail/DossierInfo";
import LandInfo from "../../../components/dossier/detail/LandInfo";
import UserInfo from "../../../components/dossier/detail/UserInfo";
import DocumentList from "../../../components/dossier/detail/DocumentList";
import ActionButtons from "../../../components/dossier/detail/ActionButtons";
import ActionModal from "../../../components/dossier/detail/ActionModal";

interface ActionModalState {
  type: "approve" | "request" | "reject" | null;
  open: boolean;
  note: string;
}

export default function DossierDetailStaff() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [dossier, setDossier] = useState<HoSo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<ActionModalState>({ type: null, open: false, note: "" });

  useEffect(() => {
    const fetchDossier = async () => {
      if (!id) return;
      try {
        setLoading(true);
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
    setActionModal({ type: null, open: false, note: "" });
  };

  const handleAction = async () => {
    if (!dossier || !actionModal.type || (actionModal.type !== "approve" && !actionModal.note.trim())) {
      alert("Vui lòng nhập nội dung!");
      return;
    }

    try {
      let res;
      switch (actionModal.type) {
        case "approve":
          res = await dossierApi.approve(dossier.hoso_id);
          break;
        case "request":
          res = await dossierApi.requestSupplement(dossier.hoso_id, actionModal.note);
          break;
        case "reject":
          res = await dossierApi.reject(dossier.hoso_id, actionModal.note);
          break;
      }
      alert(`Hồ sơ đã được ${actionModal.type === "approve" ? "duyệt" : actionModal.type === "request" ? "yêu cầu bổ sung" : "từ chối"} thành công!`);
      const updated = await dossierApi.getdetail(id!);
      setDossier(updated.data);
      closeModal();
    } catch (err: any) {
      alert(err.response?.data?.message || "Xử lý thất bại.");
    }
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

  const canAct = ["Chờ xử lý", "Đang xử lý"].includes(dossier.status);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <Header dossierId={dossier.hoso_id} />
      <StatusBadge dossier={dossier} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DossierInfo type={dossier.type} created_at={dossier.created_at} updated_at={dossier.updated_at} />
          <LandInfo parcel={dossier.parcel} />
          {(dossier.parcel?.latitude || dossier.parcel?.longitude) && (
              <div className="mt-8">
                  <h3 className="text-xl font-bold text-blue-900 mb-4">Vị trí trên bản đồ</h3>
                  <ParcelMap land={dossier.parcel} />
              </div>
          )}
        </div>
        <UserInfo
          full_name={dossier.account?.UserProfile?.full_name}
          username={dossier.account?.username}
          phone={dossier.account?.UserProfile?.phone}
          email={dossier.account?.UserProfile?.email}
        />
      </div>

      {dossier.HoSoDocuments && dossier.HoSoDocuments.length > 0 && (
        <DocumentList documents={dossier.HoSoDocuments} />
      )}

      {canAct && (
        <ActionButtons
          onApprove={() => openModal("approve")}
          onSupplement={() => openModal("request")}
          onReject={() => openModal("reject")}
        />
      )}

      {actionModal.open && actionModal.type && (
        <ActionModal
          type={actionModal.type}
          note={actionModal.note}
          onNoteChange={(note) => setActionModal({ ...actionModal, note })}
          onConfirm={handleAction}
          onClose={closeModal}
        />
      )}
    </div>
  );
}