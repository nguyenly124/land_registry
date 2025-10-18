import Login from "./login";
import { useEffect, useState } from "react";
import Register from "./register";
import type { AuthUser } from "../data/data";

interface Props {
  onSupport: () => void;
  onHome: () => void;
  onProfile: () => void;
  onLandProfile: () => void;
  onAuthChange?: (user: AuthUser | null) => void;
}

function Header({ onSupport, onHome, onProfile, onLandProfile, onAuthChange }: Props) {
  const [open, setOpen] = useState<"login" | "register" | null>(null);

  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("authUser");
      if (raw) {
        const parsed = JSON.parse(raw) as AuthUser;
        setAuthUser(parsed);
        // Thông báo cho App biết trạng thái hiện tại khi Header mount
        if (onAuthChange) onAuthChange(parsed);
      } else {
        if (onAuthChange) onAuthChange(null);
      }
    } catch (error) {
      console.error(error);
      setAuthUser(null);
      if (onAuthChange) onAuthChange(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authUser");
    setAuthUser(null);
    if (onAuthChange) onAuthChange(null); // báo App ẩn profile
    // optional: reload để reset state app
    // window.location.href = "/";
  };

  return (
    <>
      <div
        className="py-2 flex justify-around items-center border-b-2 border-gray-300 
                   sticky top-0 z-50 bg-white shadow-xl"
      >
        {/* logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={onHome}>
          <div>
            <img
              src="/image/logo_1.png"
              alt="Logo"
              className="align-middle justify-center w-12 h-12"
            />
          </div>
          <div
            className="flex-col font-bold text-2xl text-center"
            style={{ color: "#1E40AF" }}
          >
            <div>Cổng thông tin</div>
            <div>địa chính</div>
          </div>
          <div></div>
        </div>

        {/* menu */}
        <div className="flex justify-between gap-16 text-lg font-semibold">
          <div className="cursor-pointer" onClick={onHome}>Trang Chủ</div>
          <div className="cursor-pointer" onClick={onProfile}>Hồ sơ cá nhân</div>
          <div className="cursor-pointer" onClick={onLandProfile}>Hồ sơ đất</div>
          <div className="cursor-pointer" onClick={onSupport}>Hỗ trợ</div>
        </div>

        {/* nút đăng ký/đăng nhập hoặc thông tin user khi đã login */}
        <div className="flex gap-4 items-center">
          {authUser ? (
            // Hiển thị tên + CCCD và nút đăng xuất
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-700">
                <div className="font-semibold">{authUser.username}</div>
                <div className="text-xs text-gray-500">CCCD: {authUser.CCCD}</div>
              </div>
              <button
                className="text-gray-700 px-3 py-1 border rounded hover:bg-gray-100"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <>
              <button
                className="text-blue-600 font-semibold px-4 py-2 rounded border-2
                           border-blue-600 hover:bg-blue-600 hover:text-white"
                onClick={() => setOpen("register")}
              >
                Đăng ký
              </button>

              <button
                className="bg-blue-600 text-white font-semibold px-4 py-2 rounded
                           hover:bg-white hover:text-blue-600 border-2 border-blue-600"
                onClick={() => setOpen("login")}
              >
                Đăng nhập
              </button>
            </>
          )}

          <Login
            open={open === "login"}
            onClose={() => setOpen(null)}
            onLogin={(user) => {
              setAuthUser(user);
              setOpen(null);
              if (onAuthChange) onAuthChange(user); // báo App khi login thành công
            }}
          />
          <Register open={open === "register"} onClose={() => setOpen(null)} />
        </div>
      </div>
    </>
  );
}

export default Header;