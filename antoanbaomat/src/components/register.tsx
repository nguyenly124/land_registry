import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import RegisterProfile from "./registerProfile";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function RegiternModal({ open, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // hiện/ẩn mk
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // check mk
  const [CMND, setCMND] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  // success
  // const [success, setSuccess] = useState("");

  const [openProfile, setOpenProfile] = useState(false);

  // useEffect(() => {
  //   if (success) {
  //     // 0.5s chuyển về trang main
  //     const timer = setTimeout(() => {
  //       window.location.href = "/";
  //     }, 500);
  //     return () => clearTimeout(timer);
  //   }
  // }, [success]);

  useEffect(() => {
    if (!open) return;

    // Khóa scroll nền
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Đóng bằng ESC
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(CMND.length !== 12){
      setError("Số CMND/CCCD phải đủ 12 số!");
      return;
    }
    // điều kiện mk
    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!strongPassword.test(password)) {
      setError("Mật khẩu phải ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt!");
      return;
    }
    if (password !== confirm) {
      setError("Mật khẩu và xác nhận mật khẩu không khớp!");
      return;
    }
    setError("");
    // onClose();
    setOpenProfile(true);
    // setSuccess("Tiếp tục!");
    // Xử lý đăng ký ở đây
  };

  const modalUI = (
    <div
      aria-modal="true"
      role="dialog"
      aria-labelledby="regester-title"
      className="fixed inset-0 z-[1000] flex items-center justify-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        className="relative z-[1001] w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-center gap-4">
          <h2 className="text-xl font-bold ">
            ĐĂNG KÝ
          </h2>
        </div>

        {/* Form mẫu */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="">
            <label className="mb-1 block font-semibold">Số CMND/CCCD</label>
            <div >
                <input
                    autoFocus
                    type="text"
                    className="w-full rounded-xl border px-3 py-2 outline-none"
                    placeholder="Nhập số CMND/CCCD"
                    value={CMND}
                    onChange={(e) => setCMND(e.target.value)}
                />
            </div>
            
          </div>
          {/* pass */}
          <div>
            <label className="mb-1 block font-semibold">Mật khẩu</label>
            <div className="flex justify-center items-center border rounded-xl">
                <input
                    type={showPassword ? "text" : "password"}
                    className="w-full px-3 py-2 outline-none "
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    type="button"
                    tabIndex={-1}
                    className="ml-2"
                    onClick={() => setShowPassword((v) => !v)}
                >
                    <img
                        src={showPassword ? "/image/hidePass.png" : "/image/showPass.png"}
                        alt={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        className="w-6 h-6 mx-4"
                    />
                </button>
            </div>
          </div>
          {/* confirm pass */}
          <div>
            <label className="mb-1 block font-semibold">Nhập lại mật khẩu</label>

            <div className="flex justify-center items-center border rounded-xl">
                <input
                    type={showConfirm ? "text" : "password"}
                    className="w-full rounded-xl  px-3 py-2 outline-none"
                    placeholder="Nhập lại mật khẩu"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                />
                <button
                    type="button"
                    tabIndex={-1}
                    className=""
                    onClick={() => setShowConfirm((v) => !v)}
                >
                    <img
                        src={showConfirm ? "/image/hidePass.png" : "/image/showPass.png"}
                        alt={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        className="w-6 h-6 mx-4"
                    />
                </button>

            </div>
            
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl border-2 border-blue-600 bg-blue-600 mt-2 px-4 py-2 font-semibold text-white transition-colors hover:bg-white hover:text-blue-600"
            // onClick={() => setOpenProfile(true)}
          >
            Tiếp tục
            
          </button>
        </form>

        {/* <RegisterProfile open={openProfile} onClose={() => setOpenProfile(false)} /> */}
        <RegisterProfile open={openProfile} onClose={() => { setOpenProfile(false); onClose(); }} />
      </div>
    </div>
  );

  // Dùng Portal để modal nằm trên mọi layer
  return createPortal(modalUI, document.body);
}
