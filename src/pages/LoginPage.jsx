import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DarkVeil from "../components/DarkVeil";
import useStore from "../store/useStore";
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from "../utils/firebase";
import { updateProfile } from "firebase/auth";

const F = "'Inter', sans-serif";
const AQUA = "#2dd4bf";

function LoginPage() {
  const navigate = useNavigate();
  const setUser = useStore((s) => s.setUser);

  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const inputStyle = {
    width: "100%", padding: "0.72rem 0.9rem",
    borderRadius: "0.5rem",
    border: "1px solid rgba(255,255,255,0.09)",
    background: "rgba(255,255,255,0.04)",
    color: "white", fontFamily: F,
    fontSize: "0.875rem", outline: "none",
    boxSizing: "border-box",
    transition: "border 0.2s ease"
  };

  const labelStyle = {
    fontFamily: F, fontWeight: 500,
    fontSize: "0.72rem", letterSpacing: "0.06em",
    color: "rgba(255,255,255,0.4)",
    display: "block", marginBottom: "0.4rem",
    textTransform: "uppercase"
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const user = await signInWithGoogle();
      setUser({
        uid: user.uid,
        name: user.displayName || user.email.split("@")[0],
        email: user.email,
        photo: user.photoURL
      });
      navigate("/chat");
    } catch (e) {
      setError("Google sign in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.email || !form.password) { setError("Please fill in all fields"); return; }
    if (!isLogin && !form.name) { setError("Please enter your name"); return; }

    setLoading(true);
    try {
      let user;
      if (isLogin) {
        user = await signInWithEmail(form.email, form.password);
      } else {
        user = await signUpWithEmail(form.email, form.password);
        await updateProfile(user, { displayName: form.name });
      }
      setUser({
        uid: user.uid,
        name: form.name || user.displayName || user.email.split("@")[0],
        email: user.email,
        photo: user.photoURL
      });
      navigate("/chat");
    } catch (e) {
      const msg = e.code === "auth/user-not-found" ? "No account found with this email"
        : e.code === "auth/wrong-password" ? "Incorrect password"
        : e.code === "auth/email-already-in-use" ? "Email already registered"
        : e.code === "auth/weak-password" ? "Password must be at least 6 characters"
        : e.code === "auth/invalid-email" ? "Invalid email address"
        : e.code === "auth/invalid-credential" ? "Invalid email or password"
        : "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden", backgroundColor: "#0a0a0f" }}>

      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}>
        <DarkVeil hueShift={0} noiseIntensity={0.04} speed={0.4} warpAmount={0.2} />
      </div>
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.55)", zIndex: 1 }} />

      <div style={{
        position: "relative", zIndex: 2,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        minHeight: "100vh", padding: "2rem 1.5rem"
      }}>

        {/* Logo */}
        <div onClick={() => navigate("/")} style={{
          fontFamily: F, fontWeight: 800, fontSize: "1.35rem",
          background: `linear-gradient(135deg, ${AQUA}, #8b5cf6)`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: "2rem", cursor: "pointer", letterSpacing: "-0.02em"
        }}>
          ResearchMind
        </div>

        {/* Card */}
        <div style={{
          width: "100%", maxWidth: "400px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: "1rem", padding: "2rem",
          backdropFilter: "blur(24px)"
        }}>

          {/* Title */}
          <h2 style={{ fontFamily: F, fontWeight: 600, fontSize: "1.1rem", color: "white", margin: "0 0 0.4rem 0" }}>
            {isLogin ? "Welcome back" : "Create account"}
          </h2>
          <p style={{ fontFamily: F, fontWeight: 400, fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", margin: "0 0 1.5rem 0" }}>
            {isLogin ? "Sign in to your ResearchMind account" : "Start researching with AI agents"}
          </p>

          {/* Google Button */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            style={{
              width: "100%", padding: "0.75rem",
              borderRadius: "0.5rem",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "white", fontFamily: F,
              fontWeight: 500, fontSize: "0.875rem",
              cursor: googleLoading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: "0.6rem",
              transition: "background 0.2s ease",
              marginBottom: "1.25rem"
            }}>
            {/* Google SVG icon */}
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
            </svg>
            {googleLoading ? "Signing in..." : "Continue with Google"}
          </button>

          {/* Divider */}
          <div style={{
            display: "flex", alignItems: "center",
            gap: "0.75rem", marginBottom: "1.25rem"
          }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
            <span style={{ fontFamily: F, fontSize: "0.72rem", color: "rgba(255,255,255,0.25)" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* Toggle */}
          <div style={{
            display: "flex", background: "rgba(255,255,255,0.05)",
            borderRadius: "0.5rem", padding: "0.2rem", marginBottom: "1.25rem"
          }}>
            {["Login", "Sign Up"].map((label, i) => (
              <button key={label}
                onClick={() => { setIsLogin(i === 0); setError(""); }}
                style={{
                  flex: 1, padding: "0.45rem", borderRadius: "0.35rem",
                  border: "none", fontFamily: F, fontSize: "0.82rem", fontWeight: 500,
                  cursor: "pointer", transition: "all 0.2s ease",
                  background: (isLogin && i === 0) || (!isLogin && i === 1)
                    ? `linear-gradient(135deg, ${AQUA}, #8b5cf6)` : "transparent",
                  color: (isLogin && i === 0) || (!isLogin && i === 1)
                    ? "white" : "rgba(255,255,255,0.35)"
                }}>
                {label}
              </button>
            ))}
          </div>

          {/* Name */}
          {!isLogin && (
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Name</label>
              <input type="text" placeholder="Your name" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                style={inputStyle} />
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={inputStyle} />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Password</label>
            <input type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={inputStyle} />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: "1rem", padding: "0.6rem 0.9rem",
              borderRadius: "0.5rem", background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              color: "#f87171", fontFamily: F, fontSize: "0.8rem"
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            style={{
              width: "100%", padding: "0.8rem",
              borderRadius: "0.5rem", border: "none",
              background: loading ? "rgba(255,255,255,0.08)"
                : `linear-gradient(135deg, ${AQUA}, #8b5cf6)`,
              color: "white", fontFamily: F, fontWeight: 600,
              fontSize: "0.875rem", cursor: loading ? "not-allowed" : "pointer",
              transition: "opacity 0.2s ease"
            }}>
            {loading ? "Please wait..." : isLogin ? "Sign in →" : "Create account →"}
          </button>

        </div>
      </div>
    </div>
  );
}

export default LoginPage;