import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

interface PlanetInfo {
  name: string;
  color: string;
  earthLikeScore: number;
  temperature: string;
  atmosphere: string;
}

const PLANET_INFO: PlanetInfo[] = [
  {
    name: "Mercury",
    color: "#b5b5b5",
    earthLikeScore: 5,
    temperature: "-180\u00b0C to +430\u00b0C",
    atmosphere: "Virtually none",
  },
  {
    name: "Venus",
    color: "#e8cda0",
    earthLikeScore: 45,
    temperature: "465\u00b0C",
    atmosphere: "96% CO\u2082 (crushing)",
  },
  {
    name: "Earth",
    color: "#4fa3e0",
    earthLikeScore: 100,
    temperature: "-88\u00b0C to +58\u00b0C",
    atmosphere: "78% N\u2082, 21% O\u2082",
  },
  {
    name: "Mars",
    color: "#c1440e",
    earthLikeScore: 38,
    temperature: "-125\u00b0C to +20\u00b0C",
    atmosphere: "95% CO\u2082 (thin)",
  },
  {
    name: "Jupiter",
    color: "#c88b3a",
    earthLikeScore: 2,
    temperature: "-110\u00b0C (cloud tops)",
    atmosphere: "89% H\u2082, 10% He",
  },
  {
    name: "Saturn",
    color: "#e4d191",
    earthLikeScore: 1,
    temperature: "-139\u00b0C",
    atmosphere: "96% H\u2082",
  },
  {
    name: "Uranus",
    color: "#7de8e8",
    earthLikeScore: 3,
    temperature: "-197\u00b0C",
    atmosphere: "83% H\u2082, 15% He, 2% CH\u2084",
  },
  {
    name: "Neptune",
    color: "#3f54ba",
    earthLikeScore: 2,
    temperature: "-200\u00b0C",
    atmosphere: "80% H\u2082, 19% He",
  },
];

function scoreColor(score: number): string {
  if (score >= 80) return "#4ade80";
  if (score >= 40) return "#F6C35B";
  if (score >= 20) return "#f97316";
  return "#9AA7B6";
}

interface PlanetSearchProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelectPlanet: (name: string) => void;
}

export function PlanetSearch({
  open,
  onOpenChange,
  onSelectPlanet,
}: PlanetSearchProps) {
  const [query, setQuery] = useState("");
  const [earthLikeOnly, setEarthLikeOnly] = useState(false);

  let filtered = PLANET_INFO.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()),
  );
  if (earthLikeOnly) filtered = filtered.filter((p) => p.earthLikeScore >= 30);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="planet_search.dialog"
        style={{
          background: "linear-gradient(180deg, #0d1520 0%, #0a1018 100%)",
          border: "1px solid rgba(246,195,91,0.2)",
          borderRadius: 16,
          fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
          maxWidth: 500,
          maxHeight: "85vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        className="border-0"
      >
        <DialogHeader>
          <DialogTitle
            style={{
              color: "#F6C35B",
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: "0.06em",
            }}
          >
            Search Planets
          </DialogTitle>
        </DialogHeader>

        <div
          style={{ display: "flex", gap: 10, marginBottom: 12, flexShrink: 0 }}
        >
          <div style={{ position: "relative", flex: 1 }}>
            <Search
              size={13}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9AA7B6",
              }}
            />
            <Input
              data-ocid="planet_search.search_input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search planets..."
              style={{
                paddingLeft: 32,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#E9EEF5",
                fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                fontSize: 13,
              }}
            />
          </div>
          <button
            type="button"
            data-ocid="planet_search.toggle"
            onClick={() => setEarthLikeOnly((v) => !v)}
            style={{
              background: earthLikeOnly
                ? "rgba(74,222,128,0.15)"
                : "rgba(255,255,255,0.05)",
              border: `1px solid ${earthLikeOnly ? "rgba(74,222,128,0.4)" : "rgba(255,255,255,0.12)"}`,
              borderRadius: 8,
              color: earthLikeOnly ? "#4ade80" : "#9AA7B6",
              cursor: "pointer",
              padding: "6px 12px",
              fontSize: 11,
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              fontWeight: 700,
              whiteSpace: "nowrap",
              letterSpacing: "0.04em",
              transition: "all 0.15s",
            }}
          >
            Earth-like only
          </button>
        </div>

        <div
          style={{
            overflowY: "auto",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {filtered.map((p, idx) => (
            <button
              type="button"
              key={p.name}
              data-ocid={`planet_search.item.${idx + 1}`}
              onClick={() => {
                onSelectPlanet(p.name);
                onOpenChange(false);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(246,195,91,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "12px 14px",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                transition: "all 0.15s",
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: p.color,
                  boxShadow: `0 0 8px ${p.color}80`,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    color: "#E9EEF5",
                    fontSize: 13,
                    fontWeight: 700,
                    marginBottom: 3,
                  }}
                >
                  {p.name}
                </div>
                <div style={{ color: "#9AA7B6", fontSize: 10 }}>
                  {p.temperature} &nbsp;&middot;&nbsp; {p.atmosphere}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: scoreColor(p.earthLikeScore),
                  }}
                >
                  {p.earthLikeScore}%
                </div>
                <div
                  style={{
                    color: "#9AA7B6",
                    fontSize: 9,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Earth-like
                </div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div
              data-ocid="planet_search.empty_state"
              style={{
                color: "#9AA7B6",
                textAlign: "center",
                padding: "32px 0",
                fontSize: 13,
              }}
            >
              No planets found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
