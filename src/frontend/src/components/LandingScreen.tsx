import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

// ── Types ──────────────────────────────────────────────────────────────────
interface NavCard {
  id: string;
  label: string;
  sublabel: string;
  icon: string;
  color: string;
  glow: string;
  ocid: string;
}

const NAV_CARDS: NavCard[] = [
  {
    id: "multiverse",
    label: "Multiverse",
    sublabel: "6 alternate universes",
    icon: "∞",
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.5)",
    ocid: "landing.multiverse.button",
  },
  {
    id: "arcade",
    label: "Game Arcade",
    sublabel: "10 unique space games",
    icon: "🕹️",
    color: "#22d3ee",
    glow: "rgba(34,211,238,0.5)",
    ocid: "landing.arcade.button",
  },
  {
    id: "missions",
    label: "Space Missions",
    sublabel: "Cinematic mission control",
    icon: "🚀",
    color: "#fb923c",
    glow: "rgba(251,146,60,0.5)",
    ocid: "landing.missions.button",
  },
  {
    id: "leaderboard",
    label: "Leaderboard",
    sublabel: "Top Nova Credits earners",
    icon: "🏆",
    color: "#4ade80",
    glow: "rgba(74,222,128,0.5)",
    ocid: "landing.leaderboard.button",
  },
  {
    id: "dailytasks",
    label: "Daily Tasks",
    sublabel: "Earn Nova Credits daily",
    icon: "📋",
    color: "#2dd4bf",
    glow: "rgba(45,212,191,0.5)",
    ocid: "landing.dailytasks.button",
  },
];

const FEATURED_IDX = new Date().getDay() % NAV_CARDS.length;

// ── Parallax Background ────────────────────────────────────────────────────
interface ParallaxState {
  x: number;
  y: number;
}

interface StarData {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  twinkleOffset: number;
  twinkleSpeed: number;
  layer: number;
  colorIdx: number;
}

const LAYER_PARALLAX = [0.008, 0.018, 0.038];
const STAR_COLORS = [
  (a: number) => `rgba(200,215,255,${a})`,
  (a: number) => `rgba(140,190,255,${a})`,
  (a: number) => `rgba(255,230,160,${a})`,
  (a: number) => `rgba(180,255,240,${a})`,
];

function ParallaxBackground({ parallax }: { parallax: ParallaxState }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<StarData[]>([]);
  const rafRef = useRef<number>(0);
  const parallaxRef = useRef(parallax);

  useEffect(() => {
    parallaxRef.current = parallax;
  }, [parallax]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const counts = [200, 150, 60];
    starsRef.current = counts.flatMap((count, layer) =>
      Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r:
          layer === 0
            ? Math.random() * 0.9 + 0.2
            : layer === 1
              ? Math.random() * 1.3 + 0.4
              : Math.random() * 2.2 + 0.8,
        baseAlpha:
          layer === 0
            ? Math.random() * 0.4 + 0.1
            : layer === 1
              ? Math.random() * 0.55 + 0.15
              : Math.random() * 0.7 + 0.25,
        twinkleOffset: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.5 + 0.2,
        layer,
        colorIdx: Math.floor(Math.random() * STAR_COLORS.length),
      })),
    );

    let t = 0;
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      t += 0.006;

      const px = parallaxRef.current.x;
      const py = parallaxRef.current.y;

      for (const s of starsRef.current) {
        const twinkle =
          0.45 + 0.55 * Math.sin(t * s.twinkleSpeed * 8 + s.twinkleOffset);
        const alpha = s.baseAlpha * twinkle;
        const mult = LAYER_PARALLAX[s.layer];
        const sx = s.x + px * mult;
        const sy = s.y + py * mult;

        ctx.beginPath();
        ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
        ctx.fillStyle = STAR_COLORS[s.colorIdx](alpha);
        ctx.fill();

        if (s.r > 1.4 && twinkle > 0.65) {
          const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.r * 3.5);
          grad.addColorStop(0, STAR_COLORS[s.colorIdx](alpha * 0.45));
          grad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.beginPath();
          ctx.arc(sx, sy, s.r * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    }
    rafRef.current = requestAnimationFrame(draw);

    function onResize() {
      if (!canvas) return;
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
      for (const s of starsRef.current) {
        s.x = Math.random() * W;
        s.y = Math.random() * H;
      }
    }
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

// ── Nebula Layers ──────────────────────────────────────────────────────────
function NebulaLayers({ parallax }: { parallax: ParallaxState }) {
  const blobs = [
    {
      top: "-15%",
      left: "-10%",
      bottom: "auto",
      right: "auto",
      w: "55%",
      h: "55%",
      color: "rgba(90,40,180,0.16)",
      dur: 18,
      delay: 0,
      px: 0.015,
      py: 0.012,
    },
    {
      top: "auto",
      left: "auto",
      bottom: "-20%",
      right: "-12%",
      w: "60%",
      h: "60%",
      color: "rgba(10,70,160,0.13)",
      dur: 22,
      delay: -6,
      px: -0.02,
      py: -0.015,
    },
    {
      top: "20%",
      left: "40%",
      bottom: "auto",
      right: "auto",
      w: "50%",
      h: "40%",
      color: "rgba(0,180,140,0.08)",
      dur: 26,
      delay: -12,
      px: 0.01,
      py: 0.02,
    },
    {
      top: "55%",
      left: "-5%",
      bottom: "auto",
      right: "auto",
      w: "35%",
      h: "35%",
      color: "rgba(160,40,220,0.07)",
      dur: 20,
      delay: -4,
      px: -0.012,
      py: 0.01,
    },
  ];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {blobs.map((b, i) => (
        <div
          key={b.color}
          style={{
            position: "absolute",
            top: b.top,
            left: b.left,
            bottom: b.bottom,
            right: b.right,
            width: b.w,
            height: b.h,
            background: `radial-gradient(ellipse, ${b.color} 0%, transparent 68%)`,
            transform: `translate(${parallax.x * b.px}px, ${parallax.y * b.py}px)`,
            transition: "transform 0.8s ease-out",
            animation: `nebula-drift-${i % 2 === 0 ? "a" : "b"} ${b.dur}s ease-in-out ${b.delay}s infinite alternate`,
          }}
        />
      ))}
      {(
        [
          {
            id: "r1",
            sz: "min(65vw,65vh)",
            clr: "rgba(100,180,255,0.04)",
            dur: "8s",
            delay: "0s",
          },
          {
            id: "r2",
            sz: "min(82vw,82vh)",
            clr: "rgba(167,139,250,0.03)",
            dur: "12s",
            delay: "-3s",
          },
          {
            id: "r3",
            sz: "min(100vw,100vh)",
            clr: "rgba(0,255,200,0.02)",
            dur: "16s",
            delay: "-7s",
          },
        ] as const
      ).map(({ id, sz, clr, dur, delay }, i) => (
        <div
          key={id}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: sz,
            height: sz,
            borderRadius: "50%",
            border: `1px solid ${clr}`,
            transform: "translate(-50%,-50%)",
            animation: `nebula-pulse ${dur} ease-in-out ${delay} infinite ${i % 2 ? "reverse" : ""}`,
            pointerEvents: "none",
          }}
        />
      ))}
    </div>
  );
}

// ── Holographic Ring + Title ───────────────────────────────────────────────
function HolographicEmblem() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.1, ease: "easeOut" }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
      }}
    >
      <div
        style={{
          position: "relative",
          width: 88,
          height: 88,
          perspective: "400px",
        }}
      >
        {/* Outer conic ring */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background:
              "conic-gradient(from 0deg, #22d3ee, #a78bfa, #F6C35B, #22d3ee)",
            animation: "ring-spin 8s linear infinite",
            padding: 2,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: "#03070f",
            }}
          />
        </div>
        {/* Inner reverse ring */}
        <div
          style={{
            position: "absolute",
            inset: 14,
            borderRadius: "50%",
            background:
              "conic-gradient(from 180deg, #fb923c, #F6C35B, #fb923c)",
            animation: "ring-spin 5s linear infinite reverse",
            padding: 1.5,
            boxShadow: "0 0 14px rgba(246,195,91,0.35)",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: "#03070f",
            }}
          />
        </div>
        {/* Center emblem */}
        <div
          style={{
            position: "absolute",
            inset: 28,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(60,120,220,0.3) 0%, rgba(3,7,15,0.9) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            color: "rgba(180,230,255,0.85)",
            boxShadow: "inset 0 0 14px rgba(34,211,238,0.25)",
          }}
        >
          ✦
        </div>
        {/* Dashed orbit */}
        <div
          style={{
            position: "absolute",
            inset: -5,
            borderRadius: "50%",
            border: "1px dashed rgba(34,211,238,0.18)",
            animation: "ring-spin 22s linear infinite",
          }}
        />
      </div>

      <div style={{ textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, letterSpacing: "0.7em" }}
          animate={{ opacity: 0.65, letterSpacing: "0.38em" }}
          transition={{ delay: 0.4, duration: 0.9 }}
          style={{
            fontSize: "clamp(9px, 1.4vw, 11px)",
            color: "#F6C35B",
            textTransform: "uppercase",
            fontWeight: 600,
            fontFamily: "'Courier New', monospace",
            marginBottom: 10,
          }}
        >
          ▸ Interactive Universe Simulation
        </motion.div>

        <div style={{ position: "relative", display: "inline-block" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(1.7rem, 5.5vw, 3.5rem)",
              fontWeight: 900,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              lineHeight: 1.05,
              color: "#E9EEF5",
              fontFamily: "'Courier New', monospace",
              textShadow:
                "0 0 40px rgba(246,195,91,0.2), 0 0 80px rgba(100,60,200,0.12)",
            }}
          >
            Multi-verse of{" "}
            <span
              style={{
                color: "#F6C35B",
                textShadow:
                  "0 0 24px rgba(246,195,91,0.9), 0 0 60px rgba(246,195,91,0.35)",
              }}
            >
              Madness
            </span>
          </h1>
          {/* Scanline overlay on title */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(0,0,0,0.065) 0px, rgba(0,0,0,0.065) 1px, transparent 1px, transparent 3px)",
            }}
          />
        </div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.8, duration: 0.9 }}
          style={{
            width: 200,
            height: 1,
            margin: "14px auto 0",
            background:
              "linear-gradient(90deg, transparent, rgba(246,195,91,0.75), transparent)",
          }}
        />
      </div>
    </motion.div>
  );
}

// ── Live HUD Status Bar ────────────────────────────────────────────────────
interface StatusBarProps {
  isLoggedIn: boolean;
  novaCredits: number;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
  onOpenShop?: () => void;
  onToggleMute?: () => void;
  isMuted?: boolean;
  onOpenAchievements?: () => void;
  rank?: string;
}

function LiveStatusBar({
  isLoggedIn,
  novaCredits,
  isAdmin,
  onOpenAdmin,
  onOpenShop,
  onToggleMute,
  isMuted,
  onOpenAchievements,
  rank,
}: StatusBarProps) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1200);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 30,
        paddingTop: "env(safe-area-inset-top)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        height: 36,
        background: "rgba(0,12,28,0.82)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(0,255,200,0.15)",
        boxShadow: "0 1px 18px rgba(0,0,0,0.55)",
        fontFamily: "'Courier New', monospace",
      }}
    >
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            color: "rgba(0,255,200,0.5)",
            fontSize: 9,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          SOL SYSTEM ◆ ORION ARM
        </span>
        {rank && (
          <span
            style={{
              color: "#F6C35B",
              fontSize: 9,
              letterSpacing: "0.12em",
              opacity: 0.8,
              borderLeft: "1px solid rgba(246,195,91,0.2)",
              paddingLeft: 8,
              whiteSpace: "nowrap",
            }}
          >
            ▸ {rank}
          </span>
        )}
      </div>

      {/* Center */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: tick % 2 === 0 ? "#4ade80" : "#22cc6a",
            boxShadow: `0 0 ${tick % 2 === 0 ? 8 : 4}px rgba(74,222,128,0.9)`,
            transition: "box-shadow 0.4s",
          }}
        />
        <span
          style={{
            color: "rgba(74,222,128,0.75)",
            fontSize: 9,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          SYSTEM ONLINE
        </span>
        {isLoggedIn && (
          <span
            style={{
              marginLeft: 4,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: tick % 2 === 0 ? "#fb923c" : "#e07020",
                boxShadow: `0 0 ${tick % 2 === 0 ? 7 : 3}px rgba(251,146,60,0.9)`,
                transition: "box-shadow 0.4s",
              }}
            />
            <span
              style={{
                color: "rgba(251,146,60,0.65)",
                fontSize: 8,
                letterSpacing: "0.1em",
              }}
            >
              DAILY LIVE
            </span>
          </span>
        )}
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {isLoggedIn && onOpenShop && (
          <button
            type="button"
            data-ocid="landing.shop.button"
            onClick={onOpenShop}
            style={{
              padding: "3px 10px",
              background: "rgba(246,195,91,0.1)",
              border: "1px solid rgba(246,195,91,0.3)",
              borderRadius: 3,
              color: "#F6C35B",
              fontSize: 9,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.1em",
              fontFamily: "'Courier New', monospace",
              minHeight: 24,
              whiteSpace: "nowrap",
            }}
          >
            ⭐ {novaCredits}
          </button>
        )}
        {isLoggedIn && isAdmin && onOpenAdmin && (
          <button
            type="button"
            data-ocid="landing.admin.button"
            onClick={onOpenAdmin}
            style={{
              padding: "3px 10px",
              background: "rgba(255,80,80,0.1)",
              border: "1px solid rgba(255,80,80,0.3)",
              borderRadius: 3,
              color: "#ff6b6b",
              fontSize: 9,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.08em",
              fontFamily: "'Courier New', monospace",
              minHeight: 24,
            }}
          >
            ⚙ ADMIN
          </button>
        )}
        {isLoggedIn && onOpenAchievements && (
          <button
            type="button"
            data-ocid="landing.achievements.button"
            onClick={onOpenAchievements}
            style={{
              width: 24,
              height: 24,
              borderRadius: 3,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#8899BB",
              fontSize: 12,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            🏅
          </button>
        )}
        {onToggleMute && (
          <button
            type="button"
            data-ocid="landing.mute.toggle"
            onClick={onToggleMute}
            style={{
              width: 24,
              height: 24,
              borderRadius: 3,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#8899BB",
              fontSize: 11,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Hexagonal Card ─────────────────────────────────────────────────────────
const HEX_CLIP =
  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";

interface HexCardProps {
  card: NavCard;
  index: number;
  isFeatured: boolean;
  onClick: () => void;
}

function HexCard({ card, index, isFeatured, onClick }: HexCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.1, duration: 0.5, ease: "easeOut" }}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {isFeatured && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
          style={{
            position: "absolute",
            top: -12,
            right: "5%",
            zIndex: 5,
            background: "linear-gradient(135deg, #F6C35B, #fb923c)",
            color: "#0a0e18",
            fontSize: 7,
            fontWeight: 900,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "3px 7px",
            borderRadius: 3,
            fontFamily: "'Courier New', monospace",
            boxShadow: "0 0 14px rgba(246,195,91,0.7)",
            whiteSpace: "nowrap",
          }}
        >
          ★ FEATURED TODAY
        </motion.div>
      )}

      <motion.div
        animate={{
          filter: hovered
            ? `drop-shadow(0 0 16px ${card.color}) drop-shadow(0 0 32px ${card.glow})`
            : "drop-shadow(0 0 6px rgba(0,0,0,0.6))",
          scale: isFeatured ? (hovered ? 1.15 : 1.1) : hovered ? 1.05 : 1,
        }}
        transition={{ duration: 0.28 }}
        style={{ clipPath: HEX_CLIP, width: "100%", aspectRatio: "1 / 0.866" }}
      >
        <button
          type="button"
          data-ocid={card.ocid}
          onClick={onClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
          style={{
            width: "100%",
            height: "100%",
            background: hovered
              ? `linear-gradient(145deg, rgba(${hexToRgb(card.color)},0.22) 0%, rgba(5,10,20,0.85) 100%)`
              : `linear-gradient(145deg, rgba(${hexToRgb(card.color)},0.07) 0%, rgba(3,7,15,0.92) 100%)`,
            border: `2px solid ${hovered ? `${card.color}cc` : `${card.color}30`}`,
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "22% 12%",
            outline: "none",
            fontFamily: "'Courier New', monospace",
            touchAction: "manipulation",
            transition: "background 0.25s, border-color 0.25s",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <motion.div
            animate={hovered ? { scale: 1.18, y: -2 } : { scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{ fontSize: "clamp(20px, 3.2vw, 28px)", lineHeight: 1 }}
          >
            {card.icon}
          </motion.div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "clamp(7px, 1.2vw, 10px)",
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: hovered ? card.color : "#B8C8D8",
                transition: "color 0.25s",
                marginBottom: 2,
              }}
            >
              {card.label}
            </div>
            <div
              style={{
                fontSize: "clamp(6px, 1vw, 8px)",
                color: "rgba(180,200,218,0.4)",
                letterSpacing: "0.04em",
              }}
            >
              {card.sublabel}
            </div>
          </div>
        </button>
      </motion.div>

      <div
        style={{
          marginTop: 5,
          fontSize: 7,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          fontFamily: "'Courier New', monospace",
          fontWeight: 700,
          color: hovered ? card.color : "rgba(180,200,218,0.35)",
          transition: "color 0.25s",
        }}
      >
        {card.id === "arcade"
          ? "ARCADE"
          : card.id === "multiverse"
            ? "MULTI"
            : card.id === "missions"
              ? "MISSIONS"
              : card.id === "leaderboard"
                ? "RANKS"
                : "TASKS"}
      </div>
    </motion.div>
  );
}

// ── Hex Grid (Honeycomb Layout) ────────────────────────────────────────────
function HexGrid({ onNavigate }: { onNavigate: (id: string) => void }) {
  const row1 = NAV_CARDS.slice(0, 3);
  const row2 = NAV_CARDS.slice(3);

  return (
    <div style={{ width: "100%", maxWidth: 760, margin: "0 auto" }}>
      {/* Desktop: 3-2 honeycomb */}
      <div
        className="hex-desktop-grid"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "clamp(4px, 1.2vw, 10px)",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "clamp(8px, 2vw, 20px)",
            width: "100%",
            justifyContent: "center",
          }}
        >
          {row1.map((card, i) => (
            <div
              key={card.id}
              style={{ flex: "0 1 clamp(120px, 20vw, 190px)" }}
            >
              <HexCard
                card={card}
                index={i}
                isFeatured={i === FEATURED_IDX}
                onClick={() => onNavigate(card.id)}
              />
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            gap: "clamp(8px, 2vw, 20px)",
            width: "100%",
            justifyContent: "center",
            paddingLeft: "clamp(64px, 10.5vw, 105px)",
          }}
        >
          {row2.map((card, i) => (
            <div
              key={card.id}
              style={{ flex: "0 1 clamp(120px, 20vw, 190px)" }}
            >
              <HexCard
                card={card}
                index={i + 3}
                isFeatured={i + 3 === FEATURED_IDX}
                onClick={() => onNavigate(card.id)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: 2-column grid */}
      <div
        className="hex-mobile-grid"
        style={{
          display: "none",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 14,
          width: "100%",
        }}
      >
        {NAV_CARDS.map((card, i) => (
          <div key={card.id}>
            <HexCard
              card={card}
              index={i}
              isFeatured={i === FEATURED_IDX}
              onClick={() => onNavigate(card.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
interface LandingScreenProps {
  onNavigate: (dest: string) => void;
  isLoggedIn?: boolean;
  novaCredits?: number;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
  onOpenShop?: () => void;
  onOpenAudio?: () => void;
  onOpenAchievements?: () => void;
  onOpenDonate?: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  rank?: string;
}

export function LandingScreen({
  onNavigate,
  isLoggedIn,
  novaCredits = 0,
  isAdmin,
  onOpenAdmin,
  onOpenShop,
  onOpenAudio: _onOpenAudio,
  onOpenAchievements,
  onOpenDonate: _onOpenDonate,
  isMuted,
  onToggleMute,
  rank,
}: LandingScreenProps) {
  const { identity, login, loginStatus, clear } = useInternetIdentity();
  const effectivelyLoggedIn =
    isLoggedIn ?? !!(identity && !identity.getPrincipal().isAnonymous());
  const isLoggingIn = loginStatus === "logging-in";

  const [parallax, setParallax] = useState<ParallaxState>({ x: 0, y: 0 });
  const isMobileRef = useRef(
    typeof window !== "undefined" && window.innerWidth < 768,
  );
  const driftRef = useRef({ x: 0, y: 0, vx: 0.0003, vy: 0.00018 });
  const rafDriftRef = useRef<number>(0);

  // Desktop mouse parallax
  useEffect(() => {
    if (isMobileRef.current) return;
    function onMove(e: MouseEvent) {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      setParallax({ x: nx * 20, y: ny * 18 });
    }
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Mobile auto-drift
  useEffect(() => {
    if (!isMobileRef.current) return;
    function drift() {
      const d = driftRef.current;
      d.x += d.vx;
      d.y += d.vy;
      if (Math.abs(d.x) > 1) d.vx *= -1;
      if (Math.abs(d.y) > 1) d.vy *= -1;
      setParallax({ x: d.x * 14, y: d.y * 10 });
      rafDriftRef.current = requestAnimationFrame(drift);
    }
    rafDriftRef.current = requestAnimationFrame(drift);
    return () => cancelAnimationFrame(rafDriftRef.current);
  }, []);

  return (
    <div
      data-ocid="landing.page"
      style={{
        width: "100vw",
        height: "100dvh",
        background:
          "linear-gradient(180deg, #02040E 0%, #04091A 45%, #020810 100%)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Courier New', monospace",
      }}
    >
      <ParallaxBackground parallax={parallax} />
      <NebulaLayers parallax={parallax} />

      {/* HUD grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(0,255,200,0.011) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,200,0.011) 1px, transparent 1px)",
          backgroundSize: "55px 55px",
        }}
      />

      {/* Scanlines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          pointerEvents: "none",
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.028) 0px, rgba(0,0,0,0.028) 1px, transparent 1px, transparent 3px)",
        }}
      />

      <LiveStatusBar
        isLoggedIn={effectivelyLoggedIn}
        novaCredits={novaCredits}
        isAdmin={isAdmin}
        onOpenAdmin={onOpenAdmin}
        onOpenShop={onOpenShop}
        onToggleMute={onToggleMute}
        isMuted={isMuted}
        onOpenAchievements={onOpenAchievements}
        rank={rank}
      />

      {/* Main content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "clamp(18px, 3.5vh, 32px)",
          padding: "clamp(54px, 9vh, 76px) 16px clamp(56px, 9vh, 72px)",
          width: "100%",
          maxWidth: 920,
          boxSizing: "border-box",
        }}
      >
        <HolographicEmblem />
        <HexGrid onNavigate={onNavigate} />

        {/* Auth row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.95, duration: 0.6 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {!effectivelyLoggedIn ? (
            <motion.button
              type="button"
              data-ocid="landing.login.button"
              onClick={login}
              disabled={isLoggingIn}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: "11px 32px",
                background: isLoggingIn
                  ? "rgba(34,211,238,0.06)"
                  : "rgba(34,211,238,0.1)",
                border: "1px solid rgba(34,211,238,0.45)",
                borderRadius: 9999,
                color: "#22d3ee",
                fontSize: "clamp(10px, 1.4vw, 12px)",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: isLoggingIn ? "not-allowed" : "pointer",
                backdropFilter: "blur(10px)",
                boxShadow: "0 0 24px rgba(34,211,238,0.12)",
                fontFamily: "'Courier New', monospace",
                minHeight: 44,
                minWidth: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                touchAction: "manipulation",
              }}
            >
              {isLoggingIn ? (
                <>
                  <span
                    style={{
                      animation: "spin-slow 1s linear infinite",
                      display: "inline-block",
                    }}
                  >
                    ⟳
                  </span>{" "}
                  Connecting...
                </>
              ) : (
                "⚡ Connect Identity"
              )}
            </motion.button>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  padding: "8px 18px",
                  background: "rgba(74,222,128,0.07)",
                  border: "1px solid rgba(74,222,128,0.22)",
                  borderRadius: 9999,
                  color: "#4ade80",
                  fontSize: "clamp(9px, 1.3vw, 10px)",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "'Courier New', monospace",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#4ade80",
                    display: "inline-block",
                    boxShadow: "0 0 6px #4ade80",
                  }}
                />
                Identity Connected
              </div>
              <button
                type="button"
                data-ocid="landing.logout.button"
                onClick={clear}
                style={{
                  padding: "7px 14px",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 9999,
                  color: "rgba(200,212,224,0.4)",
                  fontSize: 9,
                  cursor: "pointer",
                  letterSpacing: "0.06em",
                  fontFamily: "'Courier New', monospace",
                  minHeight: 32,
                  touchAction: "manipulation",
                }}
              >
                Sign out
              </button>
            </div>
          )}
          <div
            style={{
              color: "rgba(200,212,224,0.28)",
              fontSize: 9,
              letterSpacing: "0.06em",
            }}
          >
            Powered by Internet Identity
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          padding: "10px 20px",
          paddingBottom: "max(10px, env(safe-area-inset-bottom))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(0,255,200,0.22)",
          fontSize: 9,
          letterSpacing: "0.05em",
          fontFamily: "'Courier New', monospace",
        }}
      >
        © {new Date().getFullYear()}. Built with ♥ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noreferrer"
          style={{
            color: "rgba(0,255,200,0.42)",
            textDecoration: "none",
            marginLeft: 4,
          }}
        >
          caffeine.ai
        </a>
      </div>

      <style>{`
        @keyframes nebula-drift-a {
          0%   { transform: translate(0,0) scale(1); }
          100% { transform: translate(5%,7%) scale(1.1); }
        }
        @keyframes nebula-drift-b {
          0%   { transform: translate(0,0) scale(1); }
          100% { transform: translate(-4%,-6%) scale(1.08); }
        }
        @keyframes nebula-pulse {
          0%,100% { opacity:1; transform:translate(-50%,-50%) scale(1); }
          50%      { opacity:0.3; transform:translate(-50%,-50%) scale(1.06); }
        }
        @keyframes ring-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @media (max-width: 640px) {
          .hex-desktop-grid { display: none !important; }
          .hex-mobile-grid  { display: grid !important; }
        }
      `}</style>
    </div>
  );
}

function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const r = Number.parseInt(h.substring(0, 2), 16);
  const g = Number.parseInt(h.substring(2, 4), 16);
  const b = Number.parseInt(h.substring(4, 6), 16);
  return `${r},${g},${b}`;
}
