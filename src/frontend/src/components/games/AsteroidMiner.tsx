import React, { useEffect, useRef, useCallback } from "react";

interface AsteroidMinerProps {
  onGameOver: (score: number) => void;
}

interface Ship {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  fuel: number;
}
interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}
interface Asteroid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
}
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export default function AsteroidMiner({ onGameOver }: AsteroidMinerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const stateRef = useRef({
    ship: {
      x: 400,
      y: 300,
      vx: 0,
      vy: 0,
      angle: -Math.PI / 2,
      fuel: 100,
    } as Ship,
    bullets: [] as Bullet[],
    asteroids: [] as Asteroid[],
    particles: [] as Particle[],
    score: 0,
    gameOver: false,
    keys: {} as Record<string, boolean>,
    shootCooldown: 0,
    spawnTimer: 0,
    lives: 3,
    invincible: 0,
  });

  const spawnAsteroid = useCallback(
    (canvas: HTMLCanvasElement, large = true) => {
      const edge = Math.floor(Math.random() * 4);
      let x = 0;
      let y = 0;
      if (edge === 0) {
        x = Math.random() * canvas.width;
        y = -30;
      } else if (edge === 1) {
        x = canvas.width + 30;
        y = Math.random() * canvas.height;
      } else if (edge === 2) {
        x = Math.random() * canvas.width;
        y = canvas.height + 30;
      } else {
        x = -30;
        y = Math.random() * canvas.height;
      }
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const angle = Math.atan2(cy - y, cx - x) + (Math.random() - 0.5) * 1.5;
      const speed = 0.5 + Math.random() * 1.5;
      const radius = large ? 30 + Math.random() * 20 : 12 + Math.random() * 10;
      stateRef.current.asteroids.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius,
        hp: large ? 3 : 1,
      });
    },
    [],
  );

  const spawnParticles = useCallback(
    (x: number, y: number, color: string, count = 8) => {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const speed = 1 + Math.random() * 3;
        stateRef.current.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 40 + Math.random() * 20,
          maxLife: 60,
          color,
        });
      }
    },
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const s = stateRef.current;
    s.ship = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: 0,
      vy: 0,
      angle: -Math.PI / 2,
      fuel: 100,
    };
    for (let i = 0; i < 5; i++) spawnAsteroid(canvas, true);

    const onKey = (e: KeyboardEvent, down: boolean) => {
      s.keys[e.code] = down;
      e.preventDefault();
    };
    const kd = (e: KeyboardEvent) => onKey(e, true);
    const ku = (e: KeyboardEvent) => onKey(e, false);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);

    let lastTime = performance.now();

    function loop(now: number) {
      const dt = Math.min((now - lastTime) / 16, 3);
      lastTime = now;
      if (s.gameOver) return;

      ctx.fillStyle = "rgba(2,4,12,0.85)";
      ctx.fillRect(0, 0, canvas!.width, canvas!.height);

      // starfield
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      for (let i = 0; i < 80; i++) {
        const sx = (i * 137.5 * 7) % canvas!.width;
        const sy = (i * 97.3 * 11) % canvas!.height;
        ctx.fillRect(sx, sy, 1, 1);
      }

      const ship = s.ship;
      const rotating =
        s.keys.ArrowLeft || s.keys.KeyA
          ? -1
          : s.keys.ArrowRight || s.keys.KeyD
            ? 1
            : 0;
      ship.angle += rotating * 0.05 * dt;

      const thrusting = s.keys.ArrowUp || s.keys.KeyW;
      if (thrusting && ship.fuel > 0) {
        ship.vx += Math.cos(ship.angle) * 0.15 * dt;
        ship.vy += Math.sin(ship.angle) * 0.15 * dt;
        ship.fuel = Math.max(0, ship.fuel - 0.15 * dt);
        spawnParticles(
          ship.x - Math.cos(ship.angle) * 12,
          ship.y - Math.sin(ship.angle) * 12,
          "#FF6600",
          2,
        );
      }
      ship.vx *= 0.99;
      ship.vy *= 0.99;
      ship.x = (ship.x + ship.vx * dt + canvas!.width) % canvas!.width;
      ship.y = (ship.y + ship.vy * dt + canvas!.height) % canvas!.height;

      s.shootCooldown = Math.max(0, s.shootCooldown - dt);
      if ((s.keys.Space || s.keys.KeyZ) && s.shootCooldown <= 0) {
        const speed = 8;
        s.bullets.push({
          x: ship.x + Math.cos(ship.angle) * 16,
          y: ship.y + Math.sin(ship.angle) * 16,
          vx: ship.vx + Math.cos(ship.angle) * speed,
          vy: ship.vy + Math.sin(ship.angle) * speed,
          life: 60,
        });
        s.shootCooldown = 8;
      }

      s.spawnTimer += dt;
      if (s.spawnTimer > 180) {
        s.spawnTimer = 0;
        spawnAsteroid(canvas!, true);
      }

      // bullets
      s.bullets = s.bullets.filter((b) => b.life > 0);
      for (const b of s.bullets) {
        b.x = (b.x + b.vx * dt + canvas!.width) % canvas!.width;
        b.y = (b.y + b.vy * dt + canvas!.height) % canvas!.height;
        b.life -= dt;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#00FFFF";
        ctx.shadowColor = "#00FFFF";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // asteroids
      for (let i = s.asteroids.length - 1; i >= 0; i--) {
        const a = s.asteroids[i];
        a.x = (a.x + a.vx * dt + canvas!.width) % canvas!.width;
        a.y = (a.y + a.vy * dt + canvas!.height) % canvas!.height;

        // bullet collision
        for (let j = s.bullets.length - 1; j >= 0; j--) {
          const b = s.bullets[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          if (Math.sqrt(dx * dx + dy * dy) < a.radius) {
            s.bullets.splice(j, 1);
            a.hp--;
            spawnParticles(a.x, a.y, "#FF8800", 5);
            if (a.hp <= 0) {
              s.score += Math.floor(300 / a.radius) * 10;
              spawnParticles(a.x, a.y, "#FFDD00", 12);
              if (a.radius > 20) {
                for (let k = 0; k < 2; k++) {
                  const angle = Math.random() * Math.PI * 2;
                  const spd = 1 + Math.random();
                  s.asteroids.push({
                    x: a.x,
                    y: a.y,
                    vx: Math.cos(angle) * spd,
                    vy: Math.sin(angle) * spd,
                    radius: a.radius * 0.5,
                    hp: 1,
                  });
                }
              }
              s.asteroids.splice(i, 1);
              break;
            }
          }
        }
        if (!s.asteroids[i]) continue;

        // ship collision
        if (s.invincible <= 0) {
          const dx = ship.x - s.asteroids[i].x;
          const dy = ship.y - s.asteroids[i].y;
          if (Math.sqrt(dx * dx + dy * dy) < s.asteroids[i].radius + 10) {
            s.lives--;
            s.invincible = 120;
            spawnParticles(ship.x, ship.y, "#FF0044", 16);
            ship.vx = 0;
            ship.vy = 0;
            if (s.lives <= 0) {
              s.gameOver = true;
              onGameOver(s.score);
              return;
            }
          }
        }

        // draw asteroid
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.beginPath();
        const pts = 8;
        for (let k = 0; k < pts; k++) {
          const ang = (k / pts) * Math.PI * 2;
          const r = a.radius * (0.8 + ((k * 7 + i * 13) % 5) * 0.08);
          k === 0
            ? ctx.moveTo(Math.cos(ang) * r, Math.sin(ang) * r)
            : ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
        }
        ctx.closePath();
        ctx.strokeStyle = "#8899BB";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#6688AA";
        ctx.shadowBlur = 5;
        ctx.stroke();
        ctx.restore();
        ctx.shadowBlur = 0;
      }

      // particles
      s.particles = s.particles.filter((p) => p.life > 0);
      for (const p of s.particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // ship
      if (s.invincible <= 0 || Math.floor(s.invincible / 8) % 2 === 0) {
        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.rotate(ship.angle);
        ctx.beginPath();
        ctx.moveTo(16, 0);
        ctx.lineTo(-10, -8);
        ctx.lineTo(-6, 0);
        ctx.lineTo(-10, 8);
        ctx.closePath();
        ctx.strokeStyle = "#00FFFF";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#00FFFF";
        ctx.shadowBlur = 10;
        ctx.stroke();
        if (thrusting) {
          ctx.beginPath();
          ctx.moveTo(-6, -4);
          ctx.lineTo(-16 - Math.random() * 6, 0);
          ctx.lineTo(-6, 4);
          ctx.strokeStyle = "#FF6600";
          ctx.shadowColor = "#FF6600";
          ctx.stroke();
        }
        ctx.restore();
        ctx.shadowBlur = 0;
      }
      s.invincible = Math.max(0, s.invincible - dt);

      // HUD
      ctx.fillStyle = "#E0E8FF";
      ctx.font = "bold 14px 'Plus Jakarta Sans', monospace";
      ctx.fillText(`⭐ Score: ${s.score}`, 14, 28);
      ctx.fillText(`❤️ ${s.lives}`, 14, 50);
      // fuel bar
      ctx.fillStyle = "#111827";
      ctx.fillRect(canvas!.width - 134, 14, 120, 14);
      const fuelColor =
        ship.fuel > 40 ? "#00CC66" : ship.fuel > 20 ? "#FFAA00" : "#FF3333";
      ctx.fillStyle = fuelColor;
      ctx.shadowColor = fuelColor;
      ctx.shadowBlur = 4;
      ctx.fillRect(canvas!.width - 133, 15, (ship.fuel / 100) * 118, 12);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#334455";
      ctx.lineWidth = 1;
      ctx.strokeRect(canvas!.width - 134, 14, 120, 14);
      ctx.fillStyle = "#8899BB";
      ctx.font = "10px monospace";
      ctx.fillText("FUEL", canvas!.width - 128, 25);

      if (ship.fuel <= 0) {
        s.gameOver = true;
        onGameOver(s.score);
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
  }, [spawnAsteroid, spawnParticles, onGameOver]);

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
          border: "2px solid rgba(0,255,255,0.4)",
          borderRadius: 8,
          boxShadow: "0 0 24px rgba(0,255,255,0.2)",
          maxWidth: "100%",
        }}
      />
      <p style={{ color: "#8899BB", fontSize: 12 }}>
        A/D or ←/→ Rotate &nbsp;|&nbsp; W/↑ Thrust &nbsp;|&nbsp; Space Shoot
      </p>
    </div>
  );
}
