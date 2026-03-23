import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrbitControls, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type * as THREE from "three";
import { audioManager } from "../utils/AudioManager";
import { BackButton } from "./BackButton";

// ─── Types ─────────────────────────────────────────────────────────────────
export interface MultiverseViewProps {
  onClose: () => void;
}

interface Universe {
  id: string;
  name: string;
  description: string;
  longDesc: string;
  color: string;
  glowColor: string;
  requiredVisited: number;
  bgColor: string;
  fogColor: string;
  fogNear: number;
  fogFar: number;
  stats: {
    age: string;
    size: string;
    matter: string;
    stars: string;
    temp: string;
  };
}

const UNIVERSES: Universe[] = [
  {
    id: "our",
    name: "Our Universe",
    description: "Familiar stars, galaxies, and the cosmic web",
    longDesc:
      "The observable universe — 93 billion light-years of stars, dark matter, and cosmic wonder.",
    color: "#4FA3E0",
    glowColor: "rgba(79,163,224,0.5)",
    requiredVisited: 0,
    bgColor: "#030612",
    fogColor: "#030612",
    fogNear: 80,
    fogFar: 200,
    stats: {
      age: "13.8 billion years",
      size: "93 billion ly",
      matter: "Baryonic + Dark",
      stars: "2 × 10²³",
      temp: "2.7 K (CMB)",
    },
  },
  {
    id: "darkmatter",
    name: "Dark Matter Universe",
    description: "Invisible webs of exotic matter, dim and vast",
    longDesc:
      "A universe where dark matter dominates 99.9% of all mass. Visible matter barely exists — only ghostly halos remain.",
    color: "#6B21E8",
    glowColor: "rgba(107,33,232,0.5)",
    requiredVisited: 1,
    bgColor: "#04020E",
    fogColor: "#0A0518",
    fogNear: 40,
    fogFar: 120,
    stats: {
      age: "22.1 billion years",
      size: "∞ (open)",
      matter: "99.9% Dark Matter",
      stars: "3 × 10¹⁶",
      temp: "0.001 K",
    },
  },
  {
    id: "binary",
    name: "Binary Star Universe",
    description: "Every solar system orbits two suns",
    longDesc:
      "In this universe the laws of gravity favor dual stellar formation. Every star is born in pairs, casting double shadows across all worlds.",
    color: "#F97316",
    glowColor: "rgba(249,115,22,0.5)",
    requiredVisited: 2,
    bgColor: "#0E0502",
    fogColor: "#1A0A00",
    fogNear: 60,
    fogFar: 160,
    stats: {
      age: "9.4 billion years",
      size: "71 billion ly",
      matter: "Baryonic",
      stars: "4 × 10²³",
      temp: "3.1 K (CMB)",
    },
  },
  {
    id: "crystal",
    name: "Crystal Universe",
    description: "Geometric crystalline structures, prismatic light",
    longDesc:
      "A universe where matter crystallizes at cosmic scales. Entire nebulae form hexagonal lattices and planets grow like faceted gemstones.",
    color: "#06B6D4",
    glowColor: "rgba(6,182,212,0.5)",
    requiredVisited: 3,
    bgColor: "#010D10",
    fogColor: "#021418",
    fogNear: 50,
    fogFar: 140,
    stats: {
      age: "8.2 billion years",
      size: "55 billion ly",
      matter: "Crystalline Lattice",
      stars: "8 × 10²²",
      temp: "4.4 K (CMB)",
    },
  },
  {
    id: "antimatter",
    name: "Antimatter Universe",
    description: "Inverted neon cosmos — magenta halos and void",
    longDesc:
      "In this mirror universe, antimatter won the primordial battle. Physics runs in reverse — stars absorb radiation and planets radiate energy outward.",
    color: "#EC4899",
    glowColor: "rgba(236,72,153,0.5)",
    requiredVisited: 4,
    bgColor: "#0D0008",
    fogColor: "#1A0012",
    fogNear: 45,
    fogFar: 130,
    stats: {
      age: "13.8 billion years",
      size: "93 billion ly",
      matter: "Antimatter",
      stars: "2 × 10²³",
      temp: "2.7 K (inverted)",
    },
  },
  {
    id: "nebula",
    name: "Nebula Universe",
    description: "Vivid gas clouds, colorful proto-planets everywhere",
    longDesc:
      "A young universe still in stellar infancy. Towering pillars of gas stretch light-years across. Proto-stars ignite in cascading bursts of violet and rose.",
    color: "#A855F7",
    glowColor: "rgba(168,85,247,0.5)",
    requiredVisited: 5,
    bgColor: "#08030E",
    fogColor: "#120518",
    fogNear: 30,
    fogFar: 100,
    stats: {
      age: "2.1 billion years",
      size: "31 billion ly",
      matter: "Ionized Gas + Proto-matter",
      stars: "6 × 10²¹",
      temp: "12 K (CMB)",
    },
  },
];

// ─── localStorage helpers ──────────────────────────────────────────────────
function getVisited(): string[] {
  try {
    return JSON.parse(localStorage.getItem("multiverseVisited") || "[]");
  } catch {
    return [];
  }
}
function markVisited(id: string) {
  const v = getVisited();
  if (!v.includes(id)) {
    v.push(id);
    localStorage.setItem("multiverseVisited", JSON.stringify(v));
  }
}

// ─── 3D Scenes per universe ────────────────────────────────────────────────
function OurUniverseScene() {
  return (
    <>
      <Stars radius={120} depth={60} count={6000} factor={5} fade speed={1.2} />
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#ffffff" />
      {[0, 1, 2, 3, 4].map((i) => (
        <OrbitingPlanet
          key={i}
          index={i}
          color={["#4FA3E0", "#4CAF50", "#C1440E", "#C88B3A", "#7DE8E8"][i]}
          radius={8 + i * 6}
          size={0.6 + i * 0.3}
          speed={0.4 - i * 0.06}
        />
      ))}
      <mesh>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshStandardMaterial
          color="#FFF176"
          emissive="#FFF176"
          emissiveIntensity={1.2}
        />
      </mesh>
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.4}
        enableZoom
        enablePan={false}
      />
    </>
  );
}

function DarkMatterScene() {
  return (
    <>
      <Stars radius={100} depth={80} count={800} factor={2} fade speed={0.3} />
      <ambientLight intensity={0.03} color="#1a0040" />
      <pointLight position={[0, 0, 0]} intensity={0.3} color="#6B21E8" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <DarkParticleCluster key={i} index={i} />
      ))}
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.2}
        enableZoom
        enablePan={false}
      />
    </>
  );
}

function DarkParticleCluster({ index }: { index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const angle = (index / 6) * Math.PI * 2;
  const r = 12 + index * 4;
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });
  return (
    <mesh
      ref={meshRef}
      position={[
        Math.cos(angle) * r,
        ((index % 3) - 1) * 4,
        Math.sin(angle) * r,
      ]}
    >
      <sphereGeometry args={[1.2, 8, 8]} />
      <meshStandardMaterial
        color="#1a0040"
        transparent
        opacity={0.18}
        emissive="#4B0082"
        emissiveIntensity={0.4}
      />
    </mesh>
  );
}

function BinaryStarScene() {
  const sunARef = useRef<THREE.Mesh>(null);
  const sunBRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (sunARef.current) {
      sunARef.current.position.x = Math.cos(t * 0.3) * 5;
      sunARef.current.position.z = Math.sin(t * 0.3) * 5;
    }
    if (sunBRef.current) {
      sunBRef.current.position.x = -Math.cos(t * 0.3) * 5;
      sunBRef.current.position.z = -Math.sin(t * 0.3) * 5;
    }
  });
  return (
    <>
      <Stars radius={100} depth={50} count={3000} factor={4} fade speed={0.8} />
      <ambientLight intensity={0.2} color="#ff8c00" />
      <mesh ref={sunARef}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FF6600"
          emissiveIntensity={1.5}
        />
      </mesh>
      <mesh ref={sunBRef}>
        <sphereGeometry args={[1.6, 32, 32]} />
        <meshStandardMaterial
          color="#FFA500"
          emissive="#FF4500"
          emissiveIntensity={1.5}
        />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <OrbitingPlanet
          key={i}
          index={i}
          color={["#C88B3A", "#E4A55A", "#D4694A", "#A0522D"][i]}
          radius={15 + i * 7}
          size={0.7 + i * 0.2}
          speed={0.2 - i * 0.04}
        />
      ))}
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.5}
        enableZoom
        enablePan={false}
      />
    </>
  );
}

function CrystalScene() {
  return (
    <>
      <Stars radius={90} depth={40} count={2000} factor={3} fade speed={0.6} />
      <ambientLight intensity={0.2} color="#00ffff" />
      <pointLight position={[0, 0, 0]} intensity={2} color="#06B6D4" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <CrystalShard key={i} index={i} />
      ))}
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.6}
        enableZoom
        enablePan={false}
      />
    </>
  );
}

function CrystalShard({ index }: { index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const angle = (index / 8) * Math.PI * 2;
  const r = 8 + (index % 3) * 6;
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y =
        clock.getElapsedTime() * (0.2 + index * 0.05);
      meshRef.current.rotation.x = clock.getElapsedTime() * 0.1;
    }
  });
  return (
    <mesh
      ref={meshRef}
      position={[
        Math.cos(angle) * r,
        ((index % 4) - 1.5) * 3,
        Math.sin(angle) * r,
      ]}
    >
      <octahedronGeometry args={[0.8 + (index % 3) * 0.4, 0]} />
      <meshStandardMaterial
        color="#00ffff"
        transparent
        opacity={0.7}
        emissive="#06B6D4"
        emissiveIntensity={0.6}
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  );
}

function AntimatterScene() {
  return (
    <>
      <Stars radius={100} depth={50} count={4000} factor={4} fade speed={1} />
      <ambientLight intensity={0.1} color="#ff00ff" />
      <pointLight position={[0, 0, 0]} intensity={3} color="#EC4899" />
      <pointLight position={[20, 10, -20]} intensity={1.5} color="#39FF14" />
      {[0, 1, 2, 3, 4].map((i) => (
        <AntimatterOrb key={i} index={i} />
      ))}
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.7}
        enableZoom
        enablePan={false}
      />
    </>
  );
}

function AntimatterOrb({ index }: { index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const angle = (index / 5) * Math.PI * 2;
  const r = 10 + index * 5;
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime();
      meshRef.current.position.x =
        Math.cos(t * (0.3 + index * 0.05) + angle) * r;
      meshRef.current.position.z =
        Math.sin(t * (0.3 + index * 0.05) + angle) * r;
      meshRef.current.position.y = Math.sin(t * 0.4 + index) * 3;
    }
  });
  const colors = ["#EC4899", "#39FF14", "#FF00FF", "#00FF88", "#FF1493"];
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.9 + index * 0.2, 24, 24]} />
      <meshStandardMaterial
        color={colors[index]}
        emissive={colors[index]}
        emissiveIntensity={1.2}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

function NebulaScene() {
  return (
    <>
      <Stars radius={80} depth={30} count={5000} factor={6} fade speed={0.5} />
      <ambientLight intensity={0.25} color="#9333ea" />
      <pointLight position={[0, 0, 0]} intensity={1.5} color="#A855F7" />
      <pointLight position={[-15, 10, 15]} intensity={1} color="#EC4899" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <NebulaCloud key={i} index={i} />
      ))}
      {[0, 1, 2].map((i) => (
        <OrbitingPlanet
          key={i}
          index={i}
          color={["#A855F7", "#EC4899", "#F472B6"][i]}
          radius={12 + i * 8}
          size={1 + i * 0.4}
          speed={0.15 - i * 0.04}
        />
      ))}
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.3}
        enableZoom
        enablePan={false}
      />
    </>
  );
}

function NebulaCloud({ index }: { index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const angle = (index / 7) * Math.PI * 2;
  const r = 6 + (index % 4) * 7;
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.03;
      meshRef.current.rotation.z = clock.getElapsedTime() * 0.02;
    }
  });
  const nebulaColors = [
    "#9333EA",
    "#A855F7",
    "#EC4899",
    "#F472B6",
    "#7C3AED",
    "#DB2777",
    "#8B5CF6",
  ];
  return (
    <mesh
      ref={meshRef}
      position={[
        Math.cos(angle) * r,
        ((index % 3) - 1) * 8,
        Math.sin(angle) * r,
      ]}
    >
      <sphereGeometry args={[3 + (index % 3), 8, 8]} />
      <meshStandardMaterial
        color={nebulaColors[index % nebulaColors.length]}
        transparent
        opacity={0.12}
        emissive={nebulaColors[index % nebulaColors.length]}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

function OrbitingPlanet({
  index,
  color,
  radius,
  size,
  speed,
}: {
  index: number;
  color: string;
  radius: number;
  size: number;
  speed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const angle = (index / 5) * Math.PI * 2;
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime() * speed + angle;
      meshRef.current.position.x = Math.cos(t) * radius;
      meshRef.current.position.z = Math.sin(t) * radius;
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.5;
    }
  });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size, 24, 24]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Single persistent Canvas — swaps scene content via activeUniverseId prop
// This prevents WebGL context exhaustion from creating/destroying Canvas on each switch
function UniverseSceneContent({ universeId }: { universeId: string }) {
  switch (universeId) {
    case "our":
      return <OurUniverseScene />;
    case "darkmatter":
      return <DarkMatterScene />;
    case "binary":
      return <BinaryStarScene />;
    case "crystal":
      return <CrystalScene />;
    case "antimatter":
      return <AntimatterScene />;
    case "nebula":
      return <NebulaScene />;
    default:
      return <OurUniverseScene />;
  }
}

function UniverseScene({ universe }: { universe: Universe }) {
  return (
    <Canvas
      style={{ width: "100%", height: "100%" }}
      camera={{ position: [0, 20, 60], fov: 55 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={[universe.bgColor]} />
      <fog
        attach="fog"
        args={[universe.fogColor, universe.fogNear, universe.fogFar]}
      />
      <UniverseSceneContent universeId={universe.id} />
    </Canvas>
  );
}

// ─── Portal card preview (CSS animated) ───────────────────────────────────
function PortalPreview({ universe }: { universe: Universe }) {
  const particles = Array.from({ length: 18 }, (_, i) => i);
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: 120,
        overflow: "hidden",
        borderRadius: 10,
      }}
    >
      {/* Dark base */}
      <div
        style={{ position: "absolute", inset: 0, background: universe.bgColor }}
      />
      {/* Rotating ring */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 90,
          height: 90,
          marginLeft: -45,
          marginTop: -45,
          borderRadius: "50%",
          border: `2px solid ${universe.color}`,
          opacity: 0.6,
          animation: "multiverseRing 4s linear infinite",
          boxShadow: `0 0 20px ${universe.glowColor}`,
        }}
      />
      {/* Inner glow orb */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 36,
          height: 36,
          marginLeft: -18,
          marginTop: -18,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${universe.color}aa 0%, ${universe.color}44 50%, transparent 80%)`,
          animation: "multiversePulse 2s ease-in-out infinite",
        }}
      />
      {/* Particles */}
      {particles.map((i) => {
        const angle = (i / 18) * 360;
        const r = 35 + (i % 3) * 6;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `calc(50% + ${Math.sin((angle * Math.PI) / 180) * r}px)`,
              left: `calc(50% + ${Math.cos((angle * Math.PI) / 180) * r}px)`,
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              borderRadius: "50%",
              background: universe.color,
              opacity: 0.4 + (i % 5) * 0.12,
              animation: `multiverseFloat ${1.5 + (i % 4) * 0.5}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Wormhole travel animation ─────────────────────────────────────────────
function WormholeTunnel({ color }: { color: string }) {
  const rings = Array.from({ length: 16 }, (_, i) => i);
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10001,
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {rings.map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            borderRadius: "50%",
            border: `${1 + i * 0.3}px solid ${color}`,
            opacity: 0.8 - i * 0.04,
            animation: "wormholeRing 0.8s linear infinite",
            animationDelay: `${i * 0.05}s`,
            width: `${8 + i * 12}vmin`,
            height: `${8 + i * 12}vmin`,
            boxShadow: `0 0 ${10 + i * 4}px ${color}88`,
          }}
        />
      ))}
      <div
        style={{
          color: "#fff",
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          zIndex: 1,
          textShadow: `0 0 20px ${color}`,
          animation: "multiverseFadeInOut 1.6s ease-in-out",
        }}
      >
        TRAVERSING MULTIVERSE
      </div>
    </div>
  );
}

// ─── Compare modal ─────────────────────────────────────────────────────────
function CompareModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10002,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      data-ocid="multiverse.compare.modal"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{
          background: "rgba(10,6,30,0.97)",
          border: "1px solid rgba(168,85,247,0.4)",
          borderRadius: 16,
          maxWidth: 900,
          width: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
          padding: 32,
          boxShadow: "0 0 60px rgba(168,85,247,0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <h2
            style={{
              color: "#F6C35B",
              fontSize: 22,
              fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              margin: 0,
            }}
          >
            ∞ Universe Comparison
          </h2>
          <button
            type="button"
            data-ocid="multiverse.compare.close_button"
            onClick={onClose}
            style={{
              background: "rgba(246,195,91,0.1)",
              border: "1px solid rgba(246,195,91,0.3)",
              borderRadius: 8,
              color: "#F6C35B",
              cursor: "pointer",
              padding: "6px 14px",
              fontSize: 13,
            }}
          >
            ✕ Close
          </button>
        </div>
        <Table>
          <TableHeader>
            <TableRow style={{ borderColor: "rgba(168,85,247,0.2)" }}>
              <TableHead style={{ color: "#A855F7", fontWeight: 700 }}>
                Universe
              </TableHead>
              <TableHead style={{ color: "#A855F7" }}>Age</TableHead>
              <TableHead style={{ color: "#A855F7" }}>Size</TableHead>
              <TableHead style={{ color: "#A855F7" }}>Matter Type</TableHead>
              <TableHead style={{ color: "#A855F7" }}>Star Count</TableHead>
              <TableHead style={{ color: "#A855F7" }}>Temperature</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {UNIVERSES.map((u) => (
              <TableRow
                key={u.id}
                style={{ borderColor: "rgba(168,85,247,0.1)" }}
              >
                <TableCell
                  style={{
                    fontWeight: 700,
                    color: u.color,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  <span style={{ marginRight: 8, fontSize: 16 }}>●</span>
                  {u.name}
                </TableCell>
                <TableCell style={{ color: "#C8D4E0", fontSize: 13 }}>
                  {u.stats.age}
                </TableCell>
                <TableCell style={{ color: "#C8D4E0", fontSize: 13 }}>
                  {u.stats.size}
                </TableCell>
                <TableCell style={{ color: "#C8D4E0", fontSize: 13 }}>
                  {u.stats.matter}
                </TableCell>
                <TableCell style={{ color: "#C8D4E0", fontSize: 13 }}>
                  {u.stats.stars}
                </TableCell>
                <TableCell style={{ color: "#C8D4E0", fontSize: 13 }}>
                  {u.stats.temp}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export function MultiverseView({ onClose }: MultiverseViewProps) {
  const [visited, setVisited] = useState<string[]>(getVisited);
  const [activeUniverse, setActiveUniverse] = useState<Universe | null>(null);
  const [traveling, setTraveling] = useState(false);
  const [travelColor, setTravelColor] = useState("#4FA3E0");
  const [showCompare, setShowCompare] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Inject keyframes once
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "multiverse-keyframes";
    if (!document.getElementById("multiverse-keyframes")) {
      style.textContent = `
        @keyframes multiverseRing {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes multiversePulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.3); opacity: 1; }
        }
        @keyframes multiverseFloat {
          from { transform: translateY(0px); }
          to { transform: translateY(-4px); }
        }
        @keyframes wormholeRing {
          from { transform: scale(0.2); opacity: 1; }
          to { transform: scale(1.8); opacity: 0; }
        }
        @keyframes multiverseFadeInOut {
          0% { opacity: 0; } 30% { opacity: 1; } 70% { opacity: 1; } 100% { opacity: 0; }
        }
        @keyframes multiverseCardGlow {
          0%, 100% { box-shadow: 0 0 20px var(--card-glow); }
          50% { box-shadow: 0 0 40px var(--card-glow), 0 0 60px var(--card-glow); }
        }
        @keyframes starfieldBg {
          from { background-position: 0 0; }
          to { background-position: -200px 200px; }
        }
      `;
      document.head.appendChild(style);
    }
    return () => {
      const el = document.getElementById("multiverse-keyframes");
      if (el) el.remove();
    };
  }, []);

  function travelTo(universe: Universe) {
    audioManager.init();
    audioManager.playUIClick();
    setTravelColor(universe.color);
    setTraveling(true);
    setTimeout(() => {
      setTraveling(false);
      setActiveUniverse(universe);
      audioManager.setUniverseAmbient(universe.name);
      const newVisited = [...visited];
      if (!newVisited.includes(universe.id)) {
        newVisited.push(universe.id);
        setVisited(newVisited);
        markVisited(universe.id);
      }
    }, 1800);
  }

  const visitedCount = visited.length;

  return (
    <>
      <BackButton onClick={onClose} />
      <div
        data-ocid="multiverse.panel"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 9999,
          background: "#030610",
          overflow: "hidden",
          fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
        }}
      >
        {/* Animated starfield background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
          radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.6) 0%, transparent 100%),
          radial-gradient(1px 1px at 25% 60%, rgba(255,255,255,0.4) 0%, transparent 100%),
          radial-gradient(2px 2px at 40% 30%, rgba(255,255,255,0.3) 0%, transparent 100%),
          radial-gradient(1px 1px at 55% 80%, rgba(255,255,255,0.5) 0%, transparent 100%),
          radial-gradient(1px 1px at 70% 20%, rgba(255,255,255,0.4) 0%, transparent 100%),
          radial-gradient(2px 2px at 80% 65%, rgba(255,255,255,0.3) 0%, transparent 100%),
          radial-gradient(1px 1px at 92% 45%, rgba(255,255,255,0.6) 0%, transparent 100%),
          radial-gradient(1px 1px at 5% 88%, rgba(255,255,255,0.5) 0%, transparent 100%),
          radial-gradient(1px 1px at 60% 50%, rgba(168,85,247,0.3) 0%, transparent 100%),
          radial-gradient(1px 1px at 35% 90%, rgba(246,195,91,0.3) 0%, transparent 100%)
        `,
            backgroundSize: "300px 300px",
            animation: "starfieldBg 80s linear infinite",
            pointerEvents: "none",
          }}
        />

        {/* Universe 3D view */}
        <AnimatePresence>
          {activeUniverse && (
            <motion.div
              key="universe-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              style={{ position: "absolute", inset: 0 }}
            >
              <UniverseScene universe={activeUniverse} />

              {/* Top bar */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  padding: "20px 28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)",
                }}
              >
                <button
                  type="button"
                  data-ocid="multiverse.back_button"
                  onClick={() => {
                    setActiveUniverse(null);
                    audioManager.startSolarSystemAmbient();
                  }}
                  style={{
                    background: "rgba(10,6,30,0.7)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(246,195,91,0.3)",
                    borderRadius: 10,
                    color: "#F6C35B",
                    cursor: "pointer",
                    padding: "8px 18px",
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  ← Back to Selection
                </button>

                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      color: activeUniverse.color,
                      fontSize: 22,
                      fontWeight: 800,
                      letterSpacing: "0.05em",
                      textShadow: `0 0 20px ${activeUniverse.glowColor}`,
                    }}
                  >
                    {activeUniverse.name}
                  </div>
                  <div
                    style={{
                      color: "rgba(200,212,224,0.7)",
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    {activeUniverse.longDesc}
                  </div>
                </div>

                <button
                  type="button"
                  data-ocid="multiverse.close_button"
                  onClick={() => {
                    audioManager.startSolarSystemAmbient();
                    onClose();
                  }}
                  style={{
                    background: "rgba(10,6,30,0.7)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(246,195,91,0.3)",
                    borderRadius: 10,
                    color: "#F6C35B",
                    cursor: "pointer",
                    padding: "8px 18px",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  ✕ Exit
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selection screen */}
        <AnimatePresence>
          {!activeUniverse && (
            <motion.div
              key="selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                position: "absolute",
                inset: 0,
                overflowY: "auto",
                padding: "32px 24px 80px",
              }}
            >
              {/* Header */}
              <div style={{ textAlign: "center", marginBottom: 40 }}>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div style={{ fontSize: 48, marginBottom: 8 }}>∞</div>
                  <h1
                    style={{
                      color: "#F6C35B",
                      fontSize: 34,
                      fontWeight: 800,
                      margin: 0,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      textShadow: "0 0 30px rgba(246,195,91,0.5)",
                    }}
                  >
                    Multiverse Explorer
                  </h1>
                  <p
                    style={{
                      color: "rgba(168,85,247,0.9)",
                      fontSize: 15,
                      marginTop: 10,
                      letterSpacing: "0.06em",
                    }}
                  >
                    {visitedCount} / 6 universes visited — travel to unlock more
                  </p>
                </motion.div>
              </div>

              {/* Portal grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: 20,
                  maxWidth: 1000,
                  margin: "0 auto 40px",
                }}
              >
                {UNIVERSES.map((universe, i) => {
                  const isLocked = visitedCount < universe.requiredVisited;
                  const isHovered = hoveredId === universe.id;
                  return (
                    <motion.div
                      key={universe.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.08 }}
                      data-ocid={`multiverse.portal.${i + 1}`}
                      onMouseEnter={() => setHoveredId(universe.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => {
                        if (isLocked) {
                          toast(
                            `🔒 Visit ${universe.requiredVisited} universe(s) to unlock ${universe.name}`,
                            { duration: 2500 },
                          );
                        } else {
                          travelTo(universe);
                        }
                      }}
                      style={{
                        background:
                          isHovered && !isLocked
                            ? `linear-gradient(135deg, rgba(10,6,30,0.95) 0%, ${universe.bgColor}cc 100%)`
                            : "rgba(10,6,30,0.8)",
                        border: `1px solid ${isHovered && !isLocked ? universe.color : "rgba(168,85,247,0.2)"}`,
                        borderRadius: 16,
                        overflow: "hidden",
                        cursor: isLocked ? "not-allowed" : "pointer",
                        backdropFilter: "blur(16px)",
                        transition: "all 0.3s ease",
                        transform:
                          isHovered && !isLocked ? "translateY(-4px)" : "none",
                        boxShadow:
                          isHovered && !isLocked
                            ? `0 8px 40px ${universe.glowColor}, 0 0 0 1px ${universe.color}44`
                            : "0 4px 16px rgba(0,0,0,0.4)",
                        filter: isLocked
                          ? "brightness(0.55) saturate(0.4)"
                          : "none",
                        position: "relative",
                      }}
                    >
                      {/* Preview */}
                      <PortalPreview universe={universe} />

                      {/* Lock overlay */}
                      {isLocked && (
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 120,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(0,0,0,0.6)",
                            backdropFilter: "blur(2px)",
                            flexDirection: "column",
                            gap: 6,
                          }}
                        >
                          <span style={{ fontSize: 28 }}>🔒</span>
                          <span
                            style={{
                              color: "rgba(200,212,224,0.7)",
                              fontSize: 10,
                              letterSpacing: "0.05em",
                            }}
                          >
                            Visit {universe.requiredVisited} universes to unlock
                          </span>
                        </div>
                      )}

                      {/* Info */}
                      <div style={{ padding: "14px 16px 16px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginBottom: 6,
                          }}
                        >
                          <div
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              background: universe.color,
                              boxShadow: `0 0 8px ${universe.color}`,
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{
                              color: isLocked
                                ? "rgba(200,212,224,0.5)"
                                : "#E9EEF5",
                              fontSize: 14,
                              fontWeight: 700,
                            }}
                          >
                            {universe.name}
                          </span>
                          {visited.includes(universe.id) && (
                            <span
                              style={{
                                marginLeft: "auto",
                                color: "#4CAF50",
                                fontSize: 11,
                                background: "rgba(76,175,80,0.15)",
                                border: "1px solid rgba(76,175,80,0.3)",
                                borderRadius: 6,
                                padding: "2px 8px",
                              }}
                            >
                              ✓ Visited
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            color: "rgba(200,212,224,0.65)",
                            fontSize: 12,
                            margin: 0,
                            lineHeight: 1.5,
                          }}
                        >
                          {universe.description}
                        </p>
                        {!isLocked && (
                          <div
                            style={{
                              marginTop: 12,
                              padding: "6px 14px",
                              background: `${universe.color}22`,
                              border: `1px solid ${universe.color}44`,
                              borderRadius: 8,
                              color: universe.color,
                              fontSize: 11,
                              fontWeight: 700,
                              textAlign: "center",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                            }}
                          >
                            → Enter Universe
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom actions */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  data-ocid="multiverse.compare.open_modal_button"
                  onClick={() => setShowCompare(true)}
                  style={{
                    background: "rgba(168,85,247,0.15)",
                    border: "1px solid rgba(168,85,247,0.4)",
                    borderRadius: 12,
                    color: "#A855F7",
                    cursor: "pointer",
                    padding: "12px 28px",
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    backdropFilter: "blur(8px)",
                    transition: "all 0.2s",
                  }}
                >
                  📊 Compare Universes
                </button>
                <button
                  type="button"
                  data-ocid="multiverse.exit_button"
                  onClick={onClose}
                  style={{
                    background: "rgba(246,195,91,0.1)",
                    border: "1px solid rgba(246,195,91,0.3)",
                    borderRadius: 12,
                    color: "#F6C35B",
                    cursor: "pointer",
                    padding: "12px 28px",
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    backdropFilter: "blur(8px)",
                    transition: "all 0.2s",
                  }}
                >
                  ← Back to Galaxy
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wormhole travel animation */}
        <AnimatePresence>
          {traveling && (
            <motion.div
              key="wormhole"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <WormholeTunnel color={travelColor} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compare modal */}
        <AnimatePresence>
          {showCompare && (
            <CompareModal onClose={() => setShowCompare(false)} />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
