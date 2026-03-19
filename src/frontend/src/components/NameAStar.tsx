import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetAllStars, useSubmitStar } from "../hooks/useQueries";

const PANEL_STYLE: React.CSSProperties = {
  background: "rgba(11,16,23,0.92)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 14,
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
};

const ICP_ADDRESS =
  "925bce4fff6f1266ecb25bfce074a06f556a3e41fa866cdd12a4daabd200e612";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onStarNamed?: () => void;
}

export function NameAStar({ open, onOpenChange, onStarNamed }: Props) {
  const [starName, setStarName] = useState("");
  const [message, setMessage] = useState("");
  const [paid, setPaid] = useState(false);
  const [copied, setCopied] = useState(false);
  const { identity, isLoginSuccess } = useInternetIdentity();
  const isLoggedIn =
    isLoginSuccess && !!identity && !identity.getPrincipal().isAnonymous();

  const { data: stars, isLoading } = useGetAllStars(open);
  const { mutate: submitStar, isPending } = useSubmitStar();

  function copyAddress() {
    navigator.clipboard.writeText(ICP_ADDRESS).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleSubmit() {
    if (!starName.trim() || !paid) return;
    submitStar(
      { name: starName.trim(), message: message.trim() },
      {
        onSuccess: () => {
          toast.success(`"${starName}" registered in the galaxy! ⭐`);
          setStarName("");
          setMessage("");
          setPaid(false);
          onStarNamed?.();
        },
        onError: () => toast.error("Failed to register star"),
      },
    );
  }

  function formatTime(ts: bigint): string {
    try {
      const ms = Number(ts) / 1_000_000;
      return new Date(ms).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="star-overlay"
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
            background: "rgba(0,0,0,0.65)",
          }}
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            data-ocid="namestar.modal"
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            style={{
              ...PANEL_STYLE,
              padding: 28,
              width: 500,
              maxWidth: "95vw",
              maxHeight: "85vh",
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
                  ⭐ Name a Star
                </div>
                <div style={{ color: "#9AA7B6", fontSize: 11, marginTop: 3 }}>
                  Register your star in the Galaxy registry
                </div>
              </div>
              <button
                type="button"
                data-ocid="namestar.close_button"
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

            {!isLoggedIn ? (
              <div
                style={{
                  background: "rgba(246,195,91,0.06)",
                  border: "1px solid rgba(246,195,91,0.2)",
                  borderRadius: 10,
                  padding: "16px",
                  color: "#D8BE8B",
                  fontSize: 13,
                  textAlign: "center",
                }}
              >
                🔒 Please login to name a star
              </div>
            ) : (
              <div style={{ marginBottom: 24 }}>
                {/* Payment instructions */}
                <div
                  style={{
                    background: "rgba(246,195,91,0.06)",
                    border: "1px solid rgba(246,195,91,0.2)",
                    borderRadius: 10,
                    padding: "14px 16px",
                    marginBottom: 18,
                  }}
                >
                  <div
                    style={{
                      color: "#F6C35B",
                      fontSize: 12,
                      fontWeight: 700,
                      marginBottom: 8,
                    }}
                  >
                    💎 Name a Star — 1 ICP
                  </div>
                  <div
                    style={{
                      color: "#9AA7B6",
                      fontSize: 11,
                      marginBottom: 10,
                      lineHeight: 1.6,
                    }}
                  >
                    Send 1 ICP to the address below, then fill in your star name
                    and confirm payment.
                  </div>
                  <div
                    style={{
                      background: "rgba(0,0,0,0.3)",
                      borderRadius: 8,
                      padding: "8px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span
                      style={{
                        color: "#E9EEF5",
                        fontSize: 10,
                        fontFamily: "monospace",
                        wordBreak: "break-all",
                        flex: 1,
                      }}
                    >
                      {ICP_ADDRESS}
                    </span>
                    <button
                      type="button"
                      data-ocid="namestar.secondary_button"
                      onClick={copyAddress}
                      style={{
                        background: "rgba(246,195,91,0.1)",
                        border: "1px solid rgba(246,195,91,0.3)",
                        borderRadius: 6,
                        color: "#F6C35B",
                        padding: "4px 10px",
                        cursor: "pointer",
                        fontSize: 10,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                      }}
                    >
                      {copied ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <input
                  data-ocid="namestar.input"
                  type="text"
                  value={starName}
                  onChange={(e) => setStarName(e.target.value)}
                  placeholder="Star name (e.g. Stella Nova)"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 10,
                    padding: "10px 14px",
                    color: "#E9EEF5",
                    fontSize: 13,
                    outline: "none",
                    fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                    marginBottom: 10,
                  }}
                />
                <textarea
                  data-ocid="namestar.textarea"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Dedication message (optional)"
                  rows={2}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 10,
                    padding: "10px 14px",
                    color: "#E9EEF5",
                    fontSize: 13,
                    resize: "none",
                    outline: "none",
                    fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                    marginBottom: 12,
                  }}
                />

                {/* Paid confirmation */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                    marginBottom: 16,
                  }}
                >
                  <input
                    data-ocid="namestar.checkbox"
                    type="checkbox"
                    checked={paid}
                    onChange={(e) => setPaid(e.target.checked)}
                    style={{
                      width: 16,
                      height: 16,
                      accentColor: "#F6C35B",
                      cursor: "pointer",
                    }}
                  />
                  <span style={{ color: "#9AA7B6", fontSize: 12 }}>
                    I confirm I have sent 1 ICP to the address above
                  </span>
                </label>

                <button
                  type="button"
                  data-ocid="namestar.submit_button"
                  disabled={!starName.trim() || !paid || isPending}
                  onClick={handleSubmit}
                  style={{
                    width: "100%",
                    background:
                      starName.trim() && paid
                        ? "rgba(246,195,91,0.14)"
                        : "rgba(255,255,255,0.04)",
                    border:
                      starName.trim() && paid
                        ? "1px solid rgba(246,195,91,0.4)"
                        : "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8,
                    color: starName.trim() && paid ? "#F6C35B" : "#9AA7B6",
                    padding: "10px",
                    cursor: starName.trim() && paid ? "pointer" : "not-allowed",
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                  }}
                >
                  {isPending ? "Registering..." : "⭐ Register My Star"}
                </button>
              </div>
            )}

            {/* Stars list */}
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.08)",
                paddingTop: 16,
              }}
            >
              <div
                style={{
                  color: "#9AA7B6",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 12,
                }}
              >
                Registered Stars ({isLoading ? "..." : (stars?.length ?? 0)})
              </div>
              {isLoading ? (
                <div
                  data-ocid="namestar.loading_state"
                  style={{
                    color: "#9AA7B6",
                    fontSize: 12,
                    textAlign: "center",
                    padding: "16px 0",
                  }}
                >
                  Loading stars...
                </div>
              ) : !stars || stars.length === 0 ? (
                <div
                  data-ocid="namestar.empty_state"
                  style={{
                    color: "#9AA7B6",
                    fontSize: 12,
                    textAlign: "center",
                    padding: "16px 0",
                  }}
                >
                  No stars named yet. Be the first!
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    maxHeight: 200,
                    overflowY: "auto",
                  }}
                >
                  {stars.map((s, i) => (
                    <div
                      // biome-ignore lint/suspicious/noArrayIndexKey: static list with stable order
                      key={i}
                      data-ocid={`namestar.item.${i + 1}`}
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: 8,
                        padding: "10px 14px",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <span style={{ fontSize: 18 }}>⭐</span>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            color: "#F6C35B",
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        >
                          {s.name}
                        </div>
                        {s.message && (
                          <div
                            style={{
                              color: "#9AA7B6",
                              fontSize: 11,
                              marginTop: 2,
                            }}
                          >
                            {s.message}
                          </div>
                        )}
                      </div>
                      <span style={{ color: "#9AA7B6", fontSize: 10 }}>
                        {formatTime(s.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
