import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface Props {
  credits: number;
  rank: string;
}

const RANK_COLORS: Record<string, string> = {
  Cadet: "#5A8FA8",
  Explorer: "#39FF14",
  Commander: "#00F5FF",
  Admiral: "#a78bfa",
  Legend: "#FFB800",
};

export function NovaCreditsDisplay({ credits, rank }: Props) {
  const rankColor = RANK_COLORS[rank] ?? "#FFB800";
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setBlink((b) => !b), 800);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      data-ocid="nova_credits.panel"
      style={{
        position: "fixed",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "rgba(2,8,16,0.9)",
        border: "1px solid rgba(0,245,255,0.35)",
        borderRadius: 2,
        padding: "6px 14px",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        zIndex: 200,
        pointerEvents: "none",
        fontFamily: "'Courier New', 'JetBrains Mono', monospace",
        boxShadow: "0 0 16px rgba(0,245,255,0.2)",
      }}
    >
      <span
        style={{
          color: "#00F5FF",
          fontSize: 10,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          opacity: 0.7,
        }}
      >
        NC
      </span>
      <span
        style={{
          color: "#FFB800",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.08em",
        }}
      >
        ✦ {credits.toLocaleString()}
      </span>
      <span
        style={{
          color: "rgba(0,245,255,0.25)",
          fontSize: 11,
        }}
      >
        |
      </span>
      <span
        style={{
          color: rankColor,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        {rank}
      </span>
      <span
        style={{
          color: "#39FF14",
          opacity: blink ? 1 : 0,
          fontSize: 11,
          transition: "opacity 0.1s",
          marginLeft: 2,
        }}
      >
        |
      </span>
    </motion.div>
  );
}
