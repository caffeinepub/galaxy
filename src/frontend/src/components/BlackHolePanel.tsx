import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface BlackHolePanelProps {
  open: boolean;
  onClose: () => void;
}

const FACTS = [
  "Nothing — not even light — can escape once it crosses the event horizon. The boundary is a one-way membrane in spacetime.",
  "At the center lies a singularity where density becomes infinite and our known laws of physics break down completely.",
  "Sagittarius A* was confirmed by observing stars orbiting an invisible, massive object over 30+ years of observations.",
  "The Event Horizon Telescope captured the first image of Sgr A* in 2022 — revealing a glowing ring of superheated plasma 50 million km wide.",
];

export function BlackHolePanel({ open, onClose }: BlackHolePanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="bh-panel"
          initial={{ opacity: 0, x: 40, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 40, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          style={{
            position: "fixed",
            top: "50%",
            right: 24,
            transform: "translateY(-50%)",
            width: 320,
            maxHeight: "85vh",
            overflowY: "auto",
            background: "rgba(8, 2, 14, 0.95)",
            border: "1px solid rgba(255, 80, 20, 0.35)",
            borderRadius: 18,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            padding: 24,
            fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
            zIndex: 200,
            boxShadow:
              "0 0 60px rgba(255, 80, 20, 0.15), 0 8px 40px rgba(0,0,0,0.7)",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,80,20,0.2) transparent",
          }}
        >
          {/* Close */}
          <button
            type="button"
            data-ocid="blackhole_panel.close_button"
            onClick={onClose}
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              background: "rgba(255,80,20,0.1)",
              border: "1px solid rgba(255,80,20,0.3)",
              borderRadius: 8,
              color: "#FF8030",
              cursor: "pointer",
              padding: "4px 8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={13} />
          </button>

          {/* Header */}
          <div style={{ marginBottom: 20, paddingRight: 28 }}>
            {/* Black hole icon */}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, #000 40%, #FF4010 70%, transparent 100%)",
                border: "2px solid rgba(255,80,20,0.6)",
                boxShadow:
                  "0 0 20px rgba(255,80,20,0.4), inset 0 0 20px rgba(255,80,20,0.15)",
                marginBottom: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              ⚫
            </div>
            <div
              style={{
                color: "#FF8030",
                fontSize: 20,
                fontWeight: 900,
                letterSpacing: "0.04em",
                lineHeight: 1.1,
                textShadow: "0 0 20px rgba(255,100,20,0.5)",
              }}
            >
              Sagittarius A*
            </div>
            <div
              style={{
                color: "rgba(200, 150, 100, 0.8)",
                fontSize: 11,
                fontWeight: 600,
                marginTop: 5,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Supermassive Black Hole — Milky Way Center
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              height: 1,
              background:
                "linear-gradient(to right, rgba(255,80,20,0.4), transparent)",
              marginBottom: 18,
            }}
          />

          {/* Stats */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 20,
            }}
          >
            {[
              { label: "Mass", value: "4.1 million solar masses" },
              { label: "Distance from Earth", value: "26,000 light years" },
              { label: "Schwarzschild Radius", value: "12 million km" },
              {
                label: "Event Horizon Temp",
                value: "~0 K (near absolute zero)",
              },
              { label: "Orbital period", value: "~230 million years" },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "7px 12px",
                  background: "rgba(255,80,20,0.05)",
                  border: "1px solid rgba(255,80,20,0.12)",
                  borderRadius: 8,
                }}
              >
                <span
                  style={{
                    color: "rgba(200,150,100,0.7)",
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {label}
                </span>
                <span
                  style={{ color: "#FFB070", fontSize: 11, fontWeight: 700 }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Facts */}
          <div
            style={{
              color: "#FF8030",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            ⚠ Known Facts
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {FACTS.map((fact) => (
              <div
                key={fact.slice(0, 30)}
                style={{
                  padding: "10px 12px",
                  background: "rgba(255,80,20,0.04)",
                  border: "1px solid rgba(255,80,20,0.1)",
                  borderLeft: "2px solid rgba(255,80,20,0.5)",
                  borderRadius: "0 8px 8px 0",
                  color: "#E0A080",
                  fontSize: 11,
                  lineHeight: 1.6,
                }}
              >
                {fact}
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div
            style={{
              marginTop: 18,
              padding: "10px 14px",
              background: "rgba(255,80,20,0.06)",
              border: "1px solid rgba(255,80,20,0.15)",
              borderRadius: 10,
              color: "rgba(200,130,80,0.8)",
              fontSize: 10,
              lineHeight: 1.6,
            }}
          >
            🔭 First imaged by the{" "}
            <strong style={{ color: "#FF8030" }}>
              Event Horizon Telescope
            </strong>{" "}
            collaboration in 2022. The orange glow you see is plasma heated to
            billions of degrees orbiting at near-light speed.
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
