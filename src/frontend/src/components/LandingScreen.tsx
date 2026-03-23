import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

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
    id: "solar",
    label: "Solar System",
    sublabel: "Explore 8 planets & beyond",
    icon: "☀️",
    color: "#F6C35B",
    glow: "rgba(246,195,91,0.35)",
    ocid: "landing.solar_system.button",
  },
  {
    id: "multiverse",
    label: "Multiverse",
    sublabel: "6 alternate universes",
    icon: "∞",
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.35)",
    ocid: "landing.multiverse.button",
  },
  {
    id: "arcade",
    label: "Game Arcade",
    sublabel: "5 unique space games",
    icon: "🕹️",
    color: "#22d3ee",
    glow: "rgba(34,211,238,0.35)",
    ocid: "landing.arcade.button",
  },
  {
    id: "missions",
    label: "Space Missions",
    sublabel: "Cinematic mission control",
    icon: "🚀",
    color: "#fb923c",
    glow: "rgba(251,146,60,0.35)",
    ocid: "landing.missions.button",
  },
  {
    id: "leaderboard",
    label: "Leaderboard",
    sublabel: "Top Nova Credits earners",
    icon: "🏆",
    color: "#4ade80",
    glow: "rgba(74,222,128,0.35)",
    ocid: "landing.leaderboard.button",
  },
];

interface Star {
  x: number;
  y: number;
  r: number;
  opacity: number;
  speed: number;
  twinkleOffset: number;
}

function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    // Generate stars
    starsRef.current = Array.from({ length: 320 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.2,
      opacity: Math.random() * 0.7 + 0.2,
      speed: Math.random() * 0.04 + 0.005,
      twinkleOffset: Math.random() * Math.PI * 2,
    }));

    let t = 0;
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      t += 0.012;
      for (const s of starsRef.current) {
        const twinkle =
          0.5 + 0.5 * Math.sin(t * s.speed * 60 + s.twinkleOffset);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,255,${s.opacity * twinkle})`;
        ctx.fill();
      }
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();

    function onResize() {
      if (!canvas) return;
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
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

interface LandingScreenProps {
  onNavigate: (dest: string) => void;
}

export function LandingScreen({ onNavigate }: LandingScreenProps) {
  const { identity, login, loginStatus } = useInternetIdentity();
  const isLoggedIn = !!(identity && !identity.getPrincipal().isAnonymous());
  const isLoggingIn = loginStatus === "logging-in";
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div
      data-ocid="landing.page"
      style={{
        width: "100vw",
        height: "100vh",
        background: "#060C14",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
      }}
    >
      {/* Starfield */}
      <StarField />

      {/* Nebula aurora layers */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-15%",
            left: "-10%",
            width: "55%",
            height: "55%",
            background:
              "radial-gradient(ellipse, rgba(100,60,200,0.12) 0%, transparent 70%)",
            animation: "nebula-drift 14s ease-in-out infinite alternate",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-20%",
            right: "-10%",
            width: "60%",
            height: "60%",
            background:
              "radial-gradient(ellipse, rgba(20,100,180,0.10) 0%, transparent 70%)",
            animation:
              "nebula-drift 18s ease-in-out infinite alternate-reverse",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "50%",
            width: "50%",
            height: "40%",
            background:
              "radial-gradient(ellipse, rgba(60,180,120,0.06) 0%, transparent 70%)",
            animation: "nebula-drift 22s ease-in-out infinite alternate",
          }}
        />
      </div>

      {/* Grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(246,195,91,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(246,195,91,0.025) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Scanline overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          pointerEvents: "none",
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 3px)",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 48,
          padding: "0 16px",
          width: "100%",
          maxWidth: 960,
        }}
      >
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          style={{ textAlign: "center" }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.35em",
              color: "#F6C35B",
              textTransform: "uppercase",
              fontWeight: 600,
              marginBottom: 12,
              opacity: 0.8,
            }}
          >
            ▸ Interactive 3D Universe Simulation
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(2rem, 5vw, 3.8rem)",
              fontWeight: 900,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              lineHeight: 1.1,
              color: "#E9EEF5",
              textShadow:
                "0 0 40px rgba(246,195,91,0.3), 0 0 80px rgba(100,60,200,0.2)",
            }}
          >
            Multi-verse of{" "}
            <span
              style={{
                color: "#F6C35B",
                textShadow:
                  "0 0 20px rgba(246,195,91,0.7), 0 0 60px rgba(246,195,91,0.3)",
              }}
            >
              Madness
            </span>
          </h1>
          <div
            style={{
              width: 200,
              height: 1,
              margin: "18px auto 0",
              background:
                "linear-gradient(90deg, transparent, rgba(246,195,91,0.6), transparent)",
            }}
          />
        </motion.div>

        {/* Navigation cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 16,
            width: "100%",
          }}
        >
          {NAV_CARDS.map((card, i) => (
            <motion.button
              key={card.id}
              type="button"
              data-ocid={card.ocid}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08, duration: 0.5 }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onHoverStart={() => setHoveredCard(card.id)}
              onHoverEnd={() => setHoveredCard(null)}
              onClick={() => onNavigate(card.id)}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "28px 16px",
                background:
                  hoveredCard === card.id
                    ? `rgba(${hexToRgb(card.color)}, 0.1)`
                    : "rgba(11,18,30,0.7)",
                border: `1px solid ${hoveredCard === card.id ? `${card.color}80` : "rgba(255,255,255,0.08)"}`,
                borderRadius: 16,
                cursor: "pointer",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow:
                  hoveredCard === card.id
                    ? `0 0 30px ${card.glow}, 0 4px 20px rgba(0,0,0,0.4)`
                    : "0 4px 16px rgba(0,0,0,0.3)",
                transition: "background 0.2s, border 0.2s, box-shadow 0.2s",
                outline: "none",
                textAlign: "center",
                minHeight: 130,
              }}
            >
              {/* Corner HUD accents */}
              <div
                style={{
                  position: "absolute",
                  top: 6,
                  left: 6,
                  width: 10,
                  height: 10,
                  borderTop: `1px solid ${card.color}60`,
                  borderLeft: `1px solid ${card.color}60`,
                  borderRadius: "2px 0 0 0",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 6,
                  right: 6,
                  width: 10,
                  height: 10,
                  borderBottom: `1px solid ${card.color}60`,
                  borderRight: `1px solid ${card.color}60`,
                  borderRadius: "0 0 2px 0",
                }}
              />

              <div
                style={{
                  fontSize: 32,
                  lineHeight: 1,
                  filter:
                    hoveredCard === card.id
                      ? `drop-shadow(0 0 12px ${card.glow})`
                      : "none",
                  transition: "filter 0.2s",
                }}
              >
                {card.icon}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: hoveredCard === card.id ? card.color : "#C8D4E0",
                    transition: "color 0.2s",
                    marginBottom: 4,
                  }}
                >
                  {card.label}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "rgba(200,212,224,0.55)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {card.sublabel}
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Auth row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {!isLoggedIn ? (
            <button
              type="button"
              data-ocid="landing.login.button"
              onClick={login}
              disabled={isLoggingIn}
              style={{
                padding: "10px 28px",
                background: isLoggingIn
                  ? "rgba(246,195,91,0.1)"
                  : "rgba(246,195,91,0.12)",
                border: "1px solid rgba(246,195,91,0.4)",
                borderRadius: 9999,
                color: "#F6C35B",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: isLoggingIn ? "not-allowed" : "pointer",
                backdropFilter: "blur(8px)",
                transition: "all 0.2s",
                fontFamily: "inherit",
                minHeight: 44,
                minWidth: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isLoggingIn ? "Connecting..." : "⚡ Connect Identity"}
            </button>
          ) : (
            <div
              style={{
                padding: "8px 20px",
                background: "rgba(74,222,128,0.08)",
                border: "1px solid rgba(74,222,128,0.25)",
                borderRadius: 9999,
                color: "#4ade80",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
              }}
            >
              ✓ Identity Connected
            </div>
          )}

          <div
            style={{
              color: "rgba(200,212,224,0.35)",
              fontSize: 10,
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
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          color: "rgba(246,195,91,0.4)",
          fontSize: 10,
          letterSpacing: "0.05em",
          whiteSpace: "nowrap",
        }}
      >
        © {new Date().getFullYear()}. Built with ♥ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noreferrer"
          style={{ color: "rgba(246,195,91,0.55)", textDecoration: "none" }}
        >
          caffeine.ai
        </a>
      </div>

      <style>{`
        @keyframes nebula-drift {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(3%, 4%) scale(1.06); }
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
