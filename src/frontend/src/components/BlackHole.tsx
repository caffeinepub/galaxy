import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { audioManager as AudioManagerType } from "../utils/AudioManager";

interface BlackHoleProps {
  onBlackHoleClick: () => void;
  audioManagerRef: React.MutableRefObject<typeof AudioManagerType | null>;
  cameraRef?: React.MutableRefObject<THREE.Camera | null>;
}

// Accretion disk vertex shader
const ACCRETION_VERT = `
  attribute float size;
  attribute float brightness;
  varying float vBrightness;
  uniform float time;

  void main() {
    vBrightness = brightness;
    vec3 pos = position;
    float dist = length(pos.xz);
    float speed = 0.4 + 2.0 / (dist * 0.15 + 0.5);
    float angle = atan(pos.z, pos.x) + time * speed;
    pos.x = dist * cos(angle);
    pos.z = dist * sin(angle);
    pos.y += sin(angle * 3.0 + dist * 0.3) * 0.3;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const ACCRETION_FRAG = `
  varying float vBrightness;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = (1.0 - dist * 2.0) * vBrightness;
    // Hot white inner -> orange outer -> dark red far
    vec3 hotWhite = vec3(1.0, 0.97, 0.90);
    vec3 orange = vec3(1.0, 0.45, 0.10);
    vec3 red = vec3(0.6, 0.08, 0.02);
    vec3 color = mix(red, orange, smoothstep(0.0, 0.5, vBrightness));
    color = mix(color, hotWhite, smoothstep(0.7, 1.0, vBrightness));
    gl_FragColor = vec4(color, alpha);
  }
`;

// Jet particle vertex shader
const JET_VERT = `
  attribute float life;
  varying float vLife;
  uniform float time;

  void main() {
    vLife = life;
    vec3 pos = position;
    pos.y += time * (sign(pos.y)) * 2.0;
    pos.y = mod(pos.y * sign(pos.y), 25.0) * sign(position.y);
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = 2.5 * (200.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const JET_FRAG = `
  varying float vLife;
  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = (1.0 - dist * 2.0) * (1.0 - vLife) * 0.6;
    vec3 blue = vec3(0.4, 0.7, 1.0);
    vec3 white = vec3(0.95, 0.97, 1.0);
    vec3 col = mix(white, blue, vLife);
    gl_FragColor = vec4(col, alpha);
  }
`;

// Gravitational lensing shader
const LENS_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const LENS_FRAG = `
  varying vec2 vUv;
  uniform float time;

  void main() {
    vec2 center = vec2(0.5);
    float dist = length(vUv - center);
    float ring = smoothstep(0.38, 0.42, dist) * smoothstep(0.52, 0.48, dist);
    float glow = smoothstep(0.5, 0.35, dist) * 0.15;
    vec3 col = mix(vec3(0.8, 0.4, 0.05), vec3(1.0, 0.85, 0.4), ring * 0.6);
    float alpha = ring * 0.55 + glow;
    gl_FragColor = vec4(col, alpha);
  }
`;

export function BlackHole({
  onBlackHoleClick,
  audioManagerRef,
}: BlackHoleProps) {
  const BLACK_HOLE_POS = new THREE.Vector3(400, 0, -600);
  const [hovered, setHovered] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  const lensRef = useRef<THREE.Mesh>(null);
  const halo1Ref = useRef<THREE.Mesh>(null);
  const halo2Ref = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Accretion disk particles
  const diskGeom = useMemo(() => {
    const count = 8000;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const brightness = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const r = 9.5 + Math.random() ** 0.6 * 16;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * (0.4 + (r - 9.5) * 0.08);
      positions[i * 3] = Math.cos(theta) * r;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * r;
      sizes[i] = 1.2 + Math.random() * 2.5;
      // brightness: higher near center
      brightness[i] =
        Math.max(0, 1 - ((r - 9.5) / 16) * 0.9) * (0.5 + Math.random() * 0.5);
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geom.setAttribute("brightness", new THREE.BufferAttribute(brightness, 1));
    return geom;
  }, []);

  // Jet particles
  const jetGeom = useMemo(() => {
    const count = 600;
    const positions = new Float32Array(count * 3);
    const life = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = Math.random() * 0.8;
      const theta = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(theta) * r;
      positions[i * 3 + 1] = (i < count / 2 ? 1 : -1) * (Math.random() * 25);
      positions[i * 3 + 2] = Math.sin(theta) * r;
      life[i] = Math.random();
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("life", new THREE.BufferAttribute(life, 1));
    return geom;
  }, []);

  const diskMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: ACCRETION_VERT,
        fragmentShader: ACCRETION_FRAG,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
      }),
    [],
  );

  const jetMat1 = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: JET_VERT,
        fragmentShader: JET_FRAG,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
      }),
    [],
  );

  const jetMat2 = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: JET_VERT,
        fragmentShader: JET_FRAG,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
      }),
    [],
  );

  const lensMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: LENS_VERT,
        fragmentShader: LENS_FRAG,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        side: THREE.DoubleSide,
      }),
    [],
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    diskMaterial.uniforms.time.value = t;
    jetMat1.uniforms.time.value = t * 0.8;
    jetMat2.uniforms.time.value = t * 0.8 + 0.5;
    lensMaterial.uniforms.time.value = t;

    // Pulse halos
    if (halo1Ref.current) {
      halo1Ref.current.scale.setScalar(1 + Math.sin(t * 0.6) * 0.04);
    }
    if (halo2Ref.current) {
      halo2Ref.current.scale.setScalar(1 + Math.cos(t * 0.35) * 0.06);
    }

    // Always face camera with lens ring (world space)
    if (lensRef.current) {
      lensRef.current.lookAt(state.camera.position);
    }

    // Distance-based audio
    const camDist = state.camera.position.distanceTo(BLACK_HOLE_POS);
    const am = audioManagerRef.current;
    if (am) {
      if (camDist < 650 && !audioPlaying) {
        setAudioPlaying(true);
        am.playBlackHoleAmbient();
      } else if (camDist >= 650 && audioPlaying) {
        setAudioPlaying(false);
        am.stopBlackHoleAmbient();
      }
    }
  });

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      audioManagerRef.current?.stopBlackHoleAmbient();
    };
  }, [audioManagerRef]);

  function handleClick(e: any) {
    e.stopPropagation();
    onBlackHoleClick();
  }

  return (
    <group ref={groupRef} position={BLACK_HOLE_POS}>
      {/* Event horizon — perfect black sphere */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: R3F 3D mesh */}
      <mesh
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[8, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Photon sphere — barely visible blue-shift ring */}
      <mesh>
        <sphereGeometry args={[9.2, 32, 32]} />
        <meshBasicMaterial
          color="#050520"
          transparent
          opacity={0.25}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Gravitational lensing ring */}
      <mesh ref={lensRef}>
        <planeGeometry args={[38, 38, 1, 1]} />
        <primitive object={lensMaterial} attach="material" />
      </mesh>

      {/* Accretion disk particles */}
      <points geometry={diskGeom}>
        <primitive object={diskMaterial} attach="material" />
      </points>

      {/* Outer glow halos */}
      <mesh ref={halo1Ref}>
        <sphereGeometry args={[14, 16, 16]} />
        <meshBasicMaterial
          color="#FF6B10"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={halo2Ref}>
        <sphereGeometry args={[22, 16, 16]} />
        <meshBasicMaterial
          color="#FF3300"
          transparent
          opacity={0.03}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Relativistic jets — north and south */}
      <points geometry={jetGeom}>
        <primitive object={jetMat1} attach="material" />
      </points>
      <points geometry={jetGeom} rotation={[Math.PI, 0, 0]}>
        <primitive object={jetMat2} attach="material" />
      </points>

      {/* Point light for local illumination */}
      <pointLight color="#FF6B10" intensity={2.5} distance={80} decay={2} />

      {/* Hover label */}
      {hovered && (
        <Html center position={[0, 14, 0]} style={{ pointerEvents: "none" }}>
          <div
            style={{
              background: "rgba(5,0,10,0.9)",
              border: "1px solid rgba(255,80,20,0.5)",
              borderRadius: 8,
              padding: "5px 14px",
              color: "#FF8030",
              fontSize: 10,
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              textShadow: "0 0 12px rgba(255,100,20,0.8)",
            }}
          >
            Sagittarius A*
            <br />
            <span style={{ fontSize: 8, opacity: 0.7 }}>Click to explore</span>
          </div>
        </Html>
      )}
    </group>
  );
}
