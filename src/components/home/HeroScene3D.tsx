"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function GiftBox() {
  const boxGroupRef = React.useRef<THREE.Group>(null);

  useFrame(({ clock, pointer }) => {
    if (!boxGroupRef.current) return;
    const t = clock.getElapsedTime();

    // Gentle bobbing motion
    boxGroupRef.current.position.y = Math.sin(t * 1.2) * 0.06;

    // Subtle pointer parallax (restrained to <= 6 degrees = ~0.1 rad)
    const targetRotY = pointer.x * 0.12 + Math.sin(t * 0.4) * 0.05;
    const targetRotX = -pointer.y * 0.08 + 0.15;

    boxGroupRef.current.rotation.y = THREE.MathUtils.lerp(
      boxGroupRef.current.rotation.y,
      targetRotY,
      0.05
    );
    boxGroupRef.current.rotation.x = THREE.MathUtils.lerp(
      boxGroupRef.current.rotation.x,
      targetRotX,
      0.05
    );
  });

  return (
    <group ref={boxGroupRef} position={[0, 0, 0]}>
      {/* Box Body */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 1.3, 1.7]} />
        <meshStandardMaterial
          color="#FAF5EF"
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* Box Lid */}
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.78, 0.28, 1.78]} />
        <meshStandardMaterial
          color="#FFFDF9"
          roughness={0.75}
          metalness={0.05}
        />
      </mesh>

      {/* Horizontal Ribbon on Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.72, 1.31, 0.22]} />
        <meshStandardMaterial
          color="#A15B52"
          roughness={0.55}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.22, 1.31, 1.72]} />
        <meshStandardMaterial
          color="#A15B52"
          roughness={0.55}
          metalness={0.1}
        />
      </mesh>

      {/* Ribbon on Lid */}
      <mesh position={[0, 0.73, 0]}>
        <boxGeometry args={[1.8, 0.29, 0.24]} />
        <meshStandardMaterial
          color="#A15B52"
          roughness={0.55}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0, 0.73, 0]}>
        <boxGeometry args={[0.24, 0.29, 1.8]} />
        <meshStandardMaterial
          color="#A15B52"
          roughness={0.55}
          metalness={0.1}
        />
      </mesh>

      {/* Ribbon Knot / Bow on Top */}
      <group position={[0, 0.95, 0]}>
        {/* Center knot */}
        <mesh>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial
            color="#A15B52"
            roughness={0.5}
            metalness={0.1}
          />
        </mesh>
        {/* Left bow loop */}
        <mesh position={[-0.22, 0.08, 0]} rotation={[0, 0, 0.35]}>
          <torusGeometry args={[0.18, 0.06, 12, 24]} />
          <meshStandardMaterial
            color="#A15B52"
            roughness={0.5}
            metalness={0.1}
          />
        </mesh>
        {/* Right bow loop */}
        <mesh position={[0.22, 0.08, 0]} rotation={[0, 0, -0.35]}>
          <torusGeometry args={[0.18, 0.06, 12, 24]} />
          <meshStandardMaterial
            color="#A15B52"
            roughness={0.5}
            metalness={0.1}
          />
        </mesh>
      </group>

      {/* Floating Lustrous Pearl Spheres */}
      <FloatingPearl offset={0} radius={1.4} speed={0.8} yOffset={0.3} size={0.12} />
      <FloatingPearl offset={2.1} radius={1.6} speed={0.6} yOffset={-0.2} size={0.09} />
      <FloatingPearl offset={4.2} radius={1.3} speed={0.9} yOffset={0.6} size={0.08} />

      {/* Subtle Shell Accent (Cone Geometry) */}
      <FloatingShell offset={1.2} radius={1.5} speed={0.7} yOffset={-0.4} />
      <FloatingShell offset={3.5} radius={1.45} speed={0.75} yOffset={0.45} />
    </group>
  );
}

function FloatingPearl({
  offset,
  radius,
  speed,
  yOffset,
  size,
}: {
  offset: number;
  radius: number;
  speed: number;
  yOffset: number;
  size: number;
}) {
  const meshRef = React.useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime() * speed + offset;
    meshRef.current.position.x = Math.cos(t) * radius;
    meshRef.current.position.z = Math.sin(t) * radius;
    meshRef.current.position.y = yOffset + Math.sin(t * 1.5) * 0.12;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size, 20, 20]} />
      <meshStandardMaterial
        color="#FFFDF9"
        roughness={0.2}
        metalness={0.15}
      />
    </mesh>
  );
}

function FloatingShell({
  offset,
  radius,
  speed,
  yOffset,
}: {
  offset: number;
  radius: number;
  speed: number;
  yOffset: number;
}) {
  const meshRef = React.useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime() * speed + offset;
    meshRef.current.position.x = Math.sin(t) * radius;
    meshRef.current.position.z = Math.cos(t) * radius;
    meshRef.current.position.y = yOffset + Math.cos(t * 1.3) * 0.1;
    meshRef.current.rotation.x = t * 0.5;
    meshRef.current.rotation.y = t * 0.8;
  });

  return (
    <mesh ref={meshRef}>
      <coneGeometry args={[0.12, 0.28, 12]} />
      <meshStandardMaterial
        color="#E7D8C7"
        roughness={0.65}
        metalness={0.05}
      />
    </mesh>
  );
}

export default function HeroScene3D() {
  return (
    <div
      className="h-full w-full pointer-events-none"
      data-testid="hero-scene-3d"
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0.4, 4.4], fov: 38 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={1.1} color="#FFFDF9" />
        <directionalLight
          position={[4, 5, 4]}
          intensity={1.3}
          color="#FAF5EF"
          castShadow
        />
        <directionalLight
          position={[-3, 2, -2]}
          intensity={0.4}
          color="#E8C1BC"
        />
        <GiftBox />
      </Canvas>
    </div>
  );
}
