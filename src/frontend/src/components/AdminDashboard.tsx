import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  AdminStats,
  LoginRecord,
  PurchaseRequest,
  PurchaseRequestStatus,
} from "../backend";
import { useActor } from "../hooks/useActor";
import { BackButton } from "./BackButton";

function fmt(n: bigint | number): string {
  return Number(n).toLocaleString();
}

function fmtTime(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleString();
}

function truncPrincipal(p: { toString(): string }): string {
  const s = p.toString();
  return `${s.slice(0, 8)}...${s.slice(-5)}`;
}

function truncHash(h: string): string {
  if (h.length <= 16) return h;
  return `${h.slice(0, 8)}...${h.slice(-6)}`;
}

function statusColor(status: PurchaseRequestStatus): string {
  const s = String(status);
  if (s === "pending") return "#fbbf24";
  if (s === "approved") return "#34d399";
  return "#f87171";
}

function statusLabel(status: PurchaseRequestStatus): string {
  const s = String(status);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = "stats" | "purchases";

export function AdminDashboard({ isOpen, onClose }: Props) {
  const { actor } = useActor();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activity, setActivity] = useState<LoginRecord[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("stats");
  const [actionLoading, setActionLoading] = useState<bigint | null>(null);

  const loadData = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const [adminResult, hasAdminResult] = await Promise.all([
        actor.isCallerAdmin(),
        actor.hasAdmin(),
      ]);
      setIsAdmin(adminResult);
      setHasAdmin(hasAdminResult);
      if (adminResult) {
        const [statsResult, activityResult, purchasesResult] =
          await Promise.all([
            actor.getAdminStats(),
            actor.getLoginActivity(),
            actor.getAllPurchaseRequests(),
          ]);
        setStats(statsResult);
        setActivity(activityResult.slice(0, 20));
        setPurchases(purchasesResult);
      }
    } catch {
      setErrorMsg("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    if (isOpen && actor) {
      loadData();
    }
  }, [isOpen, actor, loadData]);

  useEffect(() => {
    if (!isOpen || !actor || isAdmin === false) return;
    const interval = setInterval(loadData, 30_000);
    return () => clearInterval(interval);
  }, [isOpen, actor, isAdmin, loadData]);

  async function handleApprove(id: bigint) {
    if (!actor) return;
    setActionLoading(id);
    try {
      await actor.approvePurchaseRequest(id);
      toast.success("Purchase approved ✓", {
        style: {
          background: "rgba(11,16,23,0.95)",
          border: "1px solid rgba(52,211,153,0.4)",
          color: "#34d399",
        },
      });
      await loadData();
    } catch {
      toast.error("Failed to approve purchase");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id: bigint) {
    if (!actor) return;
    setActionLoading(id);
    try {
      await actor.rejectPurchaseRequest(id);
      toast.error("Purchase rejected");
      await loadData();
    } catch {
      toast.error("Failed to reject purchase");
    } finally {
      setActionLoading(null);
    }
  }

  const pendingPurchases = purchases.filter(
    (p) => String(p.status) === "pending",
  );

  const TAB_BTN = (tab: Tab, label: string, count?: number) => (
    <button
      type="button"
      onClick={() => setActiveTab(tab)}
      style={{
        background: activeTab === tab ? "rgba(96,165,250,0.12)" : "transparent",
        border:
          activeTab === tab
            ? "1px solid rgba(96,165,250,0.3)"
            : "1px solid transparent",
        borderRadius: 8,
        padding: "6px 14px",
        color: activeTab === tab ? "#60a5fa" : "rgba(255,255,255,0.4)",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span
          style={{
            background: "#fbbf24",
            color: "#0b1017",
            borderRadius: 20,
            padding: "1px 7px",
            fontSize: 10,
            fontWeight: 800,
          }}
        >
          {count}
        </span>
      )}
    </button>
  );

  if (isOpen && !actor) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 500,
          background: "rgba(0,0,10,0.92)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Plus Jakarta Sans', monospace",
        }}
      >
        <div style={{ textAlign: "center", color: "#9AA7B6", fontSize: 16 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <div>Please log in to access the admin dashboard.</div>
          <button
            type="button"
            onClick={onClose}
            style={{
              marginTop: 24,
              padding: "8px 20px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 8,
              color: "#C8D4E0",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Close
          </button>
        </div>
      </motion.div>
    );
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
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(8px)",
            zIndex: 3000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
          }}
          onClick={onClose}
        >
          <BackButton onClick={() => onClose()} />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.3 }}
            style={{
              background: "rgba(8,12,20,0.98)",
              border: "1px solid rgba(96,165,250,0.25)",
              borderRadius: 20,
              width: "100%",
              maxWidth: 720,
              maxHeight: "90vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: "20px 24px 0",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>🛡️</span>
                  <div>
                    <h2
                      style={{
                        color: "#60a5fa",
                        fontSize: 18,
                        fontWeight: 700,
                        margin: 0,
                      }}
                    >
                      Admin Dashboard
                    </h2>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.35)",
                        fontSize: 11,
                        margin: 0,
                      }}
                    >
                      Real-time mission control
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    type="button"
                    data-ocid="admin.button"
                    onClick={loadData}
                    disabled={loading}
                    style={{
                      background: "rgba(96,165,250,0.1)",
                      border: "1px solid rgba(96,165,250,0.3)",
                      color: "#60a5fa",
                      borderRadius: 8,
                      padding: "5px 12px",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: loading ? "wait" : "pointer",
                      fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                    }}
                  >
                    {loading ? "↻ Loading..." : "↻ Refresh"}
                  </button>
                  <button
                    type="button"
                    data-ocid="admin.close_button"
                    onClick={onClose}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(255,255,255,0.4)",
                      cursor: "pointer",
                      fontSize: 22,
                      lineHeight: 1,
                      padding: 4,
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Tabs */}
              {isAdmin === true && (
                <div style={{ display: "flex", gap: 6, paddingBottom: 1 }}>
                  {TAB_BTN("stats", "📊 Stats & Activity")}
                  {TAB_BTN(
                    "purchases",
                    "💳 Pending Purchases",
                    pendingPurchases.length,
                  )}
                </div>
              )}
            </div>

            <ScrollArea style={{ flex: 1 }}>
              <div style={{ padding: "20px 24px" }}>
                {loading && isAdmin === null && (
                  <div
                    data-ocid="admin.loading_state"
                    style={{
                      textAlign: "center",
                      color: "rgba(255,255,255,0.4)",
                      padding: "40px 0",
                      fontSize: 14,
                    }}
                  >
                    Loading...
                  </div>
                )}

                {errorMsg && (
                  <div
                    data-ocid="admin.error_state"
                    style={{
                      background: "rgba(248,113,113,0.1)",
                      border: "1px solid rgba(248,113,113,0.25)",
                      borderRadius: 10,
                      padding: "12px 16px",
                      color: "#f87171",
                      fontSize: 13,
                      marginBottom: 16,
                    }}
                  >
                    {errorMsg}
                  </div>
                )}

                {isAdmin === false && hasAdmin === false && (
                  <div
                    data-ocid="admin.claim_panel"
                    style={{
                      textAlign: "center",
                      padding: "40px 24px",
                      background: "rgba(255,184,0,0.04)",
                      border: "1px solid rgba(255,184,0,0.25)",
                      borderRadius: 4,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage:
                          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,245,255,0.015) 2px, rgba(0,245,255,0.015) 4px)",
                        pointerEvents: "none",
                      }}
                    />
                    <div style={{ fontSize: 40, marginBottom: 16 }}>🛡️</div>
                    <div
                      style={{
                        color: "#FFB800",
                        fontSize: 14,
                        fontWeight: 800,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        marginBottom: 8,
                        fontFamily: "'Courier New', monospace",
                      }}
                    >
                      ADMIN SEAT UNCLAIMED
                    </div>
                    <div
                      style={{
                        color: "#5A8FA8",
                        fontSize: 12,
                        marginBottom: 8,
                        lineHeight: 1.6,
                        fontFamily: "'Courier New', monospace",
                      }}
                    >
                      No administrator has been registered.
                      <br />
                      Your Internet Identity will be permanently bound as admin.
                    </div>
                    <div
                      style={{
                        color: "#FF3B3B",
                        fontSize: 10,
                        marginBottom: 20,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        fontFamily: "'Courier New', monospace",
                      }}
                    >
                      ⚠ WARNING: THIS ACTION IS PERMANENT AND IRREVERSIBLE
                    </div>
                    <button
                      type="button"
                      data-ocid="admin.confirm_button"
                      disabled={claiming}
                      onClick={async () => {
                        if (!actor) return;
                        setClaiming(true);
                        try {
                          await actor.claimAdmin();
                          toast.success(
                            "Admin access claimed! Welcome, Commander.",
                            {
                              style: {
                                background: "rgba(2,8,16,0.95)",
                                border: "1px solid rgba(0,245,255,0.4)",
                                color: "#00F5FF",
                                fontFamily: "monospace",
                              },
                            },
                          );
                          await loadData();
                        } catch {
                          toast.error("Failed to claim admin access");
                        } finally {
                          setClaiming(false);
                        }
                      }}
                      style={{
                        background: claiming
                          ? "rgba(255,184,0,0.1)"
                          : "rgba(255,184,0,0.15)",
                        border: "1px solid rgba(255,184,0,0.6)",
                        borderRadius: 2,
                        padding: "12px 28px",
                        color: "#FFB800",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: claiming ? "not-allowed" : "pointer",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        fontFamily: "'Courier New', monospace",
                        boxShadow: claiming
                          ? "none"
                          : "0 0 16px rgba(255,184,0,0.3)",
                        transition: "all 0.15s",
                      }}
                    >
                      {claiming ? "CLAIMING..." : "▶ CLAIM ADMIN ACCESS"}
                    </button>
                  </div>
                )}

                {isAdmin === false && hasAdmin === true && (
                  <div
                    data-ocid="admin.error_state"
                    style={{ textAlign: "center", padding: "48px 0" }}
                  >
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
                    <div
                      style={{
                        color: "#FF3B3B",
                        fontSize: 14,
                        fontWeight: 800,
                        marginBottom: 8,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        fontFamily: "'Courier New', monospace",
                      }}
                    >
                      ACCESS DENIED
                    </div>
                    <div
                      style={{
                        color: "#5A8FA8",
                        fontSize: 12,
                        fontFamily: "'Courier New', monospace",
                      }}
                    >
                      Admin seat is occupied. Only the registered admin may
                      access this panel.
                    </div>
                  </div>
                )}

                {isAdmin === true && stats && activeTab === "stats" && (
                  <>
                    {/* Stats grid */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(140px, 1fr))",
                        gap: 12,
                        marginBottom: 24,
                      }}
                    >
                      {[
                        {
                          label: "Total Users",
                          value: fmt(stats.totalUsers),
                          icon: "👥",
                          color: "#60a5fa",
                        },
                        {
                          label: "Logins Today",
                          value: fmt(stats.totalLoginsToday),
                          icon: "📅",
                          color: "#34d399",
                        },
                        {
                          label: "Nova Credits",
                          value: fmt(stats.totalNovaCredits),
                          icon: "❆",
                          color: "#F6C35B",
                        },
                        {
                          label: "Total Donations",
                          value: `${fmt(stats.totalDonations)} ICP`,
                          icon: "💎",
                          color: "#a78bfa",
                        },
                        {
                          label: "Pending Purchases",
                          value: fmt(stats.pendingPurchases),
                          icon: "⏳",
                          color:
                            stats.pendingPurchases > 0n
                              ? "#fbbf24"
                              : "rgba(255,255,255,0.4)",
                        },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 12,
                            padding: "14px 16px",
                          }}
                        >
                          <div style={{ fontSize: 18, marginBottom: 8 }}>
                            {stat.icon}
                          </div>
                          <div
                            style={{
                              color: stat.color,
                              fontSize: 20,
                              fontWeight: 700,
                              lineHeight: 1,
                              marginBottom: 4,
                            }}
                          >
                            {stat.value}
                          </div>
                          <div
                            style={{
                              color: "rgba(255,255,255,0.4)",
                              fontSize: 11,
                            }}
                          >
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {stats.pendingPurchases > 0n && (
                      <div
                        style={{
                          background: "rgba(251,191,36,0.08)",
                          border: "1px solid rgba(251,191,36,0.25)",
                          borderRadius: 10,
                          padding: "12px 16px",
                          marginBottom: 20,
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span style={{ fontSize: 18 }}>⚠️</span>
                        <div>
                          <div
                            style={{
                              color: "#fbbf24",
                              fontSize: 13,
                              fontWeight: 700,
                            }}
                          >
                            {fmt(stats.pendingPurchases)} Pending Credit
                            Purchase
                            {stats.pendingPurchases !== 1n ? "s" : ""}
                          </div>
                          <div
                            style={{
                              color: "rgba(255,255,255,0.45)",
                              fontSize: 11,
                              marginTop: 2,
                            }}
                          >
                            Switch to Pending Purchases tab to review
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab("purchases")}
                          style={{
                            marginLeft: "auto",
                            background: "rgba(251,191,36,0.15)",
                            border: "1px solid rgba(251,191,36,0.4)",
                            borderRadius: 8,
                            padding: "5px 12px",
                            color: "#fbbf24",
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          Review →
                        </button>
                      </div>
                    )}

                    {/* Recent login activity */}
                    <div>
                      <p
                        style={{
                          color: "rgba(255,255,255,0.5)",
                          fontSize: 11,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          marginBottom: 12,
                        }}
                      >
                        Recent Login Activity (last 20)
                      </p>
                      {activity.length === 0 ? (
                        <div
                          data-ocid="admin.empty_state"
                          style={{
                            textAlign: "center",
                            color: "rgba(255,255,255,0.3)",
                            padding: "24px 0",
                            fontSize: 13,
                          }}
                        >
                          No login activity yet.
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                          }}
                        >
                          {activity.map((record, i) => (
                            <div
                              key={`${String(record.timestamp)}-${i}`}
                              data-ocid={`admin.item.${i + 1}`}
                              style={{
                                background: "rgba(255,255,255,0.025)",
                                border: "1px solid rgba(255,255,255,0.07)",
                                borderRadius: 8,
                                padding: "8px 14px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <span
                                style={{
                                  color: "rgba(255,255,255,0.6)",
                                  fontSize: 12,
                                  fontFamily: "'JetBrains Mono', monospace",
                                }}
                              >
                                {truncPrincipal(record.user)}
                              </span>
                              <span
                                style={{
                                  color: "rgba(255,255,255,0.35)",
                                  fontSize: 11,
                                }}
                              >
                                {fmtTime(record.timestamp)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Pending Purchases Tab */}
                {isAdmin === true && activeTab === "purchases" && (
                  <div>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        marginBottom: 16,
                      }}
                    >
                      Credit Purchase Requests
                    </p>

                    {purchases.length === 0 ? (
                      <div
                        data-ocid="admin.empty_state"
                        style={{
                          textAlign: "center",
                          color: "rgba(255,255,255,0.3)",
                          padding: "48px 0",
                          fontSize: 13,
                        }}
                      >
                        <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
                        No purchase requests yet.
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                        }}
                      >
                        {purchases.map((req, i) => {
                          const isPending = String(req.status) === "pending";
                          const isActing = actionLoading === req.id;
                          return (
                            <div
                              key={String(req.id)}
                              data-ocid={`admin.item.${i + 1}`}
                              style={{
                                background: "rgba(255,255,255,0.025)",
                                border: `1px solid ${isPending ? "rgba(251,191,36,0.2)" : "rgba(255,255,255,0.07)"}`,
                                borderRadius: 12,
                                padding: "16px 18px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  justifyContent: "space-between",
                                  gap: 12,
                                }}
                              >
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 8,
                                      marginBottom: 8,
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    <span
                                      style={{
                                        background: `${statusColor(req.status)}18`,
                                        border: `1px solid ${statusColor(req.status)}44`,
                                        borderRadius: 20,
                                        padding: "2px 10px",
                                        color: statusColor(req.status),
                                        fontSize: 11,
                                        fontWeight: 700,
                                        letterSpacing: "0.05em",
                                      }}
                                    >
                                      {statusLabel(req.status)}
                                    </span>
                                    <span
                                      style={{
                                        color: "#F6C35B",
                                        fontSize: 13,
                                        fontWeight: 700,
                                      }}
                                    >
                                      ❆ {fmt(req.creditsRequested)} Nova Credits
                                    </span>
                                    <span
                                      style={{
                                        color: "rgba(255,255,255,0.4)",
                                        fontSize: 11,
                                      }}
                                    >
                                      via {req.cryptoType.toUpperCase()}
                                    </span>
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: 16,
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    <div>
                                      <span
                                        style={{
                                          color: "rgba(255,255,255,0.35)",
                                          fontSize: 10,
                                          display: "block",
                                          marginBottom: 2,
                                          textTransform: "uppercase",
                                          letterSpacing: "0.06em",
                                        }}
                                      >
                                        User
                                      </span>
                                      <span
                                        style={{
                                          color: "rgba(255,255,255,0.6)",
                                          fontSize: 12,
                                          fontFamily:
                                            "'JetBrains Mono', monospace",
                                        }}
                                      >
                                        {truncPrincipal(req.user)}
                                      </span>
                                    </div>
                                    <div>
                                      <span
                                        style={{
                                          color: "rgba(255,255,255,0.35)",
                                          fontSize: 10,
                                          display: "block",
                                          marginBottom: 2,
                                          textTransform: "uppercase",
                                          letterSpacing: "0.06em",
                                        }}
                                      >
                                        TX Hash
                                      </span>
                                      <span
                                        style={{
                                          color: "rgba(255,255,255,0.6)",
                                          fontSize: 12,
                                          fontFamily:
                                            "'JetBrains Mono', monospace",
                                        }}
                                        title={req.transactionHash}
                                      >
                                        {truncHash(req.transactionHash)}
                                      </span>
                                    </div>
                                    <div>
                                      <span
                                        style={{
                                          color: "rgba(255,255,255,0.35)",
                                          fontSize: 10,
                                          display: "block",
                                          marginBottom: 2,
                                          textTransform: "uppercase",
                                          letterSpacing: "0.06em",
                                        }}
                                      >
                                        Time
                                      </span>
                                      <span
                                        style={{
                                          color: "rgba(255,255,255,0.45)",
                                          fontSize: 12,
                                        }}
                                      >
                                        {fmtTime(req.timestamp)}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {isPending && (
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 6,
                                      flexShrink: 0,
                                    }}
                                  >
                                    <button
                                      type="button"
                                      data-ocid="admin.confirm_button"
                                      disabled={isActing}
                                      onClick={() => handleApprove(req.id)}
                                      style={{
                                        background: isActing
                                          ? "rgba(52,211,153,0.1)"
                                          : "rgba(52,211,153,0.15)",
                                        border:
                                          "1px solid rgba(52,211,153,0.4)",
                                        borderRadius: 8,
                                        padding: "7px 16px",
                                        color: "#34d399",
                                        fontSize: 12,
                                        fontWeight: 700,
                                        cursor: isActing ? "wait" : "pointer",
                                        fontFamily: "inherit",
                                        minWidth: 80,
                                      }}
                                    >
                                      {isActing ? "..." : "✓ Approve"}
                                    </button>
                                    <button
                                      type="button"
                                      data-ocid="admin.delete_button"
                                      disabled={isActing}
                                      onClick={() => handleReject(req.id)}
                                      style={{
                                        background: isActing
                                          ? "rgba(248,113,113,0.05)"
                                          : "rgba(248,113,113,0.1)",
                                        border:
                                          "1px solid rgba(248,113,113,0.3)",
                                        borderRadius: 8,
                                        padding: "7px 16px",
                                        color: "#f87171",
                                        fontSize: 12,
                                        fontWeight: 700,
                                        cursor: isActing ? "wait" : "pointer",
                                        fontFamily: "inherit",
                                        minWidth: 80,
                                      }}
                                    >
                                      {isActing ? "..." : "✕ Reject"}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
