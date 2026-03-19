import { AnimatePresence, motion } from "motion/react";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

const PANEL_STYLE: CSSProperties = {
  background: "rgba(11,16,23,0.92)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 14,
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
};

interface Question {
  q: string;
  options: [string, string, string, string];
  answer: number;
  fact: string;
}

const ALL_QUESTIONS: Question[] = [
  {
    q: "What is the largest planet in our solar system?",
    options: ["Saturn", "Jupiter", "Neptune", "Uranus"],
    answer: 1,
    fact: "Jupiter is so massive it could fit all other planets inside it twice over.",
  },
  {
    q: "How long does it take light from the Sun to reach Earth?",
    options: ["1 second", "8 minutes", "24 hours", "30 seconds"],
    answer: 1,
    fact: "Light travels at 299,792 km/s, covering 150 million km to Earth in ~8.3 minutes.",
  },
  {
    q: "Which planet has the most moons?",
    options: ["Jupiter", "Saturn", "Neptune", "Uranus"],
    answer: 1,
    fact: "Saturn has 146 confirmed moons as of 2023, beating Jupiter's 95.",
  },
  {
    q: "What is the hottest planet in the solar system?",
    options: ["Mercury", "Mars", "Venus", "Jupiter"],
    answer: 2,
    fact: "Venus is hotter than Mercury due to its thick CO2 atmosphere trapping heat.",
  },
  {
    q: "What year did the first human walk on the Moon?",
    options: ["1967", "1968", "1969", "1972"],
    answer: 2,
    fact: "Neil Armstrong stepped onto the Moon on July 20, 1969 during Apollo 11.",
  },
  {
    q: "What is the name of the galaxy we live in?",
    options: ["Andromeda", "Triangulum", "Milky Way", "Whirlpool"],
    answer: 2,
    fact: "The Milky Way is a barred spiral galaxy about 100,000 light-years in diameter.",
  },
  {
    q: "Which spacecraft was the first to leave the solar system?",
    options: ["Pioneer 10", "Voyager 2", "New Horizons", "Voyager 1"],
    answer: 3,
    fact: "Voyager 1 crossed the heliopause in 2012, entering interstellar space.",
  },
  {
    q: "What causes a solar eclipse?",
    options: [
      "Earth passes between Sun and Moon",
      "Moon passes between Earth and Sun",
      "Sun moves behind Jupiter",
      "Earth's shadow covers the Sun",
    ],
    answer: 1,
    fact: "A total solar eclipse occurs when the Moon perfectly covers the Sun's disk.",
  },
  {
    q: "What is a light-year?",
    options: [
      "A year with extra daylight",
      "The time light takes to travel",
      "Distance light travels in one year",
      "A measurement of star brightness",
    ],
    answer: 2,
    fact: "One light-year equals about 9.46 trillion kilometers or 5.88 trillion miles.",
  },
  {
    q: "Which planet rotates on its side?",
    options: ["Neptune", "Venus", "Uranus", "Saturn"],
    answer: 2,
    fact: "Uranus has an axial tilt of 98°, likely caused by an ancient massive collision.",
  },
  {
    q: "What is the Great Red Spot on Jupiter?",
    options: [
      "A volcanic eruption",
      "A giant persistent storm",
      "A meteorite crater",
      "A sea of red liquid",
    ],
    answer: 1,
    fact: "The Great Red Spot is a storm larger than Earth that has raged for 350+ years.",
  },
  {
    q: "How many Earth-sized planets could fit inside the Sun?",
    options: ["100", "1,000", "100,000", "1,300,000"],
    answer: 3,
    fact: "The Sun's volume is so enormous that about 1.3 million Earths would fit inside.",
  },
  {
    q: "What telescope launched in 2021 replaced Hubble for deep space observation?",
    options: ["Spitzer", "Chandra", "James Webb", "Kepler"],
    answer: 2,
    fact: "JWST launched December 25, 2021 and can see light from 13.6 billion years ago.",
  },
  {
    q: "What is the asteroid belt primarily composed of?",
    options: [
      "Ice and water",
      "Rocky debris and metals",
      "Gas and plasma",
      "Dark matter",
    ],
    answer: 1,
    fact: "The asteroid belt between Mars and Jupiter contains millions of rocky objects.",
  },
  {
    q: "Which planet has the longest day (slowest rotation)?",
    options: ["Mars", "Mercury", "Venus", "Saturn"],
    answer: 2,
    fact: "Venus rotates so slowly that its day (243 Earth days) is longer than its year.",
  },
  {
    q: "What is the Oort Cloud?",
    options: [
      "Jupiter's storm system",
      "A nebula near the Sun",
      "A distant region of icy objects",
      "The corona of the Sun",
    ],
    answer: 2,
    fact: "The Oort Cloud is a vast spherical shell of icy planetesimals extending to 100,000 AU.",
  },
  {
    q: "What force keeps planets in orbit around the Sun?",
    options: ["Magnetism", "Nuclear fusion", "Gravity", "Solar wind"],
    answer: 2,
    fact: "Gravity is the fundamental force that governs orbital mechanics and celestial motion.",
  },
  {
    q: "Which planet is known as the Red Planet?",
    options: ["Venus", "Jupiter", "Saturn", "Mars"],
    answer: 3,
    fact: "Mars appears red due to iron oxide (rust) on its surface and in its thin atmosphere.",
  },
  {
    q: "What is the name of Mars's largest volcano?",
    options: ["Mauna Kea", "Olympus Mons", "Vesuvius", "Elysium Mons"],
    answer: 1,
    fact: "Olympus Mons is 22 km tall and 600 km wide — the tallest volcano in the solar system.",
  },
  {
    q: "How old is our solar system approximately?",
    options: [
      "500 million years",
      "2 billion years",
      "4.6 billion years",
      "13 billion years",
    ],
    answer: 2,
    fact: "Our solar system formed from a molecular cloud collapse about 4.6 billion years ago.",
  },
];

const DAILY_QUESTIONS_COUNT = 5;

function getDailyQuestions(): Question[] {
  const seed = new Date().toDateString();
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff;
  }
  const shuffled = [...ALL_QUESTIONS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.abs((hash + i * 7919) % (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, DAILY_QUESTIONS_COUNT);
}

export function hasPendingChallenge(): boolean {
  const lastDate = localStorage.getItem("galaxy_last_challenge_date");
  return lastDate !== new Date().toDateString();
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function DailyChallenge({ open, onOpenChange }: Props) {
  const [questions] = useState(() => getDailyQuestions());
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showFact, setShowFact] = useState(false);
  const [phase, setPhase] = useState<"quiz" | "results">("quiz");
  const [streak, setStreak] = useState(0);
  const [alreadyDone, setAlreadyDone] = useState(false);

  useEffect(() => {
    const s = Number.parseInt(
      localStorage.getItem("galaxy_daily_streak") || "0",
      10,
    );
    setStreak(s);
    const lastDate = localStorage.getItem("galaxy_last_challenge_date");
    setAlreadyDone(lastDate === new Date().toDateString());
  }, []);

  function handleAnswer(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    setShowFact(true);
    if (idx === questions[qIndex].answer) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    setShowFact(false);
    setSelected(null);
    if (qIndex + 1 >= questions.length) {
      const today = new Date().toDateString();
      const lastDate = localStorage.getItem("galaxy_last_challenge_date");
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak = lastDate === yesterday ? streak + 1 : 1;
      setStreak(newStreak);
      localStorage.setItem("galaxy_daily_streak", String(newStreak));
      localStorage.setItem("galaxy_last_challenge_date", today);
      setAlreadyDone(true);
      setPhase("results");
    } else {
      setQIndex((i) => i + 1);
    }
  }

  const currentQ = questions[qIndex];
  const pct = Math.round((score / questions.length) * 100);
  const medalEmoji =
    pct === 100 ? "🥇" : pct >= 80 ? "🥈" : pct >= 60 ? "🥉" : "🌟";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="daily-challenge-overlay"
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
            data-ocid="daily_challenge.modal"
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            style={{
              ...PANEL_STYLE,
              padding: 28,
              width: 520,
              maxWidth: "95vw",
              maxHeight: "85vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>🔭</span>
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
                    Daily Challenge
                  </div>
                  <div style={{ color: "#9AA7B6", fontSize: 11, marginTop: 2 }}>
                    🔥 {streak} day streak
                  </div>
                </div>
              </div>
              <button
                type="button"
                data-ocid="daily_challenge.close_button"
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

            {/* Already done */}
            {alreadyDone && phase !== "results" ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: "center", padding: "40px 20px" }}
              >
                <div style={{ fontSize: 60, marginBottom: 16 }}>✅</div>
                <div
                  style={{
                    color: "#34D399",
                    fontSize: 18,
                    fontWeight: 800,
                    marginBottom: 8,
                  }}
                >
                  Challenge Complete!
                </div>
                <div
                  style={{ color: "#9AA7B6", fontSize: 13, marginBottom: 16 }}
                >
                  You've completed today's challenge. Come back tomorrow!
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "rgba(246,195,91,0.1)",
                    border: "1px solid rgba(246,195,91,0.3)",
                    borderRadius: 10,
                    padding: "10px 20px",
                    color: "#F6C35B",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  🔥 Current Streak: {streak} days
                </div>
              </motion.div>
            ) : phase === "results" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: "center", padding: "32px 20px" }}
              >
                <div style={{ fontSize: 64, marginBottom: 16 }}>
                  {medalEmoji}
                </div>
                <div
                  style={{
                    color:
                      pct >= 80 ? "#34D399" : pct >= 60 ? "#F6C35B" : "#9AA7B6",
                    fontSize: 22,
                    fontWeight: 900,
                    marginBottom: 6,
                  }}
                >
                  {score} / {questions.length} Correct
                </div>
                <div
                  style={{ color: "#9AA7B6", fontSize: 13, marginBottom: 20 }}
                >
                  {pct === 100
                    ? "Perfect score! You're a space expert! 🚀"
                    : pct >= 80
                      ? "Excellent work, astronaut!"
                      : pct >= 60
                        ? "Good effort — keep exploring!"
                        : "Keep studying the cosmos!"}
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "rgba(246,195,91,0.1)",
                    border: "1px solid rgba(246,195,91,0.3)",
                    borderRadius: 10,
                    padding: "10px 20px",
                    color: "#F6C35B",
                    fontWeight: 700,
                    fontSize: 14,
                    marginBottom: 20,
                  }}
                >
                  🔥 Streak: {streak} days
                </div>
                <br />
                <button
                  type="button"
                  data-ocid="daily_challenge.close_button"
                  onClick={() => onOpenChange(false)}
                  style={{
                    background: "rgba(246,195,91,0.12)",
                    border: "1px solid rgba(246,195,91,0.35)",
                    borderRadius: 10,
                    color: "#F6C35B",
                    padding: "10px 28px",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: "inherit",
                  }}
                >
                  Close
                </button>
              </motion.div>
            ) : (
              <>
                {/* Progress */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <span style={{ color: "#5a6a7a", fontSize: 11 }}>
                    Question {qIndex + 1} of {questions.length}
                  </span>
                  <span
                    style={{ color: "#F6C35B", fontSize: 11, fontWeight: 700 }}
                  >
                    Score: {score}
                  </span>
                </div>
                <div
                  style={{
                    height: 4,
                    background: "rgba(255,255,255,0.07)",
                    borderRadius: 2,
                    overflow: "hidden",
                    marginBottom: 24,
                  }}
                >
                  <motion.div
                    animate={{ width: `${(qIndex / questions.length) * 100}%` }}
                    style={{
                      height: "100%",
                      background: "#F6C35B",
                      borderRadius: 2,
                    }}
                  />
                </div>

                {/* Question */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={qIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div
                      style={{
                        color: "#E9EEF5",
                        fontSize: 15,
                        fontWeight: 600,
                        lineHeight: 1.5,
                        marginBottom: 20,
                        padding: "16px 18px",
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      🌌 {currentQ.q}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      {currentQ.options.map((opt, idx) => {
                        let bg = "rgba(255,255,255,0.04)";
                        let border = "1px solid rgba(255,255,255,0.1)";
                        let color = "#C8D4E0";
                        if (selected !== null) {
                          if (idx === currentQ.answer) {
                            bg = "rgba(52,211,153,0.12)";
                            border = "1px solid rgba(52,211,153,0.5)";
                            color = "#34D399";
                          } else if (
                            idx === selected &&
                            idx !== currentQ.answer
                          ) {
                            bg = "rgba(239,68,68,0.12)";
                            border = "1px solid rgba(239,68,68,0.4)";
                            color = "#F87171";
                          }
                        }
                        return (
                          <motion.button
                            key={opt}
                            type="button"
                            data-ocid={`daily_challenge.radio.${idx + 1}`}
                            whileHover={
                              selected === null ? { scale: 1.01 } : {}
                            }
                            whileTap={selected === null ? { scale: 0.99 } : {}}
                            onClick={() => handleAnswer(idx)}
                            style={{
                              width: "100%",
                              padding: "12px 16px",
                              background: bg,
                              border,
                              borderRadius: 10,
                              color,
                              fontSize: 13,
                              fontWeight: 500,
                              textAlign: "left",
                              cursor: selected !== null ? "default" : "pointer",
                              fontFamily: "inherit",
                              transition: "all 0.2s",
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <span
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: "50%",
                                background: "rgba(255,255,255,0.06)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 10,
                                fontWeight: 800,
                                flexShrink: 0,
                              }}
                            >
                              {["A", "B", "C", "D"][idx]}
                            </span>
                            {opt}
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Fact */}
                    <AnimatePresence>
                      {showFact && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          style={{
                            marginTop: 16,
                            padding: "12px 14px",
                            background: "rgba(96,165,250,0.08)",
                            border: "1px solid rgba(96,165,250,0.25)",
                            borderRadius: 8,
                            color: "#93C5FD",
                            fontSize: 12,
                            lineHeight: 1.5,
                          }}
                        >
                          💡 <strong>Fun Fact:</strong> {currentQ.fact}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {selected !== null && (
                      <motion.button
                        type="button"
                        data-ocid="daily_challenge.primary_button"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={handleNext}
                        style={{
                          marginTop: 20,
                          width: "100%",
                          padding: "12px",
                          background: "rgba(246,195,91,0.12)",
                          border: "1px solid rgba(246,195,91,0.4)",
                          borderRadius: 10,
                          color: "#F6C35B",
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {qIndex + 1 < questions.length
                          ? "Next Question →"
                          : "See Results 🏆"}
                      </motion.button>
                    )}
                  </motion.div>
                </AnimatePresence>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
