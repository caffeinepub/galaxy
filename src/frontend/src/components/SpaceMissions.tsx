import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const PANEL_STYLE: React.CSSProperties = {
  background: "rgba(11,16,23,0.92)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 14,
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
};

interface Mission {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  planets: string[];
  narrative: string[];
}

const MISSIONS: Mission[] = [
  {
    id: "apollo11",
    title: "Apollo 11",
    subtitle: "First Moon Landing",
    icon: "🌕",
    description:
      "Relive humanity's greatest achievement — the first crewed lunar landing on July 20, 1969.",
    planets: ["Earth"],
    narrative: [
      "T-0: Liftoff from Kennedy Space Center, Florida...",
      "Day 3: Trans-lunar injection complete. Earth grows smaller in the window.",
      "July 19: Entering lunar orbit. The Moon fills the cockpit windows.",
      "July 20: Eagle separates from Columbia. Descent begins.",
      '"The Eagle has landed." Sea of Tranquility, July 20, 1969.',
      "One small step for man. One giant leap for mankind. \u{1F1FA}\u{1F1F8}",
    ],
  },
  {
    id: "voyager1",
    title: "Voyager 1",
    subtitle: "Grand Tour of the Outer Planets",
    icon: "🛸",
    description:
      "Journey with Voyager 1 on its historic flyby of Jupiter and Saturn before escaping the solar system.",
    planets: ["Jupiter", "Saturn"],
    narrative: [
      "September 5, 1977: Voyager 1 launches from Cape Canaveral.",
      "March 1979: Closest approach to Jupiter. Io's volcanoes spotted!",
      "Jupiter's Great Red Spot seen up close — a storm bigger than Earth.",
      "November 1980: Saturn encounter. Ring system revealed in stunning detail.",
      "1990: Voyager captures the 'Pale Blue Dot' portrait of Earth.",
      "2012: Voyager 1 crosses into interstellar space — first human object to do so.",
    ],
  },
  {
    id: "marsrover",
    title: "Mars Rover",
    subtitle: "Perseverance on Mars",
    icon: "🤖",
    description:
      "Follow NASA's Perseverance rover as it lands on Mars and searches for signs of ancient life.",
    planets: ["Mars"],
    narrative: [
      "July 30, 2020: Perseverance launches aboard an Atlas V rocket.",
      "February 18, 2021: Seven minutes of terror — entry, descent, and landing.",
      "Touchdown in Jezero Crater — an ancient lake bed on Mars.",
      "First sounds from Mars: wind and rover motors recorded by onboard mic.",
      "Ingenuity helicopter makes first powered flight on another planet! ✈️",
      "Organic molecules detected — potential building blocks of life found!",
    ],
  },
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onNavigateToPlanet?: (name: string) => void;
}

export function SpaceMissions({
  open,
  onOpenChange,
  onNavigateToPlanet,
}: Props) {
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [narrativeIndex, setNarrativeIndex] = useState(0);
  const [running, setRunning] = useState(false);

  function startMission(mission: Mission) {
    setActiveMission(mission);
    setNarrativeIndex(0);
    setRunning(true);
    if (onNavigateToPlanet && mission.planets.length > 0) {
      onNavigateToPlanet(mission.planets[0]);
    }
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      if (idx < mission.narrative.length) {
        setNarrativeIndex(idx);
        if (onNavigateToPlanet && mission.planets[idx]) {
          onNavigateToPlanet(mission.planets[idx]);
        }
      } else {
        clearInterval(interval);
        setRunning(false);
      }
    }, 2200);
  }

  function handleClose() {
    setActiveMission(null);
    setRunning(false);
    onOpenChange(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="missions-overlay"
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
          onClick={handleClose}
        >
          <motion.div
            data-ocid="missions.modal"
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
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
                  Space Missions
                </div>
                <div style={{ color: "#9AA7B6", fontSize: 11, marginTop: 3 }}>
                  Guided tours through history
                </div>
              </div>
              <button
                type="button"
                data-ocid="missions.close_button"
                onClick={handleClose}
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

            {activeMission ? (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 20,
                  }}
                >
                  <span style={{ fontSize: 36 }}>{activeMission.icon}</span>
                  <div>
                    <div
                      style={{
                        color: "#F6C35B",
                        fontSize: 16,
                        fontWeight: 700,
                      }}
                    >
                      {activeMission.title}
                    </div>
                    <div style={{ color: "#9AA7B6", fontSize: 12 }}>
                      {activeMission.subtitle}
                    </div>
                  </div>
                </div>

                {/* Narrative display */}
                <div
                  style={{
                    minHeight: 120,
                    background: "rgba(0,0,0,0.3)",
                    borderRadius: 10,
                    padding: 20,
                    marginBottom: 20,
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {activeMission.narrative
                    .slice(0, narrativeIndex + 1)
                    .map((line, i) => (
                      <motion.div
                        // biome-ignore lint/suspicious/noArrayIndexKey: static list with stable order
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{
                          color: i === narrativeIndex ? "#E9EEF5" : "#5a6a7a",
                          fontSize: 13,
                          lineHeight: 1.6,
                          marginBottom: 8,
                          fontWeight: i === narrativeIndex ? 500 : 400,
                        }}
                      >
                        {i === narrativeIndex && (
                          <span style={{ color: "#F6C35B", marginRight: 6 }}>
                            ▶
                          </span>
                        )}
                        {line}
                      </motion.div>
                    ))}
                  {running && (
                    <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            repeat: Number.POSITIVE_INFINITY,
                            delay: i * 0.2,
                            duration: 0.8,
                          }}
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: "#F6C35B",
                          }}
                        />
                      ))}
                    </div>
                  )}
                  {!running && (
                    <div
                      style={{
                        color: "#34D399",
                        fontSize: 12,
                        fontWeight: 700,
                        marginTop: 8,
                      }}
                    >
                      ✓ Mission complete
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  data-ocid="missions.secondary_button"
                  onClick={() => setActiveMission(null)}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 10,
                    color: "#9AA7B6",
                    padding: "9px 18px",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                  }}
                >
                  ← Back to Missions
                </button>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {MISSIONS.map((m, idx) => (
                  <div
                    key={m.id}
                    data-ocid={`missions.item.${idx + 1}`}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      padding: "18px 18px",
                      display: "flex",
                      gap: 16,
                      alignItems: "flex-start",
                    }}
                  >
                    <span style={{ fontSize: 32, flexShrink: 0 }}>
                      {m.icon}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          color: "#F6C35B",
                          fontSize: 14,
                          fontWeight: 700,
                          marginBottom: 4,
                        }}
                      >
                        {m.title}
                      </div>
                      <div
                        style={{
                          color: "#9AA7B6",
                          fontSize: 10,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          marginBottom: 8,
                        }}
                      >
                        {m.subtitle}
                      </div>
                      <div
                        style={{
                          color: "#E9EEF5",
                          fontSize: 12,
                          lineHeight: 1.5,
                          marginBottom: 12,
                        }}
                      >
                        {m.description}
                      </div>
                      <button
                        type="button"
                        data-ocid={"missions.primary_button"}
                        onClick={() => startMission(m)}
                        style={{
                          background: "rgba(246,195,91,0.12)",
                          border: "1px solid rgba(246,195,91,0.35)",
                          borderRadius: 8,
                          color: "#F6C35B",
                          padding: "7px 16px",
                          cursor: "pointer",
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                        }}
                      >
                        🚀 Start Mission
                      </button>
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
