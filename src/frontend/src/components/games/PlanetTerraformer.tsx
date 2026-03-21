import React, { useState, useCallback } from "react";

interface PlanetTerraformerProps {
  onGameOver: (score: number) => void;
}

interface PlanetChallenge {
  name: string;
  color: string;
  targets: {
    oxygen: [number, number];
    temp: [number, number];
    water: [number, number];
  };
  initial: { oxygen: number; temp: number; water: number };
  bgColor: string;
}

const PLANETS: PlanetChallenge[] = [
  {
    name: "Kepler-452b",
    color: "#4FA3E0",
    bgColor: "#0A1828",
    targets: { oxygen: [40, 70], temp: [35, 65], water: [45, 75] },
    initial: { oxygen: 10, temp: 80, water: 20 },
  },
  {
    name: "Proxima b",
    color: "#E04F4F",
    bgColor: "#1A0808",
    targets: { oxygen: [50, 80], temp: [25, 55], water: [30, 60] },
    initial: { oxygen: 5, temp: 90, water: 5 },
  },
  {
    name: "TRAPPIST-1e",
    color: "#50C878",
    bgColor: "#081A0C",
    targets: { oxygen: [45, 75], temp: [40, 65], water: [50, 80] },
    initial: { oxygen: 20, temp: 15, water: 70 },
  },
  {
    name: "HD 40307g",
    color: "#C8A050",
    bgColor: "#1A1208",
    targets: { oxygen: [35, 65], temp: [30, 60], water: [35, 65] },
    initial: { oxygen: 60, temp: 5, water: 90 },
  },
  {
    name: "Gliese 667Cc",
    color: "#9B59B6",
    bgColor: "#100818",
    targets: { oxygen: [55, 85], temp: [45, 70], water: [40, 70] },
    initial: { oxygen: 30, temp: 100, water: 10 },
  },
];

type Stat = "oxygen" | "temp" | "water";

function clamp(v: number) {
  return Math.max(0, Math.min(100, v));
}

function StatBar({
  label,
  value,
  target,
  onChange,
  actionsLeft,
}: {
  label: string;
  value: number;
  target: [number, number];
  onChange: (delta: number) => void;
  actionsLeft: number;
}) {
  const inRange = value >= target[0] && value <= target[1];
  const barColor = inRange
    ? "#00CC66"
    : value < target[0]
      ? "#FF6622"
      : "#2266FF";
  const barGlow = inRange ? "#00FF88" : "#FF6622";
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <span
          style={{
            color: inRange ? "#00FF88" : "#AABBCC",
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          {label} {inRange ? "✓" : ""}
        </span>
        <span style={{ color: "#8899BB", fontSize: 12 }}>
          Target: {target[0]}–{target[1]} | Now:{" "}
          <span style={{ color: barColor, fontWeight: 700 }}>
            {Math.round(value)}
          </span>
        </span>
      </div>
      <div
        style={{
          position: "relative",
          height: 20,
          background: "#0A1020",
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid #223",
        }}
      >
        {/* target range */}
        <div
          style={{
            position: "absolute",
            left: `${target[0]}%`,
            width: `${target[1] - target[0]}%`,
            height: "100%",
            background: "rgba(0,220,100,0.15)",
            borderLeft: "1px solid rgba(0,220,100,0.5)",
            borderRight: "1px solid rgba(0,220,100,0.5)",
          }}
        />
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            background: barColor,
            boxShadow: `0 0 8px ${barGlow}`,
            transition: "width 0.3s ease",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        {[-15, -5, +5, +15].map((delta) => (
          <button
            type="button"
            key={delta}
            disabled={actionsLeft <= 0}
            onClick={() => onChange(delta)}
            style={{
              flex: 1,
              padding: "4px 0",
              borderRadius: 4,
              border: "1px solid #334",
              background:
                delta > 0 ? "rgba(0,180,100,0.15)" : "rgba(180,60,0,0.15)",
              color: delta > 0 ? "#00CC66" : "#FF6622",
              cursor: actionsLeft > 0 ? "pointer" : "not-allowed",
              fontSize: 12,
              fontWeight: 700,
              opacity: actionsLeft > 0 ? 1 : 0.4,
            }}
          >
            {delta > 0 ? `+${delta}` : delta}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PlanetTerraformer({
  onGameOver,
}: PlanetTerraformerProps) {
  const [round, setRound] = useState(0);
  const [stats, setStats] = useState({ ...PLANETS[0].initial });
  const [actionsLeft, setActionsLeft] = useState(5);
  const [roundResults, setRoundResults] = useState<boolean[]>([]);
  const [phase, setPhase] = useState<"play" | "result" | "done">("play");
  const [lastPassed, setLastPassed] = useState(false);
  const planet = PLANETS[round];

  const checkAllInRange = useCallback(
    (
      s: { oxygen: number; temp: number; water: number },
      p: PlanetChallenge,
    ) => {
      return (
        s.oxygen >= p.targets.oxygen[0] &&
        s.oxygen <= p.targets.oxygen[1] &&
        s.temp >= p.targets.temp[0] &&
        s.temp <= p.targets.temp[1] &&
        s.water >= p.targets.water[0] &&
        s.water <= p.targets.water[1]
      );
    },
    [],
  );

  const handleChange = useCallback((stat: Stat, delta: number) => {
    setStats((prev) => ({ ...prev, [stat]: clamp(prev[stat] + delta) }));
    setActionsLeft((prev) => prev - 1);
  }, []);

  const handleSubmit = useCallback(() => {
    const passed = checkAllInRange(stats, planet);
    setLastPassed(passed);
    setRoundResults((prev) => [...prev, passed]);
    setPhase("result");
  }, [stats, planet, checkAllInRange]);

  const handleNext = useCallback(() => {
    if (round + 1 >= PLANETS.length) {
      setPhase("done");
      const score = roundResults.filter(Boolean).length + (lastPassed ? 1 : 0);
      onGameOver(score);
    } else {
      const nextRound = round + 1;
      setRound(nextRound);
      setStats({ ...PLANETS[nextRound].initial });
      setActionsLeft(5);
      setPhase("play");
    }
  }, [round, roundResults, lastPassed, onGameOver]);

  const allPassed = roundResults.filter(Boolean).length + (lastPassed ? 1 : 0);

  // Compute planet visual
  const oxygen = stats.oxygen;
  const temp = stats.temp;
  const water = stats.water;
  const greenness = Math.min(1, oxygen / 70);
  const blueness = Math.min(1, water / 70);
  const hotness = Math.min(1, temp / 100);
  const r = Math.floor(30 + hotness * 100 + (1 - greenness) * 50);
  const g = Math.floor(greenness * 180 + blueness * 40);
  const b = Math.floor(blueness * 200 + (1 - hotness) * 80);
  const planetColor = `rgb(${r},${g},${b})`;
  const atmAlpha = (oxygen + water) / 200;

  if (phase === "done") {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🌍</div>
        <h2 style={{ color: "#FFD700", fontSize: 24, marginBottom: 8 }}>
          Mission Complete!
        </h2>
        <p style={{ color: "#AABBCC", fontSize: 16, marginBottom: 24 }}>
          You terraformed {allPassed} out of 5 planets.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          {PLANETS.map((p, i) => (
            <span
              key={p.name}
              style={{
                fontSize: 24,
                opacity:
                  i < roundResults.length ? (roundResults[i] ? 1 : 0.3) : 0.2,
              }}
            >
              {p.color === "#50C878"
                ? "🌿"
                : p.color === "#4FA3E0"
                  ? "💧"
                  : p.color === "#E04F4F"
                    ? "🔥"
                    : p.color === "#C8A050"
                      ? "🏜️"
                      : "🌌"}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (phase === "result") {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>
          {lastPassed ? "🌍" : "💥"}
        </div>
        <h2
          style={{
            color: lastPassed ? "#00FF88" : "#FF4444",
            fontSize: 24,
            marginBottom: 8,
          }}
        >
          {lastPassed ? "Planet Terraformed!" : "Terraforming Failed"}
        </h2>
        <p style={{ color: "#AABBCC", fontSize: 14, marginBottom: 24 }}>
          {lastPassed
            ? `${planet.name} is now habitable!`
            : `${planet.name} conditions were not met.`}
        </p>
        <button
          type="button"
          onClick={handleNext}
          style={{
            padding: "12px 32px",
            borderRadius: 8,
            border: "1px solid #4466FF",
            background: "rgba(40,80,200,0.3)",
            color: "#88AAFF",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {round + 1 >= PLANETS.length ? "View Results" : "Next Planet →"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 24, padding: "0 8px", maxWidth: 760 }}>
      {/* Planet visual */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          minWidth: 200,
        }}
      >
        <div style={{ position: "relative", width: 160, height: 160 }}>
          {/* atmosphere glow */}
          <div
            style={{
              position: "absolute",
              inset: -12,
              borderRadius: "50%",
              background: `radial-gradient(circle, transparent 45%, rgba(${r},${g},${b},${atmAlpha * 0.5}) 65%, transparent 80%)`,
              filter: "blur(8px)",
              animation: "spin 20s linear infinite",
            }}
          />
          {/* planet */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: `radial-gradient(circle at 35% 35%, ${planetColor}, rgba(${Math.floor(r * 0.4)},${Math.floor(g * 0.4)},${Math.floor(b * 0.4)},1))`,
              boxShadow: `0 0 30px rgba(${r},${g},${b},0.4), inset -20px -20px 40px rgba(0,0,0,0.5)`,
              transition: "all 0.5s ease",
            }}
          />
          {/* ocean sheen */}
          {blueness > 0.3 && (
            <div
              style={{
                position: "absolute",
                top: "20%",
                left: "15%",
                width: "40%",
                height: "25%",
                borderRadius: "50%",
                background: `rgba(${Math.floor(blueness * 100)},${Math.floor(blueness * 160)},255,${blueness * 0.3})`,
                filter: "blur(4px)",
              }}
            />
          )}
          {/* cloud/oxygen layer */}
          {greenness > 0.3 && (
            <div
              style={{
                position: "absolute",
                inset: 4,
                borderRadius: "50%",
                border: `2px solid rgba(200,255,200,${greenness * 0.3})`,
                boxShadow: `0 0 10px rgba(0,200,80,${greenness * 0.2})`,
              }}
            />
          )}
        </div>
        <div
          style={{
            color: planet.color,
            fontWeight: 700,
            fontSize: 14,
            textAlign: "center",
          }}
        >
          {planet.name}
        </div>
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {roundResults.map((r2, i) => {
            const rKey = `result-${i}`;
            return (
              <span key={rKey} style={{ fontSize: 16 }}>
                {r2 ? "✅" : "❌"}
              </span>
            );
          })}
        </div>
        <div style={{ textAlign: "center", color: "#8899BB", fontSize: 12 }}>
          Round {round + 1}/5
          <br />
          <span style={{ color: actionsLeft > 0 ? "#FFD700" : "#FF4444" }}>
            {actionsLeft} actions left
          </span>
        </div>
        <button
          type="button"
          disabled={actionsLeft > 0}
          onClick={handleSubmit}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: 8,
            border: "1px solid rgba(100,200,100,0.4)",
            background:
              actionsLeft === 0 ? "rgba(0,150,60,0.3)" : "rgba(20,40,20,0.3)",
            color: actionsLeft === 0 ? "#00FF88" : "#446644",
            fontSize: 14,
            fontWeight: 700,
            cursor: actionsLeft === 0 ? "pointer" : "not-allowed",
            opacity: actionsLeft === 0 ? 1 : 0.5,
          }}
        >
          {actionsLeft === 0 ? "Submit Planet" : `Use ${actionsLeft} Actions`}
        </button>
      </div>

      {/* Controls */}
      <div style={{ flex: 1 }}>
        <h3
          style={{
            color: "#88AACC",
            fontSize: 14,
            marginBottom: 16,
            fontWeight: 700,
          }}
        >
          🌡 Adjust Conditions — Use {actionsLeft} actions to hit target ranges
        </h3>
        <StatBar
          label="🌬 Oxygen"
          value={stats.oxygen}
          target={planet.targets.oxygen}
          onChange={(d) => handleChange("oxygen", d)}
          actionsLeft={actionsLeft}
        />
        <StatBar
          label="🌡 Temperature"
          value={stats.temp}
          target={planet.targets.temp}
          onChange={(d) => handleChange("temp", d)}
          actionsLeft={actionsLeft}
        />
        <StatBar
          label="💧 Water"
          value={stats.water}
          target={planet.targets.water}
          onChange={(d) => handleChange("water", d)}
          actionsLeft={actionsLeft}
        />
      </div>

      <style>
        {
          "@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }"
        }
      </style>
    </div>
  );
}
