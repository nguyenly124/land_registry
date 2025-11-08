// src/pages/ResetPasswordForm.tsx
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../api/authApi";

export default function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu phải ít nhất 6 ký tự.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await authApi.resetPassword(email, otp, newPassword);
      alert("Đặt lại mật khẩu thành công!");
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "OTP không hợp lệ hoặc đã hết hạn.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-2xl font-bold text-center">Đặt lại mật khẩu</h1>
        <p className="mb-4 text-sm text-gray-600">Email: <strong>{email}</strong></p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nhập mã OTP (6 chữ số)"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="w-full rounded-lg border p-3 text-center text-xl tracking-widest"
            maxLength={6}
            required
          />
          <input
            type="password"
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-lg border p-3"
            required
          />
          <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border p-3"
            required
          />

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full rounded-lg bg-green-600 py-3 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "Xác nhận"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-500">
          OTP có hiệu lực trong 5 phút.
        </p>
      </div>
    </div>
  );
}