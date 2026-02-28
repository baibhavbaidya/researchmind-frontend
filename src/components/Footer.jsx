const F = "'Inter', sans-serif";

export default function Footer() {
  return (
    <div style={{
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "1rem 1.5rem",
      display: "flex", flexWrap: "wrap",
      alignItems: "center", justifyContent: "space-between",
      gap: "0.5rem", fontFamily: F
    }}>
      <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.2)" }}>
        © {new Date().getFullYear()} ResearchMind. All rights reserved.
      </span>
      <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.15)" }}>
        LangGraph · FAISS · HuggingFace · FastAPI
      </span>
    </div>
  );
}