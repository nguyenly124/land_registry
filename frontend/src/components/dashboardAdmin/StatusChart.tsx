// src/components/dashboard/StatusChart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity } from "lucide-react";

interface StatusChartProps {
  pending: number;
  processing: number;
  approved: number;
  rejected: number;
}

export default function StatusChart({ pending, processing, approved, rejected }: StatusChartProps) {
  const data = [
    { name: "Chờ xử lý", value: pending, fill: "#f59e0b" },
    { name: "Đang xử lý", value: processing, fill: "#3b82f6" },
    { name: "Đã duyệt", value: approved, fill: "#10b981" },
    { name: "Từ chối", value: rejected, fill: "#ef4444" },
  ];

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 mt-8">
      <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
        <Activity className="w-7 h-7 text-blue-600" />
        BIỂU ĐỒ TRẠNG THÁI HỒ SƠ
      </h2>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fill: "#6b7280", fontSize: 12 }} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px" }} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-6 mt-4 flex-wrap text-sm text-gray-600">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-amber-500 rounded"></div> Chờ xử lý</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-500 rounded"></div> Đang xử lý</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded"></div> Đã duyệt</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded"></div> Từ chối</div>
      </div>
    </div>
  );
}