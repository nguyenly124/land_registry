// src/components/register/Step3.tsx
import { useState } from "react";
import { authApi } from "../../api";
import { Loader2, AlertTriangle } from "lucide-react"; // Import icon

type Props = {
  data: { email: string; username: string; password: string };
  onSuccess: () => void;
};

export default function Step3({ data, onSuccess }: Props) {
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [cccd, setCccd] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // --- Cập nhật kiểm tra đầy đủ thông tin trước khi validate chi tiết ---
    if (!fullName.trim() || !dob || !phone.trim() || !address.trim() || !cccd.trim()) {
        return setError("Vui lòng điền đầy đủ tất cả các trường!");
    }
    
    if (!/^([A-Za-zÀ-ỹ\s]+){2,}$/.test(fullName.trim()))
      return setError("Họ tên phải có ít nhất 2 từ và chỉ chứa chữ cái.");
    
    // Kiểm tra ngày sinh hợp lệ (ví dụ: không phải ngày trong tương lai)
    const today = new Date().toISOString().split('T')[0];
    if (dob > today) {
        return setError("Ngày sinh không hợp lệ (không thể là ngày trong tương lai).");
    }

    if (!/^(03|05|07|08|09)\d{8}$/.test(phone))
      return setError("SĐT phải 10 số, bắt đầu bằng 03,05,07,08,09.");
    if (cccd.length !== 12 || !/^\d+$/.test(cccd))
      return setError("CCCD phải đủ 12 số.");
    if (address.trim().length < 5) return setError("Địa chỉ ít nhất 5 ký tự.");

    try {
      setLoading(true);
      await authApi.register({
        ...data,
        full_name: fullName.trim(), // Đảm bảo không có khoảng trắng thừa
        dob,
        phone,
        address: address.trim(), // Đảm bảo không có khoảng trắng thừa
        email: data.email,
        cccd,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5"> {/* Tăng khoảng cách giữa các phần tử */}
     <p className="text-sm text-gray-600 text-center mb-4">
          Vui lòng điền thông tin cá nhân của bạn để hoàn tất đăng ký.
      </p>

      {/* Input Họ và tên */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
        <input 
          id="fullName"
          type="text"
          placeholder="Ví dụ: Nguyễn Văn A" 
          value={fullName} 
          onChange={e => setFullName(e.target.value)} 
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
          autoComplete="name"
        />
      </div>
      
      {/* Input Ngày sinh */}
      <div>
        <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
        <input 
          id="dob" 
          type="date" 
          value={dob} 
          onChange={e => setDob(e.target.value)} 
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
          max={new Date().toISOString().split('T')[0]} // Không cho chọn ngày trong tương lai
        />
      </div>

      {/* Input Số điện thoại */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
        <input 
          id="phone"
          type="tel" // Loại input tel tốt hơn cho SĐT
          placeholder="Ví dụ: 0912345678" 
          value={phone} 
          onChange={e => setPhone(e.target.value.replace(/\D/g, ""))} 
          maxLength={10} 
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
          autoComplete="tel"
          inputMode="numeric"
        />
      </div>

      {/* Input Địa chỉ */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ (Quê quán)</label>
        <input 
          id="address"
          type="text"
          placeholder="Ví dụ: Số 1, đường ABC, Hà Nội" 
          value={address} 
          onChange={e => setAddress(e.target.value)} 
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
          autoComplete="address-level1" // Hoặc phù hợp hơn
        />
      </div>

      {/* Input CCCD */}
      <div>
        <label htmlFor="cccd" className="block text-sm font-medium text-gray-700 mb-1">Số CCCD/CMND</label>
        <input 
          id="cccd"
          type="text" // Có thể dùng text vì CCCD không chỉ là số
          placeholder="Nhập 12 số CCCD" 
          value={cccd} 
          onChange={e => setCccd(e.target.value.replace(/\D/g, ""))} 
          maxLength={12} 
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
          inputMode="numeric"
        />
      </div>

      {/* Hiển thị lỗi */}
      {error && (
        <p className="text-sm text-red-600 text-center flex items-center justify-center space-x-1 mt-4">
            <AlertTriangle size={16} /> <span>{error}</span>
        </p>
      )}

      {/* Nút Hoàn tất */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-6"
      >
        {loading ? (
          <Loader2 size={20} className="animate-spin mr-2" />
        ) : (
          "Hoàn tất đăng ký"
        )}
      </button>
    </form>
  );
}