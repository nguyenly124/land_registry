// src/components/dossier/detail/StatusBadge.tsx
import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  FileText,
  User,
  ArrowRight,
} from "lucide-react";
import { dossierApi } from "../../../api/dossierApi";
import type { HoSo,HoSoHistory } from "../../../api/types";
import { formatDate } from "../../../../utils/date";
import { number } from "zod";

interface StatusBadgeProps {
  dossier: HoSo;
}

const statusConfig: Record<
  string,
  { bg: string; text: string; icon: React.ReactNode; label: string }
> = {
  "Chờ xử lý": {
    bg: "yellow-100",
    text: "yellow-800",
    icon: <AlertCircle className="w-5 h-5" />,
    label: "Chờ xử lý",
  },
  "Đang xử lý": {
    bg: "blue-100",
    text: "blue-800",
    icon: <Loader2 className="w-5 h-5 animate-spin" />,
    label: "Đang xử lý",
  },
  "Đã duyệt": {
    bg: "green-100",
    text: "green-800",
    icon: <CheckCircle className="w-5 h-5" />,
    label: "Đã duyệt",
  },
  "Từ chối": {
    bg: "red-100",
    text: "red-800",
    icon: <XCircle className="w-5 h-5" />,
    label: "Từ chối",
  },
};

const actionConfig: Record<string, { color: string; label: string }> = {
  "Nộp hồ sơ mới": { color: "indigo", label: "Nộp hồ sơ" },
  "Yêu cầu bổ sung": { color: "orange", label: "Yêu cầu bổ sung" },
  "Duyệt": { color: "green", label: "Duyệt hồ sơ" },
  "Từ chối": { color: "red", label: "Từ chối hồ sơ" },
};

export default function StatusBadge({ dossier }: StatusBadgeProps) {
  const [history, setHistory] = useState<HoSoHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentStatus = dossier.status;
  const config = statusConfig[currentStatus] || statusConfig["Chờ xử lý"];

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await dossierApi.getHistory(dossier.hoso_id.toString());
        setHistory(res.data || []);
      } catch (err: any) {
        setError("Không thể tải lịch sử.");
        console.error("Lỗi tải lịch sử:", err);
      } finally {
        setLoading(false);
      }
    };

    if (dossier.hoso_id) {
      fetchHistory();
    }
  }, [dossier.hoso_id]);

  // Node đầu tiên: Nộp hồ sơ
  const firstNode: HoSoHistory = {
    history_id: 0,
    hoso_id: Number(dossier.hoso_id),
    old_status: null,
    new_status: "Chờ xử lý",
    action: "Nộp hồ sơ mới",
    actor_id: Number(dossier.account_id),
    note: `Loại hồ sơ: ${dossier.type}`,
    created_at: dossier.created_at,
    actor: {
      username: dossier.account?.username || "Người dân",
      UserProfile: {
        full_name: dossier.account?.UserProfile?.full_name || "Người dân",
      },
    },
  };

  const fullHistory: HoSoHistory[] = [firstNode, ...history];

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
      {/* Phần trạng thái hiện tại */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full bg-${config.bg} text-${config.text}`}>
              {config.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Trạng thái hiện tại</p>
              <p className="text-xl font-bold text-gray-900">{currentStatus}</p>
            </div>
          </div>
          <span
            className={`px-6 py-3 rounded-full font-bold text-${config.text} bg-${config.bg} border-2 border-${config.text.replace(
              "800",
              "300"
            )}`}
          >
            {config.label}
          </span>
        </div>
      </div>

      {/* Phần lịch sử xử lý */}
      <div className="p-6">
        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4" />
          Lịch sử xử lý
        </h4>

        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <p className="text-red-600 text-sm text-center py-4">{error}</p>
        ) : fullHistory.length === 0 ? (
          <p className="text-gray-500 text-center py-6 text-sm">Chưa có lịch sử xử lý</p>
        ) : (
          <div className="relative">
            {/* Đường nối dọc */}
            <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-gray-300"></div>

            {fullHistory.map((item, index) => {
              const actionCfg = actionConfig[item.action] || { color: "gray", label: item.action };
              const isLast = index === fullHistory.length - 1;

              return (
                <div key={item.history_id || index} className="relative flex items-start gap-4 pb-6">
                  {/* Node tròn */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold z-10 ${
                      isLast ? `bg-${actionCfg.color}-600` : "bg-gray-400"
                    }`}
                  >
                    {index + 1}
                  </div>

                  {/* Nội dung */}
                  <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full bg-${actionCfg.color}-100 text-${actionCfg.color}-700`}
                      >
                        {actionCfg.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(item.created_at)}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-gray-800">
                      {item.new_status}
                      {item.old_status && (
                        <span className="text-gray-500">
                          {" "}
                          ← <span className="line-through">{item.old_status}</span>
                        </span>
                      )}
                    </p>

                    {item.note && (
                      <p className="text-sm text-gray-600 mt-1 italic">"{item.note}"</p>
                    )}

                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                      <User className="w-3 h-3" />
                      {item.actor.UserProfile?.full_name || item.actor.username}
                    </div>
                  </div>

                  {/* Mũi tên nối */}
                  {index < fullHistory.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-gray-400 mt-4" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}