import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Toaster } from "@/components/ui/sonner";
import { Html, Line, OrbitControls, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Check,
  Copy,
  Globe2,
  Heart,
  LoaderCircle,
  LogIn,
  LogOut,
  Rocket,
  Search,
  Volume2,
  VolumeX,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ACESFilmicToneMapping,
  BackSide,
  Color,
  DoubleSide,
  Vector3,
} from "three";
import {
  type AchievementState,
  AchievementsPanel,
  loadAchievements as loadAchievementsData,
  saveAchievements as saveAchievementsData,
} from "./components/Achievements";
import { AdminDashboard } from "./components/AdminDashboard";
import { AudioSettings } from "./components/AudioSettings";
import { BlackHole } from "./components/BlackHole";
import { BlackHolePanel } from "./components/BlackHolePanel";
import { ConstellationOverlay } from "./components/ConstellationOverlay";
import { CreditShop } from "./components/CreditShop";
import { DailyChallenge } from "./components/DailyChallenge";
import { DailyTaskPanel } from "./components/DailyTaskPanel";
import { DonationModal } from "./components/DonationModal";
import { ErrorBoundary } from "./components/ErrorBoundary";
import GameArcade from "./components/GameArcade";
import { InterstellarBlackHoleHero } from "./components/InterstellarBlackHoleHero";
import { Leaderboard } from "./components/Leaderboard";
import { MonetizationModal } from "./components/MonetizationModal";
import { MultiverseView } from "./components/MultiverseView";
import { NFTTeaser } from "./components/NFTTeaser";
import { NameAStar } from "./components/NameAStar";
import { NovaCreditsDisplay } from "./components/NovaCreditsDisplay";
import { PlanetJournal } from "./components/PlanetJournal";
import { PLANET_DETAILS, PlanetPanel } from "./components/PlanetPanel";
import type { PlanetDetails } from "./components/PlanetPanel";
import { PlanetQuiz } from "./components/PlanetQuiz";
import { PlanetSearch } from "./components/PlanetSearch";
import { SpaceMissions } from "./components/SpaceMissions";
import { SpaceTimeline } from "./components/SpaceTimeline";
import { SurfaceView } from "./components/SurfaceView";
import { WarpIntroSequence } from "./components/WarpIntroSequence";
import { WormholeEffect } from "./components/WormholeEffect";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useIsPremiumUser } from "./hooks/useQueries";
import { useSpaceAudio } from "./hooks/useSpaceAudio";
import { audioManager } from "./utils/AudioManager";

// ─── Types ───────────────────────────────────────────────────────────────────
type ViewMode = "solar" | "galaxy";

interface PlanetConfig {
  name: string;
  color: string;
  size: number;
  orbitalRadius: number;
  speed: number;
  tilt: number;
  hasRings?: boolean;
  initialAngle?: number;
}

// ─── Planet Data ─────────────────────────────────────────────────────────────
const PLANETS: PlanetConfig[] = [
  {
    name: "Mercury",
    color: "#b5b5b5",
    size: 0.38,
    orbitalRadius: 12,
    speed: 4.15,
    tilt: 0,
    initialAngle: 0.5,
  },
  {
    name: "Venus",
    color: "#e8cda0",
    size: 0.95,
    orbitalRadius: 18,
    speed: 1.62,
    tilt: 3,
    initialAngle: 1.2,
  },
  {
    name: "Earth",
    color: "#4fa3e0",
    size: 1,
    orbitalRadius: 25,
    speed: 1,
    tilt: 23.4,
    initialAngle: 2,
  },
  {
    name: "Mars",
    color: "#c1440e",
    size: 0.53,
    orbitalRadius: 33,
    speed: 0.53,
    tilt: 25,
    initialAngle: 3.5,
  },
  {
    name: "Jupiter",
    color: "#c88b3a",
    size: 3.5,
    orbitalRadius: 52,
    speed: 0.084,
    tilt: 3,
    initialAngle: 0.8,
  },
  {
    name: "Saturn",
    color: "#e4d191",
    size: 2.9,
    orbitalRadius: 70,
    speed: 0.034,
    tilt: 26.7,
    hasRings: true,
    initialAngle: 4.2,
  },
  {
    name: "Uranus",
    color: "#7de8e8",
    size: 1.8,
    orbitalRadius: 88,
    speed: 0.012,
    tilt: 97.8,
    initialAngle: 1.6,
  },
  {
    name: "Neptune",
    color: "#3f54ba",
    size: 1.7,
    orbitalRadius: 105,
    speed: 0.006,
    tilt: 28,
    initialAngle: 5.1,
  },
];

const TRUE_SCALE_SIZES: Record<string, number> = {
  Mercury: 0.28,
  Venus: 0.7,
  Earth: 0.8,
  Mars: 0.42,
  Jupiter: 8.5,
  Saturn: 7.2,
  Uranus: 3.2,
  Neptune: 3.1,
};

// ─── Achievement helpers ──────────────────────────────────────────────────────
function loadAchievements(): AchievementState {
  try {
    const raw = localStorage.getItem("galaxy_achievements");
    if (raw) return JSON.parse(raw);
  } catch {
    /* noop */
  }
  return {
    visitedPlanets: [],
    usedGalaxyView: false,
    landedOnSurface: false,
    usedQuiz: false,
    namedAStar: false,
    wrotePlanetJournal: false,
  };
}

function saveAchievements(s: AchievementState) {
  try {
    localStorage.setItem("galaxy_achievements", JSON.stringify(s));
  } catch {
    /* noop */
  }
}

function hasPendingChallenge(): boolean {
  const lastDate = localStorage.getItem("galaxy_last_challenge_date");
  return lastDate !== new Date().toDateString();
}

// ─── 3D Components ────────────────────────────────────────────────────────────
function AsteroidBelt() {
  const { positions } = useMemo(() => {
    const pos: number[] = [];
    for (let i = 0; i < 800; i++) {
      const r = 35 + Math.random() * 14;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 1.2;
      pos.push(Math.cos(theta) * r, y, Math.sin(theta) * r);
    }
    return { positions: new Float32Array(pos) };
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.22}
        color="#8a7a6a"
        transparent
        opacity={0.55}
        sizeAttenuation
      />
    </points>
  );
}

function OrbitLine({ radius }: { radius: number }) {
  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push([Math.cos(a) * radius, 0, Math.sin(a) * radius]);
    }
    return pts;
  }, [radius]);
  return (
    <Line
      points={points}
      color="white"
      lineWidth={0.4}
      transparent
      opacity={0.1}
    />
  );
}

function SaturnRings() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[3.8, 6.5, 64]} />
      <meshBasicMaterial
        color="#c2a46e"
        side={DoubleSide}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

function GalaxyParticles({ visible }: { visible: boolean }) {
  const { positions, colors } = useMemo(() => {
    const pos: number[] = [];
    const col: number[] = [];
    const numArms = 4;
    const perArm = 4000;
    const armColors = [
      new Color("#8ab4e8"),
      new Color("#e8c48a"),
      new Color("#a8d4f5"),
      new Color("#f0d8a0"),
    ];
    for (let arm = 0; arm < numArms; arm++) {
      const armOffset = (arm / numArms) * Math.PI * 2;
      const ac = armColors[arm];
      for (let i = 0; i < perArm; i++) {
        const t = i / perArm;
        const r = 20 + t * 750;
        const spin = t * Math.PI * 5;
        const spread = r * 0.12;
        const x =
          Math.cos(armOffset + spin) * r + (Math.random() - 0.5) * spread * 2;
        const z =
          Math.sin(armOffset + spin) * r + (Math.random() - 0.5) * spread * 2;
        const y = (Math.random() - 0.5) * 18 * Math.exp(-t * 1.8);
        pos.push(x, y, z);
        const bright = 0.25 + (1 - t) * 0.75;
        col.push(ac.r * bright, ac.g * bright, ac.b * bright);
      }
    }
    for (let i = 0; i < 3000; i++) {
      const r = Math.random() * 60;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * 0.5;
      pos.push(
        Math.cos(theta) * r * Math.cos(phi),
        Math.sin(phi) * r * 0.4,
        Math.sin(theta) * r * Math.cos(phi),
      );
      const b = 0.6 + Math.random() * 0.4;
      col.push(b * 1, b * 0.9, b * 0.7);
    }
    for (let i = 0; i < 4000; i++) {
      const r = 100 + Math.random() * 700;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * 0.15;
      pos.push(
        Math.cos(theta) * r * Math.cos(phi),
        Math.sin(phi) * r,
        Math.sin(theta) * r * Math.cos(phi),
      );
      const b = Math.random() * 0.3 + 0.05;
      col.push(b, b, b * 1.2);
    }
    return { positions: new Float32Array(pos), colors: new Float32Array(col) };
  }, []);
  return (
    <points visible={visible}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={1.8}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
      />
    </points>
  );
}

function GalacticOrbitLine({ visible }: { visible: boolean }) {
  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 256; i++) {
      const a = (i / 256) * Math.PI * 2;
      pts.push([Math.cos(a) * 400, 0, Math.sin(a) * 400]);
    }
    return pts;
  }, []);
  if (!visible) return null;
  return (
    <Line
      points={points}
      color="#F6C35B"
      lineWidth={0.8}
      transparent
      opacity={0.35}
    />
  );
}

function GalacticCenter({ visible }: { visible: boolean }) {
  const ref = useRef<any>(null);
  useFrame((state) => {
    if (ref.current)
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.2;
  });
  if (!visible) return null;
  return (
    <group>
      <mesh ref={ref}>
        <torusGeometry args={[8, 0.4, 8, 64]} />
        <meshBasicMaterial color="#F6C35B" transparent opacity={0.6} />
      </mesh>
      <pointLight color="#F6C35B" intensity={3} distance={100} decay={2} />
      <Html center position={[0, 20, 0]} style={{ pointerEvents: "none" }}>
        <div
          style={{
            color: "#F6C35B",
            fontSize: 10,
            fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            textAlign: "center",
            textShadow: "0 0 8px rgba(246,195,91,0.8)",
            whiteSpace: "nowrap",
          }}
        >
          Galactic Center
          <br />
          <span style={{ fontSize: 8, opacity: 0.7 }}>
            26,000 light-years away
          </span>
        </div>
      </Html>
    </group>
  );
}

function CameraController({
  viewMode,
  selectedPlanet,
  planetPositionsRef,
}: {
  viewMode: ViewMode;
  selectedPlanet: PlanetConfig | null;
  planetPositionsRef: React.RefObject<Record<string, Vector3>>;
}) {
  const targetPos = useRef(new Vector3(0, 30, 120));
  const targetLook = useRef(new Vector3(0, 0, 0));
  useFrame((state) => {
    if (selectedPlanet) {
      const pp = planetPositionsRef.current[selectedPlanet.name];
      if (pp) {
        const offset = selectedPlanet.size * 6 + 10;
        targetPos.current.set(
          pp.x + offset * 0.7,
          pp.y + offset * 0.4,
          pp.z + offset * 0.7,
        );
        targetLook.current.copy(pp);
      }
    } else if (viewMode === "galaxy") {
      targetPos.current.set(0, 600, 1100);
      targetLook.current.set(0, 0, 0);
    } else {
      targetPos.current.set(0, 30, 120);
      targetLook.current.set(0, 0, 0);
    }
    state.camera.position.lerp(targetPos.current, 0.035);
    if (state.controls) {
      (state.controls as any).target.lerp(targetLook.current, 0.035);
      (state.controls as any).update();
    }
  });
  return null;
}

function Planet({
  planet,
  isSelected,
  onPlanetClick,
  planetPositionsRef,
  speedMultiplier,
  scaleMode,
}: {
  planet: PlanetConfig;
  isSelected: boolean;
  onPlanetClick: (p: PlanetConfig, pos: Vector3) => void;
  planetPositionsRef: React.RefObject<Record<string, Vector3>>;
  speedMultiplier: number;
  scaleMode: boolean;
}) {
  const groupRef = useRef<any>(null);
  const meshRef = useRef<any>(null);
  const angleRef = useRef(planet.initialAngle ?? 0);
  const [hovered, setHovered] = useState(false);
  const emissiveColor = useMemo(() => {
    const c = new Color(planet.color);
    c.multiplyScalar(0.3);
    return c;
  }, [planet.color]);
  useFrame((_, delta) => {
    angleRef.current += planet.speed * delta * 0.5 * speedMultiplier;
    if (groupRef.current) {
      const x = Math.cos(angleRef.current) * planet.orbitalRadius;
      const z = Math.sin(angleRef.current) * planet.orbitalRadius;
      groupRef.current.position.set(x, 0, z);
      if (!planetPositionsRef.current[planet.name]) {
        planetPositionsRef.current[planet.name] = new Vector3();
      }
      planetPositionsRef.current[planet.name].set(x, 0, z);
    }
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.3;
  });
  const tiltRad = (planet.tilt * Math.PI) / 180;
  function handleClick(e: any) {
    e.stopPropagation();
    const worldPos = planetPositionsRef.current[planet.name] ?? new Vector3();
    onPlanetClick(planet, worldPos.clone());
  }
  return (
    <group ref={groupRef}>
      <group rotation={[0, 0, tiltRad]}>
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: Three.js mesh -- keyboard N/A */}
        <mesh
          ref={meshRef}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = "default";
          }}
          onClick={handleClick}
        >
          <sphereGeometry
            args={[
              scaleMode
                ? (TRUE_SCALE_SIZES[planet.name] ?? planet.size)
                : planet.size,
              32,
              32,
            ]}
          />
          <meshStandardMaterial
            color={planet.color}
            roughness={0.8}
            metalness={0.1}
            emissive={isSelected ? new Color(planet.color) : emissiveColor}
            emissiveIntensity={isSelected ? 0.4 : 0.05}
          />
        </mesh>
        {isSelected && (
          <mesh>
            <sphereGeometry args={[planet.size * 1.15, 32, 32]} />
            <meshBasicMaterial
              color={planet.color}
              transparent
              opacity={0.12}
              side={BackSide}
              depthWrite={false}
            />
          </mesh>
        )}
        {planet.hasRings && <SaturnRings />}
        {(hovered || isSelected) && (
          <Html
            center
            position={[0, planet.size + 1.8, 0]}
            style={{ pointerEvents: "none" }}
          >
            <div
              style={{
                background: "rgba(11,16,23,0.9)",
                border: `1px solid ${isSelected ? "rgba(246,195,91,0.8)" : "rgba(246,195,91,0.5)"}`,
                borderRadius: 8,
                padding: "4px 11px",
                color: "#F6C35B",
                fontSize: 11,
                fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
              }}
            >
              {planet.name}
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}

function Sun() {
  const halo1Ref = useRef<any>(null);
  const halo2Ref = useRef<any>(null);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (halo1Ref.current)
      halo1Ref.current.material.opacity = 0.08 + Math.sin(t * 0.7) * 0.03;
    if (halo2Ref.current)
      halo2Ref.current.material.opacity = 0.04 + Math.sin(t * 0.4 + 1) * 0.015;
  });
  return (
    <group>
      <mesh>
        <sphereGeometry args={[7, 32, 32]} />
        <meshStandardMaterial
          color="#FFF5CC"
          emissive="#F6C35B"
          emissiveIntensity={2.5}
          roughness={0.3}
          metalness={0}
        />
      </mesh>
      <mesh ref={halo1Ref}>
        <sphereGeometry args={[7.5, 32, 32]} />
        <meshBasicMaterial
          color="#F1A83A"
          transparent
          opacity={0.1}
          side={BackSide}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={halo2Ref}>
        <sphereGeometry args={[10, 32, 32]} />
        <meshBasicMaterial
          color="#F6C35B"
          transparent
          opacity={0.045}
          side={BackSide}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[15, 16, 16]} />
        <meshBasicMaterial
          color="#F1A83A"
          transparent
          opacity={0.02}
          side={BackSide}
          depthWrite={false}
        />
      </mesh>
      <pointLight color="#FFF5CC" intensity={4} distance={500} decay={1} />
      <pointLight color="#F6C35B" intensity={2} distance={200} decay={2} />
    </group>
  );
}

function SolarSystemGroup({
  viewMode,
  selectedPlanetName,
  onPlanetClick,
  planetPositionsRef,
  speedMultiplier,
  scaleMode,
}: {
  viewMode: ViewMode;
  selectedPlanetName: string | null;
  onPlanetClick: (p: PlanetConfig, pos: Vector3) => void;
  planetPositionsRef: React.RefObject<Record<string, Vector3>>;
  speedMultiplier: number;
  scaleMode: boolean;
}) {
  const groupRef = useRef<any>(null);
  const galacticAngle = useRef(Math.PI / 6);
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (viewMode === "galaxy") {
      galacticAngle.current += delta * 0.018;
      const tx = Math.cos(galacticAngle.current) * 400;
      const tz = Math.sin(galacticAngle.current) * 400;
      groupRef.current.position.lerp(new Vector3(tx, 0, tz), 0.04);
    } else {
      groupRef.current.position.lerp(new Vector3(0, 0, 0), 0.06);
    }
  });
  return (
    <group ref={groupRef}>
      <Sun />
      {PLANETS.map((p) => (
        <OrbitLine key={`orbit-${p.name}`} radius={p.orbitalRadius} />
      ))}
      {PLANETS.map((p) => (
        <Planet
          key={p.name}
          planet={p}
          isSelected={selectedPlanetName === p.name}
          onPlanetClick={onPlanetClick}
          planetPositionsRef={planetPositionsRef}
          speedMultiplier={speedMultiplier}
          scaleMode={scaleMode}
        />
      ))}
      <AsteroidBelt />
      {viewMode === "galaxy" && (
        <Html center position={[0, 18, 0]} style={{ pointerEvents: "none" }}>
          <div
            style={{
              background: "rgba(11,16,23,0.85)",
              border: "1px solid rgba(246,195,91,0.5)",
              borderRadius: 8,
              padding: "5px 12px",
              color: "#F6C35B",
              fontSize: 10,
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            Our Solar System
          </div>
        </Html>
      )}
    </group>
  );
}

function Scene({
  viewMode,
  selectedPlanetName,
  onPlanetClick,
  planetPositionsRef,
  speedMultiplier,
  scaleMode,
  onBlackHoleClick,
  audioManagerRef,
}: {
  viewMode: ViewMode;
  selectedPlanetName: string | null;
  onPlanetClick: (p: PlanetConfig, pos: Vector3) => void;
  planetPositionsRef: React.RefObject<Record<string, Vector3>>;
  speedMultiplier: number;
  scaleMode: boolean;
  onBlackHoleClick: () => void;
  audioManagerRef: React.RefObject<any>;
}) {
  const selectedPlanet =
    PLANETS.find((p) => p.name === selectedPlanetName) ?? null;
  return (
    <>
      <ambientLight intensity={viewMode === "galaxy" ? 0.03 : 0.08} />
      {viewMode === "galaxy" ? (
        <Stars
          radius={3000}
          depth={300}
          count={25000}
          factor={5}
          saturation={0.6}
          fade
          speed={0.2}
        />
      ) : (
        <Stars
          radius={200}
          depth={60}
          count={6000}
          factor={4}
          saturation={0.5}
          fade
          speed={0.5}
        />
      )}
      <GalaxyParticles visible={viewMode === "galaxy"} />
      <GalacticOrbitLine visible={viewMode === "galaxy"} />
      <GalacticCenter visible={viewMode === "galaxy"} />
      <SolarSystemGroup
        viewMode={viewMode}
        selectedPlanetName={selectedPlanetName}
        onPlanetClick={onPlanetClick}
        planetPositionsRef={planetPositionsRef}
        speedMultiplier={speedMultiplier}
        scaleMode={scaleMode}
      />
      {viewMode === "solar" && (
        <BlackHole
          onBlackHoleClick={onBlackHoleClick}
          audioManagerRef={audioManagerRef}
        />
      )}
      <CameraController
        viewMode={viewMode}
        selectedPlanet={selectedPlanet}
        planetPositionsRef={planetPositionsRef}
      />
      <OrbitControls
        makeDefault
        minDistance={8}
        maxDistance={viewMode === "galaxy" ? 3000 : 400}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
      />
    </>
  );
}

// ─── AuthButton ───────────────────────────────────────────────────────────────
function AuthButton() {
  const {
    login,
    clear,
    isInitializing,
    isLoggingIn,
    isLoginSuccess,
    identity,
  } = useInternetIdentity();
  const isLoggedIn =
    isLoginSuccess && !!identity && !identity.getPrincipal().isAnonymous();
  const principal = identity?.getPrincipal().toString() ?? "";
  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}...${principal.slice(-3)}`
    : "";
  const [copied, setCopied] = useState(false);

  function copyPrincipal() {
    navigator.clipboard.writeText(principal).then(() => {
      setCopied(true);
      toast.success("Principal ID copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (isInitializing) {
    return (
      <div
        style={{ padding: "8px 14px", display: "flex", alignItems: "center" }}
      >
        <LoaderCircle
          size={14}
          style={{ color: "#F6C35B", animation: "spin 1s linear infinite" }}
        />
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            data-ocid="auth.profile_button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(246,195,91,0.1)",
              border: "1px solid rgba(246,195,91,0.25)",
              borderRadius: 10,
              padding: "6px 12px",
              cursor: "pointer",
            }}
          >
            <Avatar style={{ width: 22, height: 22 }}>
              <AvatarFallback
                style={{
                  background: "rgba(246,195,91,0.2)",
                  color: "#F6C35B",
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                {principal.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span
              style={{
                color: "#D8BE8B",
                fontSize: 11,
                fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                fontWeight: 600,
              }}
            >
              {shortPrincipal}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          data-ocid="auth.popover"
          style={{
            background: "rgba(11,16,23,0.97)",
            border: "1px solid rgba(246,195,91,0.25)",
            borderRadius: 14,
            padding: 16,
            width: 300,
            backdropFilter: "blur(16px)",
            fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
          }}
          className="border-0"
        >
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                color: "#F6C35B",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Internet Identity
            </div>
            <div
              style={{
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                padding: "8px 10px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  color: "#D8BE8B",
                  fontSize: 10,
                  fontFamily: "monospace",
                  wordBreak: "break-all",
                  flex: 1,
                  lineHeight: 1.5,
                }}
              >
                {principal}
              </span>
              <button
                type="button"
                data-ocid="auth.copy_button"
                onClick={copyPrincipal}
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 6,
                  color: copied ? "#4ade80" : "#F6C35B",
                  cursor: "pointer",
                  padding: "5px 6px",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  transition: "color 0.15s",
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>
          </div>
          <button
            type="button"
            data-ocid="auth.logout_button"
            onClick={clear}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 9,
              color: "#F6C35B",
              cursor: "pointer",
              padding: "9px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              fontSize: 12,
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              fontWeight: 600,
              transition: "all 0.15s",
            }}
          >
            <LogOut size={13} />
            Logout
          </button>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <button
      type="button"
      data-ocid="auth.login_button"
      onClick={login}
      disabled={isLoggingIn}
      style={{
        background: "rgba(246,195,91,0.15)",
        border: "1px solid rgba(246,195,91,0.4)",
        borderRadius: 10,
        color: "#F6C35B",
        cursor: isLoggingIn ? "not-allowed" : "pointer",
        padding: "8px 14px",
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.06em",
        transition: "all 0.15s",
      }}
    >
      {isLoggingIn ? (
        <LoaderCircle size={14} className="animate-spin" />
      ) : (
        <LogIn size={14} />
      )}
      {isLoggingIn ? "Connecting..." : "Login"}
    </button>
  );
}

// ─── Menu button helper ───────────────────────────────────────────────────────
function MenuBtn({
  ocid,
  onClick,
  color = "#C8D4E0",
  border,
  bg,
  children,
}: {
  ocid: string;
  onClick: () => void;
  color?: string;
  border?: string;
  bg?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      data-ocid={ocid}
      onClick={onClick}
      style={{
        width: "100%",
        padding: "9px 14px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        color,
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        border: border ?? "1px solid transparent",
        background: bg ?? "transparent",
        borderRadius: 10,
        transition: "all 0.15s",
        textAlign: "left",
      }}
    >
      {children}
    </button>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [showSolarSystem, setShowSolarSystem] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("solar");
  const [selectedPlanetName, setSelectedPlanetName] = useState<string | null>(
    null,
  );
  const [donationOpen, setDonationOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [surfaceViewPlanet, setSurfaceViewPlanet] =
    useState<PlanetConfig | null>(null);
  const planetPositionsRef = useRef<Record<string, Vector3>>({});
  const { identity } = useInternetIdentity();
  const { isMuted, toggleMute } = useSpaceAudio("space");
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [scaleMode, setScaleMode] = useState(false);
  const [constellationMode, setConstellationMode] = useState(false);
  const [wormholeActive, setWormholeActive] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [missionsOpen, setMissionsOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);
  const [nameStarOpen, setNameStarOpen] = useState(false);
  const [monetizeOpen, setMonetizeOpen] = useState(false);
  const [dailyChallengeOpen, setDailyChallengeOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [multiverseOpen, setMultiverseOpen] = useState(false);
  const [pendingChallenge, setPendingChallenge] = useState(() =>
    hasPendingChallenge(),
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [blackHoleOpen, setBlackHoleOpen] = useState(false);
  const [audioSettingsOpen, setAudioSettingsOpen] = useState(false);
  const [creditShopOpen, setCreditShopOpen] = useState(false);
  const [dailyTasksOpen, setDailyTasksOpen] = useState(false);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);
  const [nftTeaserOpen, setNftTeaserOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [arcadeOpen, setArcadeOpen] = useState(false);
  const [novaCredits, setNovaCredits] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const audioManagerRef = useRef<any>(null);
  const [cometVisible, setCometVisible] = useState(false);
  const [cometStyle, setCometStyle] = useState({ top: "10%", angle: 45 });
  const [solarFlareVisible, setSolarFlareVisible] = useState(false);

  const anyModalOpen =
    donationOpen ||
    searchOpen ||
    quizOpen ||
    achievementsOpen ||
    missionsOpen ||
    leaderboardOpen ||
    journalOpen ||
    nameStarOpen ||
    monetizeOpen ||
    dailyChallengeOpen ||
    timelineOpen ||
    audioSettingsOpen ||
    blackHoleOpen ||
    multiverseOpen ||
    !!surfaceViewPlanet ||
    creditShopOpen ||
    dailyTasksOpen ||
    adminDashboardOpen ||
    nftTeaserOpen ||
    arcadeOpen;

  const [topBarVisible, setTopBarVisible] = useState(true);
  const topBarTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Comet flyby
  useEffect(() => {
    function scheduleComet() {
      const delay = 30000 + Math.random() * 15000;
      return setTimeout(() => {
        const top = `${5 + Math.random() * 35}%`;
        const angle = 25 + Math.random() * 30;
        setCometStyle({ top, angle });
        setCometVisible(true);
        audioManager.playCometWhoosh();
        setTimeout(() => setCometVisible(false), 2800);
        scheduleComet();
      }, delay);
    }
    const t = scheduleComet();
    return () => clearTimeout(t);
  }, []);

  // Solar flare
  useEffect(() => {
    function scheduleFlare() {
      const delay = 60000 + Math.random() * 30000;
      return setTimeout(() => {
        setSolarFlareVisible(true);
        audioManager.playSolarFlare();
        toast("☀️ Solar flare detected!", {
          duration: 3000,
          style: {
            background: "rgba(11,16,23,0.95)",
            border: "1px solid rgba(251,146,60,0.5)",
            color: "#FB923C",
          },
        });
        setTimeout(() => setSolarFlareVisible(false), 3500);
        scheduleFlare();
      }, delay);
    }
    const t = scheduleFlare();
    return () => clearTimeout(t);
  }, []);

  const [achievements, setAchievements] = useState<AchievementState>(() =>
    loadAchievements(),
  );

  const principal = identity?.getPrincipal().toString() ?? null;
  const isLoggedIn = !!(identity && !identity.getPrincipal().isAnonymous());
  const { data: isPremiumUser = false } = useIsPremiumUser(
    isLoggedIn ? principal : null,
  );
  const { actor } = useActor();

  // Load credits and record login
  useEffect(() => {
    if (!isLoggedIn || !actor) return;
    async function initUser() {
      try {
        const [bal, adminStatus] = await Promise.all([
          actor!.getBalance(),
          actor!.isCallerAdmin(),
          actor!.recordLogin(),
        ]);
        setNovaCredits(Number(bal));
        setIsAdmin(adminStatus);
      } catch {
        /* non-fatal */
      }
    }
    initUser();
  }, [isLoggedIn, actor]);

  function updateAchievement(update: Partial<AchievementState>) {
    setAchievements((prev) => {
      const next = { ...prev, ...update };
      saveAchievements(next);
      return next;
    });
  }

  function getRank(credits: number): string {
    if (credits >= 10000) return "Legend";
    if (credits >= 5000) return "Admiral";
    if (credits >= 2000) return "Commander";
    if (credits >= 500) return "Explorer";
    return "Cadet";
  }

  const selectedPlanetDetails: PlanetDetails | null = selectedPlanetName
    ? (PLANET_DETAILS[selectedPlanetName] ?? null)
    : null;
  const selectedPlanetConfig: PlanetConfig | null = selectedPlanetName
    ? (PLANETS.find((p) => p.name === selectedPlanetName) ?? null)
    : null;

  // Init audio on first interaction
  useEffect(() => {
    function initAudio() {
      audioManager.init();
      audioManagerRef.current = audioManager;
    }
    document.addEventListener("click", initAudio, { once: true });
    document.addEventListener("keydown", initAudio, { once: true });
    return () => {
      document.removeEventListener("click", initAudio);
      document.removeEventListener("keydown", initAudio);
    };
  }, []);

  const handlePlanetClick = useCallback((planet: PlanetConfig) => {
    audioManager.playPlanetSound(planet.name);
    setSelectedPlanetName(planet.name);
    setAchievements((prev) => {
      const next = {
        ...prev,
        visitedPlanets: [...new Set([...prev.visitedPlanets, planet.name])],
      };
      saveAchievements(next);
      return next;
    });
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedPlanetName(null);
  }, []);

  const toggleGalaxy = useCallback(() => {
    setWormholeActive(true);
    audioManager.playUIClick();
    setTimeout(() => {
      setViewMode((v) => {
        const next = v === "galaxy" ? "solar" : "galaxy";
        if (next === "galaxy") audioManager.startGalaxyAmbient();
        else audioManager.startSolarSystemAmbient();
        return next;
      });
      setSelectedPlanetName(null);
    }, 400);
    setAchievements((prev) => {
      const next = { ...prev, usedGalaxyView: true };
      saveAchievements(next);
      return next;
    });
  }, []);

  const handleLandOnPlanet = useCallback(async () => {
    if (!selectedPlanetConfig) return;
    // Credit-gated: premium users free; others spend 50 credits
    if (!isPremiumUser) {
      if (novaCredits < 50) {
        toast.error(
          "Requires Premium access or 50 Nova Credits to land on planets.",
          {
            style: {
              background: "rgba(11,16,23,0.95)",
              border: "1px solid rgba(248,113,113,0.4)",
              color: "#f87171",
            },
          },
        );
        setDonationOpen(true);
        return;
      }
      if (actor) {
        const success = await actor.spendCredits(50n);
        if (!success) {
          toast.error("Insufficient Nova Credits.");
          return;
        }
        setNovaCredits((prev) => Math.max(0, prev - 50));
        toast.success("✦ 50 Nova Credits spent — enjoy the surface!", {
          style: {
            background: "rgba(11,16,23,0.95)",
            border: "1px solid rgba(246,195,91,0.4)",
            color: "#F6C35B",
          },
        });
      }
    }
    setSurfaceViewPlanet(selectedPlanetConfig);
    setAchievements((prev) => {
      const next = { ...prev, landedOnSurface: true };
      saveAchievements(next);
      return next;
    });
  }, [selectedPlanetConfig, isPremiumUser, novaCredits, actor]);

  const handleGalaxyToggle = useCallback(async () => {
    if (viewMode === "galaxy") {
      toggleGalaxy();
      return;
    }
    // Entering galaxy view: premium = free; otherwise 100 credits
    if (!isPremiumUser) {
      if (novaCredits < 100) {
        toast.error(
          "Requires Premium access or 100 Nova Credits to access Galaxy View.",
          {
            style: {
              background: "rgba(11,16,23,0.95)",
              border: "1px solid rgba(248,113,113,0.4)",
              color: "#f87171",
            },
          },
        );
        setDonationOpen(true);
        setMenuOpen(false);
        return;
      }
      if (actor) {
        const success = await actor.spendCredits(100n);
        if (!success) {
          toast.error("Insufficient Nova Credits.");
          return;
        }
        setNovaCredits((prev) => Math.max(0, prev - 100));
        toast.success("✦ 100 Nova Credits spent — welcome to the Galaxy!", {
          style: {
            background: "rgba(11,16,23,0.95)",
            border: "1px solid rgba(246,195,91,0.4)",
            color: "#F6C35B",
          },
        });
      }
    }
    toggleGalaxy();
  }, [viewMode, isPremiumUser, novaCredits, actor, toggleGalaxy]);

  const resetTopBarTimer = () => {
    setTopBarVisible(true);
    if (topBarTimerRef.current) clearTimeout(topBarTimerRef.current);
    topBarTimerRef.current = setTimeout(() => setTopBarVisible(false), 4000);
  };

  const handleMenuPanelActivity = () => {
    if (menuTimerRef.current) clearTimeout(menuTimerRef.current);
    menuTimerRef.current = setTimeout(() => setMenuOpen(false), 5000);
  };

  if (!showSolarSystem) {
    return (
      <ErrorBoundary>
        <InterstellarBlackHoleHero
          onEnterSolarSystem={() => setShowSolarSystem(true)}
        />
      </ErrorBoundary>
    );
  }

  const isGalaxyLocked =
    !isPremiumUser && viewMode !== "galaxy" && novaCredits < 100;
  const galaxyLockLabel =
    !isPremiumUser && viewMode !== "galaxy"
      ? novaCredits >= 100
        ? "100 Credits"
        : "★ PREMIUM"
      : undefined;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#0B1017",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseMove={resetTopBarTimer}
    >
      {showIntro && (
        <WarpIntroSequence onComplete={() => setShowIntro(false)} />
      )}
      {/* 3D Canvas */}
      <ErrorBoundary>
        <Canvas
          camera={{ fov: 60, near: 0.1, far: 5000, position: [0, 30, 120] }}
          frameloop={anyModalOpen ? "demand" : "always"}
          style={{
            background: "linear-gradient(180deg, #0B1017 0%, #0F1A25 100%)",
          }}
          gl={{
            antialias: true,
            alpha: false,
            toneMapping: ACESFilmicToneMapping,
            toneMappingExposure: 1.2,
          }}
        >
          <Scene
            viewMode={viewMode}
            selectedPlanetName={selectedPlanetName}
            onPlanetClick={handlePlanetClick}
            planetPositionsRef={planetPositionsRef}
            speedMultiplier={speedMultiplier}
            scaleMode={scaleMode}
            onBlackHoleClick={() => setBlackHoleOpen(true)}
            audioManagerRef={audioManagerRef}
          />
        </Canvas>
      </ErrorBoundary>

      {/* Modal dim overlay */}
      <AnimatePresence>
        {anyModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 105,
              background: "rgba(5, 10, 18, 0.88)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
            key="modal-overlay"
          />
        )}
      </AnimatePresence>

      {/* Top bar */}
      <motion.div
        animate={{ opacity: topBarVisible ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 24px",
          pointerEvents: topBarVisible ? "auto" : "none",
          zIndex: 10,
        }}
      >
        <div style={{ pointerEvents: "auto" }}>
          <AuthButton />
        </div>
      </motion.div>

      {/* Planet panel */}
      <PlanetPanel planet={selectedPlanetDetails} onClose={handleClosePanel} />

      {/* Land on Planet button */}
      <AnimatePresence>
        {selectedPlanetName && selectedPlanetConfig && (
          <motion.button
            key="land-btn"
            type="button"
            data-ocid="surface.open_modal_button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            onClick={handleLandOnPlanet}
            style={{
              position: "absolute",
              bottom: 80,
              left: "50%",
              transform: "translateX(-50%)",
              background: `linear-gradient(135deg, ${selectedPlanetConfig.color}cc, ${selectedPlanetConfig.color}88)`,
              border: `1px solid ${selectedPlanetConfig.color}80`,
              borderRadius: 12,
              color: "#fff",
              cursor: "pointer",
              padding: "11px 24px",
              fontSize: 11,
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: 7,
              backdropFilter: "blur(8px)",
              boxShadow: `0 4px 20px ${selectedPlanetConfig.color}40`,
              whiteSpace: "nowrap",
            }}
          >
            <Rocket size={13} />
            Land on {selectedPlanetName}
            {!isPremiumUser && (
              <span style={{ fontSize: 9, opacity: 0.8 }}>(50 ✦)</span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Planet Journal button */}
      <AnimatePresence>
        {selectedPlanetName && (
          <motion.button
            key="journal-btn"
            type="button"
            data-ocid="journal.open_modal_button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={() => setJournalOpen(true)}
            style={{
              position: "absolute",
              bottom: 110,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(11,16,23,0.8)",
              border: "1px solid rgba(246,195,91,0.3)",
              borderRadius: 10,
              color: "#D8BE8B",
              cursor: "pointer",
              padding: "8px 18px",
              fontSize: 11,
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              fontWeight: 700,
              letterSpacing: "0.08em",
              display: "flex",
              alignItems: "center",
              gap: 6,
              backdropFilter: "blur(8px)",
              whiteSpace: "nowrap",
            }}
          >
            📝 Planet Journal
          </motion.button>
        )}
      </AnimatePresence>

      {/* Menu toggle button */}
      <motion.button
        type="button"
        data-ocid="menu.toggle"
        onClick={() => setMenuOpen((v) => !v)}
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        whileHover={{ opacity: 1, scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: "fixed",
          bottom: 24,
          left: 24,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: menuOpen
            ? "rgba(246,195,91,0.18)"
            : "rgba(20,30,50,0.95)",
          border: menuOpen
            ? "1px solid rgba(246,195,91,0.6)"
            : "1px solid rgba(246,195,91,0.5)",
          color: "#F6C35B",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: menuOpen
            ? "0 0 18px rgba(246,195,91,0.3)"
            : "0 0 16px rgba(246,195,91,0.4), 0 2px 8px rgba(0,0,0,0.6)",
          zIndex: 9999,
          transition: "background 0.2s, border 0.2s, box-shadow 0.2s",
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          role="img"
          aria-label="Menu"
        >
          <rect y="3" width="18" height="2" rx="1" fill="currentColor" />
          <rect y="8" width="18" height="2" rx="1" fill="currentColor" />
          <rect y="13" width="18" height="2" rx="1" fill="currentColor" />
        </svg>
      </motion.button>

      {/* Menu panel */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="controls-panel"
            initial={{ x: -270, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -270, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onMouseMove={handleMenuPanelActivity}
            style={{
              position: "fixed",
              bottom: 78,
              left: 12,
              width: 240,
              maxHeight: "calc(100vh - 120px)",
              overflowY: "auto",
              background: "rgba(11,16,23,0.88)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 16,
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              padding: "12px 10px",
              display: "flex",
              flexDirection: "column",
              gap: 5,
              zIndex: 9998,
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(246,195,91,0.2) transparent",
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
            }}
          >
            <div
              style={{
                color: "#F6C35B",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "2px 8px 6px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                marginBottom: 2,
              }}
            >
              Controls
            </div>

            {/* Galaxy toggle — credit/premium gated */}
            <button
              type="button"
              data-ocid="galaxy.toggle"
              onClick={() => {
                setMenuOpen(false);
                handleGalaxyToggle();
              }}
              title={
                galaxyLockLabel
                  ? `${galaxyLockLabel} to unlock Galaxy View`
                  : undefined
              }
              style={{
                width: "100%",
                padding: "9px 14px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: viewMode === "galaxy" ? "#F6C35B" : "#C8D4E0",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                border:
                  viewMode === "galaxy"
                    ? "1px solid rgba(246,195,91,0.4)"
                    : "1px solid transparent",
                background:
                  viewMode === "galaxy"
                    ? "rgba(246,195,91,0.08)"
                    : "transparent",
                borderRadius: 10,
                transition: "all 0.2s",
                textAlign: "left",
                opacity: isGalaxyLocked ? 0.7 : 1,
              }}
            >
              <Globe2 size={14} style={{ flexShrink: 0 }} />
              {viewMode === "galaxy" ? "Solar System View" : "Galaxy View"}
              {galaxyLockLabel && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 9,
                    color: "#F6C35B",
                    letterSpacing: "0.1em",
                  }}
                >
                  {galaxyLockLabel}
                </span>
              )}
            </button>

            {/* Donate */}
            <MenuBtn
              ocid="donation.open_modal_button"
              onClick={() => {
                setDonationOpen(true);
                setMenuOpen(false);
              }}
            >
              <Heart size={14} color="#F6C35B" style={{ flexShrink: 0 }} />
              Support Exploration
            </MenuBtn>

            {/* Search */}
            <MenuBtn
              ocid="planet_search.open_modal_button"
              onClick={() => {
                setSearchOpen(true);
                setMenuOpen(false);
              }}
            >
              <Search size={14} color="#7de8e8" style={{ flexShrink: 0 }} />
              Search Planets
            </MenuBtn>

            {/* Audio */}
            <MenuBtn
              ocid="audio.toggle"
              onClick={toggleMute}
              color={isMuted ? "#9AA7B6" : "#C8D4E0"}
            >
              {isMuted ? (
                <VolumeX size={14} style={{ flexShrink: 0 }} />
              ) : (
                <Volume2 size={14} style={{ flexShrink: 0 }} />
              )}
              {isMuted ? "Audio Off" : "Audio On"}
            </MenuBtn>

            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.07)",
                margin: "4px 0",
              }}
            />

            {/* Speed */}
            <div
              style={{
                padding: "8px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <span
                style={{
                  color: "#F6C35B",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                ⏩ Speed: {speedMultiplier.toFixed(1)}x
              </span>
              <input
                data-ocid="controls.toggle"
                type="range"
                min={0.1}
                max={50}
                step={0.1}
                value={speedMultiplier}
                onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
                style={{
                  width: "100%",
                  accentColor: "#F6C35B",
                  cursor: "pointer",
                }}
              />
            </div>

            {/* Scale */}
            <MenuBtn
              ocid="scale.toggle"
              onClick={() => setScaleMode((v) => !v)}
              color="#F6C35B"
              border={
                scaleMode
                  ? "1px solid rgba(246,195,91,0.4)"
                  : "1px solid transparent"
              }
              bg={scaleMode ? "rgba(246,195,91,0.08)" : "transparent"}
            >
              🔭 {scaleMode ? "True Scale ON" : "True Scale"}
            </MenuBtn>

            {/* Constellations */}
            <MenuBtn
              ocid="constellation.toggle"
              onClick={() => setConstellationMode((v) => !v)}
              color="#F6C35B"
              border={
                constellationMode
                  ? "1px solid rgba(246,195,91,0.4)"
                  : "1px solid transparent"
              }
              bg={constellationMode ? "rgba(246,195,91,0.08)" : "transparent"}
            >
              ✨ Constellations
            </MenuBtn>

            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.07)",
                margin: "4px 0",
              }}
            />
            <div
              style={{
                color: "#F6C35B",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "2px 8px 4px",
              }}
            >
              Activities
            </div>

            <MenuBtn
              ocid="quiz.open_modal_button"
              onClick={() => {
                setQuizOpen(true);
                setMenuOpen(false);
              }}
            >
              🧠 Planet Quiz
            </MenuBtn>
            <MenuBtn
              ocid="achievements.open_modal_button"
              onClick={() => {
                setAchievementsOpen(true);
                setMenuOpen(false);
              }}
            >
              🏆 Achievements
            </MenuBtn>
            <MenuBtn
              ocid="missions.open_modal_button"
              onClick={() => {
                setMissionsOpen(true);
                setMenuOpen(false);
              }}
            >
              🚀 Space Missions
            </MenuBtn>
            <MenuBtn
              ocid="leaderboard.open_modal_button"
              onClick={() => {
                setLeaderboardOpen(true);
                setMenuOpen(false);
              }}
            >
              🏅 Leaderboard
            </MenuBtn>
            <MenuBtn
              ocid="namestar.open_modal_button"
              onClick={() => {
                setNameStarOpen(true);
                setMenuOpen(false);
              }}
            >
              <MenuBtn
                ocid="arcade.open_modal_button"
                onClick={() => {
                  setArcadeOpen(true);
                  setMenuOpen(false);
                }}
              >
                🎮 Game Arcade
              </MenuBtn>
              ⭐ Name a Star
            </MenuBtn>

            <button
              type="button"
              data-ocid="daily_challenge.open_modal_button"
              onClick={() => {
                setDailyChallengeOpen(true);
                setPendingChallenge(false);
                setMenuOpen(false);
              }}
              style={{
                width: "100%",
                padding: "9px 14px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "#C8D4E0",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                border: "1px solid transparent",
                background: "transparent",
                borderRadius: 10,
                transition: "all 0.15s",
                textAlign: "left",
                position: "relative",
              }}
            >
              🔭 Daily Challenge
              {pendingChallenge && (
                <span
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 10,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#EF4444",
                    boxShadow: "0 0 6px rgba(239,68,68,0.8)",
                  }}
                />
              )}
            </button>

            <MenuBtn
              ocid="timeline.open_modal_button"
              onClick={() => {
                setTimelineOpen(true);
                setMenuOpen(false);
              }}
            >
              📅 Space Timeline
            </MenuBtn>
            <MenuBtn
              ocid="multiverse.open_modal_button"
              onClick={() => {
                setMultiverseOpen(true);
                setMenuOpen(false);
              }}
            >
              ∞ Multiverse
            </MenuBtn>
            <MenuBtn
              ocid="audio_settings.open_modal_button"
              onClick={() => {
                setAudioSettingsOpen(true);
                setMenuOpen(false);
              }}
            >
              🔊 Audio Settings
            </MenuBtn>
            <MenuBtn
              ocid="monetize.open_modal_button"
              onClick={() => {
                setMonetizeOpen(true);
                setMenuOpen(false);
              }}
            >
              💰 Support & Revenue
            </MenuBtn>

            {/* Nova Credits Shop */}
            <MenuBtn
              ocid="nova_credits.open_modal_button"
              onClick={() => {
                setCreditShopOpen(true);
                setMenuOpen(false);
              }}
              color="#F6C35B"
              border="1px solid rgba(246,195,91,0.2)"
              bg="rgba(246,195,91,0.06)"
            >
              ✦ Nova Credits Shop
            </MenuBtn>

            {/* Daily Tasks */}
            <MenuBtn
              ocid="daily_tasks.open_modal_button"
              onClick={() => {
                setDailyTasksOpen(true);
                setMenuOpen(false);
              }}
            >
              ✅ Daily Tasks
            </MenuBtn>

            {/* NFT Collection */}
            <MenuBtn
              ocid="nft.open_modal_button"
              onClick={() => {
                setNftTeaserOpen(true);
                setMenuOpen(false);
              }}
              color="#a78bfa"
              border="1px solid rgba(167,139,250,0.2)"
              bg="rgba(167,139,250,0.06)"
            >
              🌌 NFT Collection
            </MenuBtn>

            {/* Admin Dashboard (admin only) */}
            {isAdmin && (
              <MenuBtn
                ocid="admin.open_modal_button"
                onClick={() => {
                  setAdminDashboardOpen(true);
                  setMenuOpen(false);
                }}
                color="#60a5fa"
                border="1px solid rgba(96,165,250,0.2)"
                bg="rgba(96,165,250,0.06)"
              >
                🛡️ Admin Dashboard
              </MenuBtn>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nova Credits display */}
      {isLoggedIn && (
        <NovaCreditsDisplay credits={novaCredits} rank={getRank(novaCredits)} />
      )}

      {/* Bottom hint */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(11,16,23,0.65)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 9999,
          padding: "7px 18px",
          backdropFilter: "blur(10px)",
          color: "#F6C35B",
          fontSize: 10,
          fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
          fontWeight: 500,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}
      >
        {selectedPlanetName
          ? "Zooming to planet · Click close to return"
          : viewMode === "galaxy"
            ? "Milky Way · Sun orbiting galactic center"
            : "Drag to rotate · Scroll to zoom · Click planets"}
      </div>

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          right: selectedPlanetName ? 400 : 24,
          color: "#F6C35B",
          fontSize: 10,
          fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
          letterSpacing: "0.05em",
          opacity: 0.55,
          transition: "right 0.3s",
        }}
      >
        © {new Date().getFullYear()}. Built with ♥ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noreferrer"
          style={{ color: "#D8BE8B", textDecoration: "none" }}
        >
          caffeine.ai
        </a>
      </div>

      {/* Modals */}
      <DonationModal open={donationOpen} onOpenChange={setDonationOpen} />
      <PlanetSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSelectPlanet={(name) => {
          const pos = planetPositionsRef.current[name];
          if (pos && pos.length() > 0.1) setSelectedPlanetName(name);
          else setSelectedPlanetName(name);
        }}
      />

      <AnimatePresence>
        {surfaceViewPlanet && (
          <SurfaceView
            key="surface"
            planet={surfaceViewPlanet}
            onExit={() => setSurfaceViewPlanet(null)}
          />
        )}
      </AnimatePresence>

      <ConstellationOverlay active={constellationMode} />
      <WormholeEffect
        active={wormholeActive}
        onDone={() => setWormholeActive(false)}
      />

      <PlanetQuiz
        open={quizOpen}
        onOpenChange={setQuizOpen}
        onQuizComplete={() => updateAchievement({ usedQuiz: true })}
      />
      <AchievementsPanel
        open={achievementsOpen}
        onOpenChange={setAchievementsOpen}
        achievements={achievements}
      />
      <SpaceMissions
        open={missionsOpen}
        onOpenChange={setMissionsOpen}
        onNavigateToPlanet={(name) => setSelectedPlanetName(name)}
        novaCredits={novaCredits}
        onCreditsSpent={(amount) =>
          setNovaCredits((prev) => Math.max(0, prev - amount))
        }
      />
      <Leaderboard
        open={leaderboardOpen}
        onOpenChange={setLeaderboardOpen}
        isLoggedIn={isLoggedIn}
      />
      {selectedPlanetName && (
        <PlanetJournal
          open={journalOpen}
          onOpenChange={setJournalOpen}
          planetName={selectedPlanetName}
          onJournalWritten={() =>
            updateAchievement({ wrotePlanetJournal: true })
          }
        />
      )}
      <NameAStar
        open={nameStarOpen}
        onOpenChange={setNameStarOpen}
        onStarNamed={() => updateAchievement({ namedAStar: true })}
      />
      <MonetizationModal open={monetizeOpen} onOpenChange={setMonetizeOpen} />
      <DailyChallenge
        open={dailyChallengeOpen}
        onOpenChange={setDailyChallengeOpen}
      />
      <SpaceTimeline open={timelineOpen} onOpenChange={setTimelineOpen} />
      {multiverseOpen && (
        <MultiverseView onClose={() => setMultiverseOpen(false)} />
      )}

      {/* Comet */}
      <AnimatePresence>
        {cometVisible && (
          <motion.div
            key="comet"
            initial={{ opacity: 0, x: -80, y: -20 }}
            animate={{
              opacity: [0, 1, 1, 0.6, 0],
              x: ["-5vw", "110vw"],
              y: ["0vh", "40vh"],
            }}
            transition={{ duration: 2.6, ease: "easeIn" }}
            style={{
              position: "fixed",
              top: cometStyle.top,
              left: 0,
              zIndex: 50,
              pointerEvents: "none",
              transform: `rotate(${cometStyle.angle}deg)`,
            }}
          >
            <div
              style={{
                width: 120,
                height: 2,
                background:
                  "linear-gradient(to right, transparent, rgba(147,197,253,0.4), rgba(255,255,255,0.9))",
                borderRadius: 1,
                position: "absolute",
                right: 6,
                top: -1,
                filter: "blur(0.5px)",
              }}
            />
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#fff",
                boxShadow:
                  "0 0 8px 3px rgba(147,197,253,0.8), 0 0 18px 6px rgba(96,165,250,0.4)",
                position: "absolute",
                right: 0,
                top: -2,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Solar flare */}
      <AnimatePresence>
        {solarFlareVisible && (
          <motion.div
            key="solar-flare"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{
              opacity: [0, 0.7, 0.5, 0.8, 0],
              scale: [0.6, 1.4, 1.1, 1.6, 0.8],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: "easeOut" }}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 200,
              height: 200,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(251,191,36,0.15) 0%, rgba(251,146,60,0.08) 40%, transparent 70%)",
              border: "1px solid rgba(251,146,60,0.25)",
              boxShadow:
                "0 0 60px 20px rgba(251,191,36,0.1), 0 0 120px 40px rgba(251,146,60,0.05)",
              pointerEvents: "none",
              zIndex: 10,
            }}
          />
        )}
      </AnimatePresence>

      <BlackHolePanel
        open={blackHoleOpen}
        onClose={() => setBlackHoleOpen(false)}
      />
      <AudioSettings
        open={audioSettingsOpen}
        onClose={() => setAudioSettingsOpen(false)}
      />
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "rgba(11,16,23,0.95)",
            border: "1px solid rgba(246,195,91,0.3)",
            color: "#E9EEF5",
            fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
          },
        }}
      />
      <CreditShop
        isOpen={creditShopOpen}
        onClose={() => setCreditShopOpen(false)}
      />
      <DailyTaskPanel
        isOpen={dailyTasksOpen}
        onClose={() => setDailyTasksOpen(false)}
        onCreditsEarned={(amount) => setNovaCredits((prev) => prev + amount)}
      />
      <AdminDashboard
        isOpen={adminDashboardOpen}
        onClose={() => setAdminDashboardOpen(false)}
      />
      <NFTTeaser
        isOpen={nftTeaserOpen}
        onClose={() => setNftTeaserOpen(false)}
      />
      <GameArcade
        open={arcadeOpen}
        onClose={() => setArcadeOpen(false)}
        novaCredits={novaCredits}
        onSpendCredits={(amount) =>
          setNovaCredits((prev) => Math.max(0, prev - amount))
        }
        onEarnCredits={(amount) => setNovaCredits((prev) => prev + amount)}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
}
