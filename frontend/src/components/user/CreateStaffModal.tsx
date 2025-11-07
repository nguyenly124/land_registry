// src/components/user/CreateStaffModal.tsx
import { useState } from "react";
import { userApi } from "../../api";
import type { CreateStaffRequest } from "../../api";
import { X, Loader2 } from "lucide-react";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateStaffModal({ onClose, onSuccess }: Props) {
  const [form, setForm] = useState<CreateStaffRequest>({
    username: "", password: "", full_name: "", dob: "", address: "", phone: "", email: "", cccd: "", position: "", agency: "", staff_code: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userApi.createStaff(form);
      onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.message || "Lỗi tạo tài khoản");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-900">Tạo tài khoản cán bộ</h2>
          <button aria-label="create" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required placeholder="Tên đăng nhập" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <input required type="password" placeholder="Mật khẩu" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <input required placeholder="Họ và tên" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <input required type="date" placeholder="Ngày sinh" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} className="px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <input required placeholder="Địa chỉ" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <input required placeholder="Số điện thoại" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <input required type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <input required placeholder="CCCD" value={form.cccd} onChange={e => setForm({ ...form, cccd: e.target.value })} className="px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <input required placeholder="Chức vụ" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} className="px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <input required placeholder="Cơ quan" value={form.agency} onChange={e => setForm({ ...form, agency: e.target.value })} className="px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <input required placeholder="Mã cán bộ" value={form.staff_code} onChange={e => setForm({ ...form, staff_code: e.target.value })} className="md:col-span-2 px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              Tạo tài khoản
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}