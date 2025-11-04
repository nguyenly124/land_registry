// src/components/header.tsx
import { useState } from "react";
import Login from "./login";
import Register from "./register/register";
import { useAuth } from "../context/authContext";
import NotificationDropdown from "./page/user/NotificationDropdown";
import type { AuthUser } from "../api";

interface Props {
  onSupport: () => void;
  onHome: () => void;
  onProfile: () => void;
  onLandProfile: () => void;
  onLogout: () => void;    
  isLoggedIn: boolean;
  username?: string;
  onAuthChange?: (user: AuthUser | null) => void;
}

interface MenuItem {
  label: string;
  onClick: () => void;
}

export default function Header({
  onSupport,
  onHome,
  onProfile,
  onLandProfile,
  onLogout,
  isLoggedIn,
  username,
  onAuthChange,
}: Props) {
  const [open, setOpen] = useState<"login" | "register" | null>(null);
  const { user, logout } = useAuth(); 

  // Xử lý đăng nhập thành công
  const handleLogin = (userData: AuthUser) => {
    setOpen(null);
    if (onAuthChange) onAuthChange(userData);
  };

  // Xử lý đăng xuất
  const handleHeaderLogout = () => {
    logout(); 
    onLogout(); 
  };

  const getMenuItems = (): MenuItem[] => {
    if (!isLoggedIn) {
      return [
        { label: "Trang Chủ", onClick: onHome },
        { label: "Hỗ trợ", onClick: onSupport },
      ];
    }
    const role = user?.role;

    if (role === "Người dân") {
      return [
        { label: "Trang Chủ", onClick: onHome },
        { label: "Hồ sơ cá nhân", onClick: onProfile },
        { label: "Hồ sơ đất", onClick: onLandProfile },
        { label: "Hỗ trợ", onClick: onSupport },
      ];
    }
    return [];
  };

  const menuItems = getMenuItems();

  return (
    <>
      <div className="py-2 flex justify-around items-center border-b-2 border-gray-300 sticky top-0 z-50 bg-white shadow-xl">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={onHome}>
          <img src="/image/logo_1.png" alt="Logo" className="w-12 h-12" />
          <div className="flex flex-col font-bold text-2xl text-center" style={{ color: "#1E40AF" }}>
            <div>Cổng thông tin</div>
            <div>địa chính</div>
          </div>
        </div>

        {/* Menu */}
        <div className="flex justify-between gap-16 text-lg font-semibold">
          {menuItems.map((item) => (
            <div key={item.label} className="cursor-pointer hover:text-blue-600 transition" onClick={item.onClick}>
              {item.label}
            </div>
          ))}
        </div>

        {/* User Info / Auth */}
        <div className="flex gap-4 items-center">
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              {/* Notification */}
              {/* <div className="relative cursor-pointer p-2 rounded-full hover:bg-gray-100 transition">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v2a3 3 0 11-6 0v-2m6 0H9" />
                </svg>
                <span className="absolute top-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-red-500"></span>
              </div> */}
              <NotificationDropdown />

              {/* User Info */}
              <div className="text-sm text-gray-700">
                <div className="font-semibold">{username}</div>
                <div className="text-xs text-gray-500">
                  <span className="font-bold ml-1 text-blue-700">{user?.role}</span>
                </div>
              </div>

              {/* Logout */}
              <button
                className="text-gray-700 px-3 py-1 border rounded hover:bg-gray-100 transition"
                onClick={handleHeaderLogout}
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <>
              <button
                className="text-blue-600 font-semibold px-4 py-2 rounded border-2 border-blue-600 hover:bg-blue-600 hover:text-white transition"
                onClick={() => setOpen("register")}
              >
                Đăng ký
              </button>
              <button
                className="bg-blue-600 text-white font-semibold px-4 py-2 rounded hover:bg-white hover:text-blue-600 border-2 border-blue-600 transition"
                onClick={() => setOpen("login")}
              >
                Đăng nhập
              </button>
            </>
          )}

          {/* Modal */}
          <Login
            open={open === "login"}
            onClose={() => setOpen(null)}
            
          />
          <Register open={open === "register"} onClose={() => setOpen(null)} />
        </div>
      </div>
    </>
  );
}