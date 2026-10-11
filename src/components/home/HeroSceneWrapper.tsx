"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useWebGLSupport } from "@/hooks/use-webgl-support";

// Dynamically load R3F 3D Scene with ssr: false so 3D code is strictly code-split
const HeroScene3D = dynamic(() => import("./HeroScene3D"), {
  ssr: false,
  loading: () => <HeroStaticPoster priority />,
});

function HeroStaticPoster({ priority = false }: { priority?: boolean }) {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-md bg-beige/30"
      data-testid="hero-static-fallback"
    >
      <Image
        src="/images/hero-fallback.webp"
        alt="Artisan crafted shell jewellery and personalized gifts styled with pink linen and dried florals"
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg/40 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}

class SceneErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn("Hero 3D scene failed gracefully, rendering static fallback:", error);
  }

  render() {
    if (this.state.hasError) {
      return <HeroStaticPoster />;
    }
    return this.props.children;
  }
}

export function HeroSceneWrapper() {
  const [mounted, setMounted] = React.useState(false);
  const prefersReducedMotion = useReducedMotion();
  const webgl = useWebGLSupport();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR or before client hydration finishes, show the static poster (0 CLS)
  if (!mounted) {
    return (
      <div className="relative aspect-square w-full max-w-[500px]">
        <HeroStaticPoster priority />
      </div>
    );
  }

  // If user prefers reduced motion or WebGL is unsupported / data-saver is active
  if (prefersReducedMotion || !webgl.isSupported) {
    return (
      <div className="relative aspect-square w-full max-w-[500px]">
        <HeroStaticPoster priority />
      </div>
    );
  }

  return (
    <div className="relative aspect-square w-full max-w-[500px]">
      <SceneErrorBoundary>
        <React.Suspense fallback={<HeroStaticPoster priority />}>
          <HeroScene3D />
        </React.Suspense>
      </SceneErrorBoundary>
    </div>
  );
}
