import { OrbitControls, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

interface InterstellarBlackHoleHeroProps {
  onEnterSolarSystem: () => void;
}

// Accretion disk particle system
function AccretionDisk() {
  const meshRef = useRef<THREE.Points>(null);
  const COUNT = 10000;

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const r = 12 + Math.random() ** 0.5 * 23;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * (0.6 + (r - 12) * 0.08);
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(theta) * r;

      // Doppler: x > 0 (approaching) = bright white/gold, x < 0 = dim red/orange
      const x = pos[i * 3];
      const brightness = (x / r) * 0.5 + 0.5; // 0..1, 1 = approaching
      const distFactor = 1 - (r - 12) / 23; // closer to center = brighter

      if (brightness > 0.5) {
        // Approaching side: white-gold
        const t = (brightness - 0.5) * 2;
        col[i * 3] = 1.0;
        col[i * 3 + 1] = 0.85 + 0.15 * t * distFactor;
        col[i * 3 + 2] = 0.4 + 0.6 * t * distFactor;
      } else {
        // Receding side: dim orange-red
        const t = brightness / 0.5;
        col[i * 3] = 0.6 + 0.3 * t * distFactor;
        col[i * 3 + 1] = 0.15 + 0.3 * t * distFactor;
        col[i * 3 + 2] = 0.02;
      }
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.18}
        vertexColors
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

// Relativistic jets — top AND bottom
function RelativisticJets() {
  const topRef = useRef<THREE.Points>(null);
  const botRef = useRef<THREE.Points>(null);
  const COUNT = 600;

  const { positions } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const h = Math.random() * 80; // positive only; we'll flip for bottom
      const r = h < 8 ? Math.random() * 1.5 : Math.random() * (0.5 + h * 0.015);
      const theta = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = h;
      pos[i * 3 + 2] = Math.sin(theta) * r;
    }
    return { positions: pos };
  }, []);

  const mat = (
    <pointsMaterial
      size={0.12}
      color="#a0c8ff"
      transparent
      opacity={0.35}
      blending={THREE.AdditiveBlending}
      depthWrite={false}
      sizeAttenuation
    />
  );

  return (
    <>
      {/* Top jet */}
      <points ref={topRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        {mat}
      </points>
      {/* Bottom jet — mirrored downward */}
      <points ref={botRef} scale={[1, -1, 1]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        {mat}
      </points>
    </>
  );
}

// Photon ring (bright torus)
function PhotonRing() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.z += delta * 0.03;
  });
  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[11.5, 0.25, 16, 128]} />
      <meshBasicMaterial
        color="#fffbe8"
        transparent
        opacity={0.95}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// Secondary glow rings
function GlowRings() {
  return (
    <>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[13, 0.08, 8, 128]} />
        <meshBasicMaterial
          color="#ffaa44"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[16, 0.06, 8, 128]} />
        <meshBasicMaterial
          color="#ff6622"
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

// Event horizon (black sphere)
function EventHorizon() {
  return (
    <mesh>
      <sphereGeometry args={[10, 64, 64]} />
      <meshBasicMaterial color="#000000" />
    </mesh>
  );
}

// Outer ambient glow sphere
function OuterGlow() {
  return (
    <mesh>
      <sphereGeometry args={[14, 32, 32]} />
      <meshBasicMaterial
        color="#ff8833"
        transparent
        opacity={0.04}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// Gravitational lensing distortion ring
function LensingRing() {
  return (
    <mesh>
      <torusGeometry args={[12.2, 1.2, 8, 128]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.06}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Auto-rotate wrapper
function AutoRotate({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.04;
    }
  });
  return <group ref={groupRef}>{children}</group>;
}

export function InterstellarBlackHoleHero({
  onEnterSolarSystem,
}: InterstellarBlackHoleHeroProps) {
  const [showHint, setShowHint] = useState(true);
  const [interacted, setInteracted] = useState(false);
  // Audio stored in refs so they survive remounts without leaking
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioStartedRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
        audioStartedRef.current = false;
      }
    };
  }, []);

  function startBlackHoleAudio() {
    if (audioStartedRef.current) return;
    audioStartedRef.current = true;
    try {
      const ctx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.15;
      masterGain.connect(ctx.destination);

      // 20Hz sub-bass
      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.value = 20;
      const g1 = ctx.createGain();
      g1.gain.value = 0.7;
      osc1.connect(g1);
      g1.connect(masterGain);
      osc1.start();

      // 40Hz rumble
      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.value = 40;
      const g2 = ctx.createGain();
      g2.gain.value = 0.4;
      osc2.connect(g2);
      g2.connect(masterGain);
      osc2.start();

      // 60Hz harmonic
      const osc3 = ctx.createOscillator();
      osc3.type = "triangle";
      osc3.frequency.value = 60;
      const g3 = ctx.createGain();
      g3.gain.value = 0.2;
      osc3.connect(g3);
      g3.connect(masterGain);
      osc3.start();

      // Random deep pulses
      function schedulePulse() {
        if (!audioCtxRef.current) return;
        const delay = 3000 + Math.random() * 8000;
        setTimeout(() => {
          const c = audioCtxRef.current;
          if (!c) return;
          const pulse = c.createOscillator();
          pulse.type = "sine";
          pulse.frequency.value = 15 + Math.random() * 10;
          const pg = c.createGain();
          pg.gain.setValueAtTime(0, c.currentTime);
          pg.gain.linearRampToValueAtTime(0.3, c.currentTime + 0.5);
          pg.gain.linearRampToValueAtTime(0, c.currentTime + 2.5);
          pulse.connect(pg);
          pg.connect(masterGain);
          pulse.start();
          pulse.stop(c.currentTime + 3);
          schedulePulse();
        }, delay);
      }
      schedulePulse();
    } catch (_e) {
      // Audio blocked
    }
  }

  const handleInteraction = () => {
    if (!interacted) {
      setInteracted(true);
      startBlackHoleAudio();
    }
  };

  return (
    <div
      onClick={handleInteraction}
      onKeyDown={handleInteraction}
      role="presentation"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "#000",
        zIndex: 0,
      }}
    >
      <Canvas
        camera={{ fov: 50, near: 0.1, far: 2000, position: [0, 15, 60] }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.5,
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <Stars
          radius={600}
          depth={80}
          count={7000}
          factor={5}
          saturation={0.2}
          fade
          speed={0.3}
        />
        <ambientLight intensity={0.01} />

        <AutoRotate>
          <AccretionDisk />
          <GlowRings />
        </AutoRotate>

        <EventHorizon />
        <PhotonRing />
        <LensingRing />
        <OuterGlow />
        <RelativisticJets />

        <OrbitControls
          enableZoom
          minDistance={15}
          maxDistance={200}
          autoRotate={false}
          enablePan={false}
          target={[0, 0, 0]}
        />
      </Canvas>

      {/* App title */}
      <div
        style={{
          position: "absolute",
          top: "2rem",
          left: "2rem",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(1.1rem, 2.5vw, 1.8rem)",
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "0.08em",
            textShadow:
              "0 0 30px rgba(255,160,50,0.6), 0 0 60px rgba(255,100,20,0.3)",
          }}
        >
          Multi-verse of Madness
        </div>
      </div>

      {/* Click hint */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
              color: "rgba(255,220,120,0.7)",
              fontSize: "0.85rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              pointerEvents: "none",
              fontFamily: "sans-serif",
              marginTop: "8rem",
            }}
          >
            Click to interact
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enter Solar System button */}
      <div
        style={{
          position: "absolute",
          bottom: "3rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
        }}
      >
        <motion.button
          data-ocid="blackhole.enter_solar_system.button"
          onClick={(e) => {
            e.stopPropagation();
            onEnterSolarSystem();
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,180,60,0.6)",
            borderRadius: "2px",
            color: "#ffd27a",
            padding: "0.75rem 2.2rem",
            fontSize: "0.9rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            cursor: "pointer",
            fontFamily: "sans-serif",
            fontWeight: 400,
            boxShadow:
              "0 0 20px rgba(255,150,30,0.35), 0 0 60px rgba(255,100,0,0.15), inset 0 0 20px rgba(255,150,30,0.05)",
            transition: "box-shadow 0.3s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 0 35px rgba(255,160,40,0.7), 0 0 80px rgba(255,100,0,0.3), inset 0 0 30px rgba(255,150,30,0.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 0 20px rgba(255,150,30,0.35), 0 0 60px rgba(255,100,0,0.15), inset 0 0 20px rgba(255,150,30,0.05)";
          }}
        >
          Enter Solar System →
        </motion.button>
      </div>
    </div>
  );
}
