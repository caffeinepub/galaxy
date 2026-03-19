import { Button } from "@/components/ui/button";
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

interface Question {
  q: string;
  options: string[];
  answer: number;
}

const QUESTION_BANK: Question[] = [
  {
    q: "Which planet is closest to the Sun?",
    options: ["Venus", "Mercury", "Mars", "Earth"],
    answer: 1,
  },
  {
    q: "Which planet has the most moons?",
    options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
    answer: 1,
  },
  {
    q: "What is the largest planet in our solar system?",
    options: ["Saturn", "Uranus", "Neptune", "Jupiter"],
    answer: 3,
  },
  {
    q: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    answer: 1,
  },
  {
    q: "Which planet has the Great Red Spot?",
    options: ["Mars", "Neptune", "Jupiter", "Saturn"],
    answer: 2,
  },
  {
    q: "Which planet has rings visible from Earth?",
    options: ["Jupiter", "Uranus", "Saturn", "Neptune"],
    answer: 2,
  },
  {
    q: "Which planet spins on its side (97.8° tilt)?",
    options: ["Neptune", "Saturn", "Uranus", "Jupiter"],
    answer: 2,
  },
  {
    q: "Which planet is sometimes called Earth's twin?",
    options: ["Mars", "Venus", "Mercury", "Neptune"],
    answer: 1,
  },
  {
    q: "Which planet has the fastest orbital speed?",
    options: ["Earth", "Venus", "Mars", "Mercury"],
    answer: 3,
  },
  {
    q: "How many planets are in our solar system?",
    options: ["7", "8", "9", "10"],
    answer: 1,
  },
  {
    q: "Which planet is farthest from the Sun?",
    options: ["Uranus", "Saturn", "Neptune", "Jupiter"],
    answer: 2,
  },
  {
    q: "What is the hottest planet?",
    options: ["Mercury", "Venus", "Mars", "Earth"],
    answer: 1,
  },
  {
    q: "Which planet has a storm called the Great Dark Spot?",
    options: ["Uranus", "Saturn", "Jupiter", "Neptune"],
    answer: 3,
  },
  {
    q: "Which planet has the shortest day (~10 hours)?",
    options: ["Saturn", "Jupiter", "Mars", "Uranus"],
    answer: 1,
  },
  {
    q: "Olympus Mons, the tallest volcano, is on which planet?",
    options: ["Earth", "Venus", "Mars", "Mercury"],
    answer: 2,
  },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick5(): Question[] {
  return shuffle(QUESTION_BANK).slice(0, 5);
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onQuizComplete?: () => void;
}

export function PlanetQuiz({ open, onOpenChange, onQuizComplete }: Props) {
  const [questions, setQuestions] = useState<Question[]>(() => pick5());
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  function restart() {
    setQuestions(pick5());
    setCurrent(0);
    setSelected(null);
    setConfirmed(false);
    setScore(0);
    setDone(false);
  }

  function handleSelect(idx: number) {
    if (confirmed) return;
    setSelected(idx);
  }

  function handleConfirm() {
    if (selected === null) return;
    const correct = questions[current].answer === selected;
    const newScore = correct ? score + 1 : score;
    setConfirmed(true);
    if (current === questions.length - 1) {
      setTimeout(() => {
        setScore(newScore);
        setDone(true);
        onQuizComplete?.();
      }, 900);
    } else {
      setTimeout(() => {
        setScore(newScore);
        setCurrent((c) => c + 1);
        setSelected(null);
        setConfirmed(false);
      }, 900);
    }
  }

  if (!open) return null;
  const q = questions[current];

  return (
    <AnimatePresence>
      <motion.div
        key="quiz-overlay"
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
          data-ocid="quiz.modal"
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          style={{ ...PANEL_STYLE, padding: 32, width: 480, maxWidth: "95vw" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <div>
              <div
                style={{
                  color: "#F6C35B",
                  fontSize: 16,
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Planet Quiz
              </div>
              <div style={{ color: "#9AA7B6", fontSize: 11, marginTop: 2 }}>
                Test your space knowledge
              </div>
            </div>
            <button
              type="button"
              data-ocid="quiz.close_button"
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

          {done ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>
                {score >= 4 ? "🏆" : score >= 2 ? "🌟" : "🚀"}
              </div>
              <div
                style={{
                  color: "#F6C35B",
                  fontSize: 22,
                  fontWeight: 800,
                  marginBottom: 8,
                }}
              >
                Score: {score}/{questions.length}
              </div>
              <div style={{ color: "#9AA7B6", fontSize: 13, marginBottom: 24 }}>
                {score === questions.length
                  ? "Perfect! You're a space expert!"
                  : score >= 3
                    ? "Great job, astronaut!"
                    : "Keep exploring the cosmos!"}
              </div>
              <div
                style={{ display: "flex", gap: 12, justifyContent: "center" }}
              >
                <Button
                  data-ocid="quiz.primary_button"
                  onClick={restart}
                  style={{
                    background: "rgba(246,195,91,0.15)",
                    border: "1px solid rgba(246,195,91,0.4)",
                    color: "#F6C35B",
                    fontWeight: 700,
                  }}
                >
                  Try Again
                </Button>
                <Button
                  data-ocid="quiz.close_button"
                  onClick={() => onOpenChange(false)}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#9AA7B6",
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {/* Progress */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 20,
                }}
              >
                {questions.map((_, i) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: static list with stable order
                    key={i}
                    style={{
                      flex: 1,
                      height: 3,
                      borderRadius: 2,
                      background:
                        i < current
                          ? "#F6C35B"
                          : i === current
                            ? "rgba(246,195,91,0.5)"
                            : "rgba(255,255,255,0.1)",
                      transition: "background 0.3s",
                    }}
                  />
                ))}
                <span
                  style={{
                    color: "#9AA7B6",
                    fontSize: 11,
                    whiteSpace: "nowrap",
                  }}
                >
                  {current + 1}/{questions.length}
                </span>
              </div>

              {/* Question */}
              <div
                style={{
                  color: "#E9EEF5",
                  fontSize: 15,
                  fontWeight: 600,
                  marginBottom: 20,
                  lineHeight: 1.5,
                }}
              >
                {q.q}
              </div>

              {/* Options */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                {q.options.map((opt, i) => {
                  let bg = "rgba(255,255,255,0.04)";
                  let border = "1px solid rgba(255,255,255,0.1)";
                  let color = "#E9EEF5";
                  if (selected === i) {
                    if (!confirmed) {
                      bg = "rgba(246,195,91,0.12)";
                      border = "1px solid rgba(246,195,91,0.5)";
                      color = "#F6C35B";
                    } else if (i === q.answer) {
                      bg = "rgba(52,211,153,0.12)";
                      border = "1px solid rgba(52,211,153,0.5)";
                      color = "#34D399";
                    } else {
                      bg = "rgba(239,68,68,0.12)";
                      border = "1px solid rgba(239,68,68,0.4)";
                      color = "#F87171";
                    }
                  } else if (confirmed && i === q.answer) {
                    bg = "rgba(52,211,153,0.08)";
                    border = "1px solid rgba(52,211,153,0.35)";
                    color = "#34D399";
                  }
                  return (
                    <button
                      // biome-ignore lint/suspicious/noArrayIndexKey: static list with stable order
                      key={i}
                      type="button"
                      data-ocid={`quiz.item.${i + 1}`}
                      onClick={() => handleSelect(i)}
                      style={{
                        background: bg,
                        border,
                        borderRadius: 10,
                        padding: "11px 16px",
                        color,
                        cursor: confirmed ? "default" : "pointer",
                        fontSize: 13,
                        fontWeight: 500,
                        textAlign: "left",
                        transition: "all 0.2s",
                        fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                      }}
                    >
                      <span style={{ color: "#9AA7B6", marginRight: 8 }}>
                        {String.fromCharCode(65 + i)}.
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              <Button
                data-ocid="quiz.submit_button"
                disabled={selected === null}
                onClick={handleConfirm}
                style={{
                  width: "100%",
                  background:
                    selected !== null
                      ? "rgba(246,195,91,0.15)"
                      : "rgba(255,255,255,0.04)",
                  border:
                    selected !== null
                      ? "1px solid rgba(246,195,91,0.4)"
                      : "1px solid rgba(255,255,255,0.08)",
                  color: selected !== null ? "#F6C35B" : "#9AA7B6",
                  fontWeight: 700,
                  cursor: selected !== null ? "pointer" : "not-allowed",
                }}
              >
                {confirmed ? "Next..." : "Confirm Answer"}
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
