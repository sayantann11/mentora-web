"use client";

/**
 * "The growth journey": a winding path of soft stepping-stones that rise as the
 * visitor scrolls, leading to a warm light. Procedural geometry only (no .glb,
 * no textures, no HDR downloads). One instanced mesh for all stones.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { sceneState } from "@/lib/sceneStore";
import { tracks } from "@/content/programs";

const STONES = 15;
const KEY_STONES = [3, 8, 13]; // Listen · Understand · Grow

function pathPoint(i: number, out = new THREE.Vector3()) {
  const t = i / (STONES - 1);
  // Gentle S-curve rising up and away from the viewer.
  return out.set(Math.sin(t * Math.PI * 1.6) * 2.1 + 1.6, -1.6 + t * 2.4, 2 - t * 13);
}

const palettes = Object.fromEntries(
  tracks.map((t) => [t.id, { a: new THREE.Color(t.palette.a), b: new THREE.Color(t.palette.b), c: new THREE.Color(t.palette.c), glow: new THREE.Color(t.palette.glow) }]),
);

function smooth(x: number) {
  const c = Math.min(1, Math.max(0, x));
  return c * c * (3 - 2 * c);
}

function Stones() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const glow = useRef<THREE.Mesh>(null);
  const glowMat = useRef<THREE.MeshBasicMaterial>(null);
  const halo = useRef<THREE.MeshBasicMaterial>(null);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const base = useMemo(() => Array.from({ length: STONES }, (_, i) => pathPoint(i)), []);
  const colA = useMemo(() => new THREE.Color(), []);
  const colB = useMemo(() => new THREE.Color(), []);
  const current = useMemo(() => ({ a: new THREE.Color("#8f6fd0"), b: new THREE.Color("#c9b6ee"), glow: new THREE.Color("#e6dbff") }), []);
  const geom = useMemo(() => {
    const g = new THREE.SphereGeometry(1, 36, 24);
    g.scale(1, 0.32, 1); // pebble
    return g;
  }, []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.42, metalness: 0.04 }), []);

  useEffect(() => () => {
    geom.dispose();
    mat.dispose();
  }, [geom, mat]);

  useFrame((state, delta) => {
    const m = mesh.current;
    if (!m) return;
    const p = sceneState.progress;
    const t = state.clock.elapsedTime;
    const target = palettes[sceneState.track];
    const k = 1 - Math.pow(0.02, delta);
    current.a.lerp(target.a, k);
    current.b.lerp(target.b, k);
    current.glow.lerp(target.glow, k);

    for (let i = 0; i < STONES; i++) {
      const b = base[i];
      const isKey = KEY_STONES.includes(i);
      // Each stone rises into place as the scroll progress reaches it.
      const rise = smooth(p * (STONES + 4) - i + 4.5);
      const bob = Math.sin(t * 0.8 + i * 0.7) * 0.06;
      tmp.position.set(b.x, b.y - 1.4 * (1 - rise) + bob, b.z);
      const s = (isKey ? 0.78 : 0.52) * (0.6 + 0.4 * rise);
      tmp.scale.setScalar(s);
      tmp.rotation.set(0, i * 0.9 + t * 0.05, 0);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
      const station = sceneState.station;
      const lit = isKey && KEY_STONES.indexOf(i) <= station - 1 ? 1 : 0;
      colA.copy(current.b).lerp(current.a, i / STONES);
      colB.copy(colA).lerp(current.glow, lit * 0.55);
      m.setColorAt(i, colB);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;

    if (glow.current) {
      const end = base[STONES - 1];
      glow.current.position.set(end.x - 0.4, end.y + 2.4 + Math.sin(t * 0.6) * 0.15, end.z - 2);
      const pulse = 1 + Math.sin(t * 1.2) * 0.04;
      glow.current.scale.setScalar((1.1 + p * 0.5) * pulse);
    }
    glowMat.current?.color.copy(current.glow);
    halo.current?.color.copy(current.glow);
  });

  return (
    <>
      <instancedMesh ref={mesh} args={[geom, mat, STONES]} />
      <mesh ref={glow}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial ref={glowMat} toneMapped={false} />
        <mesh scale={1.9}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshBasicMaterial ref={halo} transparent opacity={0.16} depthWrite={false} toneMapped={false} />
        </mesh>
      </mesh>
    </>
  );
}

function Drifters() {
  const group = useRef<THREE.Group>(null);
  const seeds = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        x: (i % 2 ? 1 : -1) * (3 + (i * 1.3) % 3),
        y: -0.5 + ((i * 1.7) % 3.5),
        z: -2 - i * 1.6,
        r: 0.18 + ((i * 0.37) % 0.4),
        sp: 0.3 + (i % 3) * 0.15,
      })),
    [],
  );
  const mats = useRef<THREE.MeshStandardMaterial[]>([]);
  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const pal = palettes[sceneState.track];
    g.children.forEach((c, i) => {
      const s = seeds[i];
      c.position.set(s.x + Math.sin(t * s.sp + i) * 0.3, s.y + Math.cos(t * s.sp * 0.8 + i) * 0.35, s.z);
    });
    mats.current.forEach((m, i) => m.color.lerp(i % 2 ? pal.c : pal.b, 0.04));
  });
  return (
    <group ref={group}>
      {seeds.map((s, i) => (
        <mesh key={i} scale={s.r}>
          <icosahedronGeometry args={[1, 3]} />
          <meshStandardMaterial
            ref={(m) => {
              if (m) mats.current[i] = m;
            }}
            roughness={0.3}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}
    </group>
  );
}

function CameraRig() {
  const { camera, size } = useThree();
  const look = useMemo(() => new THREE.Vector3(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const narrow = size.width < 768;
  useFrame((_, delta) => {
    const p = sceneState.progress;
    const k = 1 - Math.pow(0.001, delta);
    // Travel forward and upward along the path as the story progresses.
    pos.set((narrow ? 1.4 : 0) + sceneState.pointerX * 0.45 + p * 1.2, 0.6 + p * 1.6 + sceneState.pointerY * 0.3, (narrow ? 10 : 8) - p * 7.5);
    camera.position.lerp(pos, k);
    look.set(1.6 + p * 0.6, -0.2 + p * 1.2, -4 - p * 6);
    camera.lookAt(look);
  });
  return null;
}

export default function JourneyScene({ onFail }: { onFail: () => void }) {
  const [dpr, setDpr] = useState<number>(1.5);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const vis = () => setActive(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", vis);
    return () => document.removeEventListener("visibilitychange", vis);
  }, []);

  return (
    <Canvas
      aria-hidden
      dpr={dpr}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      camera={{ position: [0, 0.6, 8], fov: 42, near: 0.1, far: 60 }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.domElement.addEventListener("webglcontextlost", onFail, { once: true });
      }}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} flipflops={3} onFallback={onFail} />
      <fog attach="fog" args={["#f3edf8", 9, 24]} />
      <hemisphereLight args={["#ffffff", "#e9dcc9", 1.2]} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} color="#fff4e6" />
      <directionalLight position={[-5, 2, -3]} intensity={0.5} color="#c9b6ee" />
      <Stones />
      <Drifters />
      <CameraRig />
    </Canvas>
  );
}
