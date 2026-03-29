import { Stethoscope, LogOut, User as UserIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useRef, useEffect } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const tabs = [
    { label: "Home", path: "/dashboard" },
    { label: "New Analysis", path: "/analyze" },
    { label: "History", path: "/history" },
  ];

  const initials = (profile?.full_name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <button
          onClick={() => navigate(user ? "/dashboard" : "/")}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80 active:scale-[0.98]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <Stethoscope className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground hidden sm:inline">
            Medi<span className="text-primary">AI</span>
          </span>
        </button>

        {user && (
          <nav className="hidden md:flex gap-1 rounded-lg bg-muted p-1">
            {tabs.map((tab) => (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-200 active:scale-[0.97] ${
                  location.pathname === tab.path
                    ? "bg-card text-foreground card-shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        )}

        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full gradient-primary text-xs font-bold text-primary-foreground transition-transform active:scale-[0.95]"
            >
              {initials}
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl bg-card border border-border card-shadow-lg py-1 z-50">
                <button
                  onClick={() => { navigate("/profile"); setDropdownOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <UserIcon className="h-4 w-4" /> Profile
                </button>
                {/* Mobile nav links */}
                <div className="md:hidden border-t border-border my-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.path}
                      onClick={() => { navigate(tab.path); setDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="border-t border-border my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
