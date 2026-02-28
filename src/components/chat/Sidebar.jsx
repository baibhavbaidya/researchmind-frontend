import {  useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../../store/useStore";
import { uploadDocument, clearDocuments, deleteDocument } from "../../utils/api";
import { logOut } from "../../utils/firebase";

const F = "'Inter', sans-serif";
const AQUA = "#2dd4bf";

function Sidebar({ onClose }) {
  const navigate = useNavigate();
  const { documents, addDocument, clearDocuments: clearDocsStore, user, logout } = useStore();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();



  const handleUpload = async (file) => {
    if (!file || !file.name.endsWith(".pdf")) {
      setError("Only PDF files supported");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const result = await uploadDocument(file);
      addDocument({
        id: result.document_id,
        filename: result.filename,
        chunk_count: result.chunks_created,
        page_count: result.page_count,
        uploaded_at: new Date().toISOString()
      });
    } catch (e) {
      setError(e.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleClear = async () => {
    try {
      await clearDocuments();
      clearDocsStore();
    } catch {
      setError("Failed to clear documents");
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      logout();
      navigate("/");
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  return (
    <div style={{
      width: "260px", minWidth: "260px",
      height: "100vh",
      background: "#0d0d1a",
      borderRight: "1px solid rgba(255,255,255,0.07)",
      display: "flex", flexDirection: "column",
      overflow: "hidden"
    }}>

      {/* Logo + Close */}
      <div style={{
        padding: "1rem",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: "0.75rem"
        }}>
          <span
  onClick={() => navigate("/")}
  style={{
    fontFamily: F, fontWeight: 700, fontSize: "1rem",
    background: `linear-gradient(135deg, ${AQUA}, #8b5cf6)`,
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    letterSpacing: "-0.02em", cursor: "pointer"
  }}>
  ResearchMind
</span>
          <button onClick={onClose} style={{
            background: "none", border: "none",
            color: "rgba(255,255,255,0.3)",
            cursor: "pointer", fontSize: "1rem", padding: "0.2rem"
          }}>✕</button>
        </div>

        {/* User Profile */}
        <div
          onClick={() => navigate("/profile")}
          style={{
            display: "flex", alignItems: "center", gap: "0.6rem",
            padding: "0.5rem 0.6rem", borderRadius: "0.5rem",
            cursor: "pointer", transition: "background 0.2s ease"
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          {user?.photo ? (
            <img src={user.photo} alt="avatar" style={{
              width: "30px", height: "30px", borderRadius: "50%",
              objectFit: "cover", flexShrink: 0
            }} />
          ) : (
            <div style={{
              width: "30px", height: "30px", borderRadius: "50%",
              background: `linear-gradient(135deg, ${AQUA}, #8b5cf6)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: F, fontWeight: 700, fontSize: "0.78rem",
              color: "white", flexShrink: 0
            }}>
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: F, fontWeight: 500, fontSize: "0.78rem",
              color: "white", whiteSpace: "nowrap",
              overflow: "hidden", textOverflow: "ellipsis"
            }}>
              {user?.name || "User"}
            </div>
            <div style={{
              fontFamily: F, fontSize: "0.65rem",
              color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap",
              overflow: "hidden", textOverflow: "ellipsis"
            }}>
              {user?.email || ""}
            </div>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <div style={{ padding: "0.75rem 0.75rem 0" }}>
        <button
          onClick={() => navigate("/history")}
          style={{
            width: "100%", padding: "0.6rem 0.75rem",
            borderRadius: "0.5rem", border: "none",
            background: "transparent", color: "rgba(255,255,255,0.5)",
            fontFamily: F, fontSize: "0.82rem", fontWeight: 500,
            cursor: "pointer", textAlign: "left",
            display: "flex", alignItems: "center", gap: "0.5rem",
            transition: "background 0.2s ease"
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          Chat History
        </button>
      </div>
{/* New Chat Button */}
      <div style={{ padding: "0 0.75rem 0.75rem" }}>
        <button
          onClick={() => {
            useStore.getState().clearMessages();
            useStore.getState().clearDocuments();
            useStore.getState().clearFollowUpMessages();
            useStore.getState().resetAgentLogs();
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(45,212,191,0.1)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
          style={{
            width: "100%", padding: "0.6rem 0.85rem",
            borderRadius: "0.5rem",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.7)",
            fontFamily: F, fontSize: "0.78rem", fontWeight: 500,
            cursor: "pointer", transition: "all 0.15s ease",
            textAlign: "left", display: "flex",
            alignItems: "center", gap: "0.5rem"
          }}>
          <span style={{ fontSize: "1rem", lineHeight: 1 }}>+</span> New Chat
        </button>
      </div>

      
      {/* Documents Section */}
      <div style={{ padding: "1rem 0.75rem 0.5rem", flex: 1, overflowY: "auto" }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: "0.6rem"
        }}>
          <span style={{
            fontFamily: F, fontSize: "0.7rem", fontWeight: 600,
            color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em",
            textTransform: "uppercase"
          }}>
            Documents ({documents.length})
          </span>
          {documents.length > 0 && (
            <button onClick={handleClear} style={{
              background: "none", border: "none",
              color: "rgba(239,68,68,0.6)", fontFamily: F,
              fontSize: "0.68rem", cursor: "pointer"
            }}>
              Clear all
            </button>
          )}
        </div>

        {documents.length === 0 ? (
          <div style={{
            padding: "1rem 0", textAlign: "center",
            fontFamily: F, fontSize: "0.75rem",
            color: "rgba(255,255,255,0.2)"
          }}>
            No documents yet
          </div>
        ) : (
          documents.map((doc, i) => (
  <div key={i} style={{
    padding: "0.6rem 0.75rem", borderRadius: "0.5rem",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    marginBottom: "0.4rem",
    display: "flex", alignItems: "flex-start", gap: "0.5rem"
  }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontFamily: F, fontSize: "0.78rem", fontWeight: 500,
        color: "rgba(255,255,255,0.75)",
        whiteSpace: "nowrap", overflow: "hidden",
        textOverflow: "ellipsis"
      }}>
        {doc.filename}
      </div>
      <div style={{
        fontFamily: F, fontSize: "0.68rem",
        color: "rgba(255,255,255,0.3)", marginTop: "0.2rem"
      }}>
        {doc.chunk_count} chunks · {doc.page_count} pages
      </div>
    </div>
    <button
      onClick={async () => {
        try {
          await deleteDocument(doc.filename);
          useStore.getState().setDocuments(
            useStore.getState().documents.filter(d => d.filename !== doc.filename)
          );
        } catch {
          setError("Failed to remove document");
        }
      }}
      onMouseEnter={e => e.currentTarget.style.color = "#f87171"}
      onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.2)"}
      style={{
        background: "none", border: "none",
        color: "rgba(255,255,255,0.2)",
        cursor: "pointer", fontSize: "0.75rem",
        padding: "0.1rem", flexShrink: 0,
        transition: "color 0.15s ease", lineHeight: 1
      }}
      title="Remove document"
    >
      ✕
    </button>
  </div>

          ))
        )}
      </div>

      {/* Upload Zone */}
      <div style={{ padding: "0.75rem" }}>
        {error && (
          <div style={{
            marginBottom: "0.5rem", padding: "0.5rem 0.75rem",
            borderRadius: "0.4rem", background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#f87171", fontFamily: F, fontSize: "0.72rem"
          }}>
            {error}
          </div>
        )}

        <div
          onClick={() => !uploading && fileRef.current.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault(); setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleUpload(file);
          }}
          style={{
            padding: "1rem", borderRadius: "0.6rem", textAlign: "center",
            border: `1px dashed ${dragOver ? AQUA : "rgba(255,255,255,0.12)"}`,
            background: dragOver ? `rgba(45,212,191,0.05)` : "rgba(255,255,255,0.02)",
            cursor: uploading ? "not-allowed" : "pointer",
            transition: "all 0.2s ease", marginBottom: "0.5rem"
          }}
        >
          <div style={{
            fontFamily: F, fontSize: "0.75rem", fontWeight: 500,
            color: uploading ? AQUA : "rgba(255,255,255,0.4)"
          }}>
            {uploading ? "Uploading..." : "Drop PDF or click to upload"}
          </div>
        </div>

        <input
          ref={fileRef} type="file" accept=".pdf"
          style={{ display: "none" }}
          onChange={e => handleUpload(e.target.files[0])}
        />

        {/* Logout */}
        <button
          onClick={handleLogout}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          style={{
            width: "100%", padding: "0.6rem",
            borderRadius: "0.5rem", border: "none",
            background: "transparent",
            color: "rgba(239,68,68,0.6)",
            fontFamily: F, fontWeight: 500,
            fontSize: "0.78rem", cursor: "pointer",
            transition: "background 0.2s ease",
            textAlign: "center"
          }}>
          Sign out
        </button>

      </div>
    </div>
  );
}

export default Sidebar;