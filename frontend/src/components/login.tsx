import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Register from "./register/register";
import { authApi } from "../api"; 
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { X } from "lucide-react";
import type { AuthUser } from "../api";
import { useAuth } from "../context/authContext";
import { Navigate, useNavigate } from "react-router-dom";
type Props = {
  open: boolean;
  onClose: () => void;
  
};

export default function LoginModal({ open, onClose }: Props) {
  const { login } = useAuth(); 
  const navigate =useNavigate()
  const dialogRef = useRef<HTMLDivElement>(null);
  const [openRegister, setOpenRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username.trim()) {
      setError("Vui lòng nhập tên đăng nhập!");
      return;
    }
    if (!password.trim()) {
      setError("Vui lòng nhập mật khẩu!");
      return;
    }

    try {
      setLoading(true);

      const res = await authApi.login({ username, password });

      const authUser: AuthUser = {
        account_id: res.user.account_id,
        username: res.user.username,
        role: res.user.role,
        token: res.token,
      };

      // DÙNG CONTEXT → TỰ ĐỘNG LƯU localStorage + CẬP NHẬT TOÀN APP
      login(authUser);
    // ĐÓNG MODAL SAU 1.5s CHỈ KHI THÀNH CÔNG
    setTimeout(() => {
      setSuccess("");
      onClose();
      if (authUser.role === "Cán bộ") {
          navigate("/staff/dashboard");
        } else {
          navigate("/");
        }
    }, 1500);
  } catch (err: any) {
    console.error("Lỗi đăng nhập:", err);
    const msg =
      err.response?.data?.message ||
      err.message ||
      "Đăng nhập thất bại, vui lòng thử lại!";
    setError(msg);

    // TỰ ĐỘNG XÓA LỖI SAU 3s (tùy chọn)
    setTimeout(() => setError(""), 3000000);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (!open) {
      setUsername("");
      setPassword("");
      setError("");
      setSuccess("");
      setShowPassword(false);
      setLoading(false);
    }
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const modalUI = (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-[1000] flex items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        className="relative z-[1001] w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800">
                Đăng nhập 
            </h2>
            
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition p-1 rounded-full hover:bg-gray-100"
              aria-label="Đóng"
            >
              <X size={24} />
            </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="mb-1 block font-semibold">
              Tên đăng nhập
            </label>
            <input
              id="username"
              type="text"
              className="w-full rounded-xl border px-3 py-2 outline-none"
              placeholder="Nhập tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block font-semibold">
              Mật khẩu
            </label>
            <div className="flex items-center border rounded-xl">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="w-full px-3 py-2 outline-none"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="ml-2 p-2 text-gray-600 hover:text-blue-600 transition-colors"
                onClick={() => {
                  setShowPassword(true);
                  // Tự động ẩn lại sau 3 giây
                  setTimeout(() => setShowPassword(false), 3000);
                }}
              >
                {showPassword ? (
                  <FaEyeSlash size={20} title="Ẩn mật khẩu" />
                ) : (
                  <FaEye size={20} title="Hiện mật khẩu" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-center text-sm font-medium">
               {error}
            </div>
          )}
          {success && (
            <div className="text-green-600 text-center text-sm font-medium">
               {success}
            </div>
          )}

          <div className="flex justify-center mt-10 mb-2 items-center">
            <div className="flex-1 border-t border-gray-400"></div>
            <label
              className="text-s text-blue-700 hover:text-blue-800 cursor-pointer mx-2"
              onClick={() => setOpenRegister(true)}
            >
              Đăng ký
            </label>
            <Register open={openRegister} onClose={() => setOpenRegister(false)} />
            <div className="flex-1 border-t border-gray-400"></div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl border-2 border-blue-600 bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-white hover:text-blue-600 disabled:opacity-50"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );

  return createPortal(modalUI, document.body);
}
