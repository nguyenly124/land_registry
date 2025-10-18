import { useRef, useState, useEffect } from "react";
import Header from "./components/header";
import Home from "./components/home";
import Instructions from "./components/instructions";
import Profile from "./components/profile";
import Footer from "./components/footer";
import LandProfile from "./components/landProfile";
import AdminProfile from "./components/adminProfile";
import AdminLandProfile from "./components/adminLandProfile";
import type { AuthUser } from "./data/data";

function App() {
  const instructionsRef = useRef<HTMLDivElement>(null);
  const homeRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const landProfileRef = useRef<HTMLDivElement>(null);

  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("authUser");
      if (raw) setAuthUser(JSON.parse(raw) as AuthUser);
    } catch {
      setAuthUser(null);
    }
  }, []);

  const HEADER_OFFSET = 82;

  const scrollLandProfileRef = () => {
    if (landProfileRef.current) {
      const y = landProfileRef.current.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const scrollToInstructions = () => {
    if (instructionsRef.current) {
      const y = instructionsRef.current.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const scrollToHome = () => {
    if (homeRef.current) {
      const y = homeRef.current.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const scrollToProfile = () => {
    if (profileRef.current) {
      const y = profileRef.current.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET - 40;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const isAdmin = authUser?.role === "admin";

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Header
        onSupport={scrollToInstructions}
        onHome={scrollToHome}
        onProfile={scrollToProfile}
        onLandProfile={scrollLandProfileRef}
        onAuthChange={(user) => {
          setAuthUser(user);
          if (!user) scrollToHome();
        }}
      />

      {/* Nội dung chiếm phần còn lại */}
      <main className="flex-1">
        <div ref={homeRef}>
          <Home onShowInstructions={scrollToInstructions} />
        </div>

        <div ref={instructionsRef}>
          <Instructions />
        </div>

        {authUser && (
          <div ref={profileRef}>
            {isAdmin ? <AdminProfile /> : <Profile />}
          </div>
        )}

        {authUser && (
          <div ref={landProfileRef}>
            {isAdmin ? <AdminLandProfile /> : <LandProfile />}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
