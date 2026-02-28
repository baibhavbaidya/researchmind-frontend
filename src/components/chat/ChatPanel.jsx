import { useState, useRef, useEffect } from "react";
import useStore from "../../store/useStore";
import { createWebSocket } from "../../utils/api";
import ReactMarkdown from "react-markdown";
import { followUp } from "../../utils/api";

const F = "'Inter', sans-serif";
const AQUA = "#2dd4bf";

function ChatPanel({ sidebarOpen, onOpenSidebar, agentPanelOpen, onToggleAgentPanel }) {
  const [input, setInput] = useState("");
  const [useDocuments, setUseDocuments] = useState(true);
  const fileRef = useRef();
  const messagesEndRef = useRef();
  const wsRef = useRef(null);
  const { followUpMessages, addFollowUpMessage } = useStore();
  const [followUpLoading, setFollowUpLoading] = useState(false);

  const {
    messages, addMessage, isQuerying, setIsQuerying,
    resetAgentLogs, addAgentLog, setCurrentSources,
    documents
  } = useStore();

  const hasResult = messages.some(m => m.role === "assistant" && !m.thinking && m.content);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, followUpMessages]);

  const handleSend = async () => {
    if (!input.trim() || isQuerying || followUpLoading) return;

    if (hasResult) {
      // Follow-up mode
      const question = input.trim();
      const lastUserMessage = [...messages].reverse().find(m => m.role === "user");
      const lastAssistantMessage = [...messages].reverse().find(m => m.role === "assistant" && !m.thinking && m.content);
      setInput("");
      addFollowUpMessage({ role: "user", content: question });
      setFollowUpLoading(true);
      try {
        const data = await followUp(
          lastUserMessage?.content || "",
          lastAssistantMessage?.content || "",
          question
        );
        addFollowUpMessage({ role: "assistant", content: data.answer });
      } catch {
        addFollowUpMessage({ role: "assistant", content: "Sorry, I couldn't process that. Please try again." });
      } finally {
        setFollowUpLoading(false);
      }
    } else {
      // Research mode — full pipeline
      const query = input.trim();
      setInput("");
      setIsQuerying(true);
      resetAgentLogs();
      setCurrentSources([]);

      addMessage({ role: "user", content: query, id: Date.now() });
      const thinkingId = Date.now() + 1;
      addMessage({ role: "assistant", content: null, id: thinkingId, thinking: true });

      try {
        const ws = await createWebSocket();
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("WebSocket opened, sending query...");
          ws.send(JSON.stringify({ query, use_documents: useDocuments && documents.length > 0 }));
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          const { agent, status, message, data: payload } = data;

          console.log("WS message:", agent, status, message);
          addAgentLog(`${agent}: ${message}`);

          if (status === "complete" && payload?.answer) {
            setCurrentSources(payload.sources || []);
            useStore.setState(state => ({
              messages: state.messages.map(m =>
                m.id === thinkingId
                  ? { ...m, thinking: false, content: payload.answer, sources: payload.sources || [] }
                  : m
              )
            }));
            setIsQuerying(false);
            ws.close();
          }

          if (status === "error") {
            useStore.setState(state => ({
              messages: state.messages.map(m =>
                m.id === thinkingId
                  ? { ...m, thinking: false, content: `Error: ${message}`, error: true }
                  : m
              )
            }));
            setIsQuerying(false);
            ws.close();
          }
        };

        ws.onerror = () => {
          useStore.setState(state => ({
            messages: state.messages.map(m =>
              m.id === thinkingId
                ? { ...m, thinking: false, content: "Connection error. Make sure the backend is running.", error: true }
                : m
            )
          }));
          setIsQuerying(false);
        };

        ws.onclose = () => {};

      } catch (e) {
        console.error("sendQuery error:", e);
        setIsQuerying(false);
      }
    }
  };

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      height: "100vh", overflow: "hidden",
      position: "relative"
    }}>

      {/* Top Bar */}
      <div style={{
        padding: "0 1.25rem",
        height: "56px", minHeight: "56px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(10,10,15,0.8)",
        backdropFilter: "blur(12px)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {!sidebarOpen && (
            <button onClick={onOpenSidebar} style={{
              background: "none", border: "none",
              color: "rgba(255,255,255,0.4)", cursor: "pointer",
              fontSize: "1rem", padding: "0.25rem"
            }}>☰</button>
          )}
          <span style={{
            fontFamily: F, fontWeight: 600, fontSize: "0.875rem", color: "white"
          }}>
            Research Chat
          </span>
          {documents.length > 0 && (
            <span style={{
              padding: "0.2rem 0.6rem", borderRadius: "999px",
              background: `rgba(45,212,191,0.1)`,
              border: `1px solid rgba(45,212,191,0.2)`,
              fontFamily: F, fontSize: "0.68rem", fontWeight: 500,
              color: AQUA
            }}>
              {documents.length} doc{documents.length > 1 ? "s" : ""} loaded
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* Use documents toggle */}
          <label style={{
            display: "flex", alignItems: "center", gap: "0.4rem",
            cursor: "pointer", fontFamily: F, fontSize: "0.75rem",
            color: "rgba(255,255,255,0.4)"
          }}>
            <div
              onClick={() => setUseDocuments(!useDocuments)}
              style={{
                width: "32px", height: "18px", borderRadius: "999px",
                background: useDocuments ? AQUA : "rgba(255,255,255,0.1)",
                position: "relative", cursor: "pointer",
                transition: "background 0.2s ease"
              }}
            >
              <div style={{
                position: "absolute", top: "2px",
                left: useDocuments ? "16px" : "2px",
                width: "14px", height: "14px",
                borderRadius: "50%", background: "white",
                transition: "left 0.2s ease"
              }} />
            </div>
            Use docs
          </label>

          {/* Agent panel toggle */}
          <button onClick={onToggleAgentPanel} style={{
            background: agentPanelOpen ? "rgba(45,212,191,0.1)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${agentPanelOpen ? "rgba(45,212,191,0.2)" : "rgba(255,255,255,0.08)"}`,
            color: agentPanelOpen ? AQUA : "rgba(255,255,255,0.4)",
            fontFamily: F, fontSize: "0.72rem", fontWeight: 500,
            padding: "0.3rem 0.7rem", borderRadius: "0.4rem",
            cursor: "pointer", transition: "all 0.2s ease"
          }}>
            Agents
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "1.5rem 1.25rem",
        display: "flex", flexDirection: "column", gap: "1.25rem"
      }}>

        {messages.length === 0 && (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            textAlign: "center", padding: "3rem 1rem"
          }}>
            <div style={{
              fontFamily: F, fontWeight: 700, fontSize: "1.5rem",
              color: "white", marginBottom: "0.75rem", letterSpacing: "-0.02em"
            }}>
              What do you want to research?
            </div>
            <div style={{
              fontFamily: F, fontSize: "0.875rem",
              color: "rgba(255,255,255,0.35)", maxWidth: "400px", lineHeight: 1.6
            }}>
              Ask anything. Five AI agents will search, verify, and synthesize an answer for you.
            </div>

            {/* Suggested queries */}
            <div style={{
              display: "flex", flexWrap: "wrap", gap: "0.5rem",
              justifyContent: "center", marginTop: "1.5rem", maxWidth: "500px"
            }}>
              {[
                "What are the benefits of intermittent fasting?",
                "How does quantum computing work?",
                "What is the future of AI?",
              ].map((q, i) => (
                <button key={i} onClick={() => setInput(q)} style={{
                  padding: "0.5rem 0.9rem", borderRadius: "999px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.03)",
                  color: "rgba(255,255,255,0.5)",
                  fontFamily: F, fontSize: "0.78rem",
                  cursor: "pointer", transition: "all 0.2s ease"
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(45,212,191,0.3)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main research messages */}
        {messages.map((msg) => (
          <div key={msg.id} style={{
            display: "flex",
            justifyContent: msg.role === "user" ? "flex-end" : "flex-start"
          }}>
            {msg.role === "user" ? (
              <div style={{
                maxWidth: "70%", padding: "0.75rem 1rem",
                borderRadius: "1rem 1rem 0.25rem 1rem",
                background: `linear-gradient(135deg, rgba(45,212,191,0.15), rgba(139,92,246,0.15))`,
                border: "1px solid rgba(45,212,191,0.2)",
                fontFamily: F, fontSize: "0.875rem",
                color: "rgba(255,255,255,0.9)", lineHeight: 1.6
              }}>
                {msg.content}
              </div>
            ) : (
              <div style={{ maxWidth: "85%", width: "85%" }}>
                {msg.thinking ? (
                  <div style={{
                    padding: "1rem", borderRadius: "0.75rem",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                        {[0, 1, 2].map(i => (
                          <div key={i} style={{
                            width: "6px", height: "6px", borderRadius: "50%",
                            background: AQUA,
                            animation: `bounce 1.2s ease infinite`,
                            animationDelay: `${i * 0.2}s`
                          }} />
                        ))}
                      </div>
                      <span style={{ fontFamily: F, fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>
                        Agents working...
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: "1.25rem", borderRadius: "0.75rem",
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${msg.error ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.07)"}`,
                  }}>
                    <div style={{
                      fontFamily: F, fontSize: "0.875rem",
                      color: "rgba(255,255,255,0.85)", lineHeight: 1.75
                    }}
                      className="markdown-content"
                    >
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>

                    {msg.sources && msg.sources.length > 0 && (
                      <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{
                          fontFamily: F, fontSize: "0.68rem", fontWeight: 600,
                          color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em",
                          textTransform: "uppercase", marginBottom: "0.5rem"
                        }}>
                          Sources
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                          {msg.sources.map((s, i) => (
                            <a key={i} href={s.url || "#"} target="_blank" rel="noreferrer" style={{
                              padding: "0.25rem 0.6rem", borderRadius: "0.35rem",
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              fontFamily: F, fontSize: "0.7rem",
                              color: "rgba(255,255,255,0.45)",
                              textDecoration: "none", transition: "all 0.2s ease"
                            }}
                              onMouseEnter={e => e.currentTarget.style.color = AQUA}
                              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.45)"}
                            >
                              [{s.index}] {s.source.length > 40 ? s.source.slice(0, 40) + "..." : s.source}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Follow-up messages */}
        {followUpMessages.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {followUpMessages.map((msg, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start"
              }}>
                {msg.role === "user" ? (
                  <div style={{
                    maxWidth: "70%", padding: "0.75rem 1rem",
                    borderRadius: "1rem 1rem 0.25rem 1rem",
                    background: `linear-gradient(135deg, rgba(45,212,191,0.15), rgba(139,92,246,0.15))`,
                    border: "1px solid rgba(45,212,191,0.2)",
                    fontFamily: F, fontSize: "0.875rem",
                    color: "rgba(255,255,255,0.9)", lineHeight: 1.6
                  }}>
                    {msg.content}
                  </div>
                ) : (
                  <div style={{ maxWidth: "85%", width: "85%" }}>
                    <div style={{
                      padding: "1.25rem", borderRadius: "0.75rem",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}>
                      <div style={{
                        fontFamily: F, fontSize: "0.875rem",
                        color: "rgba(255,255,255,0.85)", lineHeight: 1.75
                      }}
                        className="markdown-content"
                      >
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Follow-up loading */}
        {followUpLoading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{
              padding: "1rem", borderRadius: "0.75rem",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: "6px", height: "6px", borderRadius: "50%",
                      background: AQUA,
                      animation: `bounce 1.2s ease infinite`,
                      animationDelay: `${i * 0.2}s`
                    }} />
                  ))}
                </div>
                <span style={{ fontFamily: F, fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>
                  Thinking...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div style={{
        padding: "1rem 1.25rem",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(10,10,15,0.8)",
        backdropFilter: "blur(12px)"
      }}>
        <div style={{
          display: "flex", alignItems: "flex-end", gap: "0.75rem",
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${hasResult ? "rgba(45,212,191,0.15)" : "rgba(255,255,255,0.09)"}`,
          borderRadius: "0.75rem", padding: "0.6rem 0.75rem",
          transition: "border 0.2s ease"
        }}>

          {/* Attach button */}
          <button onClick={() => fileRef.current.click()} style={{
            background: "none", border: "none",
            color: "rgba(255,255,255,0.3)", cursor: "pointer",
            fontSize: "1rem", padding: "0.25rem", flexShrink: 0,
            transition: "color 0.2s ease"
          }}
            onMouseEnter={e => e.currentTarget.style.color = AQUA}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
            title="Attach PDF"
          >
            +
          </button>

          {/* Text input */}
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={hasResult ? "Ask a follow-up question..." : "Ask a research question..."}
            rows={1}
            style={{
              flex: 1, background: "none", border: "none",
              color: "white", fontFamily: F, fontSize: "0.875rem",
              resize: "none", outline: "none", lineHeight: 1.6,
              maxHeight: "120px", overflowY: "auto"
            }}
          />

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || isQuerying || followUpLoading}
            style={{
              background: input.trim() && !isQuerying && !followUpLoading
                ? `linear-gradient(135deg, ${AQUA}, #8b5cf6)` : "rgba(255,255,255,0.06)",
              border: "none", borderRadius: "0.5rem",
              color: input.trim() && !isQuerying && !followUpLoading ? "white" : "rgba(255,255,255,0.2)",
              fontFamily: F, fontWeight: 600, fontSize: "0.8rem",
              padding: "0.45rem 0.9rem",
              cursor: input.trim() && !isQuerying && !followUpLoading ? "pointer" : "not-allowed",
              flexShrink: 0, transition: "all 0.2s ease"
            }}
          >
            {isQuerying || followUpLoading ? "..." : "Send"}
          </button>
        </div>

        <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }}
          onChange={async e => {
            const file = e.target.files[0];
            if (!file) return;
            alert("Please use the sidebar to upload documents");
          }}
        />

        {/* Mode indicator */}
        {hasResult ? (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "0.4rem", marginTop: "0.4rem"
          }}>
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: AQUA }} />
            <span style={{ fontFamily: F, fontSize: "0.65rem", color: "rgba(45,212,191,0.6)" }}>
              Follow-up mode · New Chat to start over
            </span>
          </div>
        ) : (
          <div style={{
            textAlign: "center", marginTop: "0.5rem",
            fontFamily: F, fontSize: "0.65rem", color: "rgba(255,255,255,0.18)"
          }}>
            Press Enter to send · Shift+Enter for new line
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
        .markdown-content h2 {
          font-size: 0.95rem;
          font-weight: 600;
          color: white;
          margin: 1rem 0 0.4rem 0;
        }
        .markdown-content p {
          margin: 0.4rem 0;
        }
        .markdown-content ul, .markdown-content ol {
          padding-left: 1.25rem;
          margin: 0.4rem 0;
        }
        .markdown-content li {
          margin: 0.2rem 0;
        }
        .markdown-content strong {
          color: white;
          font-weight: 600;
        }
      `}</style>

    </div>
  );
}

export default ChatPanel;