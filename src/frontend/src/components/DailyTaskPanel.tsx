import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { BackButton } from "./BackButton";

interface Task {
  id: string;
  label: string;
  description: string;
  credits: number;
  icon: string;
  auto?: boolean;
}

const TASKS: Task[] = [
  {
    id: "daily_login",
    label: "Daily Login Bonus",
    description: "Claim your daily login reward",
    credits: 25,
    icon: "🌅",
    auto: true,
  },
  {
    id: "visit_planets",
    label: "Visit 3 Planets",
    description: "Click on any 3 planets in the solar system",
    credits: 50,
    icon: "🪐",
  },
  {
    id: "daily_trivia",
    label: "Complete Daily Trivia",
    description: "Answer the daily space trivia challenge",
    credits: 30,
    icon: "🧠",
  },
  {
    id: "explore_universe",
    label: "Explore a Universe",
    description: "Travel to any universe in the Multiverse",
    credits: 40,
    icon: "🌌",
  },
  {
    id: "watch_event",
    label: "Watch a Space Event",
    description: "Witness a comet flyby or solar flare",
    credits: 20,
    icon: "☄️",
  },
];

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function loadClaimedTasks(): Set<string> {
  try {
    const raw = localStorage.getItem(`nova_tasks_${getTodayKey()}`);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveClaimed(claimed: Set<string>) {
  localStorage.setItem(
    `nova_tasks_${getTodayKey()}`,
    JSON.stringify(Array.from(claimed)),
  );
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreditsEarned: (amount: number) => void;
}

export function DailyTaskPanel({ isOpen, onClose, onCreditsEarned }: Props) {
  const { actor } = useActor();
  const [claimed, setClaimed] = useState<Set<string>>(loadClaimedTasks);
  const [claiming, setClaiming] = useState<string | null>(null);

  // Refresh claimed from localStorage when panel opens + auto-claim login bonus
  useEffect(() => {
    if (!isOpen) return;
    const current = loadClaimedTasks();
    setClaimed(current);
    // Auto-claim daily login bonus
    const loginTask = TASKS.find((t) => t.auto && t.id === "daily_login");
    if (loginTask && !current.has("daily_login") && actor) {
      const next = new Set(current);
      next.add("daily_login");
      saveClaimed(next);
      setClaimed(next);
      onCreditsEarned(loginTask.credits);
      (actor as any)
        .earnCredits(BigInt(loginTask.credits), "Daily login bonus")
        .catch(() => {});
    }
  }, [isOpen, actor, onCreditsEarned]);

  async function claimTask(task: Task) {
    if (!actor || claimed.has(task.id) || claiming) return;
    setClaiming(task.id);
    try {
      await (actor as any).earnCredits(
        BigInt(task.credits),
        `Daily task: ${task.id}`,
      );
      const next = new Set(claimed);
      next.add(task.id);
      setClaimed(next);
      saveClaimed(next);
      onCreditsEarned(task.credits);
      toast.success(`✦ +${task.credits} Nova Credits earned!`, {
        style: {
          background: "rgba(11,16,23,0.95)",
          border: "1px solid rgba(246,195,91,0.4)",
          color: "#F6C35B",
        },
      });
    } catch {
      toast.error("Failed to claim reward. Please try again.");
    } finally {
      setClaiming(null);
    }
  }

  const claimedCount = TASKS.filter((t) => claimed.has(t.id)).length;
  const progress = (claimedCount / TASKS.length) * 100;
  const totalEarnable = TASKS.reduce((s, t) => s + t.credits, 0);
  const totalEarned = TASKS.filter((t) => claimed.has(t.id)).reduce(
    (s, t) => s + t.credits,
    0,
  );

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
              maxWidth: 500,
              overflow: "hidden",
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
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: 20 }}>✅</span>
                  <h2
                    style={{
                      color: "#F6C35B",
                      fontSize: 18,
                      fontWeight: 700,
                      margin: 0,
                    }}
                  >
                    Daily Tasks
                  </h2>
                </div>
                <p
                  style={{
                    color: "rgba(255,255,255,0.45)",
                    fontSize: 12,
                    margin: 0,
                  }}
                >
                  {getTodayKey()} · {claimedCount}/{TASKS.length} completed
                </p>
              </div>
              <button
                type="button"
                data-ocid="daily_tasks.close_button"
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

            {/* Progress */}
            <div
              style={{
                padding: "14px 24px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>
                  Daily Progress
                </span>
                <span
                  style={{ color: "#F6C35B", fontSize: 11, fontWeight: 600 }}
                >
                  ✦ {totalEarned} / {totalEarnable} credits
                </span>
              </div>
              <div
                style={{
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 9999,
                  height: 6,
                  overflow: "hidden",
                }}
              >
                <motion.div
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.6 }}
                  style={{
                    height: "100%",
                    background: "linear-gradient(90deg, #F6C35B, #fb923c)",
                    borderRadius: 9999,
                  }}
                />
              </div>
            </div>

            {/* Tasks */}
            <div style={{ padding: "16px 24px 20px" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {TASKS.map((task, i) => {
                  const done = claimed.has(task.id);
                  const loading = claiming === task.id;
                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      data-ocid={`daily_tasks.item.${i + 1}`}
                      style={{
                        background: done
                          ? "rgba(52,211,153,0.06)"
                          : "rgba(255,255,255,0.03)",
                        border: `1px solid ${
                          done
                            ? "rgba(52,211,153,0.2)"
                            : "rgba(255,255,255,0.08)"
                        }`,
                        borderRadius: 12,
                        padding: "12px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                      }}
                    >
                      <span style={{ fontSize: 22, flexShrink: 0 }}>
                        {task.icon}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            color: done ? "rgba(255,255,255,0.4)" : "#E9EEF5",
                            fontSize: 13,
                            fontWeight: 600,
                            textDecoration: done ? "line-through" : "none",
                          }}
                        >
                          {task.label}
                        </div>
                        <div
                          style={{
                            color: "rgba(255,255,255,0.35)",
                            fontSize: 11,
                            marginTop: 2,
                          }}
                        >
                          {task.description}
                        </div>
                      </div>
                      <div
                        style={{
                          flexShrink: 0,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            color: "#F6C35B",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          +{task.credits} ✦
                        </span>
                        {done ? (
                          <span
                            style={{
                              background: "rgba(52,211,153,0.15)",
                              border: "1px solid rgba(52,211,153,0.3)",
                              color: "#34d399",
                              borderRadius: 6,
                              padding: "3px 8px",
                              fontSize: 10,
                              fontWeight: 600,
                            }}
                          >
                            ✓ Claimed
                          </span>
                        ) : (
                          <button
                            type="button"
                            data-ocid={`daily_tasks.button.${i + 1}`}
                            disabled={loading || !actor}
                            onClick={() => claimTask(task)}
                            style={{
                              background: loading
                                ? "rgba(246,195,91,0.08)"
                                : "rgba(246,195,91,0.15)",
                              border: "1px solid rgba(246,195,91,0.35)",
                              color: "#F6C35B",
                              borderRadius: 6,
                              padding: "4px 12px",
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: loading ? "wait" : "pointer",
                              fontFamily:
                                "'Plus Jakarta Sans', Inter, sans-serif",
                              transition: "all 0.2s",
                            }}
                          >
                            {loading ? "..." : "Claim"}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
