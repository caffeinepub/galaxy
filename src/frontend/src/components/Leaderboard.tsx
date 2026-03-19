import { AnimatePresence, motion } from "motion/react";
import { useGetTopDonors } from "../hooks/useQueries";

const PANEL_STYLE: React.CSSProperties = {
  background: "rgba(11,16,23,0.92)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 14,
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
};

function truncatePrincipal(p: string): string {
  if (p.length <= 12) return p;
  return `${p.slice(0, 6)}...${p.slice(-4)}`;
}

const MEDALS = ["🥇", "🥈", "🥉"];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function Leaderboard({ open, onOpenChange }: Props) {
  const { data: donors, isLoading } = useGetTopDonors();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="leaderboard-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.1)",
          }}
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            data-ocid="leaderboard.modal"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            style={{
              ...PANEL_STYLE,
              padding: 28,
              width: 440,
              maxWidth: "95vw",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div>
                <div
                  style={{
                    color: "#F6C35B",
                    fontSize: 15,
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  🏆 Leaderboard
                </div>
                <div style={{ color: "#9AA7B6", fontSize: 11, marginTop: 3 }}>
                  Top space supporters
                </div>
              </div>
              <button
                type="button"
                data-ocid="leaderboard.close_button"
                onClick={() => onOpenChange(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#9AA7B6",
                  cursor: "pointer",
                  fontSize: 20,
                  lineHeight: 1,
                  padding: 4,
                }}
              >
                ×
              </button>
            </div>

            {isLoading ? (
              <div
                data-ocid="leaderboard.loading_state"
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: "#9AA7B6",
                  fontSize: 13,
                }}
              >
                Loading rankings...
              </div>
            ) : !donors || donors.length === 0 ? (
              <div
                data-ocid="leaderboard.empty_state"
                style={{ textAlign: "center", padding: "40px 0" }}
              >
                <div style={{ fontSize: 36, marginBottom: 12 }}>🌌</div>
                <div style={{ color: "#9AA7B6", fontSize: 13 }}>
                  No donors yet. Be the first!
                </div>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {donors.slice(0, 10).map((donor, i) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: static list with stable order
                    key={i}
                    data-ocid={`leaderboard.item.${i + 1}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      background:
                        i < 3
                          ? "rgba(246,195,91,0.06)"
                          : "rgba(255,255,255,0.03)",
                      border:
                        i < 3
                          ? "1px solid rgba(246,195,91,0.2)"
                          : "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 10,
                      padding: "12px 16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: i < 3 ? 22 : 14,
                        fontWeight: 700,
                        color: "#9AA7B6",
                        minWidth: 28,
                        textAlign: "center",
                      }}
                    >
                      {i < 3 ? MEDALS[i] : `#${i + 1}`}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          color: "#E9EEF5",
                          fontSize: 12,
                          fontWeight: 600,
                          fontFamily: "monospace",
                        }}
                      >
                        {truncatePrincipal(donor.principal.toString())}
                      </div>
                    </div>
                    <div
                      style={{
                        color: "#F6C35B",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {(Number(donor.totalAmount) / 100).toFixed(2)} ICP
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
