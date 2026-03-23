import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { PurchaseRequestStatus } from "../backend";
import { useActor } from "../hooks/useActor";
import { useUserPurchaseRequests } from "../hooks/useQueries";
import { BackButton } from "./BackButton";

const WALLETS = [
  {
    id: "ICP",
    label: "ICP",
    address: "925bce4fff6f1266ecb25bfce074a06f556a3e41fa866cdd12a4daabd200e612",
    rate: "1 ICP = 1,000 Nova Credits",
    icon: "⚡",
    color: "#60a5fa",
  },
  {
    id: "Bitcoin",
    label: "Bitcoin",
    address: "bc1pq80t58yxr33zj7ulmzvm4k08l3uahjgpw8c2mjtwsu2wsd78j2fsf6s0lw",
    rate: "0.001 BTC = 1,000 Nova Credits",
    icon: "₿",
    color: "#fb923c",
  },
  {
    id: "Solana",
    label: "Solana",
    address: "8M2MQy4n9myiUgxuAssuDtM6Y7so24WvWab6hnAGprAT",
    rate: "1 SOL = 500 Nova Credits",
    icon: "◎",
    color: "#a78bfa",
  },
];

const STATUS_BADGE: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  [PurchaseRequestStatus.pending]: {
    label: "Pending",
    bg: "rgba(251,191,36,0.15)",
    color: "#fbbf24",
  },
  [PurchaseRequestStatus.approved]: {
    label: "Approved",
    bg: "rgba(52,211,153,0.15)",
    color: "#34d399",
  },
  [PurchaseRequestStatus.rejected]: {
    label: "Rejected",
    bg: "rgba(248,113,113,0.15)",
    color: "#f87171",
  },
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CreditShop({ isOpen, onClose }: Props) {
  const { actor } = useActor();
  const { data: requests = [], refetch } = useUserPurchaseRequests(isOpen);

  const [selectedWallet, setSelectedWallet] = useState(WALLETS[0]);
  const [copied, setCopied] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [cryptoType, setCryptoType] = useState("ICP");
  const [creditsRequested, setCreditsRequested] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function copyAddress(address: string) {
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      toast.success("Wallet address copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!actor || !txHash || !creditsRequested) return;
    const trimmed = creditsRequested.trim();
    if (!/^\d+$/.test(trimmed) || Number(trimmed) <= 0) {
      toast.error("Please enter a valid whole number of credits.");
      return;
    }
    setSubmitting(true);
    try {
      await actor.submitPurchaseRequest(txHash, cryptoType, BigInt(trimmed));
      toast.success("Purchase request submitted! Admin will approve shortly.");
      setTxHash("");
      setCreditsRequested("");
      refetch();
    } catch {
      toast.error("Failed to submit request. Please try again.");
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
            background: "rgba(0,0,0,0.75)",
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
              background: "rgba(8,12,20,0.97)",
              border: "1px solid rgba(246,195,91,0.25)",
              borderRadius: 20,
              width: "100%",
              maxWidth: 640,
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
                padding: "20px 24px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: 22 }}>✦</span>
                  <h2
                    style={{
                      color: "#F6C35B",
                      fontSize: 20,
                      fontWeight: 700,
                      margin: 0,
                    }}
                  >
                    Nova Credits Shop
                  </h2>
                </div>
                <p
                  style={{
                    color: "rgba(255,255,255,0.45)",
                    fontSize: 12,
                    margin: 0,
                  }}
                >
                  Buy credits with crypto to explore the universe
                </p>
              </div>
              <button
                type="button"
                data-ocid="credit_shop.close_button"
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

            <ScrollArea style={{ flex: 1 }}>
              <div style={{ padding: "20px 24px" }}>
                {/* Exchange Rates */}
                <div style={{ marginBottom: 24 }}>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.5)",
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: 12,
                    }}
                  >
                    Exchange Rates
                  </p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {WALLETS.map((w) => {
                      const rgbMap: Record<string, string> = {
                        "#60a5fa": "96,165,250",
                        "#fb923c": "251,146,60",
                        "#a78bfa": "167,139,250",
                      };
                      const rgb = rgbMap[w.color] ?? "255,255,255";
                      return (
                        <button
                          key={w.id}
                          type="button"
                          data-ocid={`credit_shop.${w.id.toLowerCase()}_tab`}
                          onClick={() => {
                            setSelectedWallet(w);
                            setCryptoType(w.id);
                          }}
                          style={{
                            flex: 1,
                            minWidth: 160,
                            background:
                              selectedWallet.id === w.id
                                ? `rgba(${rgb},0.12)`
                                : "rgba(255,255,255,0.04)",
                            border: `1px solid ${
                              selectedWallet.id === w.id
                                ? w.color
                                : "rgba(255,255,255,0.1)"
                            }`,
                            borderRadius: 12,
                            padding: "12px 16px",
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "all 0.2s",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 20,
                              marginBottom: 6,
                              color: w.color,
                            }}
                          >
                            {w.icon}
                          </div>
                          <div
                            style={{
                              color: w.color,
                              fontSize: 13,
                              fontWeight: 700,
                              marginBottom: 2,
                            }}
                          >
                            {w.label}
                          </div>
                          <div
                            style={{
                              color: "rgba(255,255,255,0.5)",
                              fontSize: 11,
                            }}
                          >
                            {w.rate}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Wallet Address */}
                <div style={{ marginBottom: 24 }}>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.5)",
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: 8,
                    }}
                  >
                    Step 1 — Send {selectedWallet.label} to this address
                  </p>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 10,
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <code
                      style={{
                        flex: 1,
                        color: "rgba(255,255,255,0.7)",
                        fontSize: 11,
                        wordBreak: "break-all",
                        lineHeight: 1.5,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {selectedWallet.address}
                    </code>
                    <button
                      type="button"
                      data-ocid="credit_shop.upload_button"
                      onClick={() => copyAddress(selectedWallet.address)}
                      style={{
                        flexShrink: 0,
                        background: copied
                          ? "rgba(52,211,153,0.15)"
                          : "rgba(246,195,91,0.12)",
                        border: `1px solid ${
                          copied
                            ? "rgba(52,211,153,0.4)"
                            : "rgba(246,195,91,0.3)"
                        }`,
                        borderRadius: 8,
                        padding: "6px 12px",
                        color: copied ? "#34d399" : "#F6C35B",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                        transition: "all 0.2s",
                      }}
                    >
                      {copied ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Submit TX */}
                <div style={{ marginBottom: 24 }}>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.5)",
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: 12,
                    }}
                  >
                    Step 2 — Submit your transaction
                  </p>
                  <form
                    onSubmit={handleSubmit}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <div>
                      <p
                        style={{
                          color: "rgba(255,255,255,0.45)",
                          fontSize: 11,
                          margin: "0 0 6px",
                        }}
                      >
                        Transaction Hash
                      </p>
                      <Input
                        id="tx-hash"
                        data-ocid="credit_shop.input"
                        placeholder="Paste your TX hash here"
                        value={txHash}
                        onChange={(e) => setTxHash(e.target.value)}
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: 8,
                          color: "#E9EEF5",
                          fontSize: 12,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            color: "rgba(255,255,255,0.45)",
                            fontSize: 11,
                            margin: "0 0 6px",
                          }}
                        >
                          Crypto Type
                        </p>
                        <Select
                          value={cryptoType}
                          onValueChange={(v) => {
                            setCryptoType(v);
                            const w = WALLETS.find((x) => x.id === v);
                            if (w) setSelectedWallet(w);
                          }}
                        >
                          <SelectTrigger
                            data-ocid="credit_shop.select"
                            style={{
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.12)",
                              color: "#E9EEF5",
                              fontSize: 12,
                            }}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent
                            style={{
                              background: "rgba(11,16,23,0.97)",
                              border: "1px solid rgba(255,255,255,0.12)",
                            }}
                          >
                            {WALLETS.map((w) => (
                              <SelectItem
                                key={w.id}
                                value={w.id}
                                style={{ color: "#E9EEF5" }}
                              >
                                {w.icon} {w.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            color: "rgba(255,255,255,0.45)",
                            fontSize: 11,
                            margin: "0 0 6px",
                          }}
                        >
                          Credits Requested
                        </p>
                        <Input
                          id="credits-requested"
                          data-ocid="credit_shop.textarea"
                          type="number"
                          placeholder="e.g. 1000"
                          value={creditsRequested}
                          onChange={(e) => setCreditsRequested(e.target.value)}
                          min="1"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 8,
                            color: "#E9EEF5",
                            fontSize: 12,
                          }}
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      data-ocid="credit_shop.submit_button"
                      disabled={submitting || !txHash || !creditsRequested}
                      style={{
                        background:
                          submitting || !txHash || !creditsRequested
                            ? "rgba(246,195,91,0.08)"
                            : "rgba(246,195,91,0.15)",
                        border: "1px solid rgba(246,195,91,0.4)",
                        color: "#F6C35B",
                        borderRadius: 10,
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      {submitting
                        ? "Submitting..."
                        : "✦ Submit Purchase Request"}
                    </Button>
                  </form>
                </div>

                {/* Past Requests */}
                {requests.length > 0 && (
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
                      Your Purchase History
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {requests.map((req, i) => {
                        const statusInfo =
                          STATUS_BADGE[req.status] ??
                          STATUS_BADGE[PurchaseRequestStatus.pending];
                        return (
                          <div
                            key={String(req.id)}
                            data-ocid={`credit_shop.item.${i + 1}`}
                            style={{
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              borderRadius: 10,
                              padding: "10px 14px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 12,
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  color: "#E9EEF5",
                                  fontSize: 12,
                                  fontWeight: 600,
                                }}
                              >
                                ✦{" "}
                                {Number(req.creditsRequested).toLocaleString()}{" "}
                                Nova Credits
                              </div>
                              <div
                                style={{
                                  color: "rgba(255,255,255,0.35)",
                                  fontSize: 10,
                                  marginTop: 2,
                                }}
                              >
                                {req.cryptoType} ·{" "}
                                {req.transactionHash.slice(0, 12)}...
                              </div>
                            </div>
                            <span
                              style={{
                                background: statusInfo.bg,
                                color: statusInfo.color,
                                border: `1px solid ${statusInfo.color}40`,
                                borderRadius: 6,
                                padding: "3px 8px",
                                fontSize: 10,
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                              }}
                            >
                              {statusInfo.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
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
