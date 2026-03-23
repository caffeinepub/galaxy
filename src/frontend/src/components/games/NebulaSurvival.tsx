import React, { useCallback, useEffect, useRef, useState } from "react";

interface NebulaSurvivalProps {
  onGameOver: (score: number) => void;
}

const W = 600;
const H = 400;
const PLAYER_SPEED = 5;
const BULLET_SPEED = 8;
const ENEMY_TYPES = [
  { type: "slow", color: "#FF4466", size: 18, hp: 3, speed: 1, points: 15 },
  { type: "fast", color: "#FF8800", size: 12, hp: 1, speed: 2.5, points: 10 },
  { type: "zigzag", color: "#CC44FF", size: 15, hp: 2, speed: 1.5, points: 20 },
];

type Enemy = {
  id: number;
  x: number;
  y: number;
  type: string;
  color: string;
  size: number;
  hp: number;
  speed: number;
  points: number;
  vx: number;
  vy: number;
  zigDir: number;
};
type Bullet = { id: number; x: number; y: number; triple?: number };
type PowerUp = {
  id: number;
  x: number;
  y: number;
  type: "shield" | "rapidfire" | "triple";
};
type Particle = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
};

let _id = 0;
const uid = () => ++_id;

function getPerks() {
  try {
    return {
      fast_start: localStorage.getItem("perk_fast_start") === "1",
      extra_life: localStorage.getItem("perk_extra_life") === "1",
      double_xp: localStorage.getItem("perk_double_xp") === "1",
    };
  } catch {
    return { fast_start: false, extra_life: false, double_xp: false };
  }
}

function savePerk(key: string) {
  try {
    localStorage.setItem(key, "1");
  } catch {
    /* */
  }
}

export default function NebulaSurvival({ onGameOver }: NebulaSurvivalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    px: W / 2,
    py: H - 60,
    bullets: [] as Bullet[],
    enemies: [] as Enemy[],
    powerups: [] as PowerUp[],
    particles: [] as Particle[],
    lives: 3,
    score: 0,
    kills: 0,
    startTime: Date.now(),
    shield: false,
    rapidFire: false,
    tripleShot: false,
    rapidEnd: 0,
    tripleEnd: 0,
    keys: {} as Record<string, boolean>,
    lastShot: 0,
    lastEnemy: 0,
    frame: 0,
    dead: false,
    invincible: 0,
  });
  const [displayScore, setDisplayScore] = useState(0);
  const [displayLives, setDisplayLives] = useState(3);
  const [perks, setPerks] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const rafRef = useRef<number>(0);

  const initPerks = useCallback(() => {
    const p = getPerks();
    if (p.extra_life) stateRef.current.lives = 4;
    if (p.fast_start) {
      stateRef.current.rapidFire = true;
      stateRef.current.rapidEnd = Date.now() + 5000;
    }
    const earned: string[] = [];
    if (p.fast_start) earned.push("⚡ Fast Start");
    if (p.extra_life) earned.push("❤️ Extra Life");
    if (p.double_xp) earned.push("2x XP");
    setPerks(earned);
    setDisplayLives(stateRef.current.lives);
  }, []);

  useEffect(() => {
    initPerks();
  }, [initPerks]);

  const spawnEnemy = useCallback(() => {
    const t = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
    stateRef.current.enemies.push({
      id: uid(),
      x: 30 + Math.random() * (W - 60),
      y: -20,
      ...t,
      vx: t.type === "zigzag" ? (Math.random() > 0.5 ? 1.5 : -1.5) : 0,
      vy: t.speed,
      zigDir: 1,
    });
  }, []);

  const shoot = useCallback(() => {
    const s = stateRef.current;
    const now = Date.now();
    const cooldown = s.rapidFire ? 120 : 300;
    if (now - s.lastShot < cooldown) return;
    s.lastShot = now;
    if (s.tripleShot) {
      s.bullets.push({ id: uid(), x: s.px - 10, y: s.py - 10, triple: -1 });
      s.bullets.push({ id: uid(), x: s.px, y: s.py - 10 });
      s.bullets.push({ id: uid(), x: s.px + 10, y: s.py - 10, triple: 1 });
    } else {
      s.bullets.push({ id: uid(), x: s.px, y: s.py - 10 });
    }
  }, []);

  const endGame = useCallback(() => {
    const s = stateRef.current;
    if (s.dead) return;
    s.dead = true;
    cancelAnimationFrame(rafRef.current);
    const p = getPerks();
    const finalScore = p.double_xp ? s.score * 2 : s.score;
    // Check perk unlocks
    if (finalScore >= 500 && !p.fast_start) savePerk("perk_fast_start");
    if (finalScore >= 1000 && !p.extra_life) savePerk("perk_extra_life");
    if (finalScore >= 2000 && !p.double_xp) savePerk("perk_double_xp");
    setGameOver(true);
    onGameOver(finalScore);
  }, [onGameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleKey = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key] = e.type === "keydown";
      if (e.key === " " && e.type === "keydown") {
        e.preventDefault();
        shoot();
      }
    };
    window.addEventListener("keydown", handleKey);
    window.addEventListener("keyup", handleKey);

    const loop = () => {
      const s = stateRef.current;
      if (s.dead) return;
      rafRef.current = requestAnimationFrame(loop);
      s.frame++;
      const now = Date.now();

      // Move player
      if (s.keys.ArrowLeft || s.keys.a)
        s.px = Math.max(20, s.px - PLAYER_SPEED);
      if (s.keys.ArrowRight || s.keys.d)
        s.px = Math.min(W - 20, s.px + PLAYER_SPEED);

      // Update power-up timers
      if (s.rapidEnd && now > s.rapidEnd) {
        s.rapidFire = false;
        s.rapidEnd = 0;
      }
      if (s.tripleEnd && now > s.tripleEnd) {
        s.tripleShot = false;
        s.tripleEnd = 0;
      }

      // Spawn enemies
      const spawnInterval = Math.max(1200 - s.kills * 20, 400);
      if (now - s.lastEnemy > spawnInterval) {
        spawnEnemy();
        s.lastEnemy = now;
      }

      // Spawn power-ups
      if (s.frame % 400 === 0) {
        const types: Array<"shield" | "rapidfire" | "triple"> = [
          "shield",
          "rapidfire",
          "triple",
        ];
        s.powerups.push({
          id: uid(),
          x: 30 + Math.random() * (W - 60),
          y: -20,
          type: types[Math.floor(Math.random() * 3)],
        });
      }

      // Move bullets
      s.bullets = s.bullets.filter((b) => b.y > -10);
      for (const b of s.bullets) {
        b.y -= BULLET_SPEED;
        if (b.triple) b.x += b.triple * 2;
      }

      // Move enemies
      for (const e of s.enemies) {
        e.y += e.vy;
        if (e.type === "zigzag") {
          e.x += e.vx;
          if (e.x < 20 || e.x > W - 20) e.vx *= -1;
        }
      }

      // Move powerups
      for (const p of s.powerups) p.y += 1.5;
      s.powerups = s.powerups.filter((p) => p.y < H + 20);

      // Bullet-enemy collisions
      for (const b of [...s.bullets]) {
        for (const e of [...s.enemies]) {
          if (Math.abs(b.x - e.x) < e.size && Math.abs(b.y - e.y) < e.size) {
            s.bullets = s.bullets.filter((x) => x.id !== b.id);
            e.hp--;
            // Particles
            for (let i = 0; i < 6; i++) {
              s.particles.push({
                id: uid(),
                x: e.x,
                y: e.y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 20,
                color: e.color,
              });
            }
            if (e.hp <= 0) {
              s.enemies = s.enemies.filter((x) => x.id !== e.id);
              s.score += e.points;
              s.kills++;
            }
            break;
          }
        }
      }

      // Enemy-player collisions
      if (now > s.invincible) {
        for (const e of [...s.enemies]) {
          if (
            Math.abs(e.x - s.px) < e.size + 14 &&
            Math.abs(e.y - s.py) < e.size + 14
          ) {
            s.enemies = s.enemies.filter((x) => x.id !== e.id);
            if (s.shield) {
              s.shield = false;
            } else {
              s.lives--;
              s.invincible = now + 1500;
              if (s.lives <= 0) {
                endGame();
                return;
              }
            }
          }
        }
      }

      // Powerup collection
      for (const p of [...s.powerups]) {
        if (Math.abs(p.x - s.px) < 24 && Math.abs(p.y - s.py) < 24) {
          s.powerups = s.powerups.filter((x) => x.id !== p.id);
          if (p.type === "shield") s.shield = true;
          if (p.type === "rapidfire") {
            s.rapidFire = true;
            s.rapidEnd = now + 3000;
          }
          if (p.type === "triple") {
            s.tripleShot = true;
            s.tripleEnd = now + 3000;
          }
        }
      }

      // Remove off-screen enemies
      s.enemies = s.enemies.filter((e) => e.y < H + 30);

      // Update particles
      for (const p of s.particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
      }
      s.particles = s.particles.filter((p) => p.life > 0);

      // Score time bonus
      s.score = s.kills * 10 + Math.floor((now - s.startTime) / 1000) * 5;

      // Update display
      setDisplayScore(s.score);
      setDisplayLives(s.lives);

      // --- DRAW ---
      ctx.clearRect(0, 0, W, H);
      // Background
      ctx.fillStyle = "#000814";
      ctx.fillRect(0, 0, W, H);
      // Stars
      if (s.frame % 3 === 0) {
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
      }
      // Particles
      for (const p of s.particles) {
        ctx.globalAlpha = p.life / 20;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
      }
      ctx.globalAlpha = 1;
      // Power-ups
      for (const p of s.powerups) {
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor =
          p.type === "shield"
            ? "#00DDFF"
            : p.type === "rapidfire"
              ? "#FF8800"
              : "#CC44FF";
        ctx.fillStyle =
          p.type === "shield"
            ? "#00DDFF"
            : p.type === "rapidfire"
              ? "#FF8800"
              : "#CC44FF";
        ctx.font = "18px monospace";
        ctx.fillText(
          p.type === "shield" ? "🛡" : p.type === "rapidfire" ? "⚡" : "◈",
          p.x - 9,
          p.y + 6,
        );
        ctx.restore();
      }
      // Enemies
      for (const e of s.enemies) {
        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = e.color;
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      // Bullets
      ctx.fillStyle = "#00FFC8";
      ctx.shadowBlur = 6;
      ctx.shadowColor = "#00FFC8";
      for (const b of s.bullets) {
        ctx.fillRect(b.x - 2, b.y - 6, 4, 12);
      }
      ctx.shadowBlur = 0;
      // Player
      const blink = s.invincible > now && Math.floor(s.frame / 4) % 2 === 0;
      if (!blink) {
        ctx.save();
        ctx.shadowBlur = 16;
        ctx.shadowColor = s.shield ? "#00DDFF" : "#00FF88";
        ctx.fillStyle = s.shield ? "#00DDFF" : "#00FF88";
        ctx.beginPath();
        ctx.moveTo(s.px, s.py - 16);
        ctx.lineTo(s.px - 12, s.py + 10);
        ctx.lineTo(s.px, s.py + 4);
        ctx.lineTo(s.px + 12, s.py + 10);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      // HUD
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, 0, W, 28);
      ctx.fillStyle = "#FFD700";
      ctx.font = "12px monospace";
      ctx.fillText(`SCORE: ${s.score}`, 10, 18);
      ctx.fillStyle = "#FF4466";
      ctx.fillText(`LIVES: ${"♥ ".repeat(s.lives)}`, W / 2 - 40, 18);
      ctx.fillStyle = "#00FFC8";
      ctx.fillText(`KILLS: ${s.kills}`, W - 80, 18);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("keyup", handleKey);
    };
  }, [spawnEnemy, shoot, endGame]);

  const handleTouch = (dir: "left" | "right" | "stop" | "fire") => {
    const s = stateRef.current;
    if (dir === "left") s.keys.ArrowLeft = true;
    if (dir === "right") s.keys.ArrowRight = true;
    if (dir === "stop") {
      s.keys.ArrowLeft = false;
      s.keys.ArrowRight = false;
    }
    if (dir === "fire") shoot();
  };

  if (gameOver) {
    return (
      <div
        style={{ textAlign: "center", padding: 40, fontFamily: "monospace" }}
      >
        <div style={{ fontSize: 48 }}>🌌</div>
        <div
          style={{
            color: "#B400FF",
            fontSize: 24,
            fontWeight: 900,
            marginTop: 12,
          }}
        >
          NEBULA CLAIMED YOU
        </div>
        <div style={{ color: "#FFD700", fontSize: 20, marginTop: 8 }}>
          Final Score: {displayScore}
        </div>
        {perks.length > 0 && (
          <div style={{ marginTop: 12, color: "#00FFC8", fontSize: 13 }}>
            Active Perks: {perks.join(" · ")}
          </div>
        )}
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
          gap: 16,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <span style={{ color: "#FFD700", fontSize: 14 }}>
          ⭐ {displayScore}
        </span>
        <span style={{ color: "#FF4466", fontSize: 14 }}>
          {"❤️ ".repeat(displayLives)}
        </span>
        {perks.length > 0 && (
          <span style={{ color: "#00FFC8", fontSize: 12 }}>
            {perks.join(" · ")}
          </span>
        )}
      </div>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{
          maxWidth: "100%",
          border: "1px solid #B400FF44",
          borderRadius: 10,
          boxShadow: "0 0 24px #B400FF33",
          display: "block",
        }}
      />
      {/* Mobile touch controls */}
      <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
        <button
          type="button"
          onTouchStart={() => handleTouch("left")}
          onMouseDown={() => handleTouch("left")}
          onTouchEnd={() => handleTouch("stop")}
          onMouseUp={() => handleTouch("stop")}
          style={touchBtnStyle("#00FFC8")}
        >
          ◀
        </button>
        <button
          type="button"
          onTouchStart={() => handleTouch("fire")}
          onMouseDown={() => handleTouch("fire")}
          style={touchBtnStyle("#FFD700")}
        >
          🔫 FIRE
        </button>
        <button
          type="button"
          onTouchStart={() => handleTouch("right")}
          onMouseDown={() => handleTouch("right")}
          onTouchEnd={() => handleTouch("stop")}
          onMouseUp={() => handleTouch("stop")}
          style={touchBtnStyle("#00FFC8")}
        >
          ▶
        </button>
      </div>
      <div style={{ color: "#445566", fontSize: 11 }}>
        Arrow keys / WASD to move · SPACE to fire
      </div>
    </div>
  );
}

function touchBtnStyle(color: string) {
  return {
    padding: "12px 20px",
    borderRadius: 10,
    border: `1px solid ${color}88`,
    background: `${color}22`,
    color: color,
    fontSize: 16,
    cursor: "pointer",
    fontWeight: 700,
    minWidth: 56,
    userSelect: "none" as const,
  };
}
