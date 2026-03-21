import { motion } from "motion/react";
import React from "react";

interface Props {
  credits: number;
  rank: string;
}

const RANK_COLORS: Record<string, string> = {
  Cadet: "#94a3b8",
  Explorer: "#34d399",
  Commander: "#60a5fa",
  Admiral: "#a78bfa",
  Legend: "#F6C35B",
};

export function NovaCreditsDisplay({ credits, rank }: Props) {
  const rankColor = RANK_COLORS[rank] ?? "#F6C35B";

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
        gap: 10,
        background: "rgba(11,16,23,0.85)",
        border: "1px solid rgba(246,195,91,0.25)",
        borderRadius: 9999,
        padding: "6px 16px",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        zIndex: 200,
        pointerEvents: "none",
        fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1 }}>✦</span>
      <span
        style={{
          color: "#F6C35B",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.04em",
        }}
      >
        {credits.toLocaleString()}
      </span>
      <span
        style={{
          color: "rgba(255,255,255,0.35)",
          fontSize: 11,
        }}
      >
        |
      </span>
      <span
        style={{
          color: rankColor,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {rank}
      </span>
    </motion.div>
  );
}
