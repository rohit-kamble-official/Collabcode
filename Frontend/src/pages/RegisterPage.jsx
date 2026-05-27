import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiCode, FiEye, FiEyeOff, FiCheck, FiX } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const PasswordCheck = ({ ok, label }) => (
  <div className="flex items-center gap-1.5 text-xs" style={{ color: ok ? "var(--cc-green)" : "var(--cc-text-dim)" }}>
    {ok ? <FiCheck size={12} /> : <FiX size={12} />}
    {label}
  </div>
);

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const checks = {
    length: form.password.length >= 6,
    match: form.password === form.confirm && form.confirm.length > 0,
    user: form.username.length >= 3,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!checks.length) return toast.error("Password must be at least 6 characters");
    if (!checks.match) return toast.error("Passwords do not match");
    if (!checks.user) return toast.error("Username must be at least 3 characters");

    setLoading(true);
    try {
      const data = await register(form.username, form.email, form.password);
      if (data.success) {
        toast.success("Account created! Welcome to CollabCode 🎉");
        navigate("/dashboard");
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, icon, name, type = "text", placeholder, extra }) => (
    <div>
      <label className="block mb-2 text-sm font-semibold" style={{ color: "var(--cc-text-muted)" }}>
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--cc-text-dim)" }}>
          {icon}
        </span>
        <input
          type={type}
          value={form[name]}
          onChange={(e) => setForm({ ...form, [name]: e.target.value })}
          placeholder={placeholder}
          required
          className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none transition-all"
          style={{
            background: "var(--cc-surface-2)",
            border: "1px solid var(--cc-border)",
            color: "var(--cc-text)",
            fontFamily: type === "email" || type === "password" ? "var(--font-mono)" : "var(--font-display)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--cc-accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--cc-border)")}
        />
        {extra}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--cc-bg)" }}>
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: "var(--cc-accent-2)" }}
      />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--cc-accent), var(--cc-accent-2))" }}
            >
              <FiCode size={20} color="white" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--cc-text)" }}>
            Create account
          </h1>
          <p style={{ color: "var(--cc-text-muted)", fontSize: "0.9rem" }}>
            Join CollabCode and start collaborating
          </p>
        </div>

        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Field label="Username" icon={<FiUser size={16} />} name="username" placeholder="cooldev42" />
            <Field label="Email" icon={<FiMail size={16} />} name="email" type="email" placeholder="you@example.com" />

            <div>
              <label className="block mb-2 text-sm font-semibold" style={{ color: "var(--cc-text-muted)" }}>
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--cc-text-dim)" }}>
                  <FiLock size={16} />
                </span>
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min 6 characters"
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

              {form.password && (
                <div className="mt-2 flex gap-4">
                  <PasswordCheck ok={checks.length} label="6+ chars" />
                  <PasswordCheck ok={checks.user} label="Username 3+ chars" />
                </div>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold" style={{ color: "var(--cc-text-muted)" }}>
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--cc-text-dim)" }}>
                  <FiLock size={16} />
                </span>
                <input
                  type="password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  placeholder="Repeat your password"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "var(--cc-surface-2)",
                    border: `1px solid ${form.confirm ? (checks.match ? "var(--cc-green)" : "var(--cc-red)") : "var(--cc-border)"}`,
                    color: "var(--cc-text)",
                    fontFamily: "var(--font-mono)",
                  }}
                  onFocus={(e) => { if (!form.confirm) e.target.style.borderColor = "var(--cc-accent)"; }}
                />
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
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "var(--cc-text-muted)" }}>
            Already have an account?{" "}
            <Link to="/login" className="font-semibold" style={{ color: "var(--cc-accent)" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
