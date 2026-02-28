import { useMemo, useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';

const F = "'Inter', sans-serif";
const AQUA = "#2dd4bf";

function generateEllipsePath(cx, cy, rx, ry) {
  return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`;
}

const AGENTS = [
  { label: "Searcher", color: AQUA },
  { label: "Summarizer", color: "#8b5cf6" },
  { label: "Critic", color: "#f59e0b" },
  { label: "Fact Checker", color: "#22c55e" },
  { label: "Synthesizer", color: "#ec4899" },
];

function OrbitItem({ item, index, totalItems, path, rotation, progress }) {
  const itemOffset = (index / totalItems) * 100;
  const offsetDistance = useTransform(progress, (p) => {
    const offset = (((p + itemOffset) % 100) + 100) % 100;
    return `${offset}%`;
  });

  return (
    <motion.div style={{
      position: "absolute",
      offsetPath: `path("${path}")`,
      offsetRotate: '0deg',
      offsetAnchor: 'center center',
      offsetDistance,
    }}>
      <div style={{ transform: `rotate(${-rotation}deg)` }}>
        <div style={{
  padding: "0.5rem 1rem",
  borderRadius: "999px",
  background: `rgba(${item.color === AQUA ? "45,212,191" : item.color === "#8b5cf6" ? "139,92,246" : item.color === "#f59e0b" ? "245,158,11" : item.color === "#22c55e" ? "34,197,94" : "236,72,153"},0.12)`,
  border: `1px solid ${item.color}60`,
  color: item.color,
  fontFamily: F, fontWeight: 600,
  fontSize: "0.82rem",
  whiteSpace: "nowrap",
  letterSpacing: "0.02em",
  backdropFilter: "blur(8px)",
  boxShadow: `0 0 12px ${item.color}20`
}}>
  {item.label}
</div>
      </div>
    </motion.div>
  );
}

export default function OrbitAgents({ paused = false }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const baseWidth = 900;
  const cx = baseWidth / 2;
  const cy = baseWidth / 2;
  const radiusX = 340;
  const radiusY = 80;
  const rotation = -8;

  const path = useMemo(() =>
    generateEllipsePath(cx, cy, radiusX, radiusY),
    [cx, cy]
  );

  useEffect(() => {
    if (!containerRef.current) return;
    const updateScale = () => {
      if (!containerRef.current) return;
      setScale(containerRef.current.clientWidth / baseWidth);
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const progress = useMotionValue(0);

  useEffect(() => {
    if (paused) return;
    const controls = animate(progress, 100, {
      duration: 18,
      ease: 'linear',
      repeat: Infinity,
      repeatType: 'loop',
    });
    return () => controls.stop();
  }, [progress, paused]);

  return (
    <div
  ref={containerRef}
  style={{
    width: "100%",
    height: "120px",
    position: "relative",
    margin: "0 auto",
    overflow: "hidden"
  }}
  aria-hidden="true"
>
  <div style={{
    position: "absolute", left: "50%", top: "50%",
    width: baseWidth, height: baseWidth,
    transform: `translate(-50%, -50%) scale(${scale})`,
    transformOrigin: "center center"
  }}>
        <div style={{
          width: "100%", height: "100%",
          transform: `rotate(${rotation}deg)`,
          transformOrigin: "center center",
          position: "relative"
        }}>
            <svg
  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
  viewBox={`0 0 ${baseWidth} ${baseWidth}`}
>
  <path
    d={path}
    fill="none"
    stroke="rgba(255,255,255,0.08)"
    strokeWidth={2 / scale}
  />
</svg>
          {AGENTS.map((agent, index) => (
            <OrbitItem
              key={agent.label}
              item={agent}
              index={index}
              totalItems={AGENTS.length}
              path={path}
              rotation={rotation}
              progress={progress}
            />
          ))}
        </div>
      </div>
    </div>
  );
}