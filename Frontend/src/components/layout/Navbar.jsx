import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiCode, FiMenu, FiX, FiLogOut, FiGrid, FiHome } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { Avatar } from "../ui";
import toast from "react-hot-toast";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "rgba(10, 10, 15, 0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--cc-border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--cc-accent), var(--cc-accent-2))" }}
            >
              <FiCode size={16} color="white" />
            </div>
            <span
              className="text-lg font-bold tracking-tight hidden sm:block"
              style={{ fontFamily: "var(--font-display)", color: "var(--cc-text)" }}
            >
              Collab<span style={{ color: "var(--cc-accent)" }}>Code</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {user ? (
              <>
                <NavLink to="/dashboard" active={isActive("/dashboard")} icon={<FiGrid size={15} />}>
                  Dashboard
                </NavLink>
                <div className="flex items-center gap-3 ml-4 pl-4" style={{ borderLeft: "1px solid var(--cc-border)" }}>
                  <Avatar username={user.username} color={user.color} size={30} />
                  <span style={{ color: "var(--cc-text-muted)", fontSize: "0.875rem" }}>{user.username}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all"
                    style={{ color: "var(--cc-text-muted)" }}
                    onMouseEnter={(e) => { e.target.style.color = "var(--cc-red)"; }}
                    onMouseLeave={(e) => { e.target.style.color = "var(--cc-text-muted)"; }}
                  >
                    <FiLogOut size={14} /> Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <NavLink to="/" active={isActive("/")} icon={<FiHome size={15} />}>Home</NavLink>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm transition-all"
                  style={{ color: "var(--cc-text-muted)" }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    background: "linear-gradient(135deg, var(--cc-accent), var(--cc-accent-2))",
                    color: "white",
                  }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg"
            style={{ color: "var(--cc-text-muted)" }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="md:hidden pb-4 pt-2 flex flex-col gap-2"
            style={{ borderTop: "1px solid var(--cc-border)" }}
          >
            {user ? (
              <>
                <div className="flex items-center gap-3 px-2 py-3">
                  <Avatar username={user.username} color={user.color} size={36} />
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--cc-text)" }}>{user.username}</p>
                    <p className="text-xs" style={{ color: "var(--cc-text-muted)" }}>{user.email}</p>
                  </div>
                </div>
                <Link to="/dashboard" className="px-3 py-2.5 rounded-lg text-sm" style={{ color: "var(--cc-text)" }} onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="text-left px-3 py-2.5 rounded-lg text-sm" style={{ color: "var(--cc-red)" }}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2.5 text-sm" style={{ color: "var(--cc-text)" }} onClick={() => setMobileOpen(false)}>Login</Link>
                <Link to="/register" className="px-3 py-2.5 text-sm font-semibold rounded-lg text-center" style={{ background: "var(--cc-accent)", color: "white" }} onClick={() => setMobileOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

const NavLink = ({ to, active, icon, children }) => (
  <Link
    to={to}
    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all"
    style={{
      color: active ? "var(--cc-accent)" : "var(--cc-text-muted)",
      background: active ? "var(--cc-accent-glow)" : "transparent",
    }}
  >
    {icon}
    {children}
  </Link>
);

export default Navbar;
