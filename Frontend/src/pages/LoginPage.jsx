import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMail, FiLock, FiCode, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      if (data.success) {
        toast.success("Welcome back!");
        navigate(from, { replace: true });
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--cc-bg)" }}
    >
      {/* Background glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ background: "var(--cc-accent)" }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--cc-accent), var(--cc-accent-2))" }}
            >
              <FiCode size={20} color="white" />
            </div>
          </Link>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: "var(--font-display)", color: "var(--cc-text)" }}
          >
            Welcome back
          </h1>
          <p style={{ color: "var(--cc-text-muted)", fontSize: "0.9rem" }}>
            Sign in to your CollabCode account
          </p>
        </div>

        {/* Form card */}
        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <FormField
              label="Email"
              icon={<FiMail size={16} />}
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              required
            />

            <div>
              <label
                className="block mb-2 text-sm font-semibold"
                style={{ color: "var(--cc-text-muted)" }}
              >
                Password
              </label>
              <div className="relative">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--cc-text-dim)" }}
                >
                  <FiLock size={16} />
                </span>
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "var(--cc-surface-2)",
                    border: "1px solid var(--cc-border)",
                    color: "var(--cc-text)",
                    fontFamily: "var(--font-mono)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--cc-accent)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--cc-border)")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--cc-text-dim)" }}
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{
                background: "linear-gradient(135deg, var(--cc-accent), var(--cc-accent-2))",
                fontFamily: "var(--font-display)",
                fontSize: "0.95rem",
              }}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <p
            className="text-center text-sm mt-6"
            style={{ color: "var(--cc-text-muted)" }}
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold"
              style={{ color: "var(--cc-accent)" }}
            >
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export const FormField = ({ label, icon, type = "text", placeholder, value, onChange, required }) => (
  <div>
    <label className="block mb-2 text-sm font-semibold" style={{ color: "var(--cc-text-muted)" }}>
      {label}
    </label>
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--cc-text-dim)" }}>
          {icon}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full py-3 rounded-xl text-sm outline-none transition-all"
        style={{
          paddingLeft: icon ? "2.5rem" : "1rem",
          paddingRight: "1rem",
          background: "var(--cc-surface-2)",
          border: "1px solid var(--cc-border)",
          color: "var(--cc-text)",
          fontFamily: type === "email" || type === "password" ? "var(--font-mono)" : "var(--font-display)",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--cc-accent)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--cc-border)")}
      />
    </div>
  </div>
);

export default LoginPage;
