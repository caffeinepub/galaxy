import { AnimatePresence, motion } from "motion/react";
import React, { useState, useCallback } from "react";
import { useActor } from "../hooks/useActor";
import AsteroidMiner from "./games/AsteroidMiner";
import GravityEscape from "./games/GravityEscape";
import PlanetTerraformer from "./games/PlanetTerraformer";
import SpaceDefender from "./games/SpaceDefender";
import WormholeRacer from "./games/WormholeRacer";

interface GameArcadeProps {
  open: boolean;
  onClose: () => void;
  novaCredits: number;
  onSpendCredits: (amount: number) => void;
  onEarnCredits: (amount: number) => void;
  isLoggedIn: boolean;
}

interface GameConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  entryFee: number;
  maxReward: number;
  themeColor: string;
  glowColor: string;
  storageKey: string;
}

const GAMES: GameConfig[] = [
  {
    id: "asteroid",
    name: "Asteroid Miner",
    icon: "☄️",
    description:
      "Pilot your ship through the asteroid belt. Shoot rocks, collect minerals, manage fuel.",
    entryFee: 15,
    maxReward: 200,
    themeColor: "rgba(0,220,255,0.15)",
    glowColor: "#00DDFF",
    storageKey: "arcade_best_asteroid",
  },
  {
    id: "gravity",
    name: "Gravity Escape",
    icon: "🕳️",
    description:
      "A black hole pulls you in. Thrust away and survive 60 seconds before the event horizon swallows you.",
    entryFee: 10,
    maxReward: 150,
    themeColor: "rgba(255,120,0,0.15)",
    glowColor: "#FF8800",
    storageKey: "arcade_best_gravity",
  },
  {
    id: "terraformer",
    name: "Planet Terraformer",
    icon: "🌍",
    description:
      "Balance oxygen, temperature, and water to make 5 alien planets habitable. 5 actions per round.",
    entryFee: 10,
    maxReward: 100,
    themeColor: "rgba(0,200,80,0.15)",
    glowColor: "#00CC55",
    storageKey: "arcade_best_terraformer",
  },
  {
    id: "racer",
    name: "Wormhole Racer",
    icon: "🌀",
    description:
      "Race through a neon wormhole tunnel at increasing speed. Steer to avoid the walls.",
    entryFee: 15,
    maxReward: 180,
    themeColor: "rgba(160,50,255,0.15)",
    glowColor: "#AA33FF",
    storageKey: "arcade_best_racer",
  },
  {
    id: "defender",
    name: "Space Defender",
    icon: "🛸",
    description:
      "Waves of alien invaders descend on Earth. Defend with your laser cannon — 3 lives.",
    entryFee: 20,
    maxReward: 250,
    themeColor: "rgba(0,200,100,0.15)",
    glowColor: "#00FF88",
    storageKey: "arcade_best_defender",
  },
];

function getBestScore(key: string): number {
  try {
    return Number.parseInt(localStorage.getItem(key) ?? "0") || 0;
  } catch {
    return 0;
  }
}

function saveBestScore(key: string, score: number) {
  const prev = getBestScore(key);
  if (score > prev) {
    try {
      localStorage.setItem(key, String(score));
    } catch {
      /* */
    }
  }
}

function calcReward(
  score: number,
  maxScore: number,
  maxReward: number,
): number {
  const pct = Math.min(1, score / maxScore);
  if (pct >= 0.75) return maxReward;
  if (pct >= 0.5) return Math.floor(maxReward * 0.5);
  return Math.floor(maxReward * 0.2);
}

const MAX_SCORES: Record<string, number> = {
  asteroid: 5000,
  gravity: 60,
  terraformer: 5,
  racer: 500,
  defender: 2000,
};

export default function GameArcade({
  open,
  onClose,
  novaCredits,
  onSpendCredits,
  onEarnCredits,
  isLoggedIn,
}: GameArcadeProps) {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const [insufficientGame, setInsufficientGame] = useState<string | null>(null);

  const handlePlay = useCallback(
    (game: GameConfig) => {
      if (!isLoggedIn) return;
      if (novaCredits < game.entryFee) {
        setInsufficientGame(game.id);
        setTimeout(() => setInsufficientGame(null), 2000);
        return;
      }
      onSpendCredits(game.entryFee);
      setResultMsg(null);
      setActiveGame(game.id);
    },
    [isLoggedIn, novaCredits, onSpendCredits],
  );

  const { actor } = useActor();

  const handleGameOver = useCallback(
    (gameId: string, score: number) => {
      const game = GAMES.find((g) => g.id === gameId)!;
      saveBestScore(game.storageKey, score);
      const reward = calcReward(score, MAX_SCORES[gameId], game.maxReward);
      onEarnCredits(reward);
      if (actor && reward > 0) {
        actor.recordGameCreditsEarned(BigInt(reward)).catch(() => {});
      }
      setResultMsg(
        `Game over! Score: ${score} — You earned ⭐ ${reward} Nova Credits!`,
      );
      setActiveGame(null);
    },
    [onEarnCredits, actor],
  );

  const activeGameConfig = GAMES.find((g) => g.id === activeGame);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="arcade-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 60,
          background: "rgba(0,0,10,0.92)",
          backdropFilter: "blur(8px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflowY: "auto",
        }}
        data-ocid="arcade.modal"
      >
        {/* Header */}
        <div
          style={{
            width: "100%",
            maxWidth: 900,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px 24px 0",
          }}
        >
          <div>
            <h1
              style={{
                color: "#FFD700",
                fontSize: 26,
                fontWeight: 900,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                textShadow: "0 0 20px rgba(255,215,0,0.5)",
                margin: 0,
              }}
            >
              🎮 Game Arcade
            </h1>
            <p style={{ color: "#8899BB", fontSize: 13, margin: "4px 0 0" }}>
              Spend Nova Credits to play — earn them back based on your score
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {isLoggedIn && (
              <div
                style={{
                  background: "rgba(255,215,0,0.1)",
                  border: "1px solid rgba(255,215,0,0.3)",
                  borderRadius: 8,
                  padding: "6px 14px",
                  color: "#FFD700",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                ⭐ {novaCredits} Credits
              </div>
            )}
            <button
              type="button"
              data-ocid="arcade.close_button"
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 8,
                color: "#8899BB",
                fontSize: 20,
                cursor: "pointer",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Result message */}
        <AnimatePresence>
          {resultMsg && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                margin: "16px 0 0",
                padding: "10px 24px",
                background: "rgba(0,200,80,0.15)",
                border: "1px solid rgba(0,255,100,0.4)",
                borderRadius: 10,
                color: "#00FF88",
                fontSize: 14,
                fontWeight: 700,
                textAlign: "center",
              }}
              data-ocid="arcade.success_state"
            >
              {resultMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active game */}
        {activeGame && activeGameConfig ? (
          <div
            style={{
              width: "100%",
              maxWidth: 900,
              padding: "20px 24px 32px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                type="button"
                data-ocid="arcade.back_button"
                onClick={() => {
                  setActiveGame(null);
                }}
                style={{
                  padding: "7px 18px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#8899BB",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                ← Back to Lobby
              </button>
              <span
                style={{
                  color: activeGameConfig.glowColor,
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                {activeGameConfig.icon} {activeGameConfig.name}
              </span>
            </div>
            {activeGame === "asteroid" && (
              <AsteroidMiner
                onGameOver={(score) => handleGameOver("asteroid", score)}
              />
            )}
            {activeGame === "gravity" && (
              <GravityEscape
                onGameOver={(score) => handleGameOver("gravity", score)}
              />
            )}
            {activeGame === "terraformer" && (
              <PlanetTerraformer
                onGameOver={(score) => handleGameOver("terraformer", score)}
              />
            )}
            {activeGame === "racer" && (
              <WormholeRacer
                onGameOver={(score) => handleGameOver("racer", score)}
              />
            )}
            {activeGame === "defender" && (
              <SpaceDefender
                onGameOver={(score) => handleGameOver("defender", score)}
              />
            )}
          </div>
        ) : (
          /* Lobby */
          <div
            style={{
              width: "100%",
              maxWidth: 900,
              padding: "24px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 20,
            }}
          >
            {GAMES.map((game, idx) => {
              const best = getBestScore(game.storageKey);
              const isInsufficient = insufficientGame === game.id;
              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07 }}
                  data-ocid={`arcade.item.${idx + 1}`}
                  style={{
                    background: isInsufficient
                      ? "rgba(255,60,60,0.1)"
                      : game.themeColor,
                    border: `1px solid ${isInsufficient ? "rgba(255,80,80,0.5)" : game.glowColor.replace(")", ",0.3)").replace("#", "rgba(").replace("rgba(", "rgba(0,0,0,0.3)")}`,
                    borderColor: isInsufficient
                      ? "rgba(255,80,80,0.5)"
                      : `${game.glowColor}55`,
                    borderRadius: 14,
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    transition: "all 0.2s",
                    cursor: "default",
                    boxShadow: `0 0 20px ${game.glowColor}22`,
                  }}
                >
                  <div style={{ fontSize: 36 }}>{game.icon}</div>
                  <div>
                    <div
                      style={{
                        color: game.glowColor,
                        fontWeight: 800,
                        fontSize: 16,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {game.name}
                    </div>
                    <div
                      style={{
                        color: "#8899BB",
                        fontSize: 12,
                        marginTop: 4,
                        lineHeight: 1.5,
                      }}
                    >
                      {game.description}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                    }}
                  >
                    <span style={{ color: "#FFD700" }}>
                      ⭐ {game.entryFee} to play
                    </span>
                    <span style={{ color: "#8899BB" }}>
                      Max reward: ⭐ {game.maxReward}
                    </span>
                  </div>
                  {best > 0 && (
                    <div style={{ color: "#88AABB", fontSize: 11 }}>
                      🏆 Best: {best}
                    </div>
                  )}
                  {!isLoggedIn ? (
                    <div
                      style={{
                        padding: "9px",
                        borderRadius: 8,
                        textAlign: "center",
                        background: "rgba(100,100,120,0.2)",
                        border: "1px solid #334",
                        color: "#667788",
                        fontSize: 13,
                      }}
                    >
                      Login to play
                    </div>
                  ) : (
                    <button
                      type="button"
                      data-ocid={`arcade.play_button.${idx + 1}`}
                      onClick={() => handlePlay(game)}
                      style={{
                        padding: "10px",
                        borderRadius: 8,
                        border: `1px solid ${game.glowColor}88`,
                        background: isInsufficient
                          ? "rgba(255,60,60,0.2)"
                          : `linear-gradient(135deg, ${game.glowColor}22, ${game.glowColor}11)`,
                        color: isInsufficient ? "#FF6688" : game.glowColor,
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: "pointer",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        boxShadow: isInsufficient
                          ? "none"
                          : `0 0 12px ${game.glowColor}44`,
                        transition: "all 0.15s",
                      }}
                    >
                      {isInsufficient
                        ? "Not enough credits!"
                        : `▶ PLAY — ⭐ ${game.entryFee}`}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
