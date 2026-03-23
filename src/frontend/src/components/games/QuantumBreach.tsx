import { AnimatePresence, motion } from "motion/react";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface QuantumBreachProps {
  onGameOver: (score: number) => void;
}

const GRID_SIZE = 16;

function generateSequence(level: number): number[] {
  const count = Math.min(3 + level, 8);
  const indices: number[] = [];
  while (indices.length < count) {
    const n = Math.floor(Math.random() * GRID_SIZE);
    if (!indices.includes(n)) indices.push(n);
  }
  return indices;
}

export default function QuantumBreach({ onGameOver }: QuantumBreachProps) {
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [phase, setPhase] = useState<
    "showing" | "playing" | "feedback" | "gameover"
  >("showing");
  const [showNodes, setShowNodes] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameOverCalled = useRef(false);

  const startLevel = useCallback((lvl: number) => {
    const seq = generateSequence(lvl);
    setSequence(seq);
    setPlayerInput([]);
    setPhase("showing");
    setShowNodes(seq);
    setTimeLeft(Math.max(20 - (lvl - 1) * 2, 6));
    const displayTime = Math.max(2000 - (lvl - 1) * 200, 800);
    setTimeout(() => {
      setShowNodes([]);
      setPhase("playing");
    }, displayTime);
  }, []);

  useEffect(() => {
    startLevel(1);
  }, [startLevel]);

  // Countdown timer during play
  useEffect(() => {
    if (phase !== "playing") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setFeedback("wrong");
          setPhase("feedback");
          setLives((l) => {
            const newL = l - 1;
            if (newL <= 0 && !gameOverCalled.current) {
              gameOverCalled.current = true;
              setTimeout(() => {
                setPhase("gameover");
              }, 800);
            }
            return newL;
          });
          setTimeout(() => {
            setFeedback(null);
            if (lives > 1) {
              setLevel((lv) => {
                startLevel(lv);
                return lv;
              });
              setPhase("showing");
            }
          }, 1000);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, lives, startLevel]);

  const handleNodeClick = (idx: number) => {
    if (phase !== "playing") return;
    setActiveNode(idx);
    setTimeout(() => setActiveNode(null), 200);

    const newInput = [...playerInput, idx];
    setPlayerInput(newInput);

    const pos = newInput.length - 1;
    if (newInput[pos] !== sequence[pos]) {
      // Wrong
      setFeedback("wrong");
      setPhase("feedback");
      if (timerRef.current) clearInterval(timerRef.current);
      setLives((l) => {
        const newL = l - 1;
        if (newL <= 0 && !gameOverCalled.current) {
          gameOverCalled.current = true;
          setTimeout(() => setPhase("gameover"), 800);
        } else {
          setTimeout(() => {
            startLevel(level);
            setFeedback(null);
          }, 1000);
        }
        return newL;
      });
      return;
    }

    if (newInput.length === sequence.length) {
      // Correct!
      const bonus = timeLeft * 5;
      setScore((s) => s + level * 100 + bonus);
      setFeedback("correct");
      setPhase("feedback");
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeout(() => {
        setFeedback(null);
        const nextLevel = level + 1;
        setLevel(nextLevel);
        startLevel(nextLevel);
      }, 1000);
    }
  };

  useEffect(() => {
    if (phase === "gameover" && !gameOverCalled.current) {
      gameOverCalled.current = true;
      onGameOver(score);
    }
  }, [phase, score, onGameOver]);

  if (phase === "gameover") {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 48 }}>🔐</div>
        <div
          style={{
            color: "#FF4466",
            fontSize: 24,
            fontWeight: 900,
            marginTop: 12,
          }}
        >
          SYSTEM BREACH FAILED
        </div>
        <div style={{ color: "#FFD700", fontSize: 20, marginTop: 8 }}>
          Final Score: {score}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        fontFamily: "monospace",
      }}
    >
      {/* HUD */}
      <div
        style={{
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {[
          { label: "LEVEL", value: level, color: "#00FFC8" },
          { label: "SCORE", value: score, color: "#FFD700" },
          { label: "LIVES", value: "❤️".repeat(lives), color: "#FF4466" },
          {
            label: "TIME",
            value: phase === "playing" ? `${timeLeft}s` : "--",
            color: timeLeft < 5 ? "#FF4466" : "#FF8800",
          },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: "rgba(0,0,0,0.5)",
              border: `1px solid ${item.color}44`,
              borderRadius: 8,
              padding: "6px 14px",
              textAlign: "center",
            }}
          >
            <div style={{ color: "#667", fontSize: 10 }}>{item.label}</div>
            <div style={{ color: item.color, fontSize: 14, fontWeight: 700 }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Phase indicator */}
      <AnimatePresence mode="wait">
        <motion.div
          key={phase + feedback}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          style={{
            padding: "8px 24px",
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 700,
            background:
              feedback === "correct"
                ? "rgba(0,255,136,0.2)"
                : feedback === "wrong"
                  ? "rgba(255,68,102,0.2)"
                  : phase === "showing"
                    ? "rgba(0,255,200,0.15)"
                    : "rgba(0,150,200,0.15)",
            border: `1px solid ${feedback === "correct" ? "#00FF88" : feedback === "wrong" ? "#FF4466" : "#00FFC8"}55`,
            color:
              feedback === "correct"
                ? "#00FF88"
                : feedback === "wrong"
                  ? "#FF4466"
                  : "#00FFC8",
          }}
        >
          {feedback === "correct"
            ? "✓ SEQUENCE CORRECT — NEXT LEVEL"
            : feedback === "wrong"
              ? "✗ WRONG SEQUENCE — RETRY"
              : phase === "showing"
                ? `MEMORIZE ${sequence.length} NODES...`
                : `ENTER SEQUENCE (${playerInput.length}/${sequence.length})`}
        </motion.div>
      </AnimatePresence>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
          padding: 16,
          background: "rgba(0,0,20,0.8)",
          border: "1px solid #00FFC833",
          borderRadius: 12,
        }}
      >
        {Array.from({ length: GRID_SIZE }).map((_, idx) => {
          const _isActive = showNodes.includes(idx);
          const inputIndex = playerInput.indexOf(idx);
          const isInput = inputIndex !== -1;
          const isFlashing = activeNode === idx;
          const seqIndex = sequence.indexOf(idx);
          const isTarget = phase === "showing" && seqIndex !== -1;

          return (
            <motion.button
              // biome-ignore lint/suspicious/noArrayIndexKey: static fixed grid
              key={`node-${idx}`}
              type="button"
              onClick={() => handleNodeClick(idx)}
              whileTap={{ scale: 0.9 }}
              style={{
                width: 54,
                height: 54,
                borderRadius: 8,
                border: isTarget
                  ? "2px solid #00FFC8"
                  : isInput
                    ? "2px solid #FFD700"
                    : isFlashing
                      ? "2px solid #FFFFFF"
                      : "1px solid #FFFFFF22",
                background: isFlashing
                  ? "rgba(255,255,255,0.4)"
                  : isTarget
                    ? "rgba(0,255,200,0.35)"
                    : isInput
                      ? "rgba(255,215,0,0.25)"
                      : "rgba(0,20,40,0.8)",
                cursor: phase === "playing" ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: isTarget ? "#00FFC8" : isInput ? "#FFD700" : "#FFFFFF22",
                fontSize: 18,
                fontWeight: 700,
                boxShadow: isTarget
                  ? "0 0 12px #00FFC888"
                  : isInput
                    ? "0 0 8px #FFD70066"
                    : "none",
                transition: "all 0.15s",
              }}
            >
              {isTarget ? seqIndex + 1 : isInput ? inputIndex + 1 : "·"}
            </motion.button>
          );
        })}
      </div>

      <div style={{ color: "#445566", fontSize: 11, textAlign: "center" }}>
        Sequence length: {sequence.length} nodes | Click in the correct order
      </div>
    </div>
  );
}
