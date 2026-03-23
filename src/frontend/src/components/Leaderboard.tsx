import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { GameLeaderboardEntry } from "../backend";
import { useActor } from "../hooks/useActor";
import { BackButton } from "./BackButton";

const HUD_BG = "rgba(2,8,16,0.97)";
const CYAN = "#00F5FF";
const GREEN = "#39FF14";
const AMBER = "#FFB800";
const TEXT_PRIMARY = "#C8E6FF";
const TEXT_DIM = "#5A8FA8";

const PANEL_STYLE: React.CSSProperties = {
  background: HUD_BG,
  border: `1px solid ${CYAN}44`,
  borderRadius: 4,
  fontFamily: "'Courier New', 'JetBrains Mono', monospace",
  boxShadow: `0 0 30px ${CYAN}22, inset 0 0 60px rgba(0,0,0,0.8)`,
  position: "relative",
  overflow: "hidden",
};

const SCANLINES: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  backgroundImage:
    "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,245,255,0.015) 2px, rgba(0,245,255,0.015) 4px)",
  pointerEvents: "none",
  zIndex: 1,
};

const GRID_BG: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  backgroundImage:
    "linear-gradient(rgba(0,245,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.04) 1px, transparent 1px)",
  backgroundSize: "32px 32px",
  pointerEvents: "none",
  zIndex: 0,
};

const MEDALS = ["🥇", "🥈", "🥉"];

function truncatePrincipal(p: string): string {
  if (p.length <= 14) return p;
  return `${p.slice(0, 7)}...${p.slice(-5)}`;
}

function fmtCredits(n: bigint): string {
  return Number(n).toLocaleString();
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  isLoggedIn: boolean;
}

export function Leaderboard({ open, onOpenChange, isLoggedIn }: Props) {
  const { actor } = useActor();
  const [entries, setEntries] = useState<GameLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setBlink((b) => !b), 600);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!open || !actor || !isLoggedIn) return;
    setLoading(true);
    actor
      .getGameLeaderboard()
      .then((data) => {
        const sorted = [...data].sort(
          (a, b) => Number(b.totalGameCredits) - Number(a.totalGameCredits),
        );
        setEntries(sorted.slice(0, 20));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, actor, isLoggedIn]);

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
            background: "rgba(0,0,0,0.75)",
          }}
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            data-ocid="leaderboard.modal"
            initial={{ y: 30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              ...PANEL_STYLE,
              padding: 0,
              width: 500,
              maxWidth: "95vw",
              maxHeight: "85vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <BackButton onClick={() => onOpenChange(false)} />
            <div style={GRID_BG} />
            <div style={SCANLINES} />
            <div style={{ position: "relative", zIndex: 2, padding: 28 }}>
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 24,
                  borderBottom: `1px solid ${CYAN}33`,
                  paddingBottom: 16,
                }}
              >
                <div>
                  <div
                    style={{
                      color: CYAN,
                      fontSize: 11,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      marginBottom: 4,
                    }}
                  >
                    {"SECTOR ALPHA // GAME RANKINGS"}
                  </div>
                  <div
                    style={{
                      color: AMBER,
                      fontSize: 18,
                      fontWeight: 800,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    🏆 GLOBAL LEADERBOARD
                    <span
                      style={{
                        marginLeft: 8,
                        color: GREEN,
                        opacity: blink ? 1 : 0,
                        transition: "opacity 0.1s",
                      }}
                    >
                      |
                    </span>
                  </div>
                  <div style={{ color: TEXT_DIM, fontSize: 11, marginTop: 4 }}>
                    Ranked by Nova Credits earned from arcade games
                  </div>
                </div>
                <button
                  type="button"
                  data-ocid="leaderboard.close_button"
                  onClick={() => onOpenChange(false)}
                  style={{
                    background: "transparent",
                    border: `1px solid ${CYAN}44`,
                    color: CYAN,
                    cursor: "pointer",
                    fontSize: 16,
                    lineHeight: 1,
                    padding: "4px 10px",
                    borderRadius: 2,
                    letterSpacing: "0.05em",
                    transition: "all 0.15s",
                  }}
                >
                  [×]
                </button>
              </div>

              {!isLoggedIn ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 0",
                    color: TEXT_DIM,
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
                  <div
                    style={{
                      color: AMBER,
                      fontSize: 13,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    LOGIN REQUIRED
                  </div>
                  <div style={{ color: TEXT_DIM, fontSize: 11, marginTop: 6 }}>
                    Sign in to view the global rankings
                  </div>
                </div>
              ) : loading ? (
                <div
                  data-ocid="leaderboard.loading_state"
                  style={{
                    textAlign: "center",
                    padding: "40px 0",
                    color: CYAN,
                    fontSize: 12,
                    letterSpacing: "0.1em",
                  }}
                >
                  <div style={{ marginBottom: 8, fontSize: 24 }}>◌</div>
                  LOADING RANKINGS...
                </div>
              ) : entries.length === 0 ? (
                <div
                  data-ocid="leaderboard.empty_state"
                  style={{ textAlign: "center", padding: "40px 0" }}
                >
                  <div style={{ fontSize: 36, marginBottom: 12 }}>🌌</div>
                  <div
                    style={{
                      color: CYAN,
                      fontSize: 12,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    No entries found. Play arcade games to rank!
                  </div>
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {/* Column headers */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "48px 1fr 120px",
                      gap: 8,
                      padding: "4px 12px",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        color: TEXT_DIM,
                        fontSize: 9,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                      }}
                    >
                      RANK
                    </span>
                    <span
                      style={{
                        color: TEXT_DIM,
                        fontSize: 9,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                      }}
                    >
                      PILOT ID
                    </span>
                    <span
                      style={{
                        color: TEXT_DIM,
                        fontSize: 9,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        textAlign: "right",
                      }}
                    >
                      NOVA CREDITS
                    </span>
                  </div>

                  {entries.map((entry, i) => (
                    <motion.div
                      // biome-ignore lint/suspicious/noArrayIndexKey: stable ranked order
                      key={i}
                      data-ocid={`leaderboard.item.${i + 1}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "48px 1fr 120px",
                        gap: 8,
                        alignItems: "center",
                        background:
                          i === 0
                            ? "rgba(255,184,0,0.08)"
                            : i === 1
                              ? "rgba(0,245,255,0.06)"
                              : i === 2
                                ? "rgba(57,255,20,0.05)"
                                : "rgba(255,255,255,0.02)",
                        border:
                          i === 0
                            ? `1px solid ${AMBER}44`
                            : i === 1
                              ? `1px solid ${CYAN}33`
                              : i === 2
                                ? `1px solid ${GREEN}33`
                                : "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 2,
                        padding: "10px 12px",
                        boxShadow: i === 0 ? `0 0 12px ${AMBER}18` : "none",
                      }}
                    >
                      <div
                        style={{
                          fontSize: i < 3 ? 20 : 13,
                          fontWeight: 700,
                          color:
                            i === 0
                              ? AMBER
                              : i === 1
                                ? CYAN
                                : i === 2
                                  ? GREEN
                                  : TEXT_DIM,
                          textAlign: "center",
                        }}
                      >
                        {i < 3 ? MEDALS[i] : `#${i + 1}`}
                      </div>
                      <div
                        style={{
                          color: TEXT_PRIMARY,
                          fontSize: 12,
                          fontFamily: "'Courier New', monospace",
                          letterSpacing: "0.04em",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {truncatePrincipal(entry.principal.toString())}
                      </div>
                      <div
                        style={{
                          color: i === 0 ? AMBER : i < 3 ? CYAN : TEXT_PRIMARY,
                          fontSize: 13,
                          fontWeight: 700,
                          textAlign: "right",
                          letterSpacing: "0.04em",
                        }}
                      >
                        ✦ {fmtCredits(entry.totalGameCredits)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div
                style={{
                  marginTop: 20,
                  paddingTop: 12,
                  borderTop: `1px solid ${CYAN}22`,
                  color: TEXT_DIM,
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>TOP {entries.length} PILOTS</span>
                <span>{"NOVA CREDITS // GAME REWARDS"}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
