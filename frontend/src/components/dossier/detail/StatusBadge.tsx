// src/components/dossier/detail/StatusBadge.tsx
import { AlertCircle, Loader2, CheckCircle, XCircle,AlertTriangle } from "lucide-react";

interface StatusBadgeProps {
  status: "Chờ xử lý" | "Đang xử lý" | "Đã duyệt" | "Từ chối";
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    "Chờ xử lý": { bg: "yellow-100", text: "yellow-800", icon: <AlertCircle className="w-5 h-5" /> },
    "Đang xử lý": { bg: "blue-100", text: "blue-800", icon: <Loader2 className="w-5 h-5 animate-spin" /> },
    "Đã duyệt": { bg: "green-100", text: "green-800", icon: <CheckCircle className="w-5 h-5" /> },
    "Từ chối": { bg: "red-100", text: "red-800", icon: <XCircle className="w-5 h-5" /> },
  }[status];

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-600">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {config.icon}
          <div>
            <p className="text-sm font-medium text-gray-500">Trạng thái hiện tại</p>
            {/* <p className={`text-xl font-bold text-${config.text}`}>{status}</p> */}
          </div>
        </div>
        <span className={`px-6 py-3 rounded-full font-bold text-${config.text} bg-${config.bg} border-2 border-${config.text.replace("800", "300")}`}>
          {status}
        </span>
      </div>
    </div>
  );
}