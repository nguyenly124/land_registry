// src/components/user/UserTable.tsx
import { Shield, User } from "lucide-react";
import type { Account } from "../../api/types";
import { format } from "date-fns";

interface Props {
  users: Account[];
}

export default function UserTable({ users }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-blue-900 uppercase">Họ tên</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-blue-900 uppercase">Tài khoản</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-blue-900 uppercase">Vai trò</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-blue-900 uppercase">Email</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-blue-900 uppercase">SĐT</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-blue-900 uppercase">CCCD</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-blue-900 uppercase">Mã cán bộ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.account_id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                  {user.UserProfile?.avatar_url ? (
                    <img src={user.UserProfile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                      {user.UserProfile?.full_name?.[0] || "U"}
                    </div>
                  )}
                  {user.UserProfile?.full_name || "Chưa có"}
                </td>
                <td className="px-6 py-4 text-gray-700">@{user.username}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                    user.role === "Cán bộ" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                  }`}>
                    {user.role === "Cán bộ" ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-700">{user.UserProfile?.email || "—"}</td>
                <td className="px-6 py-4 text-gray-700">{user.UserProfile?.phone || "—"}</td>
                <td className="px-6 py-4 text-gray-700 font-mono">{user.UserProfile?.cccd || "—"}</td>
                <td className="px-6 py-4 text-gray-700 font-mono">
                  {user.UserProfile?.staff_code || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Không có người dùng nào.
          </div>
        )}
      </div>
    </div>
  );
}