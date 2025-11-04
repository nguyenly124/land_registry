// src/App.tsx
import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "./components/header";
import Home from "./components/home";
import Instructions from "./components/instructions";
import Profile from "./components/page/user/profile";
import Footer from "./components/footer";
import LandProfile from "./components/dossier/landProfile";
import DossierDetail from "./components/dossier/dosierDetail";
import AdminHome from "./components/page/staff/adminHome"; 
import { AuthProvider, useAuth } from "./context/authContext";
import DossierManagement from "../src/components/page/staff/dossierStaff"
import DossierDetailStaff from "./components/page/staff/DossierDetailStaff";
function AppContent() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "Cán bộ";
  const goHome = () => navigate("/");
  const goInstructions = () => navigate("/instructions");
  const goProfile = () => navigate("/profile");
  const goLandProfile = () => navigate("/landprofile");
  const handleLogout = () => {
    logout();
    goHome();
  };
  useEffect(() => {
    if (user) {
      if (isAdmin) navigate("/staff/dashboard");
      else navigate("/");
    }
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Header
        onSupport={goInstructions}
        onHome={goHome}
        onProfile={goProfile}
        onLandProfile={goLandProfile}
        onLogout={handleLogout}
        isLoggedIn={!!user}
        username={user?.username}
      />

      <main className="flex-1">
        <Routes>
          {/* Trang chủ mặc định */}
          <Route path="/" element={<Home onShowInstructions={goInstructions} />} />

          {/* Trang hướng dẫn */}
          <Route path="/instructions" element={<Instructions />} />

          {/* Trang hồ sơ cá nhân */}
          <Route path="/profile" element={<Profile />} />
          

          {/* Trang hồ sơ đất */}
          <Route
            path="/landprofile" element={<LandProfile />} />
           
          {/* Trang chi tiết hồ sơ */}
          <Route path="/dossier/:id" element={<DossierDetail />} />
          <Route path="/dossierstaff" element={<DossierManagement />} />
          <Route path="/dossierstaff/:id" element={<DossierDetailStaff />}/>
          {/* Trang dành cho Cán bộ */}
          <Route
            path="/staff/dashboard"
            element={
              user
                ? (isAdmin ? <AdminHome /> : <Home onShowInstructions={goInstructions} />)
                : <Home onShowInstructions={goInstructions} />
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
