import type React from "react";
import { useEffect, useRef } from "react";
import { useIsMobile } from "../../hooks/use-mobile";

interface WormholeRacerProps {
  onGameOver: (score: number) => void;
}

export default function WormholeRacer({ onGameOver }: WormholeRacerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const isMobile = useIsMobile();
  const touchKeysRef = useRef<Record<string, boolean>>({});

  const stateRef = useRef({
    playerX: 400,
    playerVX: 0,
    distance: 0,
    speed: 3,
    gameOver: false,
    keys: {} as Record<string, boolean>,
    segments: [] as {
      centerX: number;
      width: number;
      y: number;
      hue: number;
    }[],
    colorOffset: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width;
    const H = canvas.height;
    const s = stateRef.current;
    s.playerX = W / 2;
    s.playerVX = 0;
    s.distance = 0;
    s.speed = 3;
    s.gameOver = false;

    s.segments = [];
    let cx = W / 2;
    for (let y = 0; y <= H + 60; y += 20) {
      cx += (Math.random() - 0.5) * 20;
      cx = Math.max(120, Math.min(W - 120, cx));
      s.segments.push({
        centerX: cx,
        width: 240 - (H - y) * 0.1,
        y,
        hue: (y * 2) % 360,
      });
    }

    const kd = (e: KeyboardEvent) => {
      s.keys[e.code] = true;
    };
    const ku = (e: KeyboardEvent) => {
      s.keys[e.code] = false;
    };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);

    let lastTime = performance.now();

    function loop(now: number) {
      const dt = Math.min((now - lastTime) / 16, 3);
      lastTime = now;
      if (s.gameOver) return;

      s.colorOffset = (s.colorOffset + 2 * dt) % 360;
      s.distance += s.speed * dt * 0.1;
      s.speed = 3 + s.distance * 0.04;
      const scrollSpeed = s.speed;

      const allKeys = { ...s.keys, ...touchKeysRef.current };
      const left = allKeys.ArrowLeft || allKeys.KeyA || allKeys.TouchLeft;
      const right = allKeys.ArrowRight || allKeys.KeyD || allKeys.TouchRight;
      if (left) s.playerVX -= 0.7 * dt;
      if (right) s.playerVX += 0.7 * dt;
      s.playerVX *= 0.88;
      s.playerX += s.playerVX * dt;
      s.playerX = Math.max(0, Math.min(W, s.playerX));

      for (const seg of s.segments) seg.y += scrollSpeed * dt;
      s.segments = s.segments.filter((seg) => seg.y < H + 80);
      while (s.segments.length < Math.ceil(H / 20) + 5) {
        const sortedByY = [...s.segments].sort((a, b) => a.y - b.y);
        const lastY = sortedByY.length > 0 ? sortedByY[0].y : 0;
        const prevCX = sortedByY[0]?.centerX ?? W / 2;
        const newCX = Math.max(
          100,
          Math.min(W - 100, prevCX + (Math.random() - 0.5) * 30),
        );
        const newWidth = Math.max(
          90,
          240 - s.distance * 0.5 - Math.random() * 30,
        );
        s.segments.unshift({
          centerX: newCX,
          width: newWidth,
          y: lastY - 20,
          hue: (s.colorOffset + lastY * 0.5) % 360,
        });
      }

      ctx.fillStyle = "#000010";
      ctx.fillRect(0, 0, W, H);
      const sortedSegs = [...s.segments].sort((a, b) => a.y - b.y);
      for (let i = 0; i < sortedSegs.length - 1; i++) {
        const seg = sortedSegs[i];
        const next = sortedSegs[i + 1];
        const hue = (seg.hue + s.colorOffset) % 360;
        ctx.beginPath();
        ctx.moveTo(0, seg.y);
        ctx.lineTo(seg.centerX - seg.width / 2, seg.y);
        ctx.lineTo(next.centerX - next.width / 2, next.y);
        ctx.lineTo(0, next.y);
        ctx.closePath();
        ctx.fillStyle = `hsl(${hue},80%,8%)`;
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(W, seg.y);
        ctx.lineTo(seg.centerX + seg.width / 2, seg.y);
        ctx.lineTo(next.centerX + next.width / 2, next.y);
        ctx.lineTo(W, next.y);
        ctx.closePath();
        ctx.fillStyle = `hsl(${(hue + 60) % 360},80%,8%)`;
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(seg.centerX - seg.width / 2, seg.y);
        ctx.lineTo(next.centerX - next.width / 2, next.y);
        ctx.strokeStyle = `hsla(${hue},100%,70%,0.8)`;
        ctx.lineWidth = 2;
        ctx.shadowColor = `hsl(${hue},100%,60%)`;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(seg.centerX + seg.width / 2, seg.y);
        ctx.lineTo(next.centerX + next.width / 2, next.y);
        ctx.strokeStyle = `hsla(${(hue + 120) % 360},100%,70%,0.8)`;
        ctx.shadowColor = `hsl(${(hue + 120) % 360},100%,60%)`;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = "rgba(255,255,255,0.15)";
      for (let i = 0; i < 40; i++) {
        const sx = (i * 173 + s.distance * 8) % W;
        const sy = (i * 97 + s.distance * 11) % H;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      const playerY = H - 60;
      ctx.beginPath();
      ctx.moveTo(s.playerX, playerY - 12);
      ctx.lineTo(s.playerX - 8, playerY + 8);
      ctx.lineTo(s.playerX, playerY + 3);
      ctx.lineTo(s.playerX + 8, playerY + 8);
      ctx.closePath();
      const playerHue = (s.colorOffset * 2) % 360;
      ctx.fillStyle = `hsl(${playerHue},100%,70%)`;
      ctx.shadowColor = `hsl(${playerHue},100%,80%)`;
      ctx.shadowBlur = 16;
      ctx.fill();
      ctx.shadowBlur = 0;

      const nearest = sortedSegs.reduce(
        (best, seg) =>
          Math.abs(seg.y - playerY) < Math.abs(best.y - playerY) ? seg : best,
        sortedSegs[0],
      );
      if (nearest) {
        const leftWall = nearest.centerX - nearest.width / 2;
        const rightWall = nearest.centerX + nearest.width / 2;
        if (s.playerX - 8 < leftWall || s.playerX + 8 > rightWall) {
          s.gameOver = true;
          onGameOver(Math.floor(s.distance));
          return;
        }
      }

      ctx.fillStyle = "#E0E8FF";
      ctx.font = "bold 14px 'Plus Jakarta Sans', monospace";
      ctx.fillText(`🚀 Distance: ${Math.floor(s.distance)}`, 14, 28);
      ctx.fillStyle = "#FFAA00";
      ctx.font = "12px monospace";
      ctx.fillText(`Speed: ${s.speed.toFixed(1)}x`, 14, 48);

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
    };
  }, [onGameOver]);

  const btnStyle: React.CSSProperties = {
    width: 80,
    height: 64,
    borderRadius: 12,
    background: "rgba(0,0,0,0.5)",
    border: "2px solid rgba(160,50,255,0.5)",
    color: "#BB88FF",
    fontSize: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    userSelect: "none",
    WebkitUserSelect: "none",
    touchAction: "none",
    backdropFilter: "blur(6px)",
  };

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
          border: "2px solid rgba(160,50,255,0.5)",
          borderRadius: 8,
          boxShadow: "0 0 28px rgba(160,50,255,0.25)",
          maxWidth: "100%",
          touchAction: "none",
        }}
      />
      {isMobile ? (
        <div style={{ display: "flex", gap: 24 }}>
          <button
            type="button"
            style={btnStyle}
            onTouchStart={() => {
              touchKeysRef.current.TouchLeft = true;
            }}
            onTouchEnd={() => {
              touchKeysRef.current.TouchLeft = false;
            }}
            onMouseDown={() => {
              touchKeysRef.current.TouchLeft = true;
            }}
            onMouseUp={() => {
              touchKeysRef.current.TouchLeft = false;
            }}
          >
            ◀
          </button>
          <button
            type="button"
            style={btnStyle}
            onTouchStart={() => {
              touchKeysRef.current.TouchRight = true;
            }}
            onTouchEnd={() => {
              touchKeysRef.current.TouchRight = false;
            }}
            onMouseDown={() => {
              touchKeysRef.current.TouchRight = true;
            }}
            onMouseUp={() => {
              touchKeysRef.current.TouchRight = false;
            }}
          >
            ▶
          </button>
        </div>
      ) : (
        <p style={{ color: "#8899BB", fontSize: 12 }}>
          ←/→ or A/D to steer — avoid the walls — speed increases over time!
        </p>
      )}
    </div>
  );
}
