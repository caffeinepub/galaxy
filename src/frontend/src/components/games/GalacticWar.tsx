import { motion } from "motion/react";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface GalacticWarProps {
  onGameOver: (score: number) => void;
}

interface Ship {
  id: string;
  row: number;
  col: number;
  hp: number;
  maxHp: number;
  team: "player" | "enemy";
}

const GRID = 7;
const PLAYER_START_SHIPS: Array<[number, number]> = [
  [6, 1],
  [6, 3],
  [6, 5],
];
const ENEMY_START_SHIPS: Array<[number, number]> = [
  [0, 1],
  [0, 3],
  [0, 5],
];
const RESOURCE_POSITIONS: Array<[number, number]> = [
  [3, 0],
  [3, 3],
  [3, 6],
];
const TURN_TIME = 60;

function makeId() {
  return Math.random().toString(36).slice(2);
}

export default function GalacticWar({ onGameOver }: GalacticWarProps) {
  const [playerShips, setPlayerShips] = useState<Ship[]>(() =>
    PLAYER_START_SHIPS.map(([r, c]) => ({
      id: makeId(),
      row: r,
      col: c,
      hp: 3,
      maxHp: 3,
      team: "player",
    })),
  );
  const [enemyShips, setEnemyShips] = useState<Ship[]>(() =>
    ENEMY_START_SHIPS.map(([r, c]) => ({
      id: makeId(),
      row: r,
      col: c,
      hp: 2,
      maxHp: 2,
      team: "enemy",
    })),
  );
  const [resources, _setResources] =
    useState<Array<[number, number]>>(RESOURCE_POSITIONS);
  const [selected, setSelected] = useState<string | null>(null);
  const [turn, setTurn] = useState<"player" | "enemy">("player");
  const [timeLeft, setTimeLeft] = useState(TURN_TIME);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [log, setLog] = useState<string[]>([
    "Battle started! Command your fleet.",
  ]);
  const [playerResources, setPlayerResources] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState<"win" | "lose" | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameOverRef = useRef(false);

  const addLog = (msg: string) => setLog((prev) => [msg, ...prev].slice(0, 8));

  const endGame = useCallback(
    (result: "win" | "lose", finalScore: number) => {
      if (gameOverRef.current) return;
      gameOverRef.current = true;
      setGameOver(true);
      setGameResult(result);
      if (timerRef.current) clearInterval(timerRef.current);
      onGameOver(finalScore);
    },
    [onGameOver],
  );

  // Timer
  // biome-ignore lint/correctness/useExhaustiveDependencies: addLog is stable
  useEffect(() => {
    if (gameOver || turn !== "player") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          addLog("Turn timer expired — enemy acts.");
          setTurn("enemy");
          return TURN_TIME;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [turn, gameOver]);

  // Enemy AI turn
  // biome-ignore lint/correctness/useExhaustiveDependencies: addLog is stable
  useEffect(() => {
    if (turn !== "enemy" || gameOver) return;
    const timeout = setTimeout(() => {
      setEnemyShips((prev) => {
        const updated = [...prev];
        for (const ship of updated) {
          // Try to attack adjacent player ship
          const target = playerShips.find(
            (p) =>
              Math.abs(p.row - ship.row) + Math.abs(p.col - ship.col) === 1,
          );
          if (target) {
            setPlayerShips((ps) =>
              ps
                .map((p) => (p.id === target.id ? { ...p, hp: p.hp - 1 } : p))
                .filter((p) => p.hp > 0),
            );
            addLog("Enemy attacked your ship! (-1 HP)");
          } else {
            // Move toward nearest player ship
            const nearest = playerShips.reduce((a, b) =>
              Math.abs(a.row - ship.row) + Math.abs(a.col - ship.col) <
              Math.abs(b.row - ship.row) + Math.abs(b.col - ship.col)
                ? a
                : b,
            );
            const dr =
              nearest.row > ship.row ? 1 : nearest.row < ship.row ? -1 : 0;
            const dc =
              nearest.col > ship.col ? 1 : nearest.col < ship.col ? -1 : 0;
            const newRow = Math.max(0, Math.min(GRID - 1, ship.row + dr));
            const newCol = Math.max(0, Math.min(GRID - 1, ship.col + dc));
            ship.row = newRow;
            ship.col = newCol;
          }
        }
        return [...updated];
      });
      setTurn("player");
      setTimeLeft(TURN_TIME);
      setSelected(null);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [turn, gameOver, playerShips]);

  // Check win/lose
  // biome-ignore lint/correctness/useExhaustiveDependencies: game loop deps intentional
  useEffect(() => {
    if (gameOver) return;
    if (playerShips.length === 0) {
      endGame("lose", score);
      return;
    }
    if (enemyShips.length === 0) {
      const bonus = playerResources * 50 + timeLeft * 10;
      const newScore = score + bonus + 500;
      addLog(
        `All enemy ships destroyed! Round ${round} complete! +${bonus} bonus`,
      );
      // Start next round
      const newRound = round + 1;
      const numEnemies = Math.min(3 + newRound - 1, 6);
      const positions: Array<[number, number]> = [];
      for (let i = 0; i < numEnemies; i++) {
        positions.push([0, Math.floor((GRID / numEnemies) * i + 1)] as [
          number,
          number,
        ]);
      }
      setEnemyShips(
        positions.map(([r, c]) => ({
          id: makeId(),
          row: r,
          col: c,
          hp: 2,
          maxHp: 2,
          team: "enemy",
        })),
      );
      setRound(newRound);
      setScore(newScore);
      setTimeLeft(TURN_TIME);
      setTurn("player");
    }
    // Check resource victory
    const owned = resources.filter(([r, c]) =>
      playerShips.some((s) => s.row === r && s.col === c),
    );
    if (owned.length === resources.length && resources.length > 0) {
      endGame("win", score + 1000);
    }
  }, [playerShips, enemyShips, gameOver]);

  // Resource collection each turn
  // biome-ignore lint/correctness/useExhaustiveDependencies: game loop deps intentional
  useEffect(() => {
    if (turn !== "player") return;
    const onResource = resources.filter(([r, c]) =>
      playerShips.some((s) => s.row === r && s.col === c),
    ).length;
    if (onResource > 0) {
      setPlayerResources((p) => p + onResource);
      setScore((s) => s + onResource * 50);
      addLog(`Collected ${onResource} resource(s)! +${onResource * 50} score`);
    }
  }, [turn]);

  const handleCellClick = (row: number, col: number) => {
    if (turn !== "player" || gameOver) return;
    const clickedShip = playerShips.find((s) => s.row === row && s.col === col);
    const enemyHere = enemyShips.find((s) => s.row === row && s.col === col);

    if (selected) {
      const sel = playerShips.find((s) => s.id === selected);
      if (!sel) {
        setSelected(null);
        return;
      }

      if (enemyHere) {
        const dist = Math.abs(sel.row - row) + Math.abs(sel.col - col);
        if (dist === 1) {
          // Attack
          const newHp = enemyHere.hp - 1;
          if (newHp <= 0) {
            setEnemyShips((prev) => prev.filter((s) => s.id !== enemyHere.id));
            setScore((s) => s + 100);
            addLog("Destroyed enemy ship! +100 score");
          } else {
            setEnemyShips((prev) =>
              prev.map((s) =>
                s.id === enemyHere.id ? { ...s, hp: newHp } : s,
              ),
            );
            addLog(`Hit enemy ship (${newHp} HP remaining)`);
          }
          setTurn("enemy");
          setSelected(null);
          return;
        }
      }

      if (!clickedShip) {
        // Move
        const occupied = playerShips.some(
          (s) => s.row === row && s.col === col && s.id !== selected,
        );
        if (!occupied) {
          setPlayerShips((prev) =>
            prev.map((s) => (s.id === selected ? { ...s, row, col } : s)),
          );
          setTurn("enemy");
          setSelected(null);
          addLog(`Ship moved to (${row},${col})`);
          return;
        }
      }
      setSelected(clickedShip?.id ?? null);
    } else {
      if (clickedShip) setSelected(clickedShip.id);
    }
  };

  const getCellContent = (row: number, col: number) => {
    const player = playerShips.find((s) => s.row === row && s.col === col);
    const enemy = enemyShips.find((s) => s.row === row && s.col === col);
    const isResource = resources.some(([r, c]) => r === row && c === col);
    return { player, enemy, isResource };
  };

  if (gameOver) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          padding: 32,
        }}
      >
        <div style={{ fontSize: 48 }}>{gameResult === "win" ? "🏆" : "💥"}</div>
        <div
          style={{
            color: gameResult === "win" ? "#00FF88" : "#FF4466",
            fontSize: 24,
            fontWeight: 900,
          }}
        >
          {gameResult === "win" ? "VICTORY" : "DEFEAT"}
        </div>
        <div style={{ color: "#FFD700", fontSize: 20 }}>
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
        gap: 12,
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
          width: "100%",
        }}
      >
        {[
          { label: "SCORE", value: score, color: "#FFD700" },
          { label: "ROUND", value: round, color: "#00DDFF" },
          { label: "RESOURCES", value: playerResources, color: "#00FF88" },
          {
            label: "TIME",
            value: `${timeLeft}s`,
            color: timeLeft < 10 ? "#FF4466" : "#FF8800",
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
            <div style={{ color: item.color, fontSize: 16, fontWeight: 700 }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Turn indicator */}
      <div
        style={{
          padding: "6px 20px",
          borderRadius: 20,
          background:
            turn === "player"
              ? "rgba(0,255,136,0.15)"
              : "rgba(255,68,102,0.15)",
          border: `1px solid ${turn === "player" ? "#00FF88" : "#FF4466"}55`,
          color: turn === "player" ? "#00FF88" : "#FF4466",
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        {turn === "player"
          ? "▶ YOUR TURN — Select a ship, then click destination or enemy"
          : "⏳ ENEMY THINKING..."}
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${GRID}, 1fr)`,
          gap: 3,
          background: "rgba(0,0,20,0.8)",
          border: "1px solid #00DDFF33",
          borderRadius: 10,
          padding: 8,
        }}
      >
        {Array.from({ length: GRID * GRID }).map((_, i) => {
          const row = Math.floor(i / GRID);
          const col = i % GRID;
          const { player, enemy, isResource } = getCellContent(row, col);
          const isSelected = player && player.id === selected;
          const selShip = selected
            ? playerShips.find((s) => s.id === selected)
            : null;
          const isValidMove =
            selShip &&
            !player &&
            !enemy &&
            Math.abs(selShip.row - row) + Math.abs(selShip.col - col) <= 2;
          const isValidAttack =
            selShip &&
            enemy &&
            Math.abs(selShip.row - row) + Math.abs(selShip.col - col) === 1;

          return (
            <button
              type="button"
              key={`cell-${row}-${col}`}
              onClick={() => handleCellClick(row, col)}
              style={{
                width: 38,
                height: 38,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 4,
                cursor: turn === "player" && !gameOver ? "pointer" : "default",
                fontSize: 18,
                background: isSelected
                  ? "rgba(0,255,136,0.3)"
                  : isValidAttack
                    ? "rgba(255,68,102,0.3)"
                    : isValidMove
                      ? "rgba(0,220,255,0.15)"
                      : isResource
                        ? "rgba(255,200,0,0.1)"
                        : "rgba(0,0,30,0.6)",
                border: isSelected
                  ? "2px solid #00FF88"
                  : isValidAttack
                    ? "1px solid #FF4466"
                    : isValidMove
                      ? "1px solid #00DDFF55"
                      : isResource
                        ? "1px solid #FFD70044"
                        : "1px solid #FFFFFF11",
                transition: "all 0.1s",
                position: "relative",
              }}
            >
              {player ? (
                <div style={{ textAlign: "center" }}>
                  <div>🚀</div>
                  <div style={{ fontSize: 8, color: "#00FF88", lineHeight: 1 }}>
                    {player.hp}HP
                  </div>
                </div>
              ) : enemy ? (
                <div style={{ textAlign: "center" }}>
                  <div>👾</div>
                  <div style={{ fontSize: 8, color: "#FF4466", lineHeight: 1 }}>
                    {enemy.hp}HP
                  </div>
                </div>
              ) : isResource ? (
                "⚡"
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 16,
          fontSize: 11,
          color: "#8899BB",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <span>🚀 Your ships</span>
        <span>👾 Enemy ships</span>
        <span>⚡ Resource nodes</span>
        <span style={{ color: "#00DDFF" }}>■ Valid move</span>
        <span style={{ color: "#FF4466" }}>■ Attack target</span>
      </div>

      {/* Log */}
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "rgba(0,0,20,0.7)",
          border: "1px solid #FFFFFF11",
          borderRadius: 8,
          padding: "8px 12px",
          maxHeight: 100,
          overflowY: "auto",
        }}
      >
        {log.map((l, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: log is ephemeral display only
            key={i}
            style={{
              color: i === 0 ? "#AACCFF" : "#445566",
              fontSize: 11,
              lineHeight: 1.6,
            }}
          >
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}
