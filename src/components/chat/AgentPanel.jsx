import useStore from "../../store/useStore";

const F = "'Inter', sans-serif";
const AQUA = "#2dd4bf";

const AGENTS = [
  { name: "Searcher", icon: "S", desc: "Finding relevant sources" },
  { name: "Summarizer", icon: "Su", desc: "Summarizing each source" },
  { name: "Critic", icon: "C", desc: "Reviewing quality & bias" },
  { name: "FactChecker", icon: "F", desc: "Cross-verifying claims" },
  { name: "Synthesizer", icon: "Sy", desc: "Generating final answer" },
];

function AgentCard({ agent, status }) {
  const isThinking = status === "thinking";
  const isDone = status === "done";
  const isError = status === "error";
  const isActive = isThinking || isDone || isError;

  return (
    <div style={{
      padding: "0.75rem",
      borderRadius: "0.6rem",
      border: `1px solid ${isThinking ? "rgba(45,212,191,0.3)" : isDone ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.06)"}`,
      background: isThinking ? "rgba(45,212,191,0.05)" : isDone ? "rgba(34,197,94,0.04)" : "rgba(255,255,255,0.02)",
      marginBottom: "0.5rem",
      transition: "all 0.4s ease",
      transform: isActive ? "translateX(0)" : "translateX(8px)",
      opacity: isActive ? 1 : 0.35,
      animation: isActive ? "slideIn 0.3s ease" : "none"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>

        {/* Status icon */}
        <div style={{
          width: "28px", height: "28px", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.85rem", flexShrink: 0,
          background: isThinking ? "rgba(45,212,191,0.1)" : isDone ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${isThinking ? "rgba(45,212,191,0.3)" : isDone ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"}`,
        }}>
          {isThinking ? (
            <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
          ) : isDone ? (
            <span style={{ color: "#22c55e", fontSize: "0.8rem" }}>✓</span>
          ) : (
            <span style={{ fontFamily: F, fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>
              {agent.icon}
            </span>
          )}
        </div>

        {/* Agent info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: F, fontWeight: 600, fontSize: "0.8rem",
            color: isThinking ? AQUA : isDone ? "#22c55e" : "rgba(255,255,255,0.4)"
          }}>
            {agent.name}
          </div>
          <div style={{
            fontFamily: F, fontSize: "0.7rem",
            color: "rgba(255,255,255,0.3)",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
          }}>
            {isThinking ? agent.desc : isDone ? "Completed" : "Waiting"}
          </div>
        </div>

        {/* Dot indicator */}
        <div style={{
          width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
          background: isThinking ? AQUA : isDone ? "#22c55e" : "rgba(255,255,255,0.15)",
          boxShadow: isThinking ? `0 0 8px ${AQUA}` : isDone ? "0 0 8px #22c55e" : "none",
          animation: isThinking ? "pulse 1.5s ease infinite" : "none"
        }} />

      </div>
    </div>
  );
}

function AgentPanel({ onClose, embedded = false }) {
  const { agentLogs, isQuerying } = useStore();

  const getAgentStatus = (agentName) => {
    const thinking = agentLogs.find(l =>
      l.toLowerCase().includes(agentName.toLowerCase()) &&
      (l.toLowerCase().includes("searching") ||
       l.toLowerCase().includes("summarizing") ||
       l.toLowerCase().includes("reviewing") ||
       l.toLowerCase().includes("verifying") ||
       l.toLowerCase().includes("generating"))
    );
    const done = agentLogs.find(l =>
      l.toLowerCase().includes(agentName.toLowerCase()) &&
      (l.toLowerCase().includes("found") ||
       l.toLowerCase().includes("created") ||
       l.toLowerCase().includes("passed") ||
       l.toLowerCase().includes("verified") ||
       l.toLowerCase().includes("ready"))
    );

    if (done) return "done";
    if (thinking) return "thinking";
    return null;
  };

  const factLog = agentLogs.find(l =>
    l.toLowerCase().includes("factchecker:") && l.includes("verified")
  );
  let verified = 0, disputed = 0;
  if (factLog) {
    const vMatch = factLog.match(/(\d+) verified/);
    const dMatch = factLog.match(/(\d+) disputed/);
    if (vMatch) verified = parseInt(vMatch[1]);
    if (dMatch) disputed = parseInt(dMatch[1]);
  }

  const content = (
    <>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(16px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      {AGENTS.map((agent) => (
        <AgentCard
          key={agent.name}
          agent={agent}
          status={getAgentStatus(agent.name)}
        />
      ))}

      {/* Claims Summary */}
      {(verified > 0 || disputed > 0) && (
        <div style={{
          marginTop: "1rem", padding: "0.75rem",
          borderRadius: "0.6rem",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)"
        }}>
          <div style={{
            fontFamily: F, fontSize: "0.7rem", fontWeight: 600,
            color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em",
            textTransform: "uppercase", marginBottom: "0.6rem"
          }}>
            Claims Summary
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <div style={{
              flex: 1, padding: "0.5rem", borderRadius: "0.4rem",
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.2)",
              textAlign: "center"
            }}>
              <div style={{ fontFamily: F, fontWeight: 700, fontSize: "1.1rem", color: "#22c55e" }}>{verified}</div>
              <div style={{ fontFamily: F, fontSize: "0.65rem", color: "rgba(255,255,255,0.35)" }}>Verified</div>
            </div>
            <div style={{
              flex: 1, padding: "0.5rem", borderRadius: "0.4rem",
              background: "rgba(251,191,36,0.08)",
              border: "1px solid rgba(251,191,36,0.2)",
              textAlign: "center"
            }}>
              <div style={{ fontFamily: F, fontWeight: 700, fontSize: "1.1rem", color: "#fbbf24" }}>{disputed}</div>
              <div style={{ fontFamily: F, fontSize: "0.65rem", color: "rgba(255,255,255,0.35)" }}>Disputed</div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {agentLogs.length === 0 && !isQuerying && (
        <div style={{
          textAlign: "center", padding: "2rem 1rem",
          fontFamily: F, fontSize: "0.78rem",
          color: "rgba(255,255,255,0.2)", lineHeight: 1.6
        }}>
          Agent activity will appear here as each step completes
        </div>
      )}
    </>
  );

  // Embedded mode — for mobile bottom sheet, no outer container
  if (embedded) {
    return (
      <div style={{ padding: "0 0 1rem" }}>
        {content}
      </div>
    );
  }

  // Desktop mode — full panel
  return (
    <div style={{
      width: "280px", minWidth: "280px",
      height: "100vh",
      background: "rgba(255,255,255,0.02)",
      borderLeft: "1px solid rgba(255,255,255,0.07)",
      display: "flex", flexDirection: "column",
      overflow: "hidden"
    }}>

      {/* Header */}
      <div style={{
        padding: "1.25rem 1rem",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div>
          <div style={{ fontFamily: F, fontWeight: 600, fontSize: "0.875rem", color: "white" }}>
            Agent Activity
          </div>
          <div style={{
            fontFamily: F, fontSize: "0.7rem",
            color: "rgba(255,255,255,0.3)", marginTop: "0.15rem"
          }}>
            {isQuerying ? "Pipeline running..." : agentLogs.length > 0 ? "Pipeline complete" : "Waiting for query"}
          </div>
        </div>
        <button onClick={onClose} style={{
          background: "none", border: "none",
          color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "1rem"
        }}>✕</button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1rem 0.75rem 0.75rem" }}>
        {content}
      </div>

    </div>
  );
}

export default AgentPanel;