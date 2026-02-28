import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useStore from "../store/useStore";
import { logOut } from "../utils/firebase";
import { deleteHistory } from "../utils/api";
import { deleteAccount } from "../utils/api";
import { deleteUser } from "firebase/auth";
import { getAuth } from "firebase/auth";

const F = "'Inter', sans-serif";
const AQUA = "#2dd4bf";

// ── Floating Navbar (same as LandingPage) ─────────────────────────────────────
function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);


  const handleLogout = async () => {
    setLoggingOut(true);
    try { await logOut(); logout(); navigate("/"); }
    catch { setLoggingOut(false); }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{
      position: "fixed", top: "1rem",
      left: "50%", transform: "translateX(-50%)",
      zIndex: 100, width: "calc(100% - 2rem)", maxWidth: "860px"
    }}>
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "0.6rem 1rem", borderRadius: "999px",
        background: "rgba(15,15,25,0.80)",
        border: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.35)"
      }}>
        {/* Logo */}
        <div onClick={() => navigate("/")}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
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

        {/* Nav links + avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          {[{ label: "Chat", path: "/chat" }, { label: "History", path: "/history" }].map(link => (
            <button key={link.path} onClick={() => navigate(link.path)} style={{
              padding: "0.4rem 0.9rem", borderRadius: "999px", border: "none",
              background: isActive(link.path) ? "rgba(255,255,255,0.1)" : "transparent",
              color: isActive(link.path) ? "white" : "rgba(255,255,255,0.5)",
              fontFamily: F, fontSize: "0.82rem", fontWeight: 500,
              cursor: "pointer", transition: "all 0.15s ease"
            }}
              onMouseEnter={e => { if (!isActive(link.path)) e.currentTarget.style.background = "rgba(255,255,255,0.06)" }}
              onMouseLeave={e => { if (!isActive(link.path)) e.currentTarget.style.background = "transparent" }}
            >{link.label}</button>
          ))}

          {/* Avatar */}
          <div style={{ position: "relative", marginLeft: "0.25rem" }}>
            <div onClick={() => setDropdownOpen(!dropdownOpen)} style={{ cursor: "pointer" }}>
              {user?.photo ? (
                <img src={user.photo} alt="avatar" style={{
                  width: "30px", height: "30px", borderRadius: "50%", objectFit: "cover",
                  display: "block",
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
                  background: "rgba(15,15,25,0.97)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "0.75rem", backdropFilter: "blur(20px)",
                  minWidth: "180px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                  overflow: "hidden"
                }}>
                  <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ fontFamily: F, fontWeight: 600, fontSize: "0.82rem", color: "white", marginBottom: "0.15rem" }}>{user?.name}</div>
                    <div style={{ fontFamily: F, fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
                  </div>
                  <button onClick={() => { navigate("/profile"); setDropdownOpen(false); }} style={{
                    width: "100%", padding: "0.65rem 1rem", background: "transparent", border: "none",
                    color: "rgba(255,255,255,0.6)", fontFamily: F, fontSize: "0.82rem", fontWeight: 500,
                    cursor: "pointer", textAlign: "left", transition: "background 0.15s ease"
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >Settings</button>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                    <button onClick={handleLogout} disabled={loggingOut} style={{
                      width: "100%", padding: "0.65rem 1rem", background: "transparent", border: "none",
                      color: "#f87171", fontFamily: F, fontSize: "0.82rem", fontWeight: 500,
                      cursor: "pointer", textAlign: "left", transition: "background 0.15s ease"
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >{loggingOut ? "Signing out..." : "Sign out"}</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Profile Page ───────────────────────────────────────────────────────────────
function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useStore();
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState("account");
  const [clearingHistory, setClearingHistory] = useState(false);
  const [historyCleared, setHistoryCleared] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await logOut(); logout(); navigate("/"); }
    catch { setLoggingOut(false); }
  };

  const handleClearHistory = async () => {
  setClearingHistory(true);
  try {
    await deleteHistory();
    setHistoryCleared(true);
    setTimeout(() => setHistoryCleared(false), 3000);
  } catch {
    alert("Failed to clear history. Please try again.");
  } finally {
    setClearingHistory(false);
    setShowConfirm(false);
  }
};
const handleDeleteAccount = async () => {
  setDeletingAccount(true);
  try {
    await deleteAccount();
    const auth = getAuth();
    await deleteUser(auth.currentUser);
    logout();
    navigate("/");
  } catch (e) {
    if (e.code === "auth/requires-recent-login") {
      alert("For security, please sign out and sign back in, then try deleting your account again.");
    } else {
      alert(`Failed to delete account: ${e.message}`);
    }
  } finally {
    setDeletingAccount(false);
    setShowDeleteConfirm(false);
  }
};

  const tabs = [
    { id: "account", label: "Account" },
    { id: "danger", label: "Danger Zone" },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0f", fontFamily: F }}>

      {/* Floating Navbar */}
      <Navbar />

      {/* Page content — push below navbar */}
      <div style={{ paddingTop: "80px" }}>

        {/* Page Header */}
        <div style={{
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          padding: isMobile ? "1.5rem 1.25rem 0" : "2rem 2.5rem 0",
          maxWidth: "900px", margin: "0 auto"
        }}>
          {/* Back + Title */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            
            <span style={{
              fontFamily: F, fontWeight: 700, fontSize: "1.1rem", color: "white"
            }}>Settings</span>
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex", gap: "0" }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                padding: "0.7rem 1.25rem", background: "transparent", border: "none",
                borderBottom: activeTab === tab.id ? `2px solid ${AQUA}` : "2px solid transparent",
                color: activeTab === tab.id ? "white" : "rgba(255,255,255,0.4)",
                fontFamily: F, fontSize: "0.82rem", fontWeight: 500,
                cursor: "pointer", marginBottom: "-1px", transition: "all 0.15s ease"
              }}>{tab.label}</button>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div style={{
          maxWidth: "900px", margin: "0 auto",
          padding: isMobile ? "1.5rem 1.25rem" : "2rem 2.5rem",
          display: isMobile ? "block" : "flex",
          gap: "2.5rem", alignItems: "flex-start"
        }}>

          {/* Left — Profile card (desktop only) */}
          {!isMobile && (
            <div style={{
              width: "240px", flexShrink: 0,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "1rem", padding: "1.5rem",
              textAlign: "center", position: "sticky", top: "90px"
            }}>
              {user?.photo ? (
                <img src={user.photo} alt="avatar" style={{
                  width: "72px", height: "72px", borderRadius: "50%",
                  objectFit: "cover", display: "block", margin: "0 auto 0.85rem",
                  border: "3px solid rgba(45,212,191,0.25)",
                  boxShadow: "0 0 24px rgba(45,212,191,0.1)"
                }} />
              ) : (
                <div style={{
                  width: "72px", height: "72px", borderRadius: "50%",
                  background: `linear-gradient(135deg, ${AQUA}, #8b5cf6)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: F, fontWeight: 700, fontSize: "1.75rem",
                  color: "white", margin: "0 auto 0.85rem",
                  boxShadow: "0 0 24px rgba(45,212,191,0.12)"
                }}>
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}

              <div style={{ fontFamily: F, fontWeight: 600, fontSize: "0.9rem", color: "white", marginBottom: "0.25rem" }}>
                {user?.name}
              </div>
              <div style={{ fontFamily: F, fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", marginBottom: "0.85rem", wordBreak: "break-all" }}>
                {user?.email}
              </div>

              <div style={{
                display: "inline-flex", alignItems: "center",
                padding: "0.2rem 0.75rem", borderRadius: "999px",
                background: user?.photo ? "rgba(66,133,244,0.1)" : "rgba(45,212,191,0.1)",
                border: `1px solid ${user?.photo ? "rgba(66,133,244,0.2)" : "rgba(45,212,191,0.2)"}`,
                fontFamily: F, fontSize: "0.68rem", fontWeight: 500,
                color: user?.photo ? "#60a5fa" : AQUA, marginBottom: "1.5rem"
              }}>
                {user?.photo ? "Google Account" : "Email Account"}
              </div>

              
            </div>
          )}

          {/* Right — Tab content */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Mobile profile strip */}
            {isMobile && (
              <div style={{
                display: "flex", alignItems: "center", gap: "1rem",
                padding: "1rem 1.25rem",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "0.75rem", marginBottom: "1.25rem"
              }}>
                {user?.photo ? (
                  <img src={user.photo} alt="avatar" style={{
                    width: "48px", height: "48px", borderRadius: "50%",
                    objectFit: "cover", flexShrink: 0,
                    border: "2px solid rgba(45,212,191,0.25)"
                  }} />
                ) : (
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "50%",
                    background: `linear-gradient(135deg, ${AQUA}, #8b5cf6)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: F, fontWeight: 700, fontSize: "1.2rem",
                    color: "white", flexShrink: 0
                  }}>
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: F, fontWeight: 600, fontSize: "0.875rem", color: "white", marginBottom: "0.15rem" }}>{user?.name}</div>
                  <div style={{ fontFamily: F, fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === "account" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "0.75rem", overflow: "hidden"
                }}>
                  {[
                    { label: "Full name", value: user?.name },
                    { label: "Email address", value: user?.email },
                    { label: "Sign-in method", value: user?.photo ? "Google" : "Email / Password" },
                    { label: "User ID", value: user?.uid?.slice(0, 20) + "..." },
                  ].map((row, i, arr) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.9rem 1.1rem",
                      borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                      gap: "1rem", flexWrap: "wrap"
                    }}>
                      <span style={{ fontFamily: F, fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", fontWeight: 500, flexShrink: 0 }}>
                        {row.label}
                      </span>
                      <span style={{ fontFamily: F, fontSize: "0.82rem", color: "rgba(255,255,255,0.85)", textAlign: "right", wordBreak: "break-all" }}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Sign out — visible on both */}
                <button onClick={handleLogout} disabled={loggingOut}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                  style={{
                    width: "100%", padding: "0.85rem",
                    borderRadius: "0.75rem",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.55)",
                    fontFamily: F, fontWeight: 500, fontSize: "0.875rem",
                    cursor: "pointer", transition: "background 0.2s ease",
                    textAlign: "center"
                  }}>
                  {loggingOut ? "Signing out..." : "Sign out"}
                </button>
              </div>
            )}

            {activeTab === "danger" && (
  <div>
    {/* Custom Confirm Modal */}
    {showConfirm && (
      <>
        <div
          onClick={() => setShowConfirm(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(6px)"
          }}
        />
        <div style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 201,
          background: "#0f0f1a",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "1rem",
          padding: "2rem",
          width: "calc(100% - 3rem)",
          maxWidth: "400px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)"
        }}>
          {/* Icon */}
          <div style={{
            width: "44px", height: "44px", borderRadius: "50%",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.25rem", marginBottom: "1.25rem"
          }}>🗑️</div>

          <div style={{
            fontFamily: F, fontWeight: 700,
            fontSize: "1rem", color: "white", marginBottom: "0.5rem"
          }}>
            Clear research history?
          </div>
          <div style={{
            fontFamily: F, fontSize: "0.8rem",
            color: "rgba(255,255,255,0.4)",
            lineHeight: 1.6, marginBottom: "1.75rem"
          }}>
            This will permanently delete all your past queries and answers. This action cannot be undone.
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={() => setShowConfirm(false)}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
              style={{
                flex: 1, padding: "0.7rem",
                borderRadius: "0.5rem",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.6)",
                fontFamily: F, fontSize: "0.82rem", fontWeight: 500,
                cursor: "pointer", transition: "background 0.15s ease"
              }}>
              Cancel
            </button>
            <button
              onClick={handleClearHistory}
              disabled={clearingHistory}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.25)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.15)"}
              style={{
                flex: 1, padding: "0.7rem",
                borderRadius: "0.5rem",
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171",
                fontFamily: F, fontSize: "0.82rem", fontWeight: 600,
                cursor: clearingHistory ? "not-allowed" : "pointer",
                transition: "background 0.15s ease"
              }}>
              {clearingHistory ? "Clearing..." : "Yes, clear it"}
            </button>
          </div>
        </div>
      </>
    )}

    {/* Card */}
    <div style={{
      background: "rgba(239,68,68,0.04)",
      border: "1px solid rgba(239,68,68,0.15)",
      borderRadius: "0.75rem", padding: "1.25rem 1.5rem"
    }}>
      <div style={{ fontFamily: F, fontSize: "0.9rem", color: "white", fontWeight: 600, marginBottom: "0.3rem" }}>
        Clear all research history
      </div>
      <div style={{ fontFamily: F, fontSize: "0.78rem", color: "rgba(255,255,255,0.35)", marginBottom: "1.1rem", lineHeight: 1.6 }}>
        Permanently delete all your past queries and answers. This action cannot be undone.
      </div>
      {historyCleared && (
        <div style={{
          fontFamily: F, fontSize: "0.75rem", color: "#22c55e",
          marginBottom: "0.85rem", padding: "0.5rem 0.85rem",
          background: "rgba(34,197,94,0.08)",
          border: "1px solid rgba(34,197,94,0.2)", borderRadius: "0.4rem"
        }}>✓ History cleared successfully</div>
      )}
      <button
        onClick={() => setShowConfirm(true)}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.15)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
        style={{
          padding: "0.65rem 1.25rem", borderRadius: "0.5rem",
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.25)",
          color: "#f87171", fontFamily: F,
          fontSize: "0.82rem", fontWeight: 500,
          cursor: "pointer", transition: "background 0.2s ease"
        }}>
        Clear History
      </button>
    </div>

    {/* Delete Account Confirm Modal */}
    {showDeleteConfirm && (
      <>
        <div onClick={() => setShowDeleteConfirm(false)} style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)"
        }} />
        <div style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 201, background: "#0f0f1a",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: "1rem", padding: "2rem",
          width: "calc(100% - 3rem)", maxWidth: "400px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)"
        }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "50%",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.25rem", marginBottom: "1.25rem"
          }}>⚠️</div>
          <div style={{ fontFamily: F, fontWeight: 700, fontSize: "1rem", color: "white", marginBottom: "0.5rem" }}>
            Delete your account?
          </div>
          <div style={{ fontFamily: F, fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: "1.75rem" }}>
            This will permanently delete your account, all research history, and uploaded documents. This cannot be undone.
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={() => setShowDeleteConfirm(false)}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
              style={{
                flex: 1, padding: "0.7rem", borderRadius: "0.5rem",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.6)", fontFamily: F,
                fontSize: "0.82rem", fontWeight: 500,
                cursor: "pointer", transition: "background 0.15s ease"
              }}>Cancel</button>
            <button onClick={handleDeleteAccount} disabled={deletingAccount}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.3)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.15)"}
              style={{
                flex: 1, padding: "0.7rem", borderRadius: "0.5rem",
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171", fontFamily: F,
                fontSize: "0.82rem", fontWeight: 600,
                cursor: deletingAccount ? "not-allowed" : "pointer",
                transition: "background 0.15s ease"
              }}>
              {deletingAccount ? "Deleting..." : "Yes, delete it"}
            </button>
          </div>
        </div>
      </>
    )}

    {/* Delete Account Card */}
    <div style={{
      background: "rgba(239,68,68,0.04)",
      border: "1px solid rgba(239,68,68,0.15)",
      borderRadius: "0.75rem", padding: "1.25rem 1.5rem",
      marginTop: "0.75rem"
    }}>
      <div style={{ fontFamily: F, fontSize: "0.9rem", color: "white", fontWeight: 600, marginBottom: "0.3rem" }}>
        Delete account
      </div>
      <div style={{ fontFamily: F, fontSize: "0.78rem", color: "rgba(255,255,255,0.35)", marginBottom: "1.1rem", lineHeight: 1.6 }}>
        Permanently delete your account and all associated data. This action cannot be undone.
      </div>
      <button onClick={() => setShowDeleteConfirm(true)}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.15)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
        style={{
          padding: "0.65rem 1.25rem", borderRadius: "0.5rem",
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.25)",
          color: "#f87171", fontFamily: F,
          fontSize: "0.82rem", fontWeight: 500,
          cursor: "pointer", transition: "background 0.2s ease"
        }}>
        Delete Account
      </button>
    </div>
  </div>
)}

          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;