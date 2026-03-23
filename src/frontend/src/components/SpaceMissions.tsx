import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { audioManager } from "../utils/AudioManager";
import { BackButton } from "./BackButton";

// ─── Speech synthesis hook ────────────────────────────────────────────────────
function useSpeech() {
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const preferredVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Select voice once voices are available (Chrome loads them async)
  useEffect(() => {
    function pickVoice() {
      const voices = window.speechSynthesis.getVoices();
      preferredVoiceRef.current =
        voices.find((v) =>
          [
            "Google UK English Male",
            "Microsoft David",
            "Daniel",
            "Google US English",
          ].includes(v.name),
        ) ??
        voices.find(
          (v) =>
            v.lang.startsWith("en") && v.name.toLowerCase().includes("male"),
        ) ??
        voices.find((v) => v.lang.startsWith("en")) ??
        voices[0] ??
        null;
    }
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback(
    (text: string, isLaunch = false) => {
      if (!voiceEnabled || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const fullText = isLaunch
        ? `T-minus 10, 9, 8, 7, 6, 5, 4, 3, 2, 1. Ignition. Liftoff! ${text}`
        : text;
      const u = new SpeechSynthesisUtterance(fullText);
      u.pitch = 0.7;
      u.rate = 0.75;
      u.volume = 1.0;
      if (preferredVoiceRef.current) u.voice = preferredVoiceRef.current;
      utteranceRef.current = u;
      window.speechSynthesis.speak(u);
    },
    [voiceEnabled],
  );

  function cancel() {
    window.speechSynthesis.cancel();
  }

  return { voiceEnabled, setVoiceEnabled, speak, cancel };
}

// ─── Mission roles ─────────────────────────────────────────────────────────────
type MissionRole = "pilot" | "scientist" | "engineer";

const ROLES: {
  id: MissionRole;
  icon: string;
  title: string;
  desc: string;
  telemetryFocus: string;
}[] = [
  {
    id: "pilot",
    icon: "🧑‍✈️",
    title: "Pilot",
    desc: "Navigate the spacecraft and monitor flight parameters. You control speed, altitude, and trajectory.",
    telemetryFocus: "flight",
  },
  {
    id: "scientist",
    icon: "🔬",
    title: "Scientist",
    desc: "Analyze instrument readings and mission data. Your observations will advance human knowledge.",
    telemetryFocus: "science",
  },
  {
    id: "engineer",
    icon: "⚙️",
    title: "Engineer",
    desc: "Monitor all systems and keep the spacecraft operational. You ensure mission success.",
    telemetryFocus: "systems",
  },
];

const PANEL_STYLE: React.CSSProperties = {
  background: "rgba(11,16,23,0.92)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 14,
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
};

interface MissionPhase {
  label: string;
  color: string;
  icon: string;
  narrative: string;
  telemetry: {
    speed: string;
    altitude: string;
    distance: string;
    status: string;
  };
  duration: number; // ms
}

interface Mission {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  planets: string[];
  year: string;
  agency: string;
  phases: MissionPhase[];
}

const MISSIONS: Mission[] = [
  {
    id: "apollo11",
    title: "Apollo 11",
    subtitle: "First Moon Landing",
    icon: "🌕",
    description:
      "Relive humanity's greatest achievement — the first crewed lunar landing on July 20, 1969.",
    planets: ["Earth"],
    year: "1969",
    agency: "NASA",
    phases: [
      {
        label: "LAUNCH",
        color: "#FF6B35",
        icon: "🚀",
        narrative:
          "T-0: Saturn V ignition. 7.6 million pounds of thrust. Liftoff from Kennedy Space Center, Florida.",
        telemetry: {
          speed: "0 km/h",
          altitude: "0 km",
          distance: "0 km",
          status: "ENGINES NOMINAL",
        },
        duration: 4000,
      },
      {
        label: "ASCENT",
        color: "#F6C35B",
        icon: "📡",
        narrative:
          "Staging complete. First stage jettisoned at 67 km altitude. Acceleration building to 28,000 km/h.",
        telemetry: {
          speed: "9,920 km/h",
          altitude: "67 km",
          distance: "500 km",
          status: "STAGE SEP COMPLETE",
        },
        duration: 4000,
      },
      {
        label: "TRANS-LUNAR",
        color: "#60A5FA",
        icon: "🌍",
        narrative:
          "Trans-lunar injection burn complete. Earth shrinks in the window. 3 days to the Moon.",
        telemetry: {
          speed: "40,233 km/h",
          altitude: "190 km",
          distance: "12,000 km",
          status: "TLI BURN COMPLETE",
        },
        duration: 4000,
      },
      {
        label: "LUNAR ORBIT",
        color: "#A78BFA",
        icon: "🌑",
        narrative:
          "Lunar orbit insertion. The Moon fills the entire cockpit window. Eagle separates from Columbia.",
        telemetry: {
          speed: "5,940 km/h",
          altitude: "111 km",
          distance: "384,400 km",
          status: "LOI COMPLETE",
        },
        duration: 4000,
      },
      {
        label: "DESCENT",
        color: "#34D399",
        icon: "🦅",
        narrative:
          '"The Eagle has landed." Tranquility Base. July 20, 1969 — 20:17 UTC. Humans on the Moon.',
        telemetry: {
          speed: "0 km/h",
          altitude: "0 m",
          distance: "384,402 km",
          status: "TOUCHDOWN CONFIRMED",
        },
        duration: 4000,
      },
      {
        label: "EVA",
        color: "#FBBF24",
        icon: "👨‍🚀",
        narrative:
          '"One small step for man, one giant leap for mankind." Armstrong becomes first human on the Moon.',
        telemetry: {
          speed: "0 km/h",
          altitude: "0 m",
          distance: "384,402 km",
          status: "EVA IN PROGRESS",
        },
        duration: 4000,
      },
    ],
  },
  {
    id: "voyager1",
    title: "Voyager 1",
    subtitle: "Grand Tour of the Solar System",
    icon: "🛸",
    description:
      "Journey with Voyager 1 on its historic flyby of Jupiter and Saturn before escaping the solar system.",
    planets: ["Jupiter", "Saturn"],
    year: "1977",
    agency: "NASA/JPL",
    phases: [
      {
        label: "LAUNCH",
        color: "#FF6B35",
        icon: "🚀",
        narrative:
          "September 5, 1977. Titan III-E/Centaur launches Voyager 1 from Cape Canaveral, Florida.",
        telemetry: {
          speed: "0 km/h",
          altitude: "0 km",
          distance: "0 km",
          status: "LAUNCH NOMINAL",
        },
        duration: 4000,
      },
      {
        label: "INNER SYSTEM",
        color: "#F6C35B",
        icon: "☀️",
        narrative:
          "Gravity assist from Jupiter's gravitational field begins to pull Voyager towards the giant.",
        telemetry: {
          speed: "56,000 km/h",
          altitude: "—",
          distance: "180,000,000 km",
          status: "CRUISE PHASE",
        },
        duration: 4000,
      },
      {
        label: "JUPITER FLYBY",
        color: "#F97316",
        icon: "🪐",
        narrative:
          "March 1979. Closest approach to Jupiter. Io's active volcanoes discovered. Great Red Spot imaged at close range.",
        telemetry: {
          speed: "113,000 km/h",
          altitude: "349,000 km",
          distance: "628,000,000 km",
          status: "FLYBY COMPLETE",
        },
        duration: 4000,
      },
      {
        label: "SATURN FLYBY",
        color: "#A78BFA",
        icon: "💍",
        narrative:
          "November 1980. Saturn's rings revealed in breathtaking detail. Titan's atmosphere analyzed. New moons discovered.",
        telemetry: {
          speed: "85,000 km/h",
          altitude: "124,000 km",
          distance: "1,430,000,000 km",
          status: "RING CROSSING",
        },
        duration: 4000,
      },
      {
        label: "PALE BLUE DOT",
        color: "#60A5FA",
        icon: "🌍",
        narrative:
          "1990: From 6 billion km, Carl Sagan directs Voyager to photograph Earth — the Pale Blue Dot portrait.",
        telemetry: {
          speed: "61,000 km/h",
          altitude: "—",
          distance: "6,000,000,000 km",
          status: "PHOTO COMPLETE",
        },
        duration: 4000,
      },
      {
        label: "INTERSTELLAR",
        color: "#34D399",
        icon: "✨",
        narrative:
          "2012: Voyager 1 crosses the heliopause. First human-made object to enter interstellar space. Still transmitting.",
        telemetry: {
          speed: "61,200 km/h",
          altitude: "—",
          distance: "21,000,000,000 km",
          status: "INTERSTELLAR",
        },
        duration: 4000,
      },
    ],
  },
  {
    id: "marsrover",
    title: "Perseverance",
    subtitle: "Mars 2020 Rover Mission",
    icon: "🤖",
    description:
      "Follow NASA's Perseverance rover as it lands on Mars and searches for signs of ancient life.",
    planets: ["Mars"],
    year: "2020",
    agency: "NASA/JPL",
    phases: [
      {
        label: "LAUNCH",
        color: "#FF6B35",
        icon: "🚀",
        narrative:
          "July 30, 2020. Atlas V 541 lifts off from Cape Canaveral. Perseverance and Ingenuity begin their 7-month journey.",
        telemetry: {
          speed: "0 km/h",
          altitude: "0 km",
          distance: "0 km",
          status: "LAUNCH NOMINAL",
        },
        duration: 4000,
      },
      {
        label: "CRUISE",
        color: "#F6C35B",
        icon: "🌌",
        narrative:
          "Spacecraft performs 6 trajectory correction maneuvers. Systems nominal. Instruments calibrated en route.",
        telemetry: {
          speed: "87,000 km/h",
          altitude: "—",
          distance: "54,600,000 km",
          status: "TCM-2 COMPLETE",
        },
        duration: 4000,
      },
      {
        label: "ENTRY",
        color: "#F97316",
        icon: "🔥",
        narrative:
          "Seven minutes of terror. Entry at 19,800 km/h. Heat shield glows at 1,300°C. Communications blackout.",
        telemetry: {
          speed: "19,800 km/h",
          altitude: "125 km",
          distance: "0 km",
          status: "BLACKOUT",
        },
        duration: 4000,
      },
      {
        label: "DESCENT",
        color: "#A78BFA",
        icon: "🪂",
        narrative:
          "Parachute deployed. Retro rockets ignite. Sky crane lowers rover on nylon cables. 20 meters... 10... 5...",
        telemetry: {
          speed: "2.7 km/h",
          altitude: "20 m",
          distance: "0 km",
          status: "SKY CRANE ACTIVE",
        },
        duration: 4000,
      },
      {
        label: "TOUCHDOWN",
        color: "#34D399",
        icon: "🌑",
        narrative:
          "Touchdown confirmed. Jezero Crater, Mars. February 18, 2021, 20:55 UTC. Mission Control erupts.",
        telemetry: {
          speed: "0 km/h",
          altitude: "0 m",
          distance: "—",
          status: "WHEELS DOWN",
        },
        duration: 4000,
      },
      {
        label: "DISCOVERY",
        color: "#FBBF24",
        icon: "🔬",
        narrative:
          "Organic molecules detected. Ingenuity completes first powered flight on another planet. Ancient lake confirmed.",
        telemetry: {
          speed: "0.16 km/h",
          altitude: "0 m",
          distance: "12 km roamed",
          status: "SCIENCE OPS",
        },
        duration: 4000,
      },
    ],
  },
];

function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      o: Math.random() * 0.7 + 0.3,
    }));
    let animId: number;
    let t = 0;
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.01;
      for (const s of stars) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.o * (0.7 + 0.3 * Math.sin(t + s.x))})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}

function TelemetryRow({
  label,
  value,
  color,
}: { label: string; value: string; color: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "6px 0",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <span
        style={{
          color: "#5a6a7a",
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span
        style={{
          color,
          fontSize: 13,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function PhaseTimeline({
  phases,
  currentIndex,
}: { phases: MissionPhase[]; currentIndex: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        width: "100%",
        marginBottom: 20,
      }}
    >
      {phases.map((phase, i) => (
        <div
          key={phase.label}
          style={{ display: "flex", alignItems: "center", flex: 1 }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <motion.div
              animate={{
                scale: i === currentIndex ? [1, 1.2, 1] : 1,
                boxShadow:
                  i <= currentIndex ? `0 0 12px ${phase.color}88` : "none",
              }}
              transition={{
                repeat: i === currentIndex ? Number.POSITIVE_INFINITY : 0,
                duration: 1.5,
              }}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background:
                  i < currentIndex
                    ? phase.color
                    : i === currentIndex
                      ? phase.color
                      : "rgba(255,255,255,0.08)",
                border: `2px solid ${i <= currentIndex ? phase.color : "rgba(255,255,255,0.15)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                opacity: i > currentIndex ? 0.4 : 1,
              }}
            >
              {i < currentIndex ? "✓" : phase.icon}
            </motion.div>
            <span
              style={{
                fontSize: 8,
                color: i <= currentIndex ? phase.color : "#3a4a5a",
                letterSpacing: "0.05em",
                textAlign: "center",
                lineHeight: 1.2,
              }}
            >
              {phase.label}
            </span>
          </div>
          {i < phases.length - 1 && (
            <motion.div
              animate={{ scaleX: i < currentIndex ? 1 : 0 }}
              initial={{ scaleX: 0 }}
              style={{
                height: 2,
                flex: 1,
                background: phases[i].color,
                transformOrigin: "left",
                marginTop: -14,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function MissionCinematic({
  mission,
  role,
  onBack,
  onCreditsEarned,
  actor,
}: {
  mission: Mission;
  role: MissionRole;
  onBack: () => void;
  onCreditsEarned?: (amount: number) => void;
  actor?: any;
}) {
  const [phaseIndex, setPhaseIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [started, setStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const { voiceEnabled, setVoiceEnabled, speak, cancel } = useSpeech();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentPhase =
    phaseIndex >= 0 && phaseIndex < mission.phases.length
      ? mission.phases[phaseIndex]
      : null;
  const isComplete = phaseIndex >= mission.phases.length;
  const creditsAwardedRef = useRef(false);
  useEffect(() => {
    if (isComplete && !creditsAwardedRef.current) {
      creditsAwardedRef.current = true;
      onCreditsEarned?.(200);
      if (actor) {
        actor.earnCredits(200n, "Mission completed").catch(() => {});
      }
    }
  }, [isComplete, onCreditsEarned, actor]);
  const [countdownNum, setCountdownNum] = useState<number | null>(null);

  function startMission() {
    audioManager.init();
    // 10-second countdown beeps + visual display
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        audioManager.playMissionBeep();
        setCountdownNum(10 - i);
      }, i * 1000);
    }
    // Clear countdown at T-0
    setTimeout(() => {
      setCountdownNum(null);
      audioManager.playMissionLaunch();
    }, 10000);
    // Start mission after countdown
    setTimeout(() => {
      setStarted(true);
      setPhaseIndex(0);
      setProgress(0);
      setElapsed(0);
    }, 10000);
  }

  useEffect(() => {
    if (!started || phaseIndex < 0 || isComplete) return;
    const phase = mission.phases[phaseIndex];
    setProgress(0);
    if (phaseIndex > 0) audioManager.playMissionStatic();
    if (phase.label === "LAUNCH")
      setTimeout(() => audioManager.playMissionLaunch(), 200);
    speak(phase.narrative, phase.label === "LAUNCH");
    const step = 50;
    const steps = phase.duration / step;
    let tick = 0;
    progressRef.current = setInterval(() => {
      tick++;
      setProgress(Math.min((tick / steps) * 100, 100));
      setElapsed((e) => e + step);
    }, step);
    timerRef.current = setTimeout(() => {
      if (progressRef.current) clearInterval(progressRef.current);
      setPhaseIndex((i) => i + 1);
    }, phase.duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [phaseIndex, started, mission.phases, isComplete, speak]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: cancel is stable
  useEffect(() => {
    return () => cancel();
  }, []);

  const missionElapsedStr = (() => {
    const totalMs = elapsed;
    const s = Math.floor(totalMs / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    return `${String(h).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  })();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "#030611",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <StarField />

      {/* Header */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 28 }}>{mission.icon}</span>
          <div>
            <div
              style={{
                color: "#F6C35B",
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: "0.05em",
              }}
            >
              {mission.title}
            </div>
            <div
              style={{
                color: "#5a6a7a",
                fontSize: 10,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {mission.agency} &bull; {mission.year}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {started && (
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  color: "#5a6a7a",
                  fontSize: 9,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Mission Time
              </div>
              <div
                style={{
                  color: "#34D399",
                  fontSize: 14,
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {missionElapsedStr}
              </div>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Role badge */}
            {ROLES.find((r) => r.id === role) && (
              <div
                style={{
                  background: "rgba(246,195,91,0.1)",
                  border: "1px solid rgba(246,195,91,0.3)",
                  borderRadius: 8,
                  padding: "4px 10px",
                  color: "#F6C35B",
                  fontSize: 11,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                {ROLES.find((r) => r.id === role)!.icon}{" "}
                {ROLES.find((r) => r.id === role)!.title.toUpperCase()}
              </div>
            )}
            {/* Voice toggle */}
            <button
              type="button"
              data-ocid="missions.toggle"
              onClick={() => {
                if (voiceEnabled) {
                  cancel();
                }
                setVoiceEnabled((v) => !v);
              }}
              title={
                voiceEnabled
                  ? "Disable voice narration"
                  : "Enable voice narration"
              }
              style={{
                background: voiceEnabled
                  ? "rgba(96,165,250,0.12)"
                  : "rgba(255,255,255,0.05)",
                border: voiceEnabled
                  ? "1px solid rgba(96,165,250,0.4)"
                  : "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                color: voiceEnabled ? "#60A5FA" : "#5a6a7a",
                padding: "6px 10px",
                cursor: "pointer",
                fontSize: 14,
                fontFamily: "inherit",
              }}
            >
              {voiceEnabled ? "🔊" : "🔇"}
            </button>
            <button
              type="button"
              onClick={() => {
                cancel();
                onBack();
              }}
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                color: "#9AA7B6",
                padding: "6px 14px",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
                fontFamily: "inherit",
              }}
            >
              ✕ Exit
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          position: "relative",
          zIndex: 2,
          display: "flex",
          gap: 0,
        }}
      >
        {/* Left: Visual / Phase display */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
            position: "relative",
          }}
        >
          <AnimatePresence mode="wait">
            {!started ? (
              <motion.div
                key="prelaunch"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                style={{ textAlign: "center" }}
              >
                <motion.div
                  animate={{
                    y: [0, -12, 0],
                    filter: [
                      "brightness(1)",
                      "brightness(1.4)",
                      "brightness(1)",
                    ],
                  }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
                  style={{ fontSize: 80, marginBottom: 24, display: "block" }}
                >
                  {mission.icon}
                </motion.div>
                <div
                  style={{
                    color: "#E9EEF5",
                    fontSize: 22,
                    fontWeight: 800,
                    marginBottom: 8,
                  }}
                >
                  {mission.subtitle}
                </div>
                <div
                  style={{
                    color: "#5a6a7a",
                    fontSize: 13,
                    lineHeight: 1.6,
                    maxWidth: 340,
                    margin: "0 auto 32px",
                  }}
                >
                  {mission.description}
                </div>
                <button
                  type="button"
                  data-ocid="missions.primary_button"
                  onClick={startMission}
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(246,195,91,0.2), rgba(246,195,91,0.05))",
                    border: "1px solid rgba(246,195,91,0.6)",
                    borderRadius: 12,
                    color: "#F6C35B",
                    padding: "14px 40px",
                    cursor: "pointer",
                    fontSize: 15,
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    fontFamily: "inherit",
                    boxShadow: "0 0 30px rgba(246,195,91,0.15)",
                  }}
                >
                  🚀 INITIATE LAUNCH SEQUENCE
                </button>
              </motion.div>
            ) : isComplete ? (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: "center" }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    filter: [
                      "brightness(1)",
                      "brightness(1.6)",
                      "brightness(1)",
                    ],
                  }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                  style={{ fontSize: 80, marginBottom: 20 }}
                >
                  🏆
                </motion.div>
                <div
                  style={{
                    color: "#34D399",
                    fontSize: 24,
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                    marginBottom: 8,
                  }}
                >
                  MISSION COMPLETE
                </div>
                <div
                  style={{ color: "#9AA7B6", fontSize: 14, marginBottom: 24 }}
                >
                  All mission objectives achieved successfully.
                </div>
                <div
                  style={{
                    color: "#F6C35B",
                    fontSize: 14,
                    fontWeight: 700,
                    marginBottom: 12,
                  }}
                >
                  ✦ +200 Nova Credits earned!
                </div>
                <div style={{ color: "#5a6a7a", fontSize: 12 }}>
                  Total mission time: {missionElapsedStr}
                </div>
              </motion.div>
            ) : currentPhase ? (
              <motion.div
                key={`phase-${phaseIndex}`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.08 }}
                transition={{ duration: 0.5 }}
                style={{ textAlign: "center", maxWidth: 420 }}
              >
                {/* Phase glow orb */}
                <motion.div
                  animate={{
                    boxShadow: [
                      `0 0 40px ${currentPhase.color}44`,
                      `0 0 80px ${currentPhase.color}88`,
                      `0 0 40px ${currentPhase.color}44`,
                    ],
                    scale: [1, 1.04, 1],
                  }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${currentPhase.color}33, transparent 70%)`,
                    border: `2px solid ${currentPhase.color}66`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 44,
                    margin: "0 auto 24px",
                  }}
                >
                  {currentPhase.icon}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: "inline-block",
                    background: `rgba(${currentPhase.color === "#FF6B35" ? "255,107,53" : currentPhase.color === "#34D399" ? "52,211,153" : "246,195,91"},0.12)`,
                    border: `1px solid ${currentPhase.color}55`,
                    borderRadius: 6,
                    padding: "3px 12px",
                    color: currentPhase.color,
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.15em",
                    marginBottom: 16,
                  }}
                >
                  PHASE {phaseIndex + 1}/{mission.phases.length} &mdash;{" "}
                  {currentPhase.label}
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{
                    color: "#E9EEF5",
                    fontSize: 15,
                    lineHeight: 1.7,
                    fontWeight: 500,
                  }}
                >
                  {currentPhase.narrative}
                </motion.p>

                {/* Phase progress bar */}
                <div
                  style={{
                    marginTop: 24,
                    height: 3,
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "linear", duration: 0.05 }}
                    style={{
                      height: "100%",
                      background: currentPhase.color,
                      borderRadius: 2,
                    }}
                  />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Right: Telemetry sidebar */}
        {started && !isComplete && currentPhase && (
          <motion.div
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            style={{
              width: 220,
              borderLeft: "1px solid rgba(255,255,255,0.07)",
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}
          >
            <div
              style={{
                color: "#5a6a7a",
                fontSize: 9,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: 12,
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                paddingBottom: 8,
              }}
            >
              Live Telemetry
            </div>
            <TelemetryRow
              label="Velocity"
              value={currentPhase.telemetry.speed}
              color="#60A5FA"
            />
            <TelemetryRow
              label="Altitude"
              value={currentPhase.telemetry.altitude}
              color="#34D399"
            />
            <TelemetryRow
              label="Distance"
              value={currentPhase.telemetry.distance}
              color="#F6C35B"
            />
            <TelemetryRow
              label="Status"
              value={currentPhase.telemetry.status}
              color={currentPhase.color}
            />
            <TelemetryRow
              label="Phase"
              value={`${phaseIndex + 1} / ${mission.phases.length}`}
              color="#9AA7B6"
            />

            {/* Scanning lines effect */}
            <div
              style={{
                marginTop: 20,
                height: 60,
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 6,
                overflow: "hidden",
                position: "relative",
                background: "rgba(0,0,0,0.05)",
              }}
            >
              <motion.div
                animate={{ y: [-60, 60] }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 1.5,
                  ease: "linear",
                }}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  height: 2,
                  background: `linear-gradient(to right, transparent, ${currentPhase.color}aa, transparent)`,
                }}
              />
              <div style={{ padding: 8 }}>
                {["s0", "s1", "s2", "s3"].map((v, i) => (
                  <motion.div
                    key={v}
                    animate={{ opacity: [0.2, 0.7, 0.2] }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.3,
                      duration: 1.2,
                    }}
                    style={{
                      height: 6,
                      background: `rgba(${i % 2 === 0 ? "96,165,250" : "246,195,91"},0.3)`,
                      borderRadius: 3,
                      marginBottom: 5,
                      width: `${60 + i * 10}%`,
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ marginTop: "auto", paddingTop: 20 }}>
              <div
                style={{
                  color: "#5a6a7a",
                  fontSize: 9,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Mission Clock
              </div>
              <motion.div
                animate={{ color: ["#34D399", "#60A5FA", "#34D399"] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "0.1em",
                }}
              >
                {missionElapsedStr}
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom: Phase timeline */}
      {started && (
        <div
          style={{
            position: "relative",
            zIndex: 2,
            padding: "12px 24px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <PhaseTimeline
            phases={mission.phases}
            currentIndex={Math.min(phaseIndex, mission.phases.length - 1)}
          />
        </div>
      )}

      {/* Visual countdown overlay */}
      <AnimatePresence>
        {countdownNum !== null && (
          <motion.div
            key={countdownNum}
            initial={{ opacity: 0, scale: 2 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.35 }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 50,
            }}
          >
            <div
              style={{
                fontSize: "clamp(5rem, 15vw, 10rem)",
                fontWeight: 900,
                color: "#F6C35B",
                textShadow:
                  "0 0 60px rgba(246,195,91,0.8), 0 0 120px rgba(246,195,91,0.4)",
                fontFamily: "monospace",
                lineHeight: 1,
              }}
            >
              {countdownNum}
            </div>
            <div
              style={{
                color: "rgba(246,195,91,0.7)",
                fontSize: "1.1rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                marginTop: 12,
              }}
            >
              T-minus {countdownNum}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Role Selection Screen ─────────────────────────────────────────────────────
function RoleSelectScreen({
  mission,
  onSelect,
  onBack,
}: {
  mission: Mission;
  onSelect: (role: MissionRole) => void;
  onBack: () => void;
}) {
  const [hovered, setHovered] = useState<MissionRole | null>(null);
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "#030611",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
      }}
    >
      {/* Stars BG */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 60% 20%, rgba(96,165,250,0.06) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(167,139,250,0.05) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 560,
          padding: "0 20px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{mission.icon}</div>
          <div
            style={{
              color: "#F6C35B",
              fontSize: 20,
              fontWeight: 900,
              letterSpacing: "0.06em",
              marginBottom: 6,
            }}
          >
            {mission.title}
          </div>
          <div style={{ color: "#9AA7B6", fontSize: 13 }}>
            Choose your role for this mission
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {ROLES.map((role) => (
            <motion.button
              key={role.id}
              type="button"
              data-ocid={"missions.radio"}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={() => setHovered(role.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect(role.id)}
              style={{
                background:
                  hovered === role.id
                    ? "rgba(246,195,91,0.08)"
                    : "rgba(255,255,255,0.03)",
                border:
                  hovered === role.id
                    ? "1px solid rgba(246,195,91,0.4)"
                    : "1px solid rgba(255,255,255,0.1)",
                borderRadius: 14,
                padding: "18px 22px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 16,
                textAlign: "left",
                transition: "all 0.2s",
                fontFamily: "inherit",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "rgba(246,195,91,0.1)",
                  border: "1px solid rgba(246,195,91,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  flexShrink: 0,
                }}
              >
                {role.icon}
              </div>
              <div>
                <div
                  style={{
                    color: "#F6C35B",
                    fontSize: 15,
                    fontWeight: 800,
                    marginBottom: 4,
                  }}
                >
                  {role.title}
                </div>
                <div
                  style={{ color: "#9AA7B6", fontSize: 12, lineHeight: 1.5 }}
                >
                  {role.desc}
                </div>
              </div>
              <div
                style={{
                  marginLeft: "auto",
                  color: hovered === role.id ? "#F6C35B" : "#3a4a5a",
                  fontSize: 18,
                }}
              >
                →
              </div>
            </motion.button>
          ))}
        </div>

        <button
          type="button"
          onClick={onBack}
          style={{
            marginTop: 20,
            background: "transparent",
            border: "none",
            color: "#5a6a7a",
            cursor: "pointer",
            fontSize: 12,
            fontFamily: "inherit",
            width: "100%",
            padding: "8px",
          }}
        >
          ← Back to missions
        </button>
      </motion.div>
    </div>
  );
}

const MISSION_COST = 150;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onNavigateToPlanet?: (name: string) => void;
  novaCredits?: number;
  onCreditsSpent?: (amount: number) => void;
  onCreditsEarned?: (amount: number) => void;
}

export function SpaceMissions({
  open,
  onOpenChange,
  onNavigateToPlanet,
  novaCredits = 0,
  onCreditsSpent,
  onCreditsEarned,
}: Props) {
  const { actor } = useActor();
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [roleScreen, setRoleScreen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<MissionRole>("pilot");
  const [launching, setLaunching] = useState<string | null>(null);
  const isLaunchingRef = useRef(false);

  async function handleSelectMission(m: Mission) {
    if (!actor) {
      toast.error("Please log in to launch missions.");
      return;
    }
    if (isLaunchingRef.current) return;
    if (novaCredits < MISSION_COST) {
      toast.error(
        `Insufficient Nova Credits. Need ${MISSION_COST} credits to launch.`,
        {
          style: {
            background: "rgba(11,16,23,0.95)",
            border: "1px solid rgba(248,113,113,0.4)",
            color: "#f87171",
          },
        },
      );
      return;
    }
    isLaunchingRef.current = true;
    setLaunching(m.id);
    try {
      const success = await actor.spendCredits(BigInt(MISSION_COST));
      if (!success) {
        toast.error("Insufficient Nova Credits.");
        return;
      }
      onCreditsSpent?.(MISSION_COST);
      toast.success(
        `✦ ${MISSION_COST} Nova Credits spent — launching mission!`,
        {
          style: {
            background: "rgba(11,16,23,0.95)",
            border: "1px solid rgba(246,195,91,0.4)",
            color: "#F6C35B",
          },
        },
      );
      setActiveMission(m);
      setRoleScreen(true);
      if (onNavigateToPlanet && m.planets.length > 0) {
        onNavigateToPlanet(m.planets[0]);
      }
    } catch {
      toast.error("Failed to process credit payment.");
    } finally {
      isLaunchingRef.current = false;
      setLaunching(null);
    }
  }

  function handleRoleSelect(role: MissionRole) {
    setSelectedRole(role);
    setRoleScreen(false);
  }

  function handleBack() {
    setActiveMission(null);
    setRoleScreen(false);
  }

  function handleClose() {
    setActiveMission(null);
    setRoleScreen(false);
    onOpenChange(false);
  }

  if (activeMission && roleScreen) {
    return (
      <RoleSelectScreen
        mission={activeMission}
        onSelect={handleRoleSelect}
        onBack={handleBack}
      />
    );
  }

  if (activeMission && !roleScreen) {
    return (
      <MissionCinematic
        mission={activeMission}
        role={selectedRole}
        onBack={handleBack}
        onCreditsEarned={onCreditsEarned}
        actor={actor}
      />
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="missions-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.1)",
          }}
          onClick={handleClose}
        >
          <motion.div
            data-ocid="missions.modal"
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            style={{
              ...PANEL_STYLE,
              padding: 28,
              width: 540,
              maxWidth: "95vw",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <BackButton onClick={() => onOpenChange(false)} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div>
                <div
                  style={{
                    color: "#F6C35B",
                    fontSize: 15,
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Space Missions
                </div>
                <div style={{ color: "#9AA7B6", fontSize: 11, marginTop: 3 }}>
                  Cinematic guided tours through history
                </div>
              </div>
              <button
                type="button"
                data-ocid="missions.close_button"
                onClick={handleClose}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#9AA7B6",
                  cursor: "pointer",
                  fontSize: 20,
                  lineHeight: 1,
                  padding: 4,
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {MISSIONS.map((m, idx) => (
                <div
                  key={m.id}
                  data-ocid={`missions.item.${idx + 1}`}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    padding: "18px 18px",
                    display: "flex",
                    gap: 16,
                    alignItems: "flex-start",
                    cursor: "default",
                  }}
                >
                  <span style={{ fontSize: 32, flexShrink: 0 }}>{m.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        color: "#F6C35B",
                        fontSize: 14,
                        fontWeight: 700,
                        marginBottom: 2,
                      }}
                    >
                      {m.title}
                    </div>
                    <div
                      style={{
                        color: "#9AA7B6",
                        fontSize: 10,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        marginBottom: 6,
                      }}
                    >
                      {m.subtitle} &bull; {m.agency} &bull; {m.year}
                    </div>
                    <div
                      style={{
                        color: "#E9EEF5",
                        fontSize: 12,
                        lineHeight: 1.5,
                        marginBottom: 10,
                      }}
                    >
                      {m.description}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap",
                        marginBottom: 12,
                      }}
                    >
                      {m.phases.map((phase) => (
                        <span
                          key={phase.label}
                          style={{
                            background: `${phase.color}18`,
                            border: `1px solid ${phase.color}44`,
                            borderRadius: 4,
                            color: phase.color,
                            fontSize: 9,
                            fontWeight: 700,
                            padding: "2px 7px",
                            letterSpacing: "0.06em",
                          }}
                        >
                          {phase.icon} {phase.label}
                        </span>
                      ))}
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <button
                        type="button"
                        data-ocid="missions.primary_button"
                        disabled={launching === m.id}
                        onClick={() => handleSelectMission(m)}
                        style={{
                          background: "rgba(246,195,91,0.12)",
                          border: "1px solid rgba(246,195,91,0.35)",
                          borderRadius: 8,
                          color: "#F6C35B",
                          padding: "7px 16px",
                          cursor: launching === m.id ? "wait" : "pointer",
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                          opacity: novaCredits < MISSION_COST ? 0.6 : 1,
                        }}
                      >
                        {launching === m.id
                          ? "Launching..."
                          : "🚀 Start Mission"}
                      </button>
                      <span
                        style={{
                          color: "#F6C35B",
                          fontSize: 10,
                          fontWeight: 700,
                          opacity: 0.7,
                        }}
                      >
                        ✦ {MISSION_COST} Credits
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
