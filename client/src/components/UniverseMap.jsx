import React, { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Float, Text } from "@react-three/drei";
import * as THREE from "three";

const COLOR_PALETTE = [
  "#ff9d00",
  "#06b6d4",
  "#a855f7",
  "#ef4444",
  "#22c55e",
  "#f43f5e",
  "#eab308",
  "#3b82f6",
  "#84cc16",
  "#f97316",
];

const POSITION_PRESETS = [
  [-11, 5, 0],
  [10, -4, 0],
  [0, 0, -10],
  [-6, -7, 3],
  [7, 7, -4],
  [-3, 8, -7],
  [12, 2, 2],
  [-12, -2, -2],
  [3, -8, -6],
  [0, 9, 2],
];

const Galaxy = ({ position, color, energy, name, onSelect }) => {
  const pointsRef = useRef(null);

  const particles = useMemo(() => {
    const count = 900;
    const arr = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const arm = i % 4;
      const angle = i * 0.11 + arm * Math.PI * 0.5;
      const dist = (i / count) * 4.8;
      const jitter = (Math.random() - 0.5) * 0.45;

      arr[i * 3] = Math.cos(angle) * dist + jitter;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 0.6;
      arr[i * 3 + 2] = Math.sin(angle) * dist + jitter;
    }

    return arr;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    pointsRef.current.rotation.y = t * (0.08 + energy * 0.6);
  });

  return (
    <Float speed={1.2 + energy} rotationIntensity={0.35} floatIntensity={0.7}>
      <group position={position}>
        <points
          ref={pointsRef}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={particles}
              count={particles.length / 3}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.03 + energy * 0.05}
            color={color}
            transparent
            opacity={0.86}
            blending={THREE.AdditiveBlending}
            sizeAttenuation
          />
        </points>

        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          <sphereGeometry args={[0.48 + energy * 0.35, 20, 20]} />
          <meshBasicMaterial color={color} transparent opacity={0.35} />
        </mesh>

        <Text
          position={[0, -2, 0]}
          fontSize={0.42}
          color="#e2e8f0"
          anchorX="center"
          anchorY="middle"
        >
          {name}
        </Text>
      </group>
    </Float>
  );
};

const UniverseMap = ({ communityData = [] }) => {
  const [selectedGalaxy, setSelectedGalaxy] = useState(null);

  const mapData = useMemo(() => {
    if (communityData.length > 0) return communityData;

    return [
      {
        name: "MPPSC",
        energy: 0.85,
        color: COLOR_PALETTE[0],
        pos: POSITION_PRESETS[0],
        topWarrior: "Pending...",
        activity: 0,
      },
      {
        name: "Data Science",
        energy: 0.65,
        color: COLOR_PALETTE[1],
        pos: POSITION_PRESETS[1],
        topWarrior: "Pending...",
        activity: 0,
      },
      {
        name: "Coding",
        energy: 0.58,
        color: COLOR_PALETTE[2],
        pos: POSITION_PRESETS[2],
        topWarrior: "Pending...",
        activity: 0,
      },
    ];
  }, [communityData]);

  return (
    <div className="w-full h-[320px] md:h-[430px] bg-[#05030d] rounded-2xl overflow-hidden shadow-xl border border-indigo-900/40 relative">
      <Canvas
        camera={{ position: [0, 0, 24], fov: 60 }}
        onPointerMissed={() => setSelectedGalaxy(null)}
      >
        <color attach="background" args={["#05030d"]} />
        <Stars
          radius={110}
          depth={60}
          count={4200}
          factor={4}
          saturation={0}
          fade
          speed={0.9}
        />

        <ambientLight intensity={0.6} />
        <pointLight position={[8, 8, 8]} intensity={0.7} />

        {mapData.map((item, index) => (
          <Galaxy
            key={`${item.name}-${index}`}
            name={item.name}
            energy={Math.max(0.08, Math.min(1, item.energy || 0))}
            color={item.color || COLOR_PALETTE[index % COLOR_PALETTE.length]}
            position={item.pos || POSITION_PRESETS[index % POSITION_PRESETS.length]}
            onSelect={() => setSelectedGalaxy(item)}
          />
        ))}

        <OrbitControls
          enableZoom
          enablePan={false}
          maxDistance={48}
          minDistance={11}
          autoRotate
          autoRotateSpeed={0.25}
        />
      </Canvas>

      <div className="absolute left-3 top-3 rounded-lg bg-black/50 backdrop-blur px-3 py-1.5 text-[11px] text-white/90 border border-white/10">
        Global Universe Heatmap
      </div>

      {selectedGalaxy && (
        <div className="absolute right-3 bottom-3 max-w-[260px] rounded-xl bg-slate-950/85 border border-white/10 text-slate-100 p-3 shadow-2xl">
          <p className="text-xs uppercase tracking-[0.14em] text-indigo-300 font-black">
            {selectedGalaxy.name}
          </p>
          <p className="mt-1 text-sm font-black">
            Today&apos;s Top Warrior: {selectedGalaxy.topWarrior || "N/A"}
          </p>
          <p className="mt-1 text-[11px] text-slate-300">
            Activity: {selectedGalaxy.activity ?? 0} sessions/posts
          </p>
          <p className="text-[11px] text-emerald-300 font-semibold">
            Energy: {Math.round((selectedGalaxy.energy || 0) * 100)}%
          </p>
        </div>
      )}
    </div>
  );
};

export { COLOR_PALETTE, POSITION_PRESETS };
export default UniverseMap;
