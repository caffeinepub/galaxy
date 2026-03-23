import React, { useCallback, useEffect, useRef, useState } from "react";

interface BlackHoleHeistProps {
  onGameOver: (score: number) => void;
}

const W = 600;
const H = 400;
const SHIP_SIZE = 10;
const DRAG = 0.92;
const THRUST = 0.35;
const MAX_VEL = 5;

interface GravWell {
  x: number;
  y: number;
  r: number;
  strength: number;
}
interface TimeDilation {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface Level {
  wells: GravWell[];
  dilations: TimeDilation[];
  exitX: number;
  exitY: number;
}

const LEVELS: Level[] = [
  {
    wells: [{ x: 200, y: 200, r: 40, strength: 80 }],
    dilations: [],
    exitX: 550,
    exitY: 50,
  },
  {
    wells: [
      { x: 150, y: 150, r: 35, strength: 90 },
      { x: 420, y: 280, r: 35, strength: 90 },
    ],
    dilations: [{ x: 280, y: 150, w: 80, h: 100 }],
    exitX: 550,
    exitY: 50,
  },
  {
    wells: [
      { x: 120, y: 120, r: 30, strength: 100 },
      { x: 360, y: 200, r: 30, strength: 100 },
      { x: 480, y: 300, r: 28, strength: 95 },
    ],
    dilations: [{ x: 220, y: 180, w: 80, h: 80 }],
    exitX: 540,
    exitY: 40,
  },
  {
    wells: [
      { x: 100, y: 100, r: 28, strength: 110 },
      { x: 280, y: 250, r: 32, strength: 105 },
      { x: 450, y: 150, r: 28, strength: 110 },
      { x: 380, y: 340, r: 25, strength: 100 },
    ],
    dilations: [
      { x: 160, y: 200, w: 80, h: 80 },
      { x: 350, y: 60, w: 80, h: 80 },
    ],
    exitX: 550,
    exitY: 40,
  },
  {
    wells: [
      { x: 100, y: 80, r: 26, strength: 120 },
      { x: 250, y: 200, r: 30, strength: 115 },
      { x: 400, y: 100, r: 26, strength: 120 },
      { x: 300, y: 320, r: 28, strength: 110 },
      { x: 500, y: 250, r: 26, strength: 120 },
    ],
    dilations: [
      { x: 150, y: 150, w: 80, h: 80 },
      { x: 350, y: 200, w: 80, h: 80 },
    ],
    exitX: 560,
    exitY: 30,
  },
];

export default function BlackHoleHeist({ onGameOver }: BlackHoleHeistProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    x: 40.0,
    y: H - 40,
    vx: 0.0,
    vy: 0.0,
    keys: {} as Record<string, boolean>,
    level: 0,
    lives: 3,
    score: 0,
    levelStart: Date.now(),
    dead: false,
    levelFailed: false,
    respawnTimer: 0,
    frame: 0,
  });
  const [displayLevel, setDisplayLevel] = useState(1);
  const [displayLives, setDisplayLives] = useState(3);
  const [displayScore, setDisplayScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const rafRef = useRef(0);
  const gameOverCalled = useRef(false);

  const triggerGameOver = useCallback(
    (win: boolean, finalScore: number) => {
      if (gameOverCalled.current) return;
      gameOverCalled.current = true;
      cancelAnimationFrame(rafRef.current);
      setGameOver(true);
      setWon(win);
      onGameOver(finalScore);
    },
    [onGameOver],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const onKey = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key.toLowerCase()] = e.type === "keydown";
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);

    const loop = () => {
      const s = stateRef.current;
      if (s.dead) return;
      rafRef.current = requestAnimationFrame(loop);
      s.frame++;
      const now = Date.now();

      if (s.respawnTimer > 0 && now > s.respawnTimer) {
        s.respawnTimer = 0;
        s.levelFailed = false;
        s.x = 40;
        s.y = H - 40;
        s.vx = 0;
        s.vy = 0;
        s.levelStart = now;
      }

      const lv = LEVELS[s.level];
      const inDilation = lv.dilations.some(
        (d) => s.x > d.x && s.x < d.x + d.w && s.y > d.y && s.y < d.y + d.h,
      );
      const thrustScale = inDilation ? 0.4 : 1.0;

      if (!s.levelFailed) {
        // Thrust
        if (s.keys.w || s.keys.arrowup) s.vy -= THRUST * thrustScale;
        if (s.keys.s || s.keys.arrowdown) s.vy += THRUST * thrustScale;
        if (s.keys.a || s.keys.arrowleft) s.vx -= THRUST * thrustScale;
        if (s.keys.d || s.keys.arrowright) s.vx += THRUST * thrustScale;

        // Gravity wells
        for (const w of lv.wells) {
          const dx = w.x - s.x;
          const dy = w.y - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0) {
            const force = w.strength / (dist * dist);
            s.vx += (dx / dist) * force;
            s.vy += (dy / dist) * force;
          }
          // Sucked in
          if (dist < w.r) {
            s.lives--;
            if (s.lives <= 0) {
              s.dead = true;
              triggerGameOver(false, s.score);
              return;
            }
            s.levelFailed = true;
            s.respawnTimer = now + 1000;
          }
        }

        // Drag
        s.vx *= DRAG;
        s.vy *= DRAG;
        s.vx = Math.max(-MAX_VEL, Math.min(MAX_VEL, s.vx));
        s.vy = Math.max(-MAX_VEL, Math.min(MAX_VEL, s.vy));

        s.x += s.vx;
        s.y += s.vy;
        s.x = Math.max(SHIP_SIZE, Math.min(W - SHIP_SIZE, s.x));
        s.y = Math.max(SHIP_SIZE, Math.min(H - SHIP_SIZE, s.y));

        // Check exit
        if (Math.abs(s.x - lv.exitX) < 24 && Math.abs(s.y - lv.exitY) < 24) {
          const timeBonus = Math.max(0, 30000 - (now - s.levelStart));
          s.score += 500 + Math.floor(timeBonus / 1000) * 20;
          s.level++;
          if (s.level >= LEVELS.length) {
            s.dead = true;
            triggerGameOver(true, s.score);
            return;
          }
          s.x = 40;
          s.y = H - 40;
          s.vx = 0;
          s.vy = 0;
          s.levelStart = now;
        }
      }

      setDisplayLevel(s.level + 1);
      setDisplayLives(s.lives);
      setDisplayScore(s.score);

      // --- DRAW ---
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#000814";
      ctx.fillRect(0, 0, W, H);
      // Stars
      if (s.frame % 4 === 0) {
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
      }

      // Time dilation zones
      for (const d of lv.dilations) {
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = "#8800FF";
        ctx.fillRect(d.x, d.y, d.w, d.h);
        ctx.globalAlpha = 0.6;
        ctx.strokeStyle = "#CC44FF";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(d.x, d.y, d.w, d.h);
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#CC44FF";
        ctx.font = "9px monospace";
        ctx.fillText("TIME DILATION", d.x + 4, d.y + 14);
        ctx.restore();
      }

      // Gravity wells
      for (const w of lv.wells) {
        ctx.save();
        const grad = ctx.createRadialGradient(w.x, w.y, 0, w.x, w.y, w.r * 2.5);
        grad.addColorStop(0, "rgba(0,0,0,0.95)");
        grad.addColorStop(0.4, "rgba(0,20,40,0.6)");
        grad.addColorStop(1, "rgba(0,100,200,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(w.x, w.y, w.r * 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(0,100,255,${0.4 + Math.sin(s.frame * 0.05) * 0.2})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "rgba(0,0,0,0.9)";
        ctx.beginPath();
        ctx.arc(w.x, w.y, w.r * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Exit portal
      ctx.save();
      const pulse = Math.sin(s.frame * 0.08) * 4;
      ctx.shadowBlur = 20 + pulse;
      ctx.shadowColor = "#00FF88";
      ctx.strokeStyle = "#00FF88";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(lv.exitX, lv.exitY, 14 + pulse * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(0,255,136,0.25)";
      ctx.fill();
      ctx.fillStyle = "#00FF88";
      ctx.font = "9px monospace";
      ctx.textAlign = "center";
      ctx.fillText("EXIT", lv.exitX, lv.exitY + 26);
      ctx.textAlign = "left";
      ctx.restore();

      // Player ship
      if (!s.levelFailed) {
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = "#0066FF";
        ctx.fillStyle = "#4499FF";
        ctx.translate(s.x, s.y);
        const angle = Math.atan2(s.vy, s.vx) + Math.PI / 2;
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, -SHIP_SIZE);
        ctx.lineTo(-7, SHIP_SIZE);
        ctx.lineTo(0, SHIP_SIZE * 0.5);
        ctx.lineTo(7, SHIP_SIZE);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else {
        // Explosion
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          const r = 15 + Math.random() * 10;
          ctx.fillStyle = `rgba(255,${Math.random() * 100},0,0.8)`;
          ctx.beginPath();
          ctx.arc(
            s.x + Math.cos(a) * r,
            s.y + Math.sin(a) * r,
            3,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
      }

      // HUD
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, W, 28);
      ctx.font = "12px monospace";
      ctx.fillStyle = "#0066FF";
      ctx.fillText(`LEVEL ${s.level + 1}/5`, 10, 18);
      ctx.fillStyle = "#FFD700";
      ctx.fillText(`SCORE: ${s.score}`, W / 2 - 40, 18);
      ctx.fillStyle = "#FF4466";
      ctx.fillText(`LIVES: ${"♥ ".repeat(s.lives)}`, W - 90, 18);
      if (inDilation) {
        ctx.fillStyle = "#CC44FF";
        ctx.fillText("⏱ TIME DILATION", W / 2 - 55, H - 10);
      }
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
    };
  }, [triggerGameOver]);

  const setKey = (key: string, val: boolean) => {
    stateRef.current.keys[key] = val;
  };

  if (gameOver) {
    return (
      <div
        style={{ textAlign: "center", padding: 40, fontFamily: "monospace" }}
      >
        <div style={{ fontSize: 48 }}>{won ? "🏆" : "🌀"}</div>
        <div
          style={{
            color: won ? "#00FF88" : "#FF4466",
            fontSize: 24,
            fontWeight: 900,
            marginTop: 12,
          }}
        >
          {won ? "HEIST COMPLETE" : "SWALLOWED BY GRAVITY"}
        </div>
        <div style={{ color: "#FFD700", fontSize: 20, marginTop: 8 }}>
          Final Score: {displayScore}
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
      <div
        style={{
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {[
          { label: "LEVEL", value: `${displayLevel}/5`, color: "#0066FF" },
          { label: "SCORE", value: displayScore, color: "#FFD700" },
          {
            label: "LIVES",
            value: "♥ ".repeat(displayLives),
            color: "#FF4466",
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
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{
          maxWidth: "100%",
          border: "1px solid #0066FF44",
          borderRadius: 10,
          boxShadow: "0 0 24px #0066FF33",
          display: "block",
        }}
      />
      {/* Mobile controls */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {[
          { label: "◀", key: "a" },
          { label: "▶", key: "d" },
          { label: "▲", key: "w" },
          { label: "▼", key: "s" },
        ].map((btn) => (
          <button
            key={btn.key}
            type="button"
            onTouchStart={() => setKey(btn.key, true)}
            onMouseDown={() => setKey(btn.key, true)}
            onTouchEnd={() => setKey(btn.key, false)}
            onMouseUp={() => setKey(btn.key, false)}
            style={{
              width: 52,
              height: 52,
              borderRadius: 10,
              fontSize: 20,
              border: "1px solid #0066FF88",
              background: "rgba(0,102,255,0.15)",
              color: "#4499FF",
              cursor: "pointer",
              fontWeight: 700,
              userSelect: "none",
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>
      <div style={{ color: "#445566", fontSize: 11 }}>
        WASD / Arrow keys to thrust · Reach green EXIT portal · Avoid gravity
        wells
      </div>
    </div>
  );
}
