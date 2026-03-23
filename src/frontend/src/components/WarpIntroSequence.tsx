import { useEffect, useRef, useState } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinklePhase: number;
  twinkleSpeed: number;
  streakFactor: number;
}

interface WarpIntroSequenceProps {
  onComplete: () => void;
}

export function WarpIntroSequence({ onComplete }: WarpIntroSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const canSkipRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const completedRef = useRef(false);
  const completeRef = useRef<() => void>(() => {});
  const [showSkip, setShowSkip] = useState(false);
  const [canvasOpacity, setCanvasOpacity] = useState(1);

  const complete = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    cancelAnimationFrame(rafRef.current);
    // cleanup audio
    try {
      osc1Ref.current?.stop();
      osc2Ref.current?.stop();
      audioCtxRef.current?.close();
    } catch (_) {}
    onComplete();
  };
  completeRef.current = complete;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize canvas to viewport
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Generate stars
    const stars: Star[] = [];
    for (let i = 0; i < 800; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 1.5 + 0.3,
        opacity: Math.random() * 0.8 + 0.2,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 2 + 0.5,
        streakFactor: 0,
      });
    }
    starsRef.current = stars;

    // Audio setup
    try {
      const audioCtx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      audioCtxRef.current = audioCtx;

      const masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);
      gainNodeRef.current = masterGain;

      // Sub-bass oscillator
      const osc1 = audioCtx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(40, audioCtx.currentTime);
      const osc1Gain = audioCtx.createGain();
      osc1Gain.gain.setValueAtTime(0, audioCtx.currentTime);
      osc1Gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 2);
      osc1.connect(osc1Gain);
      osc1Gain.connect(masterGain);
      osc1.start();
      osc1Ref.current = osc1;
      masterGain.gain.setValueAtTime(1, audioCtx.currentTime);

      // At 2s: second oscillator + rumble increase
      setTimeout(() => {
        if (completedRef.current) return;
        try {
          const osc2 = audioCtx.createOscillator();
          osc2.type = "sine";
          osc2.frequency.setValueAtTime(80, audioCtx.currentTime);
          // slight frequency modulation for texture
          osc2.frequency.setValueAtTime(82, audioCtx.currentTime + 0.5);
          osc2.frequency.setValueAtTime(78, audioCtx.currentTime + 1.0);
          osc2.frequency.setValueAtTime(81, audioCtx.currentTime + 1.5);
          const osc2Gain = audioCtx.createGain();
          osc2Gain.gain.setValueAtTime(0, audioCtx.currentTime);
          osc2Gain.gain.linearRampToValueAtTime(
            0.2,
            audioCtx.currentTime + 0.5,
          );
          osc2.connect(osc2Gain);
          osc2Gain.connect(masterGain);
          osc2.start();
          osc2Ref.current = osc2;
          osc1Gain.gain.linearRampToValueAtTime(
            0.5,
            audioCtx.currentTime + 0.5,
          );
        } catch (_) {}
      }, 2000);

      // At 4s: sharp transient crack then silence
      setTimeout(() => {
        if (completedRef.current) return;
        try {
          const crackBuffer = audioCtx.createBuffer(
            1,
            audioCtx.sampleRate * 0.3,
            audioCtx.sampleRate,
          );
          const data = crackBuffer.getChannelData(0);
          for (let i = 0; i < data.length; i++) {
            data[i] =
              (Math.random() * 2 - 1) *
              Math.exp(-i / (audioCtx.sampleRate * 0.05));
          }
          const crackSource = audioCtx.createBufferSource();
          crackSource.buffer = crackBuffer;
          const crackGain = audioCtx.createGain();
          crackGain.gain.setValueAtTime(1.0, audioCtx.currentTime);
          crackGain.gain.exponentialRampToValueAtTime(
            0.001,
            audioCtx.currentTime + 0.3,
          );
          crackSource.connect(crackGain);
          crackGain.connect(masterGain);
          crackSource.start();
          // Fade all out
          masterGain.gain.setValueAtTime(1, audioCtx.currentTime);
          masterGain.gain.linearRampToValueAtTime(
            0,
            audioCtx.currentTime + 1.5,
          );
        } catch (_) {}
      }, 4000);
    } catch (_) {}

    startTimeRef.current = performance.now();

    // Allow skip after 1s
    const skipTimer = setTimeout(() => {
      canSkipRef.current = true;
    }, 1000);
    const skipTextTimer = setTimeout(() => {
      setShowSkip(true);
    }, 1500);

    const DURATION = 6000;

    const draw = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      // Clear
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

      // ─── Phase 1: 0–2s, Stars fade in ───────────────────────────────────
      const phase1Progress = Math.min(elapsed / 2000, 1); // 0..1 in first 2s

      // ─── Phase 2: 2–4s, Warp tear ───────────────────────────────────────
      const phase2Progress =
        elapsed > 2000 ? Math.min((elapsed - 2000) / 2000, 1) : 0;

      // ─── Phase 3: 4–6s, Bloom reveal ────────────────────────────────────
      const phase3Progress =
        elapsed > 4000 ? Math.min((elapsed - 4000) / 2000, 1) : 0;

      // Update star streak factors based on phase2
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        // Gravity pull: stars near center streak more
        const dx = star.x - cx;
        const dy = star.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = Math.sqrt(cx * cx + cy * cy);
        const proximity = 1 - dist / maxDist; // closer = more
        star.streakFactor = phase2Progress * proximity * 3;
      }

      // Draw stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        const twinkle =
          0.7 +
          0.3 * Math.sin(now * 0.001 * star.twinkleSpeed + star.twinklePhase);
        const starOpacity =
          phase1Progress * star.opacity * twinkle * (1 - phase3Progress * 0.5);

        if (star.streakFactor > 0.05) {
          // Elongated streak toward center
          const dx = cx - star.x;
          const dy = cy - star.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const nx = dx / len;
          const ny = dy / len;
          const streakLen = star.streakFactor * 40;

          const grad = ctx.createLinearGradient(
            star.x,
            star.y,
            star.x + nx * streakLen,
            star.y + ny * streakLen,
          );
          grad.addColorStop(0, `rgba(255,255,255,${starOpacity})`);
          grad.addColorStop(1, "rgba(255,255,255,0)");

          ctx.beginPath();
          ctx.strokeStyle = grad as any;
          ctx.lineWidth = star.size * (1 + star.streakFactor);
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(star.x + nx * streakLen, star.y + ny * streakLen);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${starOpacity})`;
          ctx.fill();
        }
      }

      // ─── Phase 2: Gravitational lensing rings ───────────────────────────
      if (phase2Progress > 0) {
        const numRings = 8;
        const maxRadius = Math.sqrt(cx * cx + cy * cy) * 0.9;

        // Chromatic aberration offset
        const aberrationOffset = phase2Progress * 6;

        for (let r = 0; r < numRings; r++) {
          const ringProgress = (r / numRings + phase2Progress * 1.5) % 1;
          const radius = ringProgress * maxRadius;
          const ringOpacity = (1 - ringProgress) * phase2Progress * 0.6;

          if (ringOpacity <= 0) continue;

          // Red channel
          ctx.beginPath();
          ctx.ellipse(
            cx - aberrationOffset,
            cy,
            radius * 1.05,
            radius * 0.5,
            0,
            0,
            Math.PI * 2,
          );
          ctx.strokeStyle = `rgba(255,80,80,${ringOpacity * 0.6})`;
          ctx.lineWidth = 1.5;
          ctx.shadowBlur = 8;
          ctx.shadowColor = "rgba(255,80,80,0.4)";
          ctx.stroke();

          // Green channel (center)
          ctx.beginPath();
          ctx.ellipse(cx, cy, radius * 1.02, radius * 0.48, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(200,255,200,${ringOpacity * 0.5})`;
          ctx.lineWidth = 2;
          ctx.shadowBlur = 12;
          ctx.shadowColor = "rgba(200,255,200,0.3)";
          ctx.stroke();

          // Blue channel
          ctx.beginPath();
          ctx.ellipse(
            cx + aberrationOffset,
            cy,
            radius,
            radius * 0.46,
            0,
            0,
            Math.PI * 2,
          );
          ctx.strokeStyle = `rgba(100,180,255,${ringOpacity * 0.7})`;
          ctx.lineWidth = 1.5;
          ctx.shadowBlur = 10;
          ctx.shadowColor = "rgba(100,180,255,0.4)";
          ctx.stroke();
        }
        ctx.shadowBlur = 0;

        // Center glow building up
        const glowRadius = phase2Progress * 120;
        const glowGrad = ctx.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          glowRadius,
        );
        glowGrad.addColorStop(0, `rgba(220,240,255,${phase2Progress * 0.9})`);
        glowGrad.addColorStop(0.3, `rgba(150,200,255,${phase2Progress * 0.4})`);
        glowGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, w, h);

        // The "tear" – expanding horizontal slit
        const tearWidth = phase2Progress * phase2Progress * w * 0.8;
        const tearHeight = Math.max(2, phase2Progress * 12);
        ctx.save();
        ctx.shadowBlur = 30;
        ctx.shadowColor = "rgba(200,230,255,0.9)";
        const tearGrad = ctx.createLinearGradient(
          cx - tearWidth / 2,
          cy,
          cx + tearWidth / 2,
          cy,
        );
        tearGrad.addColorStop(0, "rgba(0,0,0,0)");
        tearGrad.addColorStop(0.1, `rgba(255,255,255,${phase2Progress * 0.8})`);
        tearGrad.addColorStop(0.5, `rgba(220,240,255,${phase2Progress})`);
        tearGrad.addColorStop(0.9, `rgba(255,255,255,${phase2Progress * 0.8})`);
        tearGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = tearGrad;
        ctx.fillRect(
          cx - tearWidth / 2,
          cy - tearHeight / 2,
          tearWidth,
          tearHeight,
        );
        ctx.restore();
      }

      // ─── Phase 3: Bloom flash reveal ────────────────────────────────────
      if (phase3Progress > 0) {
        const bloomRadius = phase3Progress * Math.sqrt(cx * cx + cy * cy) * 2.5;
        const bloomGrad = ctx.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          bloomRadius,
        );
        const bloomAlpha =
          phase3Progress < 0.3
            ? phase3Progress / 0.3 // fast flash in
            : 1 - (phase3Progress - 0.3) / 0.7; // slow fade out
        bloomGrad.addColorStop(0, `rgba(255,255,255,${bloomAlpha})`);
        bloomGrad.addColorStop(0.2, `rgba(200,230,255,${bloomAlpha * 0.8})`);
        bloomGrad.addColorStop(0.6, `rgba(100,150,255,${bloomAlpha * 0.3})`);
        bloomGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = bloomGrad;
        ctx.fillRect(0, 0, w, h);

        // Fade overall canvas opacity to reveal solar system
        const fadeOpacity = 1 - phase3Progress;
        setCanvasOpacity(fadeOpacity);
      }

      if (elapsed >= DURATION) {
        completeRef.current();
        return;
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      clearTimeout(skipTimer);
      clearTimeout(skipTextTimer);
    };
  }, []);

  const handleClick = () => {
    if (canSkipRef.current) {
      completeRef.current();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === " " || e.key === "Enter") handleClick();
      }}
      tabIndex={0}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 9999,
        cursor: canSkipRef.current ? "pointer" : "default",
        opacity: canvasOpacity,
        transition: "opacity 0.1s linear",
      }}
      data-ocid="warp_intro.canvas_target"
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
        }}
      />
      {showSkip && (
        <div
          style={{
            position: "absolute",
            bottom: "2rem",
            right: "2rem",
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: "0.75rem",
            letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.4)",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          TAP TO SKIP
        </div>
      )}
    </button>
  );
}
