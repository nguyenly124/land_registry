// src/components/register/Step1.tsx
import { useState } from "react";
import { authApi } from "../../api";

type Props = {
  onNext: (data: { email: string; username: string; password: string }) => void;
   onBack?: () => void;
};

export default function Step1({ onNext, onBack }: Props) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()||  !username.trim()|| !password.trim()|| !confirm.trim() ) {
    return setError("Vui lòng nhập đầy đủ thông tin!");
    }
    if (!email.includes("@")) return setError("Email không hợp lệ.");
    if (username.length < 3) return setError("Tên đăng nhập ít nhất 3 ký tự.");
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password))
      return setError("Mật khẩu phải ≥8 ký tự, có hoa, thường, số, ký tự đặc biệt.");
    if (password !== confirm) return setError("Mật khẩu không khớp!");

    try {
      setLoading(true);
      await authApi.sendOTP(email);
      onNext({ email, username, password });
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể gửi OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* <h2 className="text-l font-bold text-center text-blue-600">NHẬP THÔNG TIN CƠ BẢN</h2> */}
    
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        
      />
      <input
        type="text"
        placeholder="Tên đăng nhập"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        
      />
      <input
        type="password"
        placeholder="Mật khẩu"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        
      />
      <input
        type="password"
        placeholder="Xác nhận mật khẩu"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        
      />

      {error && <p className="text-red-600 text-sm text-center">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Đang gửi OTP..." : "Gửi mã xác nhận"}
      </button>
      {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-full bg-gray-300 text-gray-800 py-2 rounded-xl font-semibold hover:bg-gray-400"
          >
            Quay lại đăng nhập
          </button>
      )}
    </form>
  );
}