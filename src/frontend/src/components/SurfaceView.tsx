import { OrbitControls, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Rocket } from "lucide-react";
import { motion } from "motion/react";
import { useRef } from "react";
import * as THREE from "three";
import { useSpaceAudio } from "../hooks/useSpaceAudio";
import { PLANET_DETAILS } from "./PlanetPanel";

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

interface SurfaceSceneProps {
  planet: PlanetConfig;
}

function getSkyColor(name: string): string {
  switch (name) {
    case "Earth":
      return "#0a1a4a";
    case "Mars":
      return "#3a1a08";
    case "Venus":
      return "#4a2800";
    case "Mercury":
      return "#050810";
    case "Jupiter":
      return "#3a2010";
    case "Saturn":
      return "#2a2010";
    case "Uranus":
      return "#083848";
    case "Neptune":
      return "#080828";
    default:
      return "#080810";
  }
}

function getFogColor(name: string): string {
  switch (name) {
    case "Earth":
      return "#0a1a4a";
    case "Mars":
      return "#5a2a10";
    case "Venus":
      return "#6a3810";
    case "Mercury":
      return "#101010";
    case "Jupiter":
      return "#4a3020";
    case "Saturn":
      return "#3a2c18";
    case "Uranus":
      return "#102840";
    case "Neptune":
      return "#101040";
    default:
      return "#101010";
  }
}

function getGroundColor(baseColor: string): string {
  const c = new THREE.Color(baseColor);
  c.multiplyScalar(0.35);
  return `#${c.getHexString()}`;
}

function hasStars(name: string): boolean {
  return ["Mercury", "Mars"].includes(name);
}

const GAS_BANDS = [
  { id: "band-a", yOffset: -8, scale: 1.0, opacity: 0.5 },
  { id: "band-b", yOffset: -3, scale: 1.3, opacity: 0.4 },
  { id: "band-c", yOffset: 2, scale: 0.8, opacity: 0.5 },
  { id: "band-d", yOffset: 7, scale: 1.0, opacity: 0.35 },
];

function Rocks({ planetColor }: { planetColor: string }) {
  const rocks = useRef(
    Array.from({ length: 8 }, (_, i) => ({
      x: (Math.random() - 0.5) * 40,
      z: (Math.random() - 0.5) * 40 + 5,
      size: 0.3 + Math.random() * 0.9,
      rot: Math.random() * Math.PI,
      key: i,
    })),
  ).current;

  const c = new THREE.Color(planetColor);
  c.multiplyScalar(0.5);
  const rockColor = `#${c.getHexString()}`;

  return (
    <>
      {rocks.map((r) => (
        <mesh
          key={r.key}
          position={[r.x, r.size / 2 - 0.1, r.z]}
          rotation={[r.rot * 0.3, r.rot, r.rot * 0.5]}
        >
          <boxGeometry args={[r.size, r.size * 0.7, r.size * 0.85]} />
          <meshStandardMaterial
            color={rockColor}
            roughness={0.95}
            metalness={0.0}
          />
        </mesh>
      ))}
    </>
  );
}

function SunSphere() {
  return (
    <mesh position={[30, 18, -60]}>
      <sphereGeometry args={[3, 16, 16]} />
      <meshBasicMaterial color="#FFF5CC" />
      <pointLight color="#FFF5CC" intensity={3} distance={500} decay={1} />
    </mesh>
  );
}

function SwayCamera() {
  const angle = useRef(0);
  useFrame((state, delta) => {
    angle.current += delta * 0.12;
    state.camera.position.x = Math.sin(angle.current * 0.4) * 0.8;
    state.camera.position.y = 1.6 + Math.sin(angle.current * 0.3) * 0.15;
    state.camera.updateMatrixWorld();
  });
  return null;
}

function SurfaceScene({ planet }: SurfaceSceneProps) {
  const groundColor = getGroundColor(planet.color);
  const fogColor = getFogColor(planet.name);
  const showStars = hasStars(planet.name);
  const isGasGiant = ["Jupiter", "Saturn", "Uranus", "Neptune"].includes(
    planet.name,
  );

  const baseC = new THREE.Color(planet.color);

  return (
    <>
      <fog attach="fog" args={[fogColor, 15, 80]} />
      <ambientLight intensity={0.3} />
      <SunSphere />

      {showStars && (
        <Stars
          radius={80}
          depth={30}
          count={3000}
          factor={3}
          saturation={0.3}
          fade
          speed={0.3}
        />
      )}

      {/* Sky dome */}
      <mesh>
        <sphereGeometry args={[120, 32, 16]} />
        <meshBasicMaterial
          color={getSkyColor(planet.name)}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Ground */}
      {!isGasGiant && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[200, 200, 30, 30]} />
          <meshStandardMaterial
            color={groundColor}
            roughness={1}
            metalness={0}
            wireframe={false}
          />
        </mesh>
      )}

      {/* Cloud band rings for gas giants */}
      {isGasGiant &&
        GAS_BANDS.map((band) => {
          const bandC = baseC.clone().multiplyScalar(band.scale);
          return (
            <mesh
              key={band.id}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, band.yOffset, 0]}
            >
              <planeGeometry args={[300, 300]} />
              <meshBasicMaterial
                color={bandC.getStyle()}
                transparent
                opacity={band.opacity}
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        })}

      <Rocks planetColor={planet.color} />

      <OrbitControls
        makeDefault
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.3}
        minPolarAngle={Math.PI * 0.25}
        maxPolarAngle={Math.PI * 0.75}
      />
      <SwayCamera />
    </>
  );
}

interface SurfaceViewProps {
  planet: PlanetConfig;
  onExit: () => void;
}

export function SurfaceView({ planet, onExit }: SurfaceViewProps) {
  const details = PLANET_DETAILS[planet.name];
  const { isMuted, toggleMute } = useSpaceAudio("surface", planet.name);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: getSkyColor(planet.name),
        fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
      }}
    >
      <Canvas
        camera={{ fov: 70, near: 0.1, far: 500, position: [0, 1.6, 0] }}
        style={{ width: "100%", height: "100%" }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
      >
        <SurfaceScene planet={planet} />
      </Canvas>

      {/* Top-left overlay */}
      <div
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          background: "rgba(11,16,23,0.80)",
          border: "1px solid rgba(246,195,91,0.3)",
          borderRadius: 14,
          padding: "14px 20px",
          backdropFilter: "blur(12px)",
          maxWidth: 320,
        }}
      >
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
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: planet.color,
              boxShadow: `0 0 8px ${planet.color}80`,
            }}
          />
          <span
            style={{
              color: "#F6C35B",
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {planet.name}
          </span>
        </div>
        <div
          style={{
            color: "#9AA7B6",
            fontSize: 11,
            marginBottom: 10,
            lineHeight: 1.5,
          }}
        >
          You are on the surface of {planet.name}
        </div>
        {details && (
          <>
            <div
              style={{
                color: "#D8BE8B",
                fontSize: 11,
                lineHeight: 1.6,
                marginBottom: 8,
              }}
            >
              <strong style={{ color: "#F6C35B" }}>Atmosphere:</strong>{" "}
              {details.atmosphere}
            </div>
            <div
              style={{
                background: "rgba(246,195,91,0.06)",
                border: "1px solid rgba(246,195,91,0.15)",
                borderRadius: 8,
                padding: "8px 10px",
                color: "#9AA7B6",
                fontSize: 10,
                lineHeight: 1.6,
                fontStyle: "italic",
              }}
            >
              {details.funFact}
            </div>
          </>
        )}
      </div>

      {/* Top-right mute button */}
      <button
        type="button"
        data-ocid="surface.toggle"
        onClick={toggleMute}
        title={isMuted ? "Unmute" : "Mute"}
        style={{
          position: "absolute",
          top: 24,
          right: 24,
          background: "rgba(11,16,23,0.80)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 10,
          color: "#9AA7B6",
          cursor: "pointer",
          padding: "8px 14px",
          fontSize: 11,
          fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
          fontWeight: 600,
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {isMuted ? "Unmute" : "Mute Audio"}
      </button>

      {/* Launch button */}
      <button
        type="button"
        data-ocid="surface.close_button"
        onClick={onExit}
        style={{
          position: "absolute",
          bottom: 40,
          left: "50%",
          transform: "translateX(-50%)",
          background: "linear-gradient(135deg, #F6C35B 0%, #E5A82A 100%)",
          border: "none",
          borderRadius: 12,
          color: "#0a1018",
          cursor: "pointer",
          padding: "14px 32px",
          fontSize: 13,
          fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          gap: 8,
          boxShadow: "0 4px 24px rgba(246,195,91,0.4)",
          whiteSpace: "nowrap",
        }}
      >
        <Rocket size={16} />
        Launch Back to Space
      </button>
    </motion.div>
  );
}
