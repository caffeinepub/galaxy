import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
  Loader2,
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
import * as THREE from "three";
import {
  AchievementsPanel,
  loadAchievements,
  saveAchievements,
} from "./components/Achievements";
import type { AchievementState } from "./components/Achievements";
import { ConstellationOverlay } from "./components/ConstellationOverlay";
import { DonationModal } from "./components/DonationModal";
import { Leaderboard } from "./components/Leaderboard";
import { MonetizationModal } from "./components/MonetizationModal";
import { NameAStar } from "./components/NameAStar";
import { PlanetJournal } from "./components/PlanetJournal";
import { PLANET_DETAILS, PlanetPanel } from "./components/PlanetPanel";
import type { PlanetDetails } from "./components/PlanetPanel";
import { PlanetQuiz } from "./components/PlanetQuiz";
import { PlanetSearch } from "./components/PlanetSearch";
import { SpaceMissions } from "./components/SpaceMissions";
import { SurfaceView } from "./components/SurfaceView";
import { WormholeEffect } from "./components/WormholeEffect";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useRecordDonation } from "./hooks/useQueries";
import { useIsPremiumUser } from "./hooks/useQueries";
import { useSpaceAudio } from "./hooks/useSpaceAudio";

// ─── Planet config ─────────────────────────────────────────────────────────
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
    size: 1.0,
    orbitalRadius: 25,
    speed: 1.0,
    tilt: 23.4,
    initialAngle: 2.0,
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

// True-to-scale planet sizes (relative units)
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

// ─── Asteroid Belt ──────────────────────────────────────────────────────────
function AsteroidBelt() {
  const { positions } = useMemo(() => {
    const pos: number[] = [];
    for (let i = 0; i < 800; i++) {
      const r = 35 + Math.random() * 14; // between Mars(33) and Jupiter(52)
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

type ViewMode = "solar" | "galaxy";

interface SceneProps {
  viewMode: ViewMode;
  selectedPlanetName: string | null;
  onPlanetClick: (planet: PlanetConfig, worldPos: THREE.Vector3) => void;
  planetPositionsRef: React.MutableRefObject<Record<string, THREE.Vector3>>;
  speedMultiplier: number;
  scaleMode: boolean;
}

// ─── Orbit Line ─────────────────────────────────────────────────────────────
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

// ─── Saturn Rings ───────────────────────────────────────────────────────────
function SaturnRings() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[3.8, 6.5, 64]} />
      <meshBasicMaterial
        color="#c2a46e"
        side={THREE.DoubleSide}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

// ─── Galaxy Particles ───────────────────────────────────────────────────────
function GalaxyParticles({ visible }: { visible: boolean }) {
  const { positions, colors } = useMemo(() => {
    const pos: number[] = [];
    const col: number[] = [];
    const numArms = 4;
    const perArm = 4000;
    const armColors = [
      new THREE.Color("#8ab4e8"),
      new THREE.Color("#e8c48a"),
      new THREE.Color("#a8d4f5"),
      new THREE.Color("#f0d8a0"),
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
    // bulge at center
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
      col.push(b * 1.0, b * 0.9, b * 0.7);
    }
    // outer halo
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

// ─── Galactic Orbit Line ────────────────────────────────────────────────────
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

// ─── Camera Controller ──────────────────────────────────────────────────────
interface CameraControllerProps {
  viewMode: ViewMode;
  selectedPlanet: PlanetConfig | null;
  planetPositionsRef: React.MutableRefObject<Record<string, THREE.Vector3>>;
}

function CameraController({
  viewMode,
  selectedPlanet,
  planetPositionsRef,
}: CameraControllerProps) {
  const targetPos = useRef(new THREE.Vector3(0, 30, 120));
  const targetLook = useRef(new THREE.Vector3(0, 0, 0));

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

// ─── Planet ──────────────────────────────────────────────────────────────────
interface PlanetProps {
  planet: PlanetConfig;
  isSelected: boolean;
  onPlanetClick: (planet: PlanetConfig, worldPos: THREE.Vector3) => void;
  planetPositionsRef: React.MutableRefObject<Record<string, THREE.Vector3>>;
  speedMultiplier: number;
  scaleMode: boolean;
}

function Planet({
  planet,
  isSelected,
  onPlanetClick,
  planetPositionsRef,
  speedMultiplier,
  scaleMode,
}: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const angleRef = useRef(planet.initialAngle ?? 0);
  const [hovered, setHovered] = useState(false);

  const emissiveColor = useMemo(() => {
    const c = new THREE.Color(planet.color);
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
        planetPositionsRef.current[planet.name] = new THREE.Vector3();
      }
      planetPositionsRef.current[planet.name].set(x, 0, z);
    }
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.3;
  });

  const tiltRad = (planet.tilt * Math.PI) / 180;

  function handleClick(e: any) {
    e.stopPropagation();
    const worldPos =
      planetPositionsRef.current[planet.name] ?? new THREE.Vector3();
    onPlanetClick(planet, worldPos.clone());
  }

  return (
    <group ref={groupRef}>
      <group rotation={[0, 0, tiltRad]}>
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: R3F 3D mesh, not a DOM element */}
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
            emissive={
              isSelected ? new THREE.Color(planet.color) : emissiveColor
            }
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
              side={THREE.BackSide}
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

// ─── Sun ─────────────────────────────────────────────────────────────────────
function Sun() {
  const halo1Ref = useRef<THREE.Mesh>(null);
  const halo2Ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (halo1Ref.current)
      halo1Ref.current.scale.setScalar(1 + Math.sin(t * 0.7) * 0.03);
    if (halo2Ref.current)
      halo2Ref.current.scale.setScalar(1 + Math.cos(t * 0.4) * 0.04);
  });
  return (
    <group>
      <mesh>
        <sphereGeometry args={[6, 64, 64]} />
        <meshStandardMaterial
          color="#F6C35B"
          emissive="#F6C35B"
          emissiveIntensity={2.5}
          roughness={0.4}
          metalness={0}
        />
      </mesh>
      <mesh ref={halo1Ref}>
        <sphereGeometry args={[7.5, 32, 32]} />
        <meshBasicMaterial
          color="#F1A83A"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={halo2Ref}>
        <sphereGeometry args={[10, 32, 32]} />
        <meshBasicMaterial
          color="#F6C35B"
          transparent
          opacity={0.045}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[15, 16, 16]} />
        <meshBasicMaterial
          color="#F1A83A"
          transparent
          opacity={0.02}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      <pointLight color="#FFF5CC" intensity={4} distance={500} decay={1} />
      <pointLight color="#F6C35B" intensity={2} distance={200} decay={2} />
    </group>
  );
}

// ─── Galactic Center marker ──────────────────────────────────────────────────
function GalacticCenter({ visible }: { visible: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
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

// ─── Solar System Group (for galaxy orbit) ───────────────────────────────────
interface SolarSystemGroupProps {
  viewMode: ViewMode;
  selectedPlanetName: string | null;
  onPlanetClick: (planet: PlanetConfig, worldPos: THREE.Vector3) => void;
  planetPositionsRef: React.MutableRefObject<Record<string, THREE.Vector3>>;
  speedMultiplier: number;
  scaleMode: boolean;
}

function SolarSystemGroup({
  viewMode,
  selectedPlanetName,
  onPlanetClick,
  planetPositionsRef,
  speedMultiplier,
  scaleMode,
}: SolarSystemGroupProps) {
  const groupRef = useRef<THREE.Group>(null);
  const galacticAngle = useRef(Math.PI / 6);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (viewMode === "galaxy") {
      galacticAngle.current += delta * 0.018;
      const tx = Math.cos(galacticAngle.current) * 400;
      const tz = Math.sin(galacticAngle.current) * 400;
      groupRef.current.position.lerp(new THREE.Vector3(tx, 0, tz), 0.04);
    } else {
      groupRef.current.position.lerp(new THREE.Vector3(0, 0, 0), 0.06);
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

// ─── Main Scene ───────────────────────────────────────────────────────────────
function Scene({
  viewMode,
  selectedPlanetName,
  onPlanetClick,
  planetPositionsRef,
  speedMultiplier,
  scaleMode,
}: SceneProps) {
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

// ─── Auth Button ─────────────────────────────────────────────────────────────
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
        <Loader2
          size={14}
          style={{ color: "#9AA7B6", animation: "spin 1s linear infinite" }}
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
            padding: "16px",
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
                  color: copied ? "#4ade80" : "#9AA7B6",
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
              color: "#9AA7B6",
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
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <LogIn size={14} />
      )}
      {isLoggingIn ? "Connecting..." : "Login"}
    </button>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("solar");
  const [selectedPlanetName, setSelectedPlanetName] = useState<string | null>(
    null,
  );
  const [donationOpen, setDonationOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [surfaceViewPlanet, setSurfaceViewPlanet] =
    useState<PlanetConfig | null>(null);
  const planetPositionsRef = useRef<Record<string, THREE.Vector3>>({});
  const { actor } = useActor();
  const { mutate: recordDonation } = useRecordDonation();
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
  const [achievements, setAchievements] = useState<AchievementState>(() =>
    loadAchievements(),
  );

  const principal = identity?.getPrincipal().toString() ?? null;
  const isLoggedIn = !!(identity && !identity.getPrincipal().isAnonymous());
  // Premium user status (available for future premium gating features)
  useIsPremiumUser(isLoggedIn ? principal : null);

  function updateAchievement(update: Partial<AchievementState>) {
    setAchievements((prev) => {
      const next = { ...prev, ...update };
      saveAchievements(next);
      return next;
    });
  }

  const selectedPlanetDetails: PlanetDetails | null = selectedPlanetName
    ? (PLANET_DETAILS[selectedPlanetName] ?? null)
    : null;

  const selectedPlanetConfig: PlanetConfig | null = selectedPlanetName
    ? (PLANETS.find((p) => p.name === selectedPlanetName) ?? null)
    : null;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment_success") === "1") {
      const amount = Number.parseInt(params.get("amount") ?? "0", 10);
      toast.success("Thank you for supporting space exploration! 🚀");
      if (
        actor &&
        amount > 0 &&
        identity &&
        !identity.getPrincipal().isAnonymous()
      ) {
        recordDonation({ amount: BigInt(amount), message: "" });
      }
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (params.get("payment_cancelled") === "1") {
      toast.info("Donation cancelled.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [actor, identity, recordDonation]);

  const handlePlanetClick = useCallback((planet: PlanetConfig) => {
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
    setTimeout(() => {
      setViewMode((v) => (v === "galaxy" ? "solar" : "galaxy"));
      setSelectedPlanetName(null);
    }, 400);
    setAchievements((prev) => {
      const next = { ...prev, usedGalaxyView: true };
      saveAchievements(next);
      return next;
    });
  }, []);

  const handleLandOnPlanet = useCallback(() => {
    if (selectedPlanetConfig) {
      setSurfaceViewPlanet(selectedPlanetConfig);
      setAchievements((prev) => {
        const next = { ...prev, landedOnSurface: true };
        saveAchievements(next);
        return next;
      });
    }
  }, [selectedPlanetConfig]);

  const panelStyle: React.CSSProperties = {
    position: "absolute",
    background: "rgba(11,16,23,0.75)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 14,
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#0B1017",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 3D Canvas */}
      <Canvas
        camera={{ fov: 60, near: 0.1, far: 5000, position: [0, 30, 120] }}
        style={{
          background: "linear-gradient(180deg, #0B1017 0%, #0F1A25 100%)",
        }}
        gl={{
          antialias: true,
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
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
        />
      </Canvas>

      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 24px",
          pointerEvents: "none",
        }}
      >
        {/* Title */}
        <div
          data-ocid="header.panel"
          style={{ ...panelStyle, padding: "14px 20px", pointerEvents: "auto" }}
        >
          <div
            style={{
              color: "#F6C35B",
              fontSize: 17,
              fontWeight: 800,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            Galaxy
          </div>
          <div
            style={{
              color: "#9AA7B6",
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginTop: 4,
            }}
          >
            {viewMode === "galaxy"
              ? "Milky Way Galaxy View"
              : "Interactive 3D Simulation"}
          </div>
        </div>

        {/* Auth */}
        <div style={{ pointerEvents: "auto" }}>
          <AuthButton />
        </div>
      </div>

      {/* Planet detail panel */}
      <PlanetPanel planet={selectedPlanetDetails} onClose={handleClosePanel} />

      {/* Land on Planet button — appears when a planet is selected */}
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
          </motion.button>
        )}
      </AnimatePresence>

      {/* Journal button - when planet selected */}
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

      {/* Bottom controls */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 24,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          alignItems: "flex-start",
        }}
      >
        {/* Galaxy toggle */}
        <button
          type="button"
          data-ocid="galaxy.toggle"
          onClick={toggleGalaxy}
          style={{
            ...panelStyle,
            position: "relative",
            padding: "9px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: viewMode === "galaxy" ? "#F6C35B" : "#9AA7B6",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            border:
              viewMode === "galaxy"
                ? "1px solid rgba(246,195,91,0.5)"
                : "1px solid rgba(255,255,255,0.12)",
            background:
              viewMode === "galaxy"
                ? "rgba(246,195,91,0.08)"
                : "rgba(11,16,23,0.75)",
            transition: "all 0.2s",
          }}
        >
          <Globe2 size={14} />
          {viewMode === "galaxy" ? "Solar System View" : "Galaxy View"}
        </button>

        {/* Donate button */}
        <button
          type="button"
          data-ocid="donation.open_modal_button"
          onClick={() => setDonationOpen(true)}
          style={{
            ...panelStyle,
            position: "relative",
            padding: "9px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#E9EEF5",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            transition: "all 0.15s",
          }}
        >
          <Heart size={14} color="#F6C35B" />
          Support Exploration
        </button>

        {/* Search button */}
        <button
          type="button"
          data-ocid="planet_search.open_modal_button"
          onClick={() => setSearchOpen(true)}
          style={{
            ...panelStyle,
            position: "relative",
            padding: "9px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#E9EEF5",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            transition: "all 0.15s",
          }}
        >
          <Search size={14} color="#7de8e8" />
          Search Planets
        </button>

        {/* Mute toggle */}
        <button
          type="button"
          data-ocid="audio.toggle"
          onClick={toggleMute}
          title={isMuted ? "Unmute" : "Mute"}
          style={{
            ...panelStyle,
            position: "relative",
            padding: "9px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: isMuted ? "#9AA7B6" : "#E9EEF5",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            transition: "all 0.15s",
          }}
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          {isMuted ? "Unmuted Off" : "Audio On"}
        </button>

        {/* Time Travel Slider */}
        <div
          style={{
            ...panelStyle,
            position: "relative",
            padding: "9px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              color: "#9AA7B6",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            ⏩ {speedMultiplier.toFixed(1)}x Speed
          </span>
          <input
            data-ocid="controls.toggle"
            type="range"
            min={0.1}
            max={50}
            step={0.1}
            value={speedMultiplier}
            onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
            style={{ width: 100, accentColor: "#F6C35B", cursor: "pointer" }}
          />
        </div>

        {/* Scale Mode */}
        <button
          type="button"
          data-ocid="scale.toggle"
          onClick={() => setScaleMode((v) => !v)}
          style={{
            ...panelStyle,
            position: "relative",
            padding: "9px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: scaleMode ? "#F6C35B" : "#9AA7B6",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            border: scaleMode
              ? "1px solid rgba(246,195,91,0.5)"
              : "1px solid rgba(255,255,255,0.12)",
            background: scaleMode
              ? "rgba(246,195,91,0.08)"
              : "rgba(11,16,23,0.75)",
            transition: "all 0.2s",
          }}
        >
          🔭 {scaleMode ? "True Scale ON" : "True Scale"}
        </button>

        {/* Constellation Mode */}
        <button
          type="button"
          data-ocid="constellation.toggle"
          onClick={() => setConstellationMode((v) => !v)}
          style={{
            ...panelStyle,
            position: "relative",
            padding: "9px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: constellationMode ? "#F6C35B" : "#9AA7B6",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            border: constellationMode
              ? "1px solid rgba(246,195,91,0.5)"
              : "1px solid rgba(255,255,255,0.12)",
            background: constellationMode
              ? "rgba(246,195,91,0.08)"
              : "rgba(11,16,23,0.75)",
            transition: "all 0.2s",
          }}
        >
          ✨ Constellations
        </button>

        {/* Planet Quiz */}
        <button
          type="button"
          data-ocid="quiz.open_modal_button"
          onClick={() => setQuizOpen(true)}
          style={{
            ...panelStyle,
            position: "relative",
            padding: "9px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#E9EEF5",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            transition: "all 0.15s",
          }}
        >
          🧠 Planet Quiz
        </button>

        {/* Achievements */}
        <button
          type="button"
          data-ocid="achievements.open_modal_button"
          onClick={() => setAchievementsOpen(true)}
          style={{
            ...panelStyle,
            position: "relative",
            padding: "9px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#E9EEF5",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            transition: "all 0.15s",
          }}
        >
          🏆 Achievements
        </button>

        {/* Space Missions */}
        <button
          type="button"
          data-ocid="missions.open_modal_button"
          onClick={() => setMissionsOpen(true)}
          style={{
            ...panelStyle,
            position: "relative",
            padding: "9px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#E9EEF5",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            transition: "all 0.15s",
          }}
        >
          🚀 Space Missions
        </button>

        {/* Leaderboard */}
        <button
          type="button"
          data-ocid="leaderboard.open_modal_button"
          onClick={() => setLeaderboardOpen(true)}
          style={{
            ...panelStyle,
            position: "relative",
            padding: "9px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#E9EEF5",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            transition: "all 0.15s",
          }}
        >
          🏅 Leaderboard
        </button>

        {/* Name a Star */}
        <button
          type="button"
          data-ocid="namestar.open_modal_button"
          onClick={() => setNameStarOpen(true)}
          style={{
            ...panelStyle,
            position: "relative",
            padding: "9px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#E9EEF5",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            transition: "all 0.15s",
          }}
        >
          ⭐ Name a Star
        </button>

        {/* Support & Revenue */}
        <button
          type="button"
          data-ocid="monetize.open_modal_button"
          onClick={() => setMonetizeOpen(true)}
          style={{
            ...panelStyle,
            position: "relative",
            padding: "9px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#E9EEF5",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            transition: "all 0.15s",
          }}
        >
          💰 Support & Revenue
        </button>
      </div>

      {/* Hint bar */}
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
          color: "#9AA7B6",
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
          color: "#9AA7B6",
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

      {/* Donation modal */}
      <DonationModal open={donationOpen} onOpenChange={setDonationOpen} />

      {/* Planet search modal */}
      <PlanetSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSelectPlanet={(name) => setSelectedPlanetName(name)}
      />

      {/* Surface view overlay */}
      <AnimatePresence>
        {surfaceViewPlanet && (
          <SurfaceView
            key="surface"
            planet={surfaceViewPlanet}
            onExit={() => setSurfaceViewPlanet(null)}
          />
        )}
      </AnimatePresence>

      {/* Constellation Overlay */}
      <ConstellationOverlay active={constellationMode} />

      {/* Wormhole effect */}
      <WormholeEffect
        active={wormholeActive}
        onDone={() => setWormholeActive(false)}
      />

      {/* Planet Quiz */}
      <PlanetQuiz
        open={quizOpen}
        onOpenChange={setQuizOpen}
        onQuizComplete={() => updateAchievement({ usedQuiz: true })}
      />

      {/* Achievements Panel */}
      <AchievementsPanel
        open={achievementsOpen}
        onOpenChange={setAchievementsOpen}
        achievements={achievements}
      />

      {/* Space Missions */}
      <SpaceMissions
        open={missionsOpen}
        onOpenChange={setMissionsOpen}
        onNavigateToPlanet={(name) => setSelectedPlanetName(name)}
      />

      {/* Leaderboard */}
      <Leaderboard open={leaderboardOpen} onOpenChange={setLeaderboardOpen} />

      {/* Planet Journal */}
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

      {/* Name a Star */}
      <NameAStar
        open={nameStarOpen}
        onOpenChange={setNameStarOpen}
        onStarNamed={() => updateAchievement({ namedAStar: true })}
      />

      {/* Monetization Modal */}
      <MonetizationModal open={monetizeOpen} onOpenChange={setMonetizeOpen} />

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
    </div>
  );
}
