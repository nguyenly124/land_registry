// src/components/dossier/detail/ActionButtons.tsx
import { FileCheck, MessageSquare, FileX } from "lucide-react";

interface ActionButtonsProps {
  onApprove: () => void;
  onSupplement: () => void;
  onReject: () => void;
}

export default function ActionButtons({ onApprove, onSupplement, onReject }: ActionButtonsProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
      <h2 className="text-xl font-bold text-blue-800 mb-4">Hành động xử lý</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={onApprove}
          className="flex flex-col items-center p-4 bg-green-50 border-2 border-green-300 rounded-xl hover:shadow-md transition group"
        >
          <FileCheck className="w-10 h-10 text-green-600 mb-2 group-hover:scale-110 transition" />
          <span className="font-semibold text-green-800">Duyệt hồ sơ</span>
        </button>

        <button
          onClick={onSupplement}
          className="flex flex-col items-center p-4 bg-orange-50 border-2 border-orange-300 rounded-xl hover:shadow-md transition group"
        >
          <MessageSquare className="w-10 h-10 text-orange-600 mb-2 group-hover:scale-110 transition" />
          <span className="font-semibold text-orange-800">Yêu cầu bổ sung</span>
        </button>

        <button
          onClick={onReject}
          className="flex flex-col items-center p-4 bg-red-50 border-2 border-red-300 rounded-xl hover:shadow-md transition group"
        >
          <FileX className="w-10 h-10 text-red-600 mb-2 group-hover:scale-110 transition" />
          <span className="font-semibold text-red-800">Từ chối</span>
        </button>
      </div>
    </div>
  );
}