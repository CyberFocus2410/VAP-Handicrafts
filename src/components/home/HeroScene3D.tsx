"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * 3D Handcrafted Conch Shell & Rose Bead Bracelet
 * Modeled with alternating natural spiral shells, lustrous pink crackle crystal beads,
 * and 18K gold spacer rings on a flexible elastic torus path.
 */
function ShellBracelet() {
  const groupRef = React.useRef<THREE.Group>(null);
  const beadCount = 16;
  const radius = 1.15;

  useFrame(({ clock, pointer }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // Gentle floating breathing motion
    groupRef.current.position.y = Math.sin(t * 1.1) * 0.07;

    // Smooth continuous axial rotation + interactive mouse parallax
    const targetRotY = t * 0.25 + pointer.x * 0.35;
    const targetRotX = 0.45 + Math.sin(t * 0.6) * 0.06 - pointer.y * 0.25;
    const targetRotZ = Math.sin(t * 0.5) * 0.08;

    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotY,
      0.06
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotX,
      0.06
    );
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      targetRotZ,
      0.06
    );
  });

  // Generate beads arranged circularly around radius
  const beads = React.useMemo(() => {
    const items = [];
    for (let i = 0; i < beadCount; i++) {
      const angle = (i / beadCount) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const isShell = i % 2 === 0;

      items.push({
        id: i,
        x,
        z,
        angle,
        isShell,
      });
    }
    return items;
  }, [beadCount, radius]);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Underlying Cord / Elastic Wire Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.015, 12, 48]} />
        <meshStandardMaterial color="#D5C7BC" roughness={0.8} />
      </mesh>

      {/* Alternating Beads & Shells */}
      {beads.map((b) => {
        if (b.isShell) {
          // Natural Striped Spiral Cone Shell Bead
          return (
            <group
              key={b.id}
              position={[b.x, 0, b.z]}
              rotation={[0, -b.angle + Math.PI / 2, Math.PI / 2]}
            >
              {/* Shell main cone */}
              <mesh castShadow receiveShadow>
                <coneGeometry args={[0.13, 0.36, 16]} />
                <meshStandardMaterial
                  color="#F7EFE6"
                  roughness={0.45}
                  metalness={0.08}
                />
              </mesh>
              {/* Shell spiral ridges / bands */}
              <mesh position={[0, -0.06, 0]}>
                <torusGeometry args={[0.11, 0.02, 10, 20]} />
                <meshStandardMaterial
                  color="#C89D7C"
                  roughness={0.5}
                  metalness={0.05}
                />
              </mesh>
              <mesh position={[0, -0.13, 0]}>
                <torusGeometry args={[0.07, 0.018, 10, 20]} />
                <meshStandardMaterial
                  color="#B07D5B"
                  roughness={0.5}
                  metalness={0.05}
                />
              </mesh>
            </group>
          );
        } else {
          // Rose Pink Crackle Crystal Gemstone Bead + Gold Spacer Rings
          return (
            <group key={b.id} position={[b.x, 0, b.z]}>
              {/* Rose Quartz / Pink Crackle Glass Bead */}
              <mesh castShadow>
                <sphereGeometry args={[0.14, 24, 24]} />
                <meshStandardMaterial
                  color="#F4A3BE"
                  roughness={0.15}
                  metalness={0.2}
                  envMapIntensity={1.5}
                />
              </mesh>
              {/* Inner crackle facet sparkle effect */}
              <mesh scale={0.78}>
                <icosahedronGeometry args={[0.12, 1]} />
                <meshStandardMaterial
                  color="#FFE6EE"
                  roughness={0.05}
                  metalness={0.4}
                />
              </mesh>
              {/* Gold Spacer Ring Left */}
              <mesh
                position={[-Math.sin(b.angle) * 0.14, 0, Math.cos(b.angle) * 0.14]}
                rotation={[0, b.angle, 0]}
              >
                <cylinderGeometry args={[0.07, 0.07, 0.03, 16]} />
                <meshStandardMaterial
                  color="#E5B842"
                  roughness={0.2}
                  metalness={0.88}
                />
              </mesh>
              {/* Gold Spacer Ring Right */}
              <mesh
                position={[Math.sin(b.angle) * 0.14, 0, -Math.cos(b.angle) * 0.14]}
                rotation={[0, b.angle, 0]}
              >
                <cylinderGeometry args={[0.07, 0.07, 0.03, 16]} />
                <meshStandardMaterial
                  color="#E5B842"
                  roughness={0.2}
                  metalness={0.88}
                />
              </mesh>
            </group>
          );
        }
      })}
    </group>
  );
}

/**
 * 3D Handcrafted Dangling Shell & Pearl Earrings
 * Elegant pair with gold french hooks, purple/pink crystals, freshwater pearls, and dangling shells.
 */
function DanglingEarrings({
  position,
  delayOffset,
}: {
  position: [number, number, number];
  delayOffset: number;
}) {
  const earringRef = React.useRef<THREE.Group>(null);

  useFrame(({ clock, pointer }) => {
    if (!earringRef.current) return;
    const t = clock.getElapsedTime() + delayOffset;

    // Gentle swaying motion like hanging jewelry
    earringRef.current.position.y = position[1] + Math.sin(t * 1.3) * 0.05;
    earringRef.current.rotation.z = Math.sin(t * 1.1) * 0.1 + pointer.x * 0.12;
    earringRef.current.rotation.y = t * 0.3 + pointer.x * 0.2;
    earringRef.current.rotation.x = 0.2 + pointer.y * 0.1;
  });

  return (
    <group ref={earringRef} position={position} scale={0.88}>
      {/* 18K Gold Earring French Hook Wire */}
      <mesh position={[0, 0.55, 0]} rotation={[0, 0, -0.4]}>
        <torusGeometry args={[0.13, 0.016, 12, 24, Math.PI * 1.3]} />
        <meshStandardMaterial color="#E5B842" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Gold Top Connector Loop */}
      <mesh position={[0, 0.38, 0]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#E5B842" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Purple/Pink Faceted Crystal Bead */}
      <mesh position={[0, 0.24, 0]}>
        <octahedronGeometry args={[0.09, 0]} />
        <meshStandardMaterial
          color="#B388EB"
          roughness={0.12}
          metalness={0.25}
        />
      </mesh>

      {/* Lustrous Freshwater Tear Pearl */}
      <mesh position={[0, 0.06, 0]} scale={[1, 1.35, 1]}>
        <sphereGeometry args={[0.085, 20, 20]} />
        <meshStandardMaterial
          color="#FFFDF9"
          roughness={0.18}
          metalness={0.15}
        />
      </mesh>

      {/* Dangling Natural Shell Drop */}
      <group position={[0, -0.16, 0]} rotation={[Math.PI, 0, 0]}>
        <mesh castShadow>
          <coneGeometry args={[0.11, 0.28, 16]} />
          <meshStandardMaterial
            color="#FAF4ED"
            roughness={0.4}
            metalness={0.06}
          />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <torusGeometry args={[0.09, 0.016, 10, 20]} />
          <meshStandardMaterial color="#C89D7C" roughness={0.45} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Floating Pearl Accents
 */
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
        roughness={0.15}
        metalness={0.25}
      />
    </mesh>
  );
}

function MainJewelleryScene() {
  return (
    <group position={[0, 0.05, 0]}>
      {/* 1. Main 3D Beaded Conch Shell Bracelet */}
      <ShellBracelet />

      {/* 2. Accompanying Pair of Dangling Shell & Pearl Earrings */}
      <DanglingEarrings
        position={[1.5, 0.35, 0.2]}
        delayOffset={0.5}
      />
      <DanglingEarrings
        position={[-1.48, -0.2, 0.15]}
        delayOffset={1.8}
      />

      {/* 3. Orbiting Lustrous Pearl Spheres */}
      <FloatingPearl offset={0} radius={1.75} speed={0.7} yOffset={0.5} size={0.1} />
      <FloatingPearl offset={2.1} radius={1.85} speed={0.55} yOffset={-0.35} size={0.08} />
      <FloatingPearl offset={4.2} radius={1.65} speed={0.8} yOffset={0.2} size={0.07} />
      <FloatingPearl offset={1.3} radius={2.0} speed={0.45} yOffset={-0.6} size={0.06} />
    </group>
  );
}

export default function HeroScene3D() {
  return (
    <div
      className="h-full w-full select-none cursor-grab active:cursor-grabbing"
      data-testid="hero-scene-3d"
      aria-label="3D Interactive Shell Bracelet and Earrings display"
    >
      <Canvas
        camera={{ position: [0, 0.2, 4.2], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        {/* Soft Ambient Light for warm ivory atmosphere */}
        <ambientLight intensity={1.1} color="#FFFDF9" />

        {/* Studio Golden Key Light */}
        <directionalLight
          position={[4, 5, 4]}
          intensity={1.6}
          color="#FFF8EE"
          castShadow
        />

        {/* Rose Gold Rim Light for jewelry luster */}
        <directionalLight
          position={[-4, 2, -2]}
          intensity={0.9}
          color="#FCECE8"
        />

        {/* Bottom soft bounce for metallic underside gleam */}
        <directionalLight
          position={[0, -3, 2]}
          intensity={0.5}
          color="#E5DCD3"
        />

        <MainJewelleryScene />
      </Canvas>
    </div>
  );
}
