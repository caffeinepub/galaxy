import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const PANEL_STYLE: React.CSSProperties = {
  background: "rgba(11,16,23,0.95)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 14,
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
};

const TABS = ["Merch", "Sponsorships", "Education", "API Embed"] as const;
type Tab = (typeof TABS)[number];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function MonetizationModal({ open, onOpenChange }: Props) {
  const [tab, setTab] = useState<Tab>("Merch");
  const [formEmail, setFormEmail] = useState("");
  const [formMsg, setFormMsg] = useState("");
  const [sent, setSent] = useState(false);

  function handleContactSubmit() {
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setFormEmail("");
    setFormMsg("");
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="monetize-overlay"
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
            data-ocid="monetize.modal"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            style={{
              ...PANEL_STYLE,
              padding: 28,
              width: 520,
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
                  💰 Support & Revenue
                </div>
                <div style={{ color: "#9AA7B6", fontSize: 11, marginTop: 3 }}>
                  Partner with Galaxy
                </div>
              </div>
              <button
                type="button"
                data-ocid="monetize.close_button"
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

            {/* Tab bar */}
            <div
              style={{
                display: "flex",
                gap: 6,
                marginBottom: 24,
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                paddingBottom: 0,
              }}
            >
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  data-ocid={"monetize.tab"}
                  onClick={() => setTab(t)}
                  style={{
                    background: "transparent",
                    border: "none",
                    borderBottom:
                      tab === t ? "2px solid #F6C35B" : "2px solid transparent",
                    color: tab === t ? "#F6C35B" : "#9AA7B6",
                    padding: "8px 14px",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                    marginBottom: -1,
                    transition: "all 0.2s",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === "Merch" && (
              <div>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🛍️</div>
                <div
                  style={{
                    color: "#F6C35B",
                    fontSize: 16,
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  Galaxy Merchandise
                </div>
                <div
                  style={{
                    color: "#9AA7B6",
                    fontSize: 13,
                    lineHeight: 1.6,
                    marginBottom: 20,
                  }}
                >
                  Get exclusive Galaxy-themed posters, prints, t-shirts, and
                  more. Each purchase supports the continued development of this
                  simulation.
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginBottom: 20,
                  }}
                >
                  {[
                    "Solar System Poster",
                    "Planet T-Shirt",
                    "Galaxy Hoodie",
                    "Space Mug",
                  ].map((item, i) => (
                    <div
                      // biome-ignore lint/suspicious/noArrayIndexKey: static list with stable order
                      key={i}
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 10,
                        padding: "14px",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: 24, marginBottom: 8 }}>
                        {["🖼️", "👕", "🧥", "☕"][i]}
                      </div>
                      <div
                        style={{
                          color: "#E9EEF5",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {item}
                      </div>
                    </div>
                  ))}
                </div>
                <a
                  href="https://www.redbubble.com"
                  target="_blank"
                  rel="noreferrer"
                  data-ocid="monetize.primary_button"
                  style={{
                    display: "inline-block",
                    background: "rgba(246,195,91,0.14)",
                    border: "1px solid rgba(246,195,91,0.4)",
                    borderRadius: 10,
                    color: "#F6C35B",
                    padding: "10px 24px",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                    textDecoration: "none",
                    letterSpacing: "0.06em",
                  }}
                >
                  🛒 Visit Store →
                </a>
              </div>
            )}

            {tab === "Sponsorships" && (
              <div>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🤝</div>
                <div
                  style={{
                    color: "#F6C35B",
                    fontSize: 16,
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  Sponsor Galaxy
                </div>
                <div
                  style={{
                    color: "#9AA7B6",
                    fontSize: 13,
                    lineHeight: 1.6,
                    marginBottom: 20,
                  }}
                >
                  Get your brand featured in the Galaxy experience. Sponsor a
                  planet, asteroid, or star cluster and reach thousands of space
                  enthusiasts.
                </div>
                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 10,
                    padding: 16,
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      color: "#E9EEF5",
                      fontSize: 12,
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    Sponsorship Tiers
                  </div>
                  {[
                    [
                      "🌍 Planet Sponsor",
                      "Your brand featured on a planet — $500/mo",
                    ],
                    [
                      "☄️ Asteroid Sponsor",
                      "Named asteroid in the belt — $200/mo",
                    ],
                    [
                      "⭐ Star Sponsor",
                      "Branded star in Galaxy View — $100/mo",
                    ],
                  ].map(([title, desc]) => (
                    <div
                      key={title}
                      style={{
                        display: "flex",
                        gap: 10,
                        marginBottom: 10,
                        alignItems: "flex-start",
                      }}
                    >
                      <span
                        style={{
                          color: "#F6C35B",
                          fontSize: 13,
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {title}
                      </span>
                      <span style={{ color: "#9AA7B6", fontSize: 12 }}>
                        {desc}
                      </span>
                    </div>
                  ))}
                </div>
                {sent ? (
                  <div
                    data-ocid="monetize.success_state"
                    style={{
                      color: "#34D399",
                      fontSize: 13,
                      textAlign: "center",
                      padding: "12px",
                    }}
                  >
                    ✓ Message sent! We'll be in touch.
                  </div>
                ) : (
                  <div>
                    <input
                      data-ocid="monetize.input"
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="Your email"
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 8,
                        padding: "9px 14px",
                        color: "#E9EEF5",
                        fontSize: 12,
                        outline: "none",
                        fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                        marginBottom: 8,
                      }}
                    />
                    <textarea
                      data-ocid="monetize.textarea"
                      value={formMsg}
                      onChange={(e) => setFormMsg(e.target.value)}
                      placeholder="Tell us about your sponsorship interest..."
                      rows={3}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 8,
                        padding: "9px 14px",
                        color: "#E9EEF5",
                        fontSize: 12,
                        resize: "none",
                        outline: "none",
                        fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                        marginBottom: 10,
                      }}
                    />
                    <button
                      type="button"
                      data-ocid="monetize.submit_button"
                      onClick={handleContactSubmit}
                      style={{
                        background: "rgba(246,195,91,0.14)",
                        border: "1px solid rgba(246,195,91,0.4)",
                        borderRadius: 8,
                        color: "#F6C35B",
                        padding: "9px 20px",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                      }}
                    >
                      Send Inquiry
                    </button>
                  </div>
                )}
              </div>
            )}

            {tab === "Education" && (
              <div>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🎓</div>
                <div
                  style={{
                    color: "#F6C35B",
                    fontSize: 16,
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  Educational Licensing
                </div>
                <div
                  style={{
                    color: "#9AA7B6",
                    fontSize: 13,
                    lineHeight: 1.6,
                    marginBottom: 20,
                  }}
                >
                  License Galaxy for classrooms, science museums, and
                  educational institutions. Engage students with an immersive 3D
                  solar system exploration tool.
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    marginBottom: 20,
                  }}
                >
                  {[
                    [
                      "🏫 Classroom License",
                      "$49/year per classroom. Up to 35 students.",
                    ],
                    [
                      "🏛️ Museum License",
                      "$299/year. Kiosk-optimized view. Custom branding.",
                    ],
                    [
                      "🎓 University License",
                      "$199/year per department. API access included.",
                    ],
                  ].map(([title, desc]) => (
                    <div
                      key={title}
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 10,
                        padding: "14px 16px",
                      }}
                    >
                      <div
                        style={{
                          color: "#F6C35B",
                          fontSize: 13,
                          fontWeight: 700,
                          marginBottom: 4,
                        }}
                      >
                        {title}
                      </div>
                      <div style={{ color: "#9AA7B6", fontSize: 12 }}>
                        {desc}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ color: "#9AA7B6", fontSize: 12 }}>
                  Contact us at{" "}
                  <span style={{ color: "#F6C35B" }}>edu@galaxy.app</span> to
                  get started.
                </div>
              </div>
            )}

            {tab === "API Embed" && (
              <div>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🔌</div>
                <div
                  style={{
                    color: "#F6C35B",
                    fontSize: 16,
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  API & Embed License
                </div>
                <div
                  style={{
                    color: "#9AA7B6",
                    fontSize: 13,
                    lineHeight: 1.6,
                    marginBottom: 20,
                  }}
                >
                  Embed the Galaxy 3D solar system on your website or access our
                  data API for custom integrations.
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    marginBottom: 20,
                  }}
                >
                  {[
                    [
                      "📦 Embed Widget",
                      "$29/month",
                      "Iframe-based embed for any website. Customizable colors and starting view.",
                    ],
                    [
                      "🔑 API Access",
                      "$99/month",
                      "Full REST API. Planet data, orbital positions, real-time calculations.",
                    ],
                    [
                      "⚡ Enterprise",
                      "Custom",
                      "White-label solution, custom domains, priority support, SLA.",
                    ],
                  ].map(([title, price, desc]) => (
                    <div
                      key={title}
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 10,
                        padding: "14px 16px",
                        display: "flex",
                        gap: 14,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 4,
                          }}
                        >
                          <span
                            style={{
                              color: "#F6C35B",
                              fontSize: 13,
                              fontWeight: 700,
                            }}
                          >
                            {title}
                          </span>
                          <span
                            style={{
                              color: "#E9EEF5",
                              fontSize: 13,
                              fontWeight: 700,
                            }}
                          >
                            {price}
                          </span>
                        </div>
                        <div style={{ color: "#9AA7B6", fontSize: 12 }}>
                          {desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    background: "rgba(246,195,91,0.05)",
                    border: "1px solid rgba(246,195,91,0.15)",
                    borderRadius: 10,
                    padding: "12px 16px",
                  }}
                >
                  <div style={{ color: "#D8BE8B", fontSize: 12 }}>
                    Ready to integrate? Email{" "}
                    <span style={{ color: "#F6C35B" }}>api@galaxy.app</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
