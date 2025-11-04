// src/components/register/Step2.tsx
import { useState } from "react";
import { authApi } from "../../api";
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react"; // Import thêm icon

type Props = {
  email: string;
  onNext: () => void;
  onBack: () => void;
};

export default function Step2({ email, onNext, onBack }: Props) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  
  // Dùng state này để quản lý thông báo thành công (gửi lại OTP)
  const [successMessage, setSuccessMessage] = useState(""); 

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    
    // Kiểm tra định dạng OTP
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
        return setError("Mã OTP phải là 6 chữ số.");
    }

    try {
      setLoading(true);
      await authApi.verifyOTP(email, otp);
      onNext();
    } catch (err: any) {
      setError(err.response?.data?.message || "Mã xác thực không hợp lệ hoặc đã hết hạn.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      setError(""); // Xóa lỗi cũ nếu có
      setSuccessMessage(""); // Xóa thông báo cũ
      
      await authApi.sendOTP(email);
      setSuccessMessage("Mã xác thực mới đã được gửi thành công!");
      
      // Xóa thông báo thành công sau 4 giây
      setTimeout(() => setSuccessMessage(""), 4000); 
    } catch {
      setError("Không thể gửi lại mã xác thực. Vui lòng thử lại sau.");
    } finally {
      setResending(false);
    }
  };

  return (
    <form onSubmit={handleVerify} className="space-y-6">
      
      {/* Tiêu đề */}
      <h3 className="text-xl font-bold text-gray-800 text-center">
          Xác thực Email
      </h3>
      <p className="text-base text-gray-600 text-center">
        Vui lòng nhập mã xác thực (OTP) đã được gửi đến: 
        <br />
        <strong className="text-blue-600">{email}</strong>
      </p>

      {/* Input OTP */}
      <div className="relative">
          <input
              type="text"
              placeholder="— — — — — —" // Ký tự gợi ý đẹp hơn
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              // Điều chỉnh style input: text-3xl, font-bold, tracking-widest
              className={`w-full text-center text-3xl font-bold tracking-[0.7em] px-4 py-3 border-2 rounded-xl transition duration-200 focus:outline-none 
                  ${error ? 'border-red-500 ring-red-200' : 'border-gray-300 focus:ring-4 focus:ring-blue-200 focus:border-blue-500'}
              `}
              autoFocus // Tự động focus vào input
              inputMode="numeric"
          />
      </div>

      {/* Hiển thị thông báo lỗi/thành công */}
      {error && (
          <p className="text-sm text-red-600 text-center flex items-center justify-center space-x-1">
              <AlertTriangle size={16} /> <span>{error}</span>
          </p>
      )}
      {successMessage && (
          <p className="text-sm text-green-600 text-center flex items-center justify-center space-x-1">
              <CheckCircle size={16} /> <span>{successMessage}</span>
          </p>
      )}

      {/* Nút Gửi lại mã */}
      <button
        type="button"
        onClick={handleResend}
        disabled={resending}
        className="w-full text-sm text-blue-600 font-medium hover:text-blue-700 disabled:opacity-50 transition duration-200"
      >
        {resending ? (
             <span className="flex items-center justify-center">
                 <Loader2 size={16} className="animate-spin mr-2" /> Đang gửi lại...
             </span>
        ) : (
            "Bạn không nhận được mã? Gửi lại"
        )}
      </button>

      {/* Nhóm Nút hành động */}
      <div className="flex gap-4 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 text-gray-600 rounded-xl border border-gray-300 hover:bg-gray-100 transition duration-200 font-semibold"
        >
          Quay lại
        </button>
        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin mr-2" />
          ) : (
            "Xác nhận"
          )}
        </button>
      </div>
    </form>
  );
}