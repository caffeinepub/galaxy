import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PANEL_STYLE: React.CSSProperties = {
  background: "rgba(8,12,22,0.98)",
  border: "1px solid rgba(246,195,91,0.25)",
  borderRadius: 20,
  fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
  position: "relative",
  overflow: "hidden",
};

export function NFTTeaser({ isOpen, onClose }: Props) {
  const { actor } = useActor();
  const [name, setName] = useState("");
  const [wallet, setWallet] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !wallet.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (!actor) {
      toast.error("Please log in to join the waitlist.");
      return;
    }
    setSubmitting(true);
    try {
      await (actor as any).submitNFTWaitlist(name.trim(), wallet.trim());
      setSubmitted(true);
      toast.success("🌌 You're on the waitlist!", {
        style: {
          background: "rgba(11,16,23,0.95)",
          border: "1px solid rgba(246,195,91,0.4)",
          color: "#F6C35B",
        },
      });
    } catch {
      toast.error("Failed to join waitlist. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 3100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.82)",
            backdropFilter: "blur(10px)",
            padding: 16,
          }}
          onClick={onClose}
        >
          <motion.div
            data-ocid="nft.modal"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ ...PANEL_STYLE, width: "100%", maxWidth: 480 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gold shimmer top bar */}
            <div
              style={{
                height: 3,
                background:
                  "linear-gradient(90deg, transparent, #F6C35B, #a78bfa, transparent)",
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
              }}
            />

            {/* Stars background */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0.15,
                background:
                  "radial-gradient(ellipse at 70% 20%, #a78bfa33 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, #F6C35B22 0%, transparent 50%)",
                pointerEvents: "none",
              }}
            />

            <div style={{ padding: "28px 28px 24px", position: "relative" }}>
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 24,
                }}
              >
                <div>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🌌</div>
                  <h2
                    style={{
                      color: "#F6C35B",
                      fontSize: 20,
                      fontWeight: 800,
                      margin: 0,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Multi-verse NFT Collection
                  </h2>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.45)",
                      fontSize: 12,
                      margin: "4px 0 0",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    Coming Soon
                  </p>
                </div>
                <button
                  type="button"
                  data-ocid="nft.close_button"
                  onClick={onClose}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.35)",
                    cursor: "pointer",
                    fontSize: 22,
                    lineHeight: 1,
                    padding: 4,
                  }}
                >
                  ×
                </button>
              </div>

              {/* Info card */}
              <div
                style={{
                  background: "rgba(167,139,250,0.06)",
                  border: "1px solid rgba(167,139,250,0.2)",
                  borderRadius: 14,
                  padding: "18px 20px",
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    alignItems: "flex-start",
                  }}
                >
                  <span style={{ fontSize: 32, flexShrink: 0 }}>🪐</span>
                  <div>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.85)",
                        fontSize: 14,
                        lineHeight: 1.65,
                        margin: 0,
                      }}
                    >
                      An exclusive collection of{" "}
                      <strong style={{ color: "#F6C35B" }}>
                        8,888 unique universe NFTs
                      </strong>{" "}
                      is coming. Each NFT grants{" "}
                      <strong style={{ color: "#a78bfa" }}>
                        lifetime premium access
                      </strong>{" "}
                      to all universes, missions, and future features.
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        marginTop: 14,
                        flexWrap: "wrap",
                      }}
                    >
                      {[
                        { icon: "✦", label: "Lifetime Premium" },
                        { icon: "🌌", label: "All 6 Universes" },
                        { icon: "🚀", label: "Exclusive Missions" },
                      ].map((perk) => (
                        <span
                          key={perk.label}
                          style={{
                            background: "rgba(246,195,91,0.08)",
                            border: "1px solid rgba(246,195,91,0.2)",
                            borderRadius: 20,
                            padding: "4px 12px",
                            color: "#F6C35B",
                            fontSize: 11,
                            fontWeight: 600,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          {perk.icon} {perk.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form or success */}
              {submitted ? (
                <motion.div
                  data-ocid="nft.success_state"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    textAlign: "center",
                    padding: "24px 0 8px",
                  }}
                >
                  <div style={{ fontSize: 42, marginBottom: 10 }}>🎉</div>
                  <div
                    style={{
                      color: "#F6C35B",
                      fontSize: 17,
                      fontWeight: 700,
                      marginBottom: 6,
                    }}
                  >
                    You're on the list!
                  </div>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.45)",
                      fontSize: 13,
                    }}
                  >
                    We'll notify you when the collection drops.
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: 14 }}>
                    <label
                      htmlFor="nft-name"
                      style={{
                        display: "block",
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        marginBottom: 6,
                      }}
                    >
                      Your Name
                    </label>
                    <input
                      id="nft-name"
                      data-ocid="nft.input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Astronaut name..."
                      style={{
                        width: "100%",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 10,
                        padding: "10px 14px",
                        color: "#fff",
                        fontSize: 13,
                        fontFamily: "inherit",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label
                      htmlFor="nft-wallet"
                      style={{
                        display: "block",
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        marginBottom: 6,
                      }}
                    >
                      Wallet Address (ICP, BTC, or SOL)
                    </label>
                    <input
                      id="nft-wallet"
                      data-ocid="nft.input"
                      type="text"
                      value={wallet}
                      onChange={(e) => setWallet(e.target.value)}
                      placeholder="Your wallet address..."
                      style={{
                        width: "100%",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 10,
                        padding: "10px 14px",
                        color: "#fff",
                        fontSize: 13,
                        fontFamily: "inherit",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    data-ocid="nft.submit_button"
                    disabled={submitting}
                    style={{
                      width: "100%",
                      background: submitting
                        ? "rgba(246,195,91,0.3)"
                        : "linear-gradient(135deg, #F6C35B, #e8a830)",
                      border: "none",
                      borderRadius: 12,
                      padding: "13px 0",
                      color: submitting ? "rgba(255,255,255,0.5)" : "#0b1017",
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: submitting ? "wait" : "pointer",
                      letterSpacing: "0.04em",
                      transition: "all 0.2s",
                      fontFamily: "inherit",
                    }}
                  >
                    {submitting ? "Joining..." : "🚀 Join the Waitlist"}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
