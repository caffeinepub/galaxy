import { AnimatePresence, motion } from "motion/react";

const PANEL_STYLE: React.CSSProperties = {
  background: "rgba(11,16,23,0.92)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 14,
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
};

export interface AchievementState {
  visitedPlanets: string[];
  usedGalaxyView: boolean;
  landedOnSurface: boolean;
  usedQuiz: boolean;
  namedAStar: boolean;
  wrotePlanetJournal: boolean;
}

const PLANET_LIST = [
  "Mercury",
  "Venus",
  "Earth",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
];

interface Badge {
  id: string;
  icon: string;
  title: string;
  description: string;
  earned: (s: AchievementState) => boolean;
}

const BADGES: Badge[] = [
  {
    id: "explorer",
    icon: "🪐",
    title: "Explorer",
    description: "Visit all 8 planets",
    earned: (s) => PLANET_LIST.every((p) => s.visitedPlanets.includes(p)),
  },
  {
    id: "galactic",
    icon: "🌌",
    title: "Galactic",
    description: "Enter Galaxy View",
    earned: (s) => s.usedGalaxyView,
  },
  {
    id: "pioneer",
    icon: "🚀",
    title: "Pioneer",
    description: "Land on a planet surface",
    earned: (s) => s.landedOnSurface,
  },
  {
    id: "scholar",
    icon: "📚",
    title: "Scholar",
    description: "Complete the Planet Quiz",
    earned: (s) => s.usedQuiz,
  },
  {
    id: "stargazer",
    icon: "⭐",
    title: "Stargazer",
    description: "Name a star in the registry",
    earned: (s) => s.namedAStar,
  },
  {
    id: "chronicler",
    icon: "📝",
    title: "Chronicler",
    description: "Write a planet journal entry",
    earned: (s) => s.wrotePlanetJournal,
  },
  {
    id: "full_explorer",
    icon: "🏆",
    title: "Full Explorer",
    description: "Earn all other achievements",
    earned: (s) =>
      PLANET_LIST.every((p) => s.visitedPlanets.includes(p)) &&
      s.usedGalaxyView &&
      s.landedOnSurface &&
      s.usedQuiz &&
      s.namedAStar &&
      s.wrotePlanetJournal,
  },
];

export function loadAchievements(): AchievementState {
  try {
    const raw = localStorage.getItem("galaxy_achievements");
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    visitedPlanets: [],
    usedGalaxyView: false,
    landedOnSurface: false,
    usedQuiz: false,
    namedAStar: false,
    wrotePlanetJournal: false,
  };
}

export function saveAchievements(s: AchievementState) {
  try {
    localStorage.setItem("galaxy_achievements", JSON.stringify(s));
  } catch {}
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  achievements: AchievementState;
}

export function AchievementsPanel({ open, onOpenChange, achievements }: Props) {
  const earned = BADGES.filter((b) => b.earned(achievements));
  const totalEarned = earned.length;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="achievements-overlay"
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
            background: "rgba(0,0,0,0.1)",
          }}
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            data-ocid="achievements.panel"
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            style={{
              ...PANEL_STYLE,
              padding: 28,
              width: 460,
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
                  Achievements
                </div>
                <div style={{ color: "#9AA7B6", fontSize: 11, marginTop: 3 }}>
                  {totalEarned}/{BADGES.length} earned
                </div>
              </div>
              <button
                type="button"
                data-ocid="achievements.close_button"
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

            {/* Progress bar */}
            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                borderRadius: 4,
                height: 6,
                marginBottom: 24,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background: "linear-gradient(90deg, #F6C35B, #e8a82a)",
                  height: "100%",
                  width: `${(totalEarned / BADGES.length) * 100}%`,
                  borderRadius: 4,
                  transition: "width 0.5s",
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {BADGES.map((badge) => {
                const isEarned = badge.earned(achievements);
                return (
                  <div
                    key={badge.id}
                    data-ocid={`achievements.item.${BADGES.indexOf(badge) + 1}`}
                    style={{
                      background: isEarned
                        ? "rgba(246,195,91,0.08)"
                        : "rgba(255,255,255,0.03)",
                      border: isEarned
                        ? "1px solid rgba(246,195,91,0.35)"
                        : "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 12,
                      padding: "14px 14px",
                      opacity: isEarned ? 1 : 0.45,
                      transition: "all 0.3s",
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 8 }}>
                      {badge.icon}
                    </div>
                    <div
                      style={{
                        color: isEarned ? "#F6C35B" : "#9AA7B6",
                        fontSize: 12,
                        fontWeight: 700,
                        marginBottom: 4,
                      }}
                    >
                      {badge.title}
                    </div>
                    <div
                      style={{
                        color: "#9AA7B6",
                        fontSize: 10,
                        lineHeight: 1.4,
                      }}
                    >
                      {badge.description}
                    </div>
                    {isEarned && (
                      <div
                        style={{
                          color: "#34D399",
                          fontSize: 9,
                          marginTop: 6,
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                        }}
                      >
                        ✓ EARNED
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
