import React, { useEffect, useRef } from "react";
import { useIsMobile } from "../../hooks/use-mobile";

interface GravityEscapeProps {
  onGameOver: (score: number) => void;
}

export default function GravityEscape({ onGameOver }: GravityEscapeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const isMobile = useIsMobile();
  const thrustRef = useRef(false);
  const stateRef = useRef({
    x: 400,
    y: 150,
    vx: 2,
    vy: 0,
    thrustHeld: false,
    time: 0,
    gameOver: false,
    keys: {} as Record<string, boolean>,
    angle: 0,
    particles: [] as {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
    }[],
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const eventHorizonR = 45;
    const s = stateRef.current;
    s.x = cx;
    s.y = cy - 160;
    s.vx = 2.5;
    s.vy = 0;
    s.time = 0;
    s.gameOver = false;
    s.angle = 0;

    const onClick = () => {
      if (!s.gameOver) {
        s.thrustHeld = true;
        setTimeout(() => {
          s.thrustHeld = false;
        }, 200);
      }
    };
    const kd = (e: KeyboardEvent) => {
      s.keys[e.code] = true;
    };
    const ku = (e: KeyboardEvent) => {
      s.keys[e.code] = false;
    };
    canvas.addEventListener("mousedown", onClick);
    canvas.addEventListener("touchstart", onClick);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);

    let lastTime = performance.now();
    let diskAngle = 0;

    function loop(now: number) {
      const dt = Math.min((now - lastTime) / 16, 3);
      lastTime = now;
      if (s.gameOver) return;
      s.time += dt / 60;
      diskAngle += 0.008 * dt;

      const gravity = 0.018 + s.time * 0.0006;
      const dx = cx - s.x;
      const dy = cy - s.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      s.vx += (dx / dist) * gravity * dt;
      s.vy += (dy / dist) * gravity * dt;

      const thrusting =
        s.thrustHeld ||
        thrustRef.current ||
        s.keys.Space ||
        s.keys.ArrowUp ||
        s.keys.KeyW;
      if (thrusting) {
        const awayX = -dx / dist;
        const awayY = -dy / dist;
        s.vx += awayX * 0.22 * dt;
        s.vy += awayY * 0.22 * dt;
        for (let i = 0; i < 3; i++) {
          const a = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.8;
          s.particles.push({
            x: s.x,
            y: s.y,
            vx: Math.cos(a) * (2 + Math.random() * 2),
            vy: Math.sin(a) * (2 + Math.random() * 2),
            life: 20,
          });
        }
      }

      s.vx *= 0.995;
      s.vy *= 0.995;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.angle = Math.atan2(s.vy, s.vx);

      const distToCenter = Math.sqrt((s.x - cx) ** 2 + (s.y - cy) ** 2);
      if (distToCenter < eventHorizonR + 8) {
        s.gameOver = true;
        onGameOver(Math.floor(s.time));
        return;
      }
      if (s.x < 0 || s.x > W || s.y < 0 || s.y > H) {
        s.x = Math.max(10, Math.min(W - 10, s.x));
        s.y = Math.max(10, Math.min(H - 10, s.y));
        s.vx *= -0.5;
        s.vy *= -0.5;
      }

      ctx.fillStyle = "#000008";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      for (let i = 0; i < 120; i++)
        ctx.fillRect((i * 173.1 + 7) % W, (i * 97.7 + 13) % H, 1, 1);

      for (let r = eventHorizonR + 6; r < 200; r += 18) {
        const alpha = 0.12 * (1 - (r - eventHorizonR) / 180);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,${180 - r},50,${alpha})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(diskAngle);
      for (let i = 0; i < 360; i += 3) {
        const a = (i / 180) * Math.PI;
        const r1 = eventHorizonR + 6;
        const r2 = eventHorizonR + 28;
        const bright = (Math.sin(a * 3 + diskAngle * 4) + 1) / 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
        ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
        ctx.strokeStyle = `rgba(${200 + Math.floor(bright * 55)},${100 + Math.floor(bright * 80)},50,${0.6 + bright * 0.4})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, eventHorizonR);
      grad.addColorStop(0, "#000000");
      grad.addColorStop(0.7, "#000000");
      grad.addColorStop(0.9, "rgba(60,20,80,0.5)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, eventHorizonR, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, eventHorizonR, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,200,80,0.9)";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#FF9900";
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.shadowBlur = 0;

      s.particles = s.particles.filter((p) => p.life > 0);
      for (const p of s.particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        ctx.globalAlpha = p.life / 20;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = thrusting ? "#00CCFF" : "#FF6600";
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(-8, -6);
      ctx.lineTo(-5, 0);
      ctx.lineTo(-8, 6);
      ctx.closePath();
      ctx.strokeStyle = thrusting ? "#00FFFF" : "#44AAFF";
      ctx.lineWidth = 2;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.restore();
      ctx.shadowBlur = 0;

      const maxSafeDist = Math.min(W, H) / 2 - 30;
      const safePct = Math.min(
        1,
        (distToCenter - eventHorizonR) / (maxSafeDist - eventHorizonR),
      );
      const gaugeW = 160;
      const gaugeH = 12;
      const gx2 = W / 2 - gaugeW / 2;
      const gy2 = H - 36;
      ctx.fillStyle = "rgba(0,0,20,0.7)";
      ctx.fillRect(gx2, gy2, gaugeW, gaugeH);
      const gaugeColor =
        safePct > 0.5 ? "#00CC66" : safePct > 0.25 ? "#FFAA00" : "#FF2244";
      ctx.fillStyle = gaugeColor;
      ctx.shadowColor = gaugeColor;
      ctx.shadowBlur = 6;
      ctx.fillRect(gx2, gy2, gaugeW * safePct, gaugeH);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#334455";
      ctx.lineWidth = 1;
      ctx.strokeRect(gx2, gy2, gaugeW, gaugeH);
      ctx.fillStyle = "#8899BB";
      ctx.font = "10px monospace";
      ctx.fillText("DISTANCE FROM EVENT HORIZON", gx2, gy2 - 4);

      ctx.fillStyle = "#E0E8FF";
      ctx.font = "bold 14px 'Plus Jakarta Sans', monospace";
      ctx.fillText(`⏱ ${Math.floor(s.time)}s`, 14, 28);
      ctx.fillStyle = "#8899BB";
      ctx.font = "12px monospace";
      ctx.fillText("Survive 60s", 14, 48);
      if (thrusting) {
        ctx.fillStyle = "#00FFFF";
        ctx.font = "bold 13px monospace";
        ctx.fillText("🚀 THRUST", W - 100, 28);
      }
      if (s.time >= 60) {
        s.gameOver = true;
        onGameOver(60);
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("mousedown", onClick);
      canvas.removeEventListener("touchstart", onClick);
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
          border: "2px solid rgba(255,160,50,0.5)",
          borderRadius: 8,
          boxShadow: "0 0 28px rgba(255,100,0,0.25)",
          maxWidth: "100%",
          cursor: "pointer",
          touchAction: "none",
        }}
      />
      {isMobile ? (
        <button
          type="button"
          onTouchStart={() => {
            thrustRef.current = true;
          }}
          onTouchEnd={() => {
            thrustRef.current = false;
          }}
          onMouseDown={() => {
            thrustRef.current = true;
          }}
          onMouseUp={() => {
            thrustRef.current = false;
          }}
          style={{
            width: 120,
            height: 64,
            borderRadius: 12,
            background: "rgba(0,0,0,0.5)",
            border: "2px solid rgba(255,160,50,0.5)",
            color: "#FF9933",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            touchAction: "none",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        >
          🚀 THRUST
        </button>
      ) : (
        <p style={{ color: "#8899BB", fontSize: 12 }}>
          Click canvas, Space or ↑ to thrust — survive 60 seconds!
        </p>
      )}
    </div>
  );
}
