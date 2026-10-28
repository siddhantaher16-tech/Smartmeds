import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../constants";
import { getAvatarColors, getInitials } from "../../utils/avatarColors";

export default function Sidebar({ role }: { role?: string }) {
  const { logout, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userRole = role || profile?.role || ROLES.PATIENT;
  const { bg, text } = getAvatarColors(profile?.full_name || "");

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const getLinkClassName = (path: string) => {
    const isActive = location.pathname === path;
    return isActive
      ? "flex items-center gap-3 px-4 py-3 rounded-lg bg-white/10 border-l-4 border-accent-teal text-white font-medium shadow-sm transition-all"
      : "flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-all text-slate-300 font-medium";
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-primary text-white flex flex-col justify-between p-6 z-50 shadow-2xl">
      <div className="flex flex-col gap-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-accent-teal p-1.5 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(45,212,191,0.3)]">
            <span className="material-symbols-outlined text-white text-2xl">
              pulse_alert
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold leading-none tracking-tight">
              SmartMeds AI
            </h1>
            <p className="text-[10px] text-slate-300 uppercase tracking-widest mt-1 font-bold opacity-80">
              Health Intelligence
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {userRole === ROLES.PATIENT ? (
            <>
              <Link
                to="/patient/dashboard"
                className={getLinkClassName("/patient/dashboard")}
              >
                <span className="material-symbols-outlined">dashboard</span>
                <span>Dashboard</span>
              </Link>
              <Link
                to="/patient/doctors"
                className={getLinkClassName("/patient/doctors")}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  person_search
                </span>
                <span>My Doctors</span>
              </Link>
              <Link
                to="/patient/reports"
                className={getLinkClassName("/patient/reports")}
              >
                <span className="material-symbols-outlined">description</span>
                <span>My Reports</span>
              </Link>
              <Link
                to="/patient/profile"
                className={getLinkClassName("/patient/profile")}
              >
                <span className="material-symbols-outlined">
                  account_circle
                </span>
                <span>Profile</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/doctor/dashboard"
                className={getLinkClassName("/doctor/dashboard")}
              >
                <span className="material-symbols-outlined">dashboard</span>
                <span>Dashboard</span>
              </Link>
              <Link
                to="/doctor/patients"
                className={getLinkClassName("/doctor/patients")}
              >
                <span className="material-symbols-outlined">group</span>
                <span>My Patients</span>
              </Link>
              <Link
                to="/doctor/profile"
                className={getLinkClassName("/doctor/profile")}
              >
                <span className="material-symbols-outlined">person_pin</span>
                <span>Profile</span>
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Sidebar Bottom (User Profile) */}
      <div className="flex flex-col gap-4 border-t border-white/10 pt-6">
        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 group hover:bg-white/10 transition-all cursor-default">
          <div className="relative">
            <div
              className="size-10 rounded-xl flex items-center justify-center text-sm font-black shadow-md ring-2 ring-white/10 group-hover:ring-accent-teal/30 transition-all"
              style={{ backgroundColor: bg, color: text }}
            >
              {getInitials(profile?.full_name || "")}
            </div>
            <div className="absolute -bottom-1 -right-1 size-3.5 bg-emerald-500 border-2 border-primary rounded-full shadow-sm"></div>
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm font-bold truncate text-white group-hover:text-accent-teal transition-colors">
              {profile?.full_name || "Guest User"}
            </p>
            <span className="text-[9px] bg-accent-teal/20 text-accent-teal px-2 py-0.5 rounded-full font-black uppercase w-fit tracking-wider">
              {profile?.role || "Patient"}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all w-full text-left group"
        >
          <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">
            logout
          </span>
          <span className="text-sm font-bold">Logout</span>
        </button>
      </div>
    </aside>
  );
}
