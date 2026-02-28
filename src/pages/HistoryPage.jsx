import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getHistory } from "../utils/api";
import ReactMarkdown from "react-markdown";

const F = "'Inter', sans-serif";
const AQUA = "#2dd4bf";

function HistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await getHistory(50);
      setHistory(data);
    } catch (e) {
      console.error("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso) => {
    const d = new Date(iso + "Z");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0f", fontFamily: F }}>

      {/* Header */}
      <div style={{
        padding: "1rem 2rem",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(255,255,255,0.02)",
        backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button onClick={() => navigate(-1)} style={{
            background: "none", border: "none",
            color: "rgba(255,255,255,0.4)", cursor: "pointer",
            fontFamily: F, fontSize: "0.82rem",
            display: "flex", alignItems: "center", gap: "0.4rem",
            transition: "color 0.2s ease"
          }}
            onMouseEnter={e => e.currentTarget.style.color = "white"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
          >
            ← Back
          </button>
          <span style={{
            fontFamily: F, fontWeight: 700, fontSize: "1rem",
            background: `linear-gradient(135deg, ${AQUA}, #8b5cf6)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            letterSpacing: "-0.02em"
          }}>
            ResearchMind
          </span>
        </div>
        <div style={{
          fontFamily: F, fontWeight: 600,
          fontSize: "0.875rem", color: "white"
        }}>
          History
        </div>
        <div style={{
          fontFamily: F, fontSize: "0.75rem",
          color: "rgba(255,255,255,0.3)"
        }}>
          {history.length} queries
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem" }}>

        {loading ? (
          <div style={{
            textAlign: "center", padding: "4rem",
            fontFamily: F, fontSize: "0.875rem",
            color: "rgba(255,255,255,0.3)"
          }}>
            Loading history...
          </div>
        ) : history.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "5rem 2rem"
          }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              margin: "0 auto 1.25rem",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.4rem", color: "rgba(255,255,255,0.2)"
            }}>
              ?
            </div>
            <div style={{
              fontFamily: F, fontWeight: 600,
              fontSize: "1rem", color: "white", marginBottom: "0.5rem"
            }}>
              No research history yet
            </div>
            <div style={{
              fontFamily: F, fontSize: "0.82rem",
              color: "rgba(255,255,255,0.3)", marginBottom: "1.5rem"
            }}>
              Your past queries will appear here
            </div>
            <button onClick={() => navigate("/chat")} style={{
              padding: "0.7rem 1.5rem", borderRadius: "0.5rem",
              background: `linear-gradient(135deg, ${AQUA}, #8b5cf6)`,
              border: "none", color: "white",
              fontFamily: F, fontWeight: 600,
              fontSize: "0.82rem", cursor: "pointer"
            }}>
              Start Researching
            </button>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "0.75rem"
          }}>
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelected(item)}
                style={{
                  padding: "1.1rem", borderRadius: "0.75rem",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  cursor: "pointer", transition: "all 0.2s ease"
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.borderColor = "rgba(45,212,191,0.2)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                }}
              >
                {/* Query */}
                <div style={{
                  fontFamily: F, fontWeight: 500,
                  fontSize: "0.875rem", color: "white",
                  marginBottom: "0.5rem", lineHeight: 1.4,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden"
                }}>
                  {item.query}
                </div>

                {/* Answer preview */}
                <div style={{
                  fontFamily: F, fontSize: "0.775rem",
                  color: "rgba(255,255,255,0.35)", lineHeight: 1.5,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  marginBottom: "0.75rem"
                }}>
                  {item.answer.replace(/#{1,6}\s/g, "").replace(/\*\*/g, "")}
                </div>

                {/* Footer */}
                <div style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between"
                }}>
                  <span style={{
                    fontFamily: F, fontSize: "0.68rem",
                    color: "rgba(255,255,255,0.22)"
                  }}>
                    {formatDate(item.created_at)}
                  </span>
                  {item.sources?.length > 0 && (
                    <span style={{
                      padding: "0.15rem 0.5rem", borderRadius: "999px",
                      background: `rgba(45,212,191,0.08)`,
                      border: `1px solid rgba(45,212,191,0.15)`,
                      fontFamily: F, fontSize: "0.65rem",
                      color: AQUA, fontWeight: 500
                    }}>
                      {item.sources.length} sources
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1.5rem"
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: "700px",
              maxHeight: "80vh", overflowY: "auto",
              background: "#0f0f18",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "1rem", padding: "1.75rem"
            }}
          >
            {/* Modal header */}
            <div style={{
              display: "flex", alignItems: "flex-start",
              justifyContent: "space-between", marginBottom: "1.25rem",
              gap: "1rem"
            }}>
              <div style={{
                fontFamily: F, fontWeight: 600,
                fontSize: "1rem", color: "white", lineHeight: 1.4
              }}>
                {selected.query}
              </div>
              <button onClick={() => setSelected(null)} style={{
                background: "none", border: "none",
                color: "rgba(255,255,255,0.3)", cursor: "pointer",
                fontSize: "1.1rem", flexShrink: 0
              }}>
                ✕
              </button>
            </div>

            {/* Answer */}
            <div style={{
              fontFamily: F, fontSize: "0.875rem",
              color: "rgba(255,255,255,0.8)", lineHeight: 1.75
            }}
              className="markdown-content"
            >
              <ReactMarkdown>{selected.answer}</ReactMarkdown>
            </div>

            {/* Sources */}
            {selected.sources?.length > 0 && (
              <div style={{
                marginTop: "1.25rem", paddingTop: "1rem",
                borderTop: "1px solid rgba(255,255,255,0.07)"
              }}>
                <div style={{
                  fontFamily: F, fontSize: "0.68rem", fontWeight: 600,
                  color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em",
                  textTransform: "uppercase", marginBottom: "0.5rem"
                }}>
                  Sources
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {selected.sources.map((s, i) => (
                    <a key={i} href={s.url || "#"} target="_blank" rel="noreferrer" style={{
                      padding: "0.25rem 0.6rem", borderRadius: "0.35rem",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      fontFamily: F, fontSize: "0.7rem",
                      color: "rgba(255,255,255,0.45)",
                      textDecoration: "none"
                    }}>
                      [{s.index}] {s.source?.length > 40 ? s.source.slice(0, 40) + "..." : s.source}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div style={{
              marginTop: "1rem", fontFamily: F,
              fontSize: "0.68rem", color: "rgba(255,255,255,0.2)"
            }}>
              {formatDate(selected.created_at)}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .markdown-content h2 {
          font-size: 0.95rem;
          font-weight: 600;
          color: white;
          margin: 1rem 0 0.4rem 0;
          font-family: ${F};
        }
        .markdown-content p { margin: 0.4rem 0; }
        .markdown-content ul, .markdown-content ol {
          padding-left: 1.25rem;
          margin: 0.4rem 0;
        }
        .markdown-content li { margin: 0.2rem 0; }
        .markdown-content strong { color: white; font-weight: 600; }
      `}</style>
    </div>
  );
}

export default HistoryPage;