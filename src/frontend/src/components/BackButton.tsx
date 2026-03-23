import { motion } from "motion/react";

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export function BackButton({ onClick, label = "◀ BACK" }: BackButtonProps) {
  return (
    <motion.button
      type="button"
      data-ocid="nav.back_button"
      onClick={onClick}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      style={{
        position: "fixed",
        top: 16,
        left: 16,
        zIndex: 9999,
        background: "rgba(0,20,40,0.85)",
        border: "1px solid #00d4ff",
        color: "#00d4ff",
        fontFamily: "'JetBrains Mono', 'Geist Mono', monospace",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.1em",
        padding: "0 16px",
        borderRadius: 4,
        cursor: "pointer",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: "0 0 12px rgba(0,212,255,0.25), 0 2px 8px rgba(0,0,0,0.5)",
        minWidth: 44,
        minHeight: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        userSelect: "none",
      }}
    >
      {label}
    </motion.button>
  );
}
