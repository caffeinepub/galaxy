import React, { useEffect, useRef } from "react";

interface SpaceDefenderProps {
  onGameOver: (score: number) => void;
}

interface Alien {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  shootTimer: number;
  type: number;
}
interface Bullet {
  x: number;
  y: number;
  vy: number;
  friendly: boolean;
}
interface Explosion {
  x: number;
  y: number;
  r: number;
  maxR: number;
  life: number;
}

export default function SpaceDefender({ onGameOver }: SpaceDefenderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const stateRef = useRef({
    playerX: 400,
    playerVX: 0,
    lives: 3,
    score: 0,
    wave: 1,
    aliens: [] as Alien[],
    bullets: [] as Bullet[],
    explosions: [] as Explosion[],
    keys: {} as Record<string, boolean>,
    shootCooldown: 0,
    gameOver: false,
    waveTimer: 0,
    shields: [
      { x: 160, hp: 3 },
      { x: 400, hp: 3 },
      { x: 640, hp: 3 },
    ],
  });

  const spawnWave = (wave: number) => {
    const s = stateRef.current;
    s.aliens = [];
    const cols = 8 + wave;
    const rows = Math.min(3 + Math.floor(wave / 2), 5);
    const speed = 0.4 + wave * 0.1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        s.aliens.push({
          x: 60 + c * (680 / cols),
          y: 60 + r * 50,
          vx: speed,
          vy: 0,
          hp: r === 0 ? 1 : 2,
          shootTimer: Math.random() * 200,
          type: r % 3,
        });
      }
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: spawnWave is stable
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width;
    const H = canvas.height;
    const s = stateRef.current;
    s.playerX = W / 2;
    s.playerVX = 0;
    s.lives = 3;
    s.score = 0;
    s.wave = 1;
    s.gameOver = false;
    s.bullets = [];
    s.explosions = [];
    s.shields = [
      { x: 160, hp: 3 },
      { x: 400, hp: 3 },
      { x: 640, hp: 3 },
    ];
    spawnWave(1);

    const kd = (e: KeyboardEvent) => {
      s.keys[e.code] = true;
    };
    const ku = (e: KeyboardEvent) => {
      s.keys[e.code] = false;
    };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);

    let lastTime = performance.now();
    let dirTimer = 0;
    let moveDir = 1;

    function drawAlien(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      type: number,
    ) {
      ctx.save();
      ctx.translate(x, y);
      const colors = ["#FF4466", "#FFAA00", "#AA44FF"];
      ctx.fillStyle = colors[type];
      ctx.shadowColor = colors[type];
      ctx.shadowBlur = 8;
      if (type === 0) {
        // crab
        ctx.fillRect(-10, -5, 20, 10);
        ctx.fillRect(-14, -2, 4, 7);
        ctx.fillRect(10, -2, 4, 7);
        ctx.fillRect(-6, -10, 4, 6);
        ctx.fillRect(2, -10, 4, 6);
      } else if (type === 1) {
        // squid
        ctx.beginPath();
        ctx.arc(0, -4, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-12, 0, 4, 8);
        ctx.fillRect(-4, 0, 4, 10);
        ctx.fillRect(4, 0, 4, 10);
        ctx.fillRect(8, 0, 4, 8);
      } else {
        // saucer
        ctx.beginPath();
        ctx.ellipse(0, 0, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(0, -5, 7, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      ctx.shadowBlur = 0;
    }

    function loop(now: number) {
      const dt = Math.min((now - lastTime) / 16, 3);
      lastTime = now;
      if (s.gameOver) return;

      ctx.fillStyle = "rgba(0,0,10,0.92)";
      ctx.fillRect(0, 0, W, H);

      // stars
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      for (let i = 0; i < 80; i++)
        ctx.fillRect((i * 137) % W, (i * 97) % H, 1, 1);

      // player move
      if (s.keys.ArrowLeft || s.keys.KeyA) s.playerVX -= 0.8 * dt;
      if (s.keys.ArrowRight || s.keys.KeyD) s.playerVX += 0.8 * dt;
      s.playerVX *= 0.85;
      s.playerX = Math.max(20, Math.min(W - 20, s.playerX + s.playerVX * dt));

      // player shoot
      s.shootCooldown = Math.max(0, s.shootCooldown - dt);
      if (s.keys.Space && s.shootCooldown <= 0) {
        s.bullets.push({ x: s.playerX, y: H - 50, vy: -10, friendly: true });
        s.shootCooldown = 10;
      }

      // alien movement direction bounce
      dirTimer += dt;
      if (dirTimer > 60) {
        dirTimer = 0;
        const leftmost = Math.min(...s.aliens.map((a) => a.x));
        const rightmost = Math.max(...s.aliens.map((a) => a.x));
        if (rightmost > W - 40) {
          moveDir = -1;
          for (const a of s.aliens) a.y += 18;
        }
        if (leftmost < 40) {
          moveDir = 1;
          for (const a of s.aliens) a.y += 18;
        }
      }

      // aliens
      for (let i = s.aliens.length - 1; i >= 0; i--) {
        const a = s.aliens[i];
        a.x += moveDir * a.vx * dt;
        a.shootTimer -= dt;
        if (a.shootTimer <= 0) {
          a.shootTimer = 120 + Math.random() * 180;
          s.bullets.push({
            x: a.x,
            y: a.y + 15,
            vy: 4 + Math.random() * 2,
            friendly: false,
          });
        }
        if (a.y > H - 80) {
          s.gameOver = true;
          onGameOver(s.score);
          return;
        }
        drawAlien(ctx, a.x, a.y, a.type);
      }

      // bullets
      for (let i = s.bullets.length - 1; i >= 0; i--) {
        const b = s.bullets[i];
        b.y += b.vy * dt;
        if (b.y < 0 || b.y > H) {
          s.bullets.splice(i, 1);
          continue;
        }

        if (b.friendly) {
          // hit alien
          let hit = false;
          for (let j = s.aliens.length - 1; j >= 0; j--) {
            const a = s.aliens[j];
            if (Math.abs(b.x - a.x) < 16 && Math.abs(b.y - a.y) < 14) {
              a.hp--;
              s.explosions.push({ x: a.x, y: a.y, r: 0, maxR: 20, life: 15 });
              if (a.hp <= 0) {
                s.score += (a.type + 1) * 10;
                s.aliens.splice(j, 1);
              }
              hit = true;
              break;
            }
          }
          // hit shield
          for (const sh of s.shields) {
            if (
              Math.abs(b.x - sh.x) < 20 &&
              Math.abs(b.y - (H - 100)) < 20 &&
              sh.hp > 0
            ) {
              sh.hp--;
              hit = true;
              break;
            }
          }
          if (hit) {
            s.bullets.splice(i, 1);
            continue;
          }
        } else {
          // hit player
          if (Math.abs(b.x - s.playerX) < 16 && Math.abs(b.y - (H - 42)) < 16) {
            s.lives--;
            s.explosions.push({
              x: s.playerX,
              y: H - 42,
              r: 0,
              maxR: 30,
              life: 20,
            });
            s.bullets.splice(i, 1);
            if (s.lives <= 0) {
              s.gameOver = true;
              onGameOver(s.score);
              return;
            }
            continue;
          }
          // hit shield
          let shieldHit = false;
          for (const sh of s.shields) {
            if (
              Math.abs(b.x - sh.x) < 20 &&
              Math.abs(b.y - (H - 100)) < 20 &&
              sh.hp > 0
            ) {
              sh.hp--;
              shieldHit = true;
              break;
            }
          }
          if (shieldHit) {
            s.bullets.splice(i, 1);
            continue;
          }
        }

        ctx.beginPath();
        ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = b.friendly ? "#00FFFF" : "#FF3344";
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // shields
      for (const sh of s.shields) {
        if (sh.hp <= 0) continue;
        ctx.fillStyle = `rgba(0,200,100,${sh.hp * 0.25})`;
        ctx.shadowColor = "#00CC66";
        ctx.shadowBlur = 10;
        ctx.fillRect(sh.x - 22, H - 115, 44, 28);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(0,255,120,${sh.hp * 0.3})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(sh.x - 22, H - 115, 44, 28);
      }

      // explosions
      s.explosions = s.explosions.filter((e) => e.life > 0);
      for (const e of s.explosions) {
        e.r += 2 * dt;
        e.life -= dt;
        ctx.globalAlpha = e.life / e.maxR;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.strokeStyle = "#FF8800";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#FF4400";
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1;

      // player ship
      ctx.save();
      ctx.translate(s.playerX, H - 42);
      ctx.fillStyle = "#44CCFF";
      ctx.shadowColor = "#00AAFF";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(-14, 10);
      ctx.lineTo(-6, 5);
      ctx.lineTo(0, 8);
      ctx.lineTo(6, 5);
      ctx.lineTo(14, 10);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.shadowBlur = 0;

      // ground line
      ctx.strokeStyle = "rgba(0,200,100,0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, H - 20);
      ctx.lineTo(W, H - 20);
      ctx.stroke();

      // HUD
      ctx.fillStyle = "#E0E8FF";
      ctx.font = "bold 14px 'Plus Jakarta Sans', monospace";
      ctx.fillText(`⭐ ${s.score}`, 14, 28);
      ctx.fillText(`Wave ${s.wave}`, W / 2 - 30, 28);
      for (let i = 0; i < s.lives; i++) {
        ctx.fillStyle = "#FF4466";
        ctx.font = "14px sans-serif";
        ctx.fillText("♥", W - 30 - i * 22, 28);
      }

      // wave clear
      if (s.aliens.length === 0) {
        s.wave++;
        spawnWave(s.wave);
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
  }, [onGameOver]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={520}
        style={{
          border: "2px solid rgba(0,200,100,0.5)",
          borderRadius: 8,
          boxShadow: "0 0 28px rgba(0,200,100,0.2)",
          maxWidth: "100%",
        }}
      />
      <p style={{ color: "#8899BB", fontSize: 12 }}>
        ←/→ or A/D to move &nbsp;|&nbsp; Space to shoot &nbsp;|&nbsp; Survive
        the alien waves!
      </p>
    </div>
  );
}
