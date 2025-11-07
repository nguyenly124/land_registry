// src/components/dossier/detail/UserInfo.tsx
interface UserInfoProps {
  full_name?: string;
  username?: string;
  phone?: string;
  email?: string;
}

export default function UserInfo({ full_name, username, phone, email }: UserInfoProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 h-fit">
      <h3 className="text-lg font-bold text-blue-900 mb-4">NGƯỜI NỘP HỒ SƠ</h3>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
            {full_name?.[0] || "U"}
          </div>
          <div>
            <p className="font-bold text-gray-900">{full_name || "Không có"}</p>
            <p className="text-sm text-gray-500">@{username}</p>
          </div>
        </div>
        <div className="border-t pt-4 space-y-2">
          <p className="text-sm"><strong>SĐT:</strong> {phone || "—"}</p>
          <p className="text-sm"><strong>Email:</strong> {email || "—"}</p>
        </div>
      </div>
    </div>
  );
}