// src/components/dossier/detail/ActionModal.tsx
import { CheckCircle, MessageSquare, XCircle } from "lucide-react";

interface ActionModalProps {
  type: "approve" | "request" | "reject";
  note: string;
  onNoteChange: (note: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ActionModal({ type, note, onNoteChange, onConfirm, onClose }: ActionModalProps) {
  const config = {
    approve: { color: "green", icon: <CheckCircle className="w-6 h-6 text-green-600" />, title: "Duyệt hồ sơ", button: "Duyệt" },
    request: { color: "orange", icon: <MessageSquare className="w-6 h-6 text-orange-600" />, title: "Yêu cầu bổ sung", button: "Gửi yêu cầu" },
    reject: { color: "red", icon: <XCircle className="w-6 h-6 text-red-600" />, title: "Từ chối hồ sơ", button: "Từ chối" },
  }[type];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            {config.icon} {config.title}
          </h3>
          <button aria-label="close" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {(type === "request" || type === "reject") && (
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {type === "request" ? "Nội dung yêu cầu bổ sung" : "Lý do từ chối"}
            </label>
            <textarea
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              rows={5}
              placeholder={type === "request" ? "VD: Vui lòng bổ sung bản sao CMND..." : "VD: Thiếu giấy tờ chứng minh..."}
            />
          </div>
        )}

        {type === "approve" && (
          <p className="text-sm text-gray-600 mb-5">
            Hồ sơ sẽ được <span className="font-semibold text-green-600">duyệt ngay lập tức</span> và không thể hoàn tác.
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 text-green-800 border border-gray-300 rounded-lg hover:bg-gray-50  font-medium transition flex items-center gap-2 bg-${config.color}-600 hover:bg-${config.color}-700`}
          >
            <CheckCircle className="w-5 h-5" /> {config.button}
          </button>
        </div>
      </div>
    </div>
  );
}