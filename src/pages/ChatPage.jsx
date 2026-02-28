import { useState, useEffect } from "react";
import useStore from "../store/useStore";
import Sidebar from "../components/chat/Sidebar";
import ChatPanel from "../components/chat/ChatPanel";
import AgentPanel from "../components/chat/AgentPanel";

const F = "'Inter', sans-serif";

function ChatPage() {
  const getInitial = () => window.innerWidth >= 768;
  const [sidebarOpen, setSidebarOpen] = useState(getInitial);
  const [agentPanelOpen, setAgentPanelOpen] = useState(getInitial);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMobileAgents, setShowMobileAgents] = useState(false);
  const { isQuerying } = useStore();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
        setAgentPanelOpen(false);
      } else {
        setSidebarOpen(true);
        setAgentPanelOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isQuerying && isMobile) {
      const timer = setTimeout(() => setShowMobileAgents(true), 0);
      return () => clearTimeout(timer);
    }
  }, [isQuerying, isMobile]);

  useEffect(() => {
  useStore.getState().clearDocuments();
  useStore.getState().clearMessages();
  useStore.getState().resetAgentLogs();
  useStore.getState().clearFollowUpMessages();
}, []);

  return (
    <div style={{
      display: "flex", height: "100vh", width: "100vw",
      backgroundColor: "#0a0a0f", overflow: "hidden",
      fontFamily: F, position: "relative"
    }}>

      {/* Left Sidebar — slides in over chat on mobile */}
      <div style={{
  position: isMobile ? "fixed" : "relative",
  left: 0, top: 0,
  height: "100vh",
  zIndex: isMobile ? 50 : "auto",
  width: isMobile ? "75%" : "auto",
  maxWidth: isMobile ? "280px" : "none",
  transform: isMobile
    ? sidebarOpen ? "translateX(0)" : "translateX(-100%)"
    : "none",
  transition: "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
  flexShrink: 0,
  display: isMobile ? "block" : sidebarOpen ? "block" : "none"
}}>
  <Sidebar onClose={() => setSidebarOpen(false)} />
</div>

      {/* Center Chat — always visible, full width on mobile */}
      <ChatPanel
        sidebarOpen={sidebarOpen && !isMobile}
        onOpenSidebar={() => setSidebarOpen(true)}
        agentPanelOpen={agentPanelOpen && !isMobile}
        onToggleAgentPanel={() => {
          if (isMobile) setShowMobileAgents(true);
          else setAgentPanelOpen(!agentPanelOpen);
        }}
        isMobile={isMobile}
      />

      {/* Right Agent Panel — desktop only */}
      {!isMobile && agentPanelOpen && (
        <AgentPanel onClose={() => setAgentPanelOpen(false)} />
      )}

      {/* Mobile Bottom Sheet — Agent Activity */}
      {isMobile && (
        <>
          {showMobileAgents && (
            <div
              onClick={() => setShowMobileAgents(false)}
              style={{
                position: "fixed", inset: 0, zIndex: 40,
                background: "rgba(0,0,0,0.5)"
              }}
            />
          )}

          <div style={{
            position: "fixed", bottom: 0, left: 0, right: 0,
            zIndex: 50,
            background: "#0f0f18",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "1.25rem 1.25rem 0 0",
            transform: showMobileAgents ? "translateY(0)" : "translateY(100%)",
            transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
            maxHeight: "70vh",
            display: "flex", flexDirection: "column"
          }}>
            {/* Handle bar */}
            <div style={{
              width: "36px", height: "4px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.15)",
              margin: "0.75rem auto 0"
            }} />

            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              padding: "0.75rem 1.25rem"
            }}>
              <div style={{
                fontFamily: F, fontWeight: 600,
                fontSize: "0.875rem", color: "white"
              }}>
                Agent Activity
              </div>
              <button onClick={() => setShowMobileAgents(false)} style={{
                background: "none", border: "none",
                color: "rgba(255,255,255,0.4)",
                cursor: "pointer", fontSize: "1rem"
              }}>✕</button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0 0.75rem 1.5rem" }}>
              <AgentPanel
                onClose={() => setShowMobileAgents(false)}
                embedded={true}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ChatPage;