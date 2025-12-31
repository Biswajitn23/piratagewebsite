import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

import { useExperienceSettings } from "@/contexts/ExperienceSettingsContext";

export type HeroSceneProps = {
  pointerIntensity: number;
  fill?: boolean;
  blur?: boolean;
};

type ShieldMaterial = THREE.MeshStandardMaterial & {
  emissiveIntensity: number;
};

const HeroScene = ({ pointerIntensity, fill, blur }: HeroSceneProps) => {
  const { settings } = useExperienceSettings();
  const motionEnabled = settings.motionEnabled;

  const containerClass = fill
    ? "absolute inset-0 h-full w-full overflow-hidden border-0 rounded-none"
    : "relative h-[520px] w-full overflow-hidden rounded-[32px] border border-white/10 bg-black/30";

  return (
    <div className={`${containerClass} ${blur ? "blur-[2px] opacity-80" : ""} pointer-events-none`}>
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }} className="crt-scanlines">
        <color attach="background" args={["#060115"]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[6, 4, 8]} intensity={1.1} color={0x8a2be2} />
        <directionalLight position={[-6, -2, -4]} intensity={0.9} color={0x4b0082} />
        <Float floatIntensity={motionEnabled ? 1.4 : 0} rotationIntensity={motionEnabled ? 0.6 : 0} speed={motionEnabled ? 1 : 0}>
          <IridescentKnot pointerIntensity={pointerIntensity} />
        </Float>
        <ParticleField motionEnabled={motionEnabled} />
        <OrbitControls enablePan={false} enableZoom={false} autoRotate={motionEnabled} autoRotateSpeed={0.7} enableDamping dampingFactor={0.06} />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
};

const IridescentKnot = ({ pointerIntensity }: { pointerIntensity: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#8a2be2"),
        metalness: 0.6,
        roughness: 0.15,
        transmission: 0.2,
        thickness: 0.5,
        clearcoat: 0.7,
        clearcoatRoughness: 0.1,
        emissive: new THREE.Color("#4b0082"),
        emissiveIntensity: 0.35,
      }),
    [],
  );

  const wireMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#a78bfa"),
        wireframe: true,
        transparent: true,
        opacity: 0.28,
      }),
    [],
  );

  useFrame((state) => {
    if (!meshRef.current) {
      return;
    }

    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = Math.sin(time / 2) * 0.35;
    meshRef.current.rotation.y = time * 0.4;

    const mat = material as ShieldMaterial;
    mat.emissiveIntensity = 0.35 + pointerIntensity * 0.35;
  });

  return (
    <group>
      <mesh ref={meshRef} material={material}>
        <torusKnotGeometry args={[1.6, 0.42, 128, 12]} />
      </mesh>
      <mesh material={wireMaterial} scale={1.25}>
        <torusKnotGeometry args={[1.6, 0.42, 48, 8]} />
      </mesh>
    </group>
  );
};

const ParticleField = ({ motionEnabled }: { motionEnabled: boolean }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 300;

  const positions = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 6 + Math.random() * 4;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 4;
      arr[i] = Math.cos(angle) * radius;
      arr[i + 1] = height;
      arr[i + 2] = Math.sin(angle) * radius;
    }
    return arr;
  }, [particleCount]);

  const color = useMemo(() => new THREE.Color("#7c4dff"), []);

  useFrame((state) => {
    if (!motionEnabled || !pointsRef.current) {
      return;
    }

    const time = state.clock.getElapsedTime() * 0.1;
    pointsRef.current.rotation.y = time;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color={color}
        transparent
        opacity={0.35}
        depthWrite={false}
      />
    </points>
  );
};

const FallbackVisual = () => (
  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#4b0082]/20 via-[#8a2be2]/15 to-transparent">
    <div className="crt-scanlines glass-panel flex max-w-sm flex-col items-center gap-3 rounded-3xl border border-white/10 p-8 text-center">
      <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Initializing Piratage Lab
      </span>
      <p className="text-sm text-muted-foreground">Loading immersive scene…</p>
    </div>
  </div>
);

export default HeroScene;
