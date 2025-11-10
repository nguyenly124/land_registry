// src/components/ForgotPasswordModal.tsx
import { useState } from "react";
import { authApi } from "../api/authApi";

type Props = {
  open: boolean;
  onClose: () => void;
  onNext: (email: string) => void;
};

export default function ForgotPasswordModal({ open, onClose, onNext }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    setError("Vui lòng nhập email hợp lệ.");
    return;
  }

  setLoading(true);
  setError("");
  try {
    await authApi.forgotPassword(email);
    onNext(email);
  } catch (err: any) {
    setError(err.response?.data?.message || "Không thể gửi OTP.");
  } finally {
    setLoading(false);
  }
};

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold">Quên mật khẩu?</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border py-2 text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Đang gửi..." : "Gửi OTP"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}