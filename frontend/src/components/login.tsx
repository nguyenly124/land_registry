// src/components/LoginModal.tsx
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { createPortal } from "react-dom";
import Register from "./register/register";
import { authApi } from "../api";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { X } from "lucide-react";
import type { AuthUser } from "../api";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import ForgotPasswordModal from "./ForgotPasswordModal";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function LoginModal({ open, onClose }: Props) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [openRegister, setOpenRegister] = useState(false);
  const [openForgot, setOpenForgot] = useState(false);
  // Form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");

  // VITE: Lấy key từ .env
  const RECAPTCHA_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
 
  // Tải reCAPTCHA v3 khi cần
  useEffect(() => {
    if (!showCaptcha || !RECAPTCHA_KEY) return;

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_KEY}`;
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      // @ts-ignore
      window.grecaptcha.ready(() => {
        // @ts-ignore
        window.grecaptcha.execute(RECAPTCHA_KEY, { action: "login" }).then((token: string) => {
          setCaptchaToken(token);
        });
      });
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [showCaptcha, RECAPTCHA_KEY]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      setLoading(true);
      const payload: any = { username, password };
      if (showCaptcha && captchaToken) {
        payload.captcha = captchaToken;
      }

      const res = await authApi.login(payload);

      const authUser: AuthUser = {
        account_id: res.user.account_id,
        username: res.user.username,
        role: res.user.role,
        token: res.token,
      };

      login(authUser);
      onClose();

      setTimeout(() => {
        if (authUser.role === "Cán bộ") navigate("/staff/dashboard");
        else navigate("/");
      }, 300);

      // Reset
      setFailedAttempts(0);
      setShowCaptcha(false);
      setCaptchaToken("");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Đăng nhập thất bại.";

      setFailedAttempts((prev) => {
        const newCount = prev + 1;
        if (newCount >= 5 && !showCaptcha) {
          setShowCaptcha(true);
        }
        if (newCount >= 10) {
          setError("Tài khoản bị khóa 30 phút. Vui lòng thử lại sau.");
        }
        return newCount;
      });

      if (failedAttempts + 1 < 10) {
        setError(msg);
        // Tạo lại token nếu CAPTCHA sai
        if (showCaptcha && RECAPTCHA_KEY) {
          // @ts-ignore
          window.grecaptcha.execute(RECAPTCHA_KEY, { action: "login" }).then(setCaptchaToken);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setOpenForgot(true);
  };

  // Reset form
  useEffect(() => {
    if (!open) {
      setUsername("");
      setPassword("");
      setError("");
      setShowPassword(false);
      setLoading(false);
      setFailedAttempts(0);
      setShowCaptcha(false);
      setCaptchaToken("");
    }
  }, [open]);

  // Khóa scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={dialogRef}
        className="relative z-[1001] w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">Đăng nhập</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            aria-label="Đóng"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="mb-1 block font-semibold">Tên đăng nhập</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 outline-none"
              placeholder="Nhập tên đăng nhập"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-1 block font-semibold">Mật khẩu</label>
            <div className="flex items-center border rounded-xl">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 px-3 py-2 outline-none"
                placeholder="Nhập mật khẩu"
              />
              <button
                type="button"
                className="p-2 text-gray-600 hover:text-blue-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
          </div>

          {/* reCAPTCHA v3: Ẩn, chỉ hiện badge nhỏ góc dưới */}
          {showCaptcha && RECAPTCHA_KEY && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-blue-700">
                <div className="animate-spin">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                </div>
                <span className="font-medium">
                  Đang xác minh bảo mật tự động...
                </span>
              </div>
              
            </div>
          )}

          {/* Lỗi */}
          {error && <p className="text-center text-sm font-medium text-red-600">{error}</p>}

          {/* Đăng ký */}
          <div className="flex items-center justify-center my-4">
            <div className="flex-1 border-t border-gray-400"></div>
            <span
              className="mx-2 cursor-pointer text-sm text-blue-700 hover:text-blue-800"
              onClick={() => setOpenRegister(true)}
            >
              Đăng ký
            </span>
            <Register open={openRegister} onClose={() => setOpenRegister(false)} />
            <div className="flex-1 border-t border-gray-400"></div>
          </div>

          {/* Nút đăng nhập */}
          <button
            type="submit"
            disabled={loading || (showCaptcha && !captchaToken)}
            className="w-full rounded-xl border-2 border-blue-600 bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-white hover:text-blue-600 disabled:opacity-50 transition"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          {/* Quên mật khẩu */}
          <button
            type="button"
            onClick={handleForgotPassword}
            className="w-full text-sm text-blue-600 hover:text-blue-700"
          >
            Quên mật khẩu?
          </button>
          
        </form>
        <ForgotPasswordModal
            open={openForgot}
            onClose={() => setOpenForgot(false)}
            onNext={(email) => {
              setOpenForgot(false);
              onClose();
              navigate(`/reset-password?email=${encodeURIComponent(email)}`);
            }}
          />
      </div>
    </div>,
    document.body
  );
}