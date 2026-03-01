import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DarkVeil from "../components/DarkVeil";
import useStore from "../store/useStore";
import { logOut } from "../utils/firebase";
import OrbitAgents from "../components/OrbitAgents";

const F = "'Inter', sans-serif";
const AQUA = "#2dd4bf";
const AQUA_RGB = "45,212,191";

function LandingPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useStore();
  const [showContent, setShowContent] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 300);
    setTimeout(() => setShowButtons(true), 1500);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logOut();
      logout();
      navigate("/");
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden", backgroundColor: "#0a0a0f" }}>

      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}>
        <DarkVeil hueShift={0} noiseIntensity={0.04} speed={0.4} warpAmount={0.2} />
      </div>
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", zIndex: 1 }} />

      {/* Floating Navbar — only when logged in */}
      {isAuthenticated && (
        <div style={{
          position: "fixed", top: "1rem",
          left: "50%", transform: "translateX(-50%)",
          zIndex: 100,
          width: "calc(100% - 2rem)",
          maxWidth: "860px"
        }}>
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            padding: "0.6rem 1rem",
            borderRadius: "999px",
            background: "rgba(15,15,25,0.75)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.3)"
          }}>
            {/* Logo */}
            <div 
  onClick={() => navigate(0)}
  style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}
>
              <img src="/logo.png" alt="logo" style={{
  width: "28px", height: "28px", borderRadius: "50%",
  objectFit: "cover"
}} />
              <span style={{
                fontFamily: F, fontWeight: 700, fontSize: "0.9rem",
                background: `linear-gradient(135deg, ${AQUA}, #8b5cf6)`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                letterSpacing: "-0.02em"
              }}>ResearchMind</span>
            </div>

            {/* Nav Links + Avatar */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              {[
                { label: "Chat", path: "/chat" },
                { label: "History", path: "/history" },
              ].map(link => (
                <button key={link.path} onClick={() => navigate(link.path)}
                  style={{
                    padding: "0.4rem 0.9rem", borderRadius: "999px", border: "none",
                    background: "transparent", color: "rgba(255,255,255,0.5)",
                    fontFamily: F, fontSize: "0.82rem", fontWeight: 500, cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {link.label}
                </button>
              ))}

              {/* Avatar dropdown */}
              <div style={{ position: "relative", marginLeft: "0.25rem" }}>
                <div onClick={() => setDropdownOpen(!dropdownOpen)} style={{ cursor: "pointer" }}>
                  {user?.photo ? (
                    <img src={user.photo} alt="avatar" style={{
                      width: "30px", height: "30px", borderRadius: "50%",
                      objectFit: "cover", display: "block",
                      border: `2px solid ${dropdownOpen ? AQUA : "rgba(255,255,255,0.15)"}`,
                      transition: "border 0.2s ease"
                    }} />
                  ) : (
                    <div style={{
                      width: "30px", height: "30px", borderRadius: "50%",
                      background: `linear-gradient(135deg, ${AQUA}, #8b5cf6)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: F, fontWeight: 700, fontSize: "0.75rem", color: "white",
                      border: `2px solid ${dropdownOpen ? AQUA : "transparent"}`,
                      transition: "border 0.2s ease"
                    }}>
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>

                {dropdownOpen && (
                  <>
                    <div onClick={() => setDropdownOpen(false)}
                      style={{ position: "fixed", inset: 0, zIndex: 98 }} />
                    <div style={{
                      position: "absolute", top: "calc(100% + 0.6rem)", right: 0, zIndex: 99,
                      background: "rgba(15,15,25,0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "0.75rem", backdropFilter: "blur(20px)",
                      minWidth: "180px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                      overflow: "hidden"
                    }}>
                      <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                        <div style={{ fontFamily: F, fontWeight: 600, fontSize: "0.82rem", color: "white", marginBottom: "0.15rem" }}>
                          {user?.name}
                        </div>
                        <div style={{ fontFamily: F, fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {user?.email}
                        </div>
                      </div>
                      <button onClick={() => { navigate("/profile"); setDropdownOpen(false); }}
                        style={{
                          width: "100%", padding: "0.65rem 1rem",
                          background: "transparent", border: "none",
                          color: "rgba(255,255,255,0.6)", fontFamily: F,
                          fontSize: "0.82rem", fontWeight: 500,
                          cursor: "pointer", textAlign: "left",
                          transition: "background 0.15s ease"
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        Settings
                      </button>
                      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                        <button onClick={handleLogout} disabled={loggingOut}
                          style={{
                            width: "100%", padding: "0.65rem 1rem",
                            background: "transparent", border: "none",
                            color: "#f87171", fontFamily: F,
                            fontSize: "0.82rem", fontWeight: 500,
                            cursor: "pointer", textAlign: "left",
                            transition: "background 0.15s ease"
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          {loggingOut ? "Signing out..." : "Sign out"}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{
        position: "relative", zIndex: 2,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        minHeight: "100vh", padding: "2rem 1.5rem",
        textAlign: "center", gap: "1.25rem"
      }}>

        {/* Badge */}
        <div style={{ opacity: showContent ? 1 : 0, transform: showContent ? "translateY(0)" : "translateY(16px)", transition: "all 0.7s ease" }}>
          <span style={{
            padding: "0.4rem 1rem", borderRadius: "999px",
            fontSize: "0.72rem", fontFamily: F, fontWeight: 500,
            letterSpacing: "0.08em", textTransform: "uppercase",
            background: `rgba(${AQUA_RGB},0.08)`,
            border: `1px solid rgba(${AQUA_RGB},0.25)`,
            color: AQUA
          }}>
            Multi-Agent AI Research Assistant
          </span>
        </div>

        {/* Title */}
        <div style={{ opacity: showContent ? 1 : 0, transform: showContent ? "translateY(0)" : "translateY(16px)", transition: "all 0.7s ease 0.1s" }}>
          <h1 style={{
            fontFamily: F, fontWeight: 800,
            fontSize: "clamp(2.8rem, 9vw, 6.5rem)",
            lineHeight: 1.1, letterSpacing: "-0.03em",
            background: `linear-gradient(135deg, ${AQUA} 0%, #8b5cf6 50%, ${AQUA} 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundSize: "200% auto",
            animation: "gradientShift 3s ease infinite",
            margin: 0
          }}>
            ResearchMind
          </h1>
        </div>

        {/* Tagline — different for logged in vs not */}
        <div style={{ opacity: showContent ? 1 : 0, transform: showContent ? "translateY(0)" : "translateY(16px)", transition: "all 0.7s ease 0.2s", maxWidth: "520px" }}>
          <p style={{
            fontFamily: F, fontWeight: 400,
            fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.75, margin: 0
          }}>
            {isAuthenticated
              ? `Welcome back, ${user?.name?.split(" ")[0]}. Ready to research?`
              : "Five AI agents collaborate in real-time to research, verify, and synthesize answers from any source."
            }
          </p>
        </div>

        {/* Orbit Agents */}
<div style={{
  opacity: showContent ? 1 : 0,
  transition: "all 0.7s ease 0.3s",
  width: "100%", maxWidth: "500px",
  height: "120px",
  overflow: "hidden"
}}>
  <OrbitAgents />
</div>

        {/* Buttons */}
        <div style={{
          opacity: showButtons ? 1 : 0,
          transform: showButtons ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.7s ease",
          display: "flex", flexWrap: "wrap",
          gap: "0.75rem", justifyContent: "center",
          marginTop: "0.5rem"
        }}>
          {isAuthenticated ? (
            <button
              onClick={() => navigate("/chat")}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              style={{
                padding: "0.8rem 1.75rem", borderRadius: "0.5rem",
                fontFamily: F, fontWeight: 600, fontSize: "0.875rem",
                background: `linear-gradient(135deg, ${AQUA}, #8b5cf6)`,
                border: "none", color: "white", cursor: "pointer",
                boxShadow: `0 0 24px rgba(${AQUA_RGB},0.2)`,
                transition: "opacity 0.2s ease"
              }}>
              Go to Chat
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              style={{
                padding: "0.8rem 1.75rem", borderRadius: "0.5rem",
                fontFamily: F, fontWeight: 600, fontSize: "0.875rem",
                background: `linear-gradient(135deg, ${AQUA}, #8b5cf6)`,
                border: "none", color: "white", cursor: "pointer",
                boxShadow: `0 0 24px rgba(${AQUA_RGB},0.2)`,
                transition: "opacity 0.2s ease"
              }}>
              Get Started
            </button>
          )}
        </div>

        {/* Feature Cards — only for logged out */}
        {!isAuthenticated && (
          <div style={{
            opacity: showButtons ? 1 : 0,
            transition: "all 0.7s ease 0.2s",
            display: "flex",
flexWrap: "wrap", 
justifyContent: "center",
gap: "0.75rem", width: "100%", maxWidth: "600px",
marginTop: "2rem"
          }}>
            {[
              { title: "Hybrid Search", desc: "Web + your documents" },
              { title: "5 AI Agents", desc: "Each with a role" },
              { title: "Fact Verified", desc: "Cross-checked sources" },
            ].map((f, i) => (
              <div key={i} style={{
                padding: "1.1rem 1rem", borderRadius: "0.75rem", textAlign: "center",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(12px)",
                width: "160px", flexShrink: 0,
              }}>
                <div style={{ fontFamily: F, fontWeight: 600, fontSize: "0.82rem", color: AQUA, marginBottom: "0.25rem" }}>{f.title}</div>
                <div style={{ fontFamily: F, fontWeight: 400, fontSize: "0.72rem", color: "rgba(255,255,255,0.38)" }}>{f.desc}</div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
<div style={{ fontFamily: F, fontWeight: 400, fontSize: "0.68rem", color: "rgba(255,255,255,0.18)", marginTop: "1rem", paddingBottom: "1rem" }}>
  Built with LangGraph · FAISS · HuggingFace · FastAPI
</div>

      </div>

      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% center; }
          50% { background-position: 100% center; }
          100% { background-position: 0% center; }
        }
      `}</style>
    </div>
  );
}

export default LandingPage;