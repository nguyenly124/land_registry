// src/components/dashboard/Header.tsx
import { Activity } from "lucide-react";
import { format } from "date-fns";

interface HeaderProps {
  username: string;
}

export default function Header({ username }: HeaderProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-blue-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 flex items-center gap-3">
            <Activity className="w-10 h-10 text-blue-600" />
            TRANG CHỦ CÁN BỘ
          </h1>
          <p className="text-gray-600 mt-2">
            Chào mừng <span className="font-semibold text-blue-700">{username}</span> - Quản lý hệ thống địa chính
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
          {format(new Date(), "EEEE, dd 'tháng' MM, yyyy")}
        </div>
      </div>
    </div>
  );
}