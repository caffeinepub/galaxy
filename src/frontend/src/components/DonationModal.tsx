import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Copy, Heart, Rocket } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTotalDonations } from "../hooks/useQueries";

const CRYPTO_OPTIONS = [
  {
    id: "icp",
    name: "ICP",
    symbol: "ICP",
    color: "#29ABE2",
    address: "925bce4fff6f1266ecb25bfce074a06f556a3e41fa866cdd12a4daabd200e612",
    note: "Internet Computer native token",
  },
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    color: "#F7931A",
    address: "bc1pq80t58yxr33zj7ulmzvm4k08l3uahjgpw8c2mjtwsu2wsd78j2fsf6s0lw",
    note: "Bitcoin mainnet",
  },
  {
    id: "sol",
    name: "Solana",
    symbol: "SOL",
    color: "#9945FF",
    address: "8M2MQy4n9myiUgxuAssuDtM6Y7so24WvWab6hnAGprAT",
    note: "Solana mainnet",
  },
];

function CryptoCard({ crypto }: { crypto: (typeof CRYPTO_OPTIONS)[0] }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  function copyAddress() {
    navigator.clipboard.writeText(crypto.address).then(() => {
      setCopied(true);
      toast.success(`${crypto.symbol} address copied!`);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 12,
        padding: "12px 14px",
        marginBottom: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: crypto.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            fontWeight: 800,
            color: "#fff",
            flexShrink: 0,
            boxShadow: `0 0 10px ${crypto.color}60`,
          }}
        >
          {crypto.symbol.slice(0, 3)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#E9EEF5", fontSize: 13, fontWeight: 700 }}>
            {crypto.name}
          </div>
          <div style={{ color: "#9AA7B6", fontSize: 10 }}>{crypto.note}</div>
        </div>
        <button
          type="button"
          data-ocid={`donation.${crypto.id}.button`}
          onClick={copyAddress}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 7,
            color: copied ? "#4ade80" : "#9AA7B6",
            cursor: "pointer",
            padding: "5px 8px",
            fontSize: 10,
            fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
            display: "flex",
            alignItems: "center",
            gap: 4,
            transition: "all 0.15s",
          }}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? "Copied" : "Copy"}
        </button>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          style={{
            background: "none",
            border: "none",
            color: "#9AA7B6",
            cursor: "pointer",
            fontSize: 10,
            fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
            padding: "2px 4px",
          }}
        >
          {expanded ? "\u25b2" : "\u25bc"}
        </button>
      </div>

      <div
        style={{
          marginTop: 8,
          background: "rgba(0,0,0,0.05)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 7,
          padding: "7px 10px",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span
          style={{
            color: "#D8BE8B",
            fontSize: 10,
            fontFamily: "monospace",
            wordBreak: "break-all",
            flex: 1,
          }}
        >
          {expanded
            ? crypto.address
            : `${crypto.address.slice(0, 12)}...${crypto.address.slice(-6)}`}
        </span>
      </div>
    </div>
  );
}

interface DonationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DonationModal({ open, onOpenChange }: DonationModalProps) {
  const { data: totalDonationsCents } = useTotalDonations();

  const totalDollars =
    totalDonationsCents !== undefined
      ? (Number(totalDonationsCents) / 100).toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
      : null;

  const panelStyle: React.CSSProperties = {
    background: "linear-gradient(180deg, #0d1520 0%, #0a1018 100%)",
    border: "1px solid rgba(246,195,91,0.2)",
    borderRadius: 16,
    fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
    maxWidth: 460,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="donation.dialog"
        style={panelStyle}
        className="border-0"
      >
        <DialogHeader>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 6,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(246,195,91,0.15)",
                border: "1px solid rgba(246,195,91,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Rocket size={16} color="#F6C35B" />
            </div>
            <DialogTitle
              style={{
                color: "#F6C35B",
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: "0.04em",
              }}
            >
              Support Space Exploration
            </DialogTitle>
          </div>
          {totalDollars && (
            <div
              style={{
                background: "rgba(246,195,91,0.06)",
                border: "1px solid rgba(246,195,91,0.12)",
                borderRadius: 8,
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 4,
              }}
            >
              <Heart size={12} color="#F6C35B" fill="#F6C35B" />
              <span style={{ color: "#D8BE8B", fontSize: 12 }}>
                Community has donated{" "}
                <strong style={{ color: "#F6C35B" }}>{totalDollars}</strong> to
                space exploration
              </span>
            </div>
          )}
        </DialogHeader>

        <div style={{ padding: "4px 0" }}>
          <p
            style={{
              color: "#9AA7B6",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Send to these wallet addresses
          </p>
          {CRYPTO_OPTIONS.map((c) => (
            <CryptoCard key={c.id} crypto={c} />
          ))}
          <div
            style={{
              marginTop: 10,
              background: "rgba(246,195,91,0.06)",
              border: "1px solid rgba(246,195,91,0.15)",
              borderRadius: 8,
              padding: "10px 12px",
              color: "#9AA7B6",
              fontSize: 11,
              lineHeight: 1.6,
            }}
          >
            Send directly to these addresses. Contact us after donating to be
            acknowledged as a supporter.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
