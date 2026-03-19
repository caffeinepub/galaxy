import { AnimatePresence, motion } from "motion/react";

const PANEL_STYLE: React.CSSProperties = {
  background: "rgba(11,16,23,0.92)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 14,
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
};

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  agency?: string;
}

const EVENTS: TimelineEvent[] = [
  {
    year: "1957",
    title: "Sputnik 1 — First Satellite",
    description:
      "The Soviet Union launches Sputnik 1, Earth's first artificial satellite, marking the dawn of the Space Age.",
    icon: "🛰️",
    color: "#60A5FA",
    agency: "USSR",
  },
  {
    year: "1961",
    title: "Yuri Gagarin — First Human in Space",
    description:
      "Cosmonaut Yuri Gagarin becomes the first human to orbit Earth aboard Vostok 1, completing one orbit in 108 minutes.",
    icon: "👨‍🚀",
    color: "#A78BFA",
    agency: "Soviet Union",
  },
  {
    year: "1965",
    title: "First Spacewalk — Alexei Leonov",
    description:
      "Alexei Leonov performs the first EVA (extravehicular activity), floating freely in space for 12 minutes.",
    icon: "🚶",
    color: "#34D399",
    agency: "USSR",
  },
  {
    year: "1969",
    title: "Apollo 11 — Moon Landing",
    description:
      'Neil Armstrong and Buzz Aldrin land on the Moon. Armstrong utters: "One small step for man, one giant leap for mankind."',
    icon: "🌕",
    color: "#F6C35B",
    agency: "NASA",
  },
  {
    year: "1971",
    title: "Salyut 1 — First Space Station",
    description:
      "The Soviet Union launches the world's first space station, Salyut 1, beginning the era of permanent orbital habitation.",
    icon: "🏗️",
    color: "#60A5FA",
    agency: "USSR",
  },
  {
    year: "1976",
    title: "Viking 1 Lands on Mars",
    description:
      "NASA's Viking 1 becomes the first spacecraft to successfully land on Mars, transmitting photos and conducting soil experiments.",
    icon: "🔴",
    color: "#F97316",
    agency: "NASA",
  },
  {
    year: "1977",
    title: "Voyager 1 & 2 Launch",
    description:
      "NASA launches twin spacecraft to explore the outer solar system. Voyager 1 will eventually become the farthest human object.",
    icon: "🛸",
    color: "#FBBF24",
    agency: "NASA",
  },
  {
    year: "1981",
    title: "Space Shuttle Columbia — First Flight",
    description:
      "Space Shuttle Columbia makes its maiden flight, inaugurating the reusable orbiter era and 30 years of shuttle missions.",
    icon: "🚀",
    color: "#F97316",
    agency: "NASA",
  },
  {
    year: "1986",
    title: "Mir Space Station",
    description:
      "The Soviet Union launches Mir, the first modular space station, which will be continuously inhabited for nearly 10 years.",
    icon: "🏛️",
    color: "#A78BFA",
    agency: "USSR",
  },
  {
    year: "1990",
    title: "Hubble Space Telescope Launch",
    description:
      "NASA and ESA deploy the Hubble Space Telescope, transforming our view of the cosmos with unprecedented deep-field imagery.",
    icon: "🔭",
    color: "#60A5FA",
    agency: "NASA/ESA",
  },
  {
    year: "1998",
    title: "ISS Construction Begins",
    description:
      "Assembly of the International Space Station begins with the launch of the Zarya module — a symbol of international cooperation.",
    icon: "🌐",
    color: "#34D399",
    agency: "NASA/Roscosmos",
  },
  {
    year: "2001",
    title: "Dennis Tito — First Space Tourist",
    description:
      "American businessman Dennis Tito pays $20 million to travel to the ISS, becoming the world's first private space tourist.",
    icon: "💰",
    color: "#F6C35B",
    agency: "Roscosmos",
  },
  {
    year: "2004",
    title: "Mars Rovers Spirit & Opportunity Land",
    description:
      "NASA's twin rovers land on Mars. Opportunity will eventually travel over 45 km, operating for 15 years beyond its 90-day mission.",
    icon: "🤖",
    color: "#F97316",
    agency: "NASA",
  },
  {
    year: "2006",
    title: "Pluto Reclassified as Dwarf Planet",
    description:
      "The International Astronomical Union redefines planet, reclassifying Pluto as a dwarf planet — a controversial decision still debated.",
    icon: "❄️",
    color: "#93C5FD",
    agency: "IAU",
  },
  {
    year: "2015",
    title: "SpaceX Falcon 9 First Landing",
    description:
      "SpaceX lands the first orbital-class booster at Cape Canaveral, beginning the era of truly reusable rockets.",
    icon: "🎯",
    color: "#FBBF24",
    agency: "SpaceX",
  },
  {
    year: "2019",
    title: "First Black Hole Image Captured",
    description:
      "The Event Horizon Telescope collaboration produces the first image of a black hole — M87*, a behemoth 6.5 billion solar masses.",
    icon: "⚫",
    color: "#8B5CF6",
    agency: "EHT",
  },
  {
    year: "2020",
    title: "Crew Dragon — First Commercial Crewed Flight",
    description:
      "SpaceX Crew Dragon carries NASA astronauts to the ISS, restoring US crewed launch capability and starting commercial human spaceflight.",
    icon: "🐉",
    color: "#60A5FA",
    agency: "SpaceX/NASA",
  },
  {
    year: "2021",
    title: "Ingenuity — First Powered Flight on Mars",
    description:
      "NASA's Ingenuity helicopter completes the first powered, controlled flight on another planet, opening new doors for aerial exploration.",
    icon: "🚁",
    color: "#34D399",
    agency: "NASA",
  },
  {
    year: "2021",
    title: "James Webb Space Telescope Launch",
    description:
      "JWST launches on Christmas Day, capturing light from just 300 million years after the Big Bang — humanity's deepest view of the universe.",
    icon: "🌌",
    color: "#F6C35B",
    agency: "NASA/ESA/CSA",
  },
  {
    year: "2023",
    title: "Chandrayaan-3 — Moon South Pole Landing",
    description:
      "India's Chandrayaan-3 successfully lands near the Moon's south pole, making India the 4th country to land on the Moon.",
    icon: "🇮🇳",
    color: "#FB923C",
    agency: "ISRO",
  },
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function SpaceTimeline({ open, onOpenChange }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="timeline-overlay"
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
            background: "rgba(0,0,0,0.55)",
          }}
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            data-ocid="timeline.modal"
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            style={{
              ...PANEL_STYLE,
              padding: 28,
              width: 580,
              maxWidth: "95vw",
              maxHeight: "85vh",
              overflowY: "auto",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(96,165,250,0.2) transparent",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
                position: "sticky",
                top: 0,
                zIndex: 2,
                background: "rgba(11,16,23,0.95)",
                paddingBottom: 12,
                borderBottom: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#60A5FA",
                    fontSize: 15,
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  🌌 Space History Timeline
                </div>
                <div style={{ color: "#9AA7B6", fontSize: 11, marginTop: 3 }}>
                  1957 – Present · {EVENTS.length} major milestones
                </div>
              </div>
              <button
                type="button"
                data-ocid="timeline.close_button"
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

            {/* Timeline */}
            <div style={{ position: "relative", paddingLeft: 32 }}>
              {/* Vertical line */}
              <div
                style={{
                  position: "absolute",
                  left: 10,
                  top: 8,
                  bottom: 8,
                  width: 2,
                  background:
                    "linear-gradient(to bottom, #60A5FA44, #A78BFA44, #34D39944, #F6C35B44)",
                  borderRadius: 2,
                }}
              />

              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {EVENTS.map((event, i) => (
                  <motion.div
                    key={`${event.year}-${event.title}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{
                      position: "relative",
                      paddingBottom: 24,
                      paddingLeft: 24,
                    }}
                  >
                    {/* Dot */}
                    <div
                      style={{
                        position: "absolute",
                        left: -22,
                        top: 4,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: event.color,
                        border: `2px solid ${event.color}`,
                        boxShadow: `0 0 8px ${event.color}66`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 8,
                      }}
                    />

                    <div
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: `1px solid ${event.color}22`,
                        borderRadius: 10,
                        padding: "14px 16px",
                        transition: "background 0.2s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <span style={{ fontSize: 18 }}>{event.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              color: event.color,
                              fontSize: 13,
                              fontWeight: 700,
                              letterSpacing: "0.03em",
                            }}
                          >
                            {event.title}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              alignItems: "center",
                              marginTop: 2,
                            }}
                          >
                            <span
                              style={{
                                background: `${event.color}18`,
                                border: `1px solid ${event.color}44`,
                                borderRadius: 4,
                                color: event.color,
                                fontSize: 9,
                                fontWeight: 800,
                                padding: "1px 7px",
                                letterSpacing: "0.06em",
                              }}
                            >
                              {event.year}
                            </span>
                            {event.agency && (
                              <span
                                style={{
                                  color: "#5a6a7a",
                                  fontSize: 10,
                                  letterSpacing: "0.04em",
                                }}
                              >
                                {event.agency}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p
                        style={{
                          color: "#C8D4E0",
                          fontSize: 12,
                          lineHeight: 1.6,
                          margin: 0,
                        }}
                      >
                        {event.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
