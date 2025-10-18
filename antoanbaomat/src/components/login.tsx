import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Register from "./register";
import { validateLoginByCCCD, type AuthUser } from "../data/data"; 

type Props = {
  open: boolean;
  onClose: () => void;
  onLogin?: (user: AuthUser) => void; // callback để Header cập nhật
};

export default function LoginModal({ open, onClose, onLogin }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [openRegister, setOpenRegister] = useState(false);
  const [CMND, setCMND] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cccd = CMND.trim();
    if (cccd.length !== 12) {
      setError("Số CMND/CCCD phải đủ 12 số!");
      return;
    }
    if (!password) {
      setError("Vui lòng nhập mật khẩu!");
      return;
    }

    //hàm xác thực demo
    const res = validateLoginByCCCD(cccd, password);
    if (!res.ok) {
      setError(res.error);
      return;
    }

    // thành công--> lưu vào localStorage và thông báo cho Header
    try {
      localStorage.setItem("authUser", JSON.stringify(res.user));
    } catch (err) {
      // ignore
      console.error(err);
    }
    setError("");
    setSuccess("Đăng nhập thành công!");
    if (onLogin) onLogin(res.user);

    // đóng modal sau 300ms (không reload trang)
    setTimeout(() => {
      setSuccess("");
      onClose();
    }, 300);
  };

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const modalUI = (
    <div aria-modal="true" role="dialog" className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div ref={dialogRef} className="relative z-[1001] w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl" onClick={(e)=>e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-center gap-4">
          <h2 className="text-xl font-bold">ĐĂNG NHẬP</h2>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block font-semibold">Số CMND/CCCD</label>
            <input autoFocus type="text" className="w-full rounded-xl border px-3 py-2 outline-none" placeholder="Nhập số CMND/CCCD" value={CMND} onChange={(e)=>setCMND(e.target.value)} />
          </div>

          <div>
            <label className="mb-1 block font-semibold">Mật khẩu</label>
            <div className="flex justify-center items-center border rounded-xl">
              <input type={showPassword ? "text" : "password"} className="w-full px-3 py-2 outline-none" placeholder="Nhập mật khẩu" value={password} onChange={(e)=>setPassword(e.target.value)} />
              <button type="button" tabIndex={-1} className="ml-2" onClick={()=>setShowPassword(v=>!v)}>
                <img src={showPassword ? "/image/hidePass.png" : "/image/showPass.png"} alt={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"} className="w-6 h-6 mx-4" />
              </button>
            </div>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}

          <div className="flex justify-center mt-10 mb-2 items-center">
            <div className="flex-1 border-t border-gray-400"></div>
            <label className="text-xs text-gray-700 hover:text-blue-800 cursor-pointer mx-2" onClick={()=>setOpenRegister(true)}>Đăng ký</label>
            <Register open={openRegister} onClose={()=>setOpenRegister(false)} />
            <div className="flex-1 border-t border-gray-400"></div>
          </div>

          <button type="submit" className="w-full rounded-xl border-2 border-blue-600 bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-white hover:text-blue-600">Đăng nhập</button>
        </form>
      </div>
    </div>
  );

  return createPortal(modalUI, document.body);
}