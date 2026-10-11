"use client";

import * as React from "react";
import { Volume2, VolumeX, Play, Pause, Gem } from "lucide-react";

export function HeroVideoShowcase() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });
  const [glare, setGlare] = React.useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(true);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [isLoaded, setIsLoaded] = React.useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Tilt angle max +/- 14 degrees
    const rotateY = ((x - centerX) / centerX) * 14;
    const rotateX = -((y - centerY) / centerY) * 14;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ x: rotateX, y: rotateY });
    setGlare({ x: glareX, y: glareY, opacity: 0.35 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid="hero-static-fallback"
      className="relative w-full max-w-[460px] mx-auto select-none cursor-pointer [perspective:1400px]"
      aria-label="3D Interactive Shell Jewellery Showcase Video"
    >
      {/* Ambient Pulsing Warm Light Glow Behind Video */}
      <div
        className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-rose-400/25 via-amber-300/20 to-orange-400/20 blur-2xl -z-10 transition-opacity duration-700 pointer-events-none"
        style={{
          opacity: isHovered ? 0.9 : 0.6,
        }}
      />

      {/* 3D Transforming Showcase Frame */}
      <div
        className="relative rounded-3xl p-[2.5px] bg-gradient-to-tr from-[#D4AF37]/60 via-rose-300/50 to-amber-200/60 shadow-[0_20px_50px_rgba(45,26,22,0.3)] transition-transform duration-200 ease-out [transform-style:preserve-3d]"
        style={{
          transform: isHovered
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.025, 1.025, 1.025)`
            : "rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
        }}
      >
        {/* Inner Video Housing */}
        <div className="relative aspect-[9/16] sm:aspect-[4/5] w-full overflow-hidden rounded-[22px] bg-stone-900 border border-white/20">
          <video
            ref={videoRef}
            src="/videos/shell-jewelry-hero.mp4"
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={() => setIsLoaded(true)}
            className="w-full h-full object-cover object-center"
          />

          {/* Dynamic 3D Specular Light Sheen / Glare */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, ${glare.opacity}) 0%, rgba(255, 255, 255, 0) 60%)`,
            }}
          />

          {/* Subtle Top Vignette Gradient for Controls Contrast */}
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />

          {/* Floating 3D Badge: Top Left (Depth = 40px) */}
          <div
            className="absolute top-4 left-4 z-20 transition-transform duration-200 pointer-events-none"
            style={{
              transform: isHovered ? "translateZ(45px)" : "translateZ(0px)",
            }}
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900/80 backdrop-blur-md border border-white/25 shadow-lg text-ivory">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-semibold tracking-wide flex items-center gap-1 text-white">
                <Gem className="w-3 h-3 text-amber-300" />
                Artisan Jewellery Set
              </span>
            </div>
          </div>

          {/* Floating 3D Controls: Top Right (Depth = 45px) */}
          <div
            className="absolute top-4 right-4 z-20 flex items-center gap-2 transition-transform duration-200"
            style={{
              transform: isHovered ? "translateZ(50px)" : "translateZ(0px)",
            }}
          >
            <button
              type="button"
              onClick={toggleMute}
              className="p-2 rounded-full bg-stone-900/80 backdrop-blur-md border border-white/25 text-white hover:bg-white hover:text-stone-900 shadow-md transition-all active:scale-90"
              title={isMuted ? "Unmute Video" : "Mute Video"}
              aria-label={isMuted ? "Unmute Video" : "Mute Video"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={togglePlay}
              className="p-2 rounded-full bg-stone-900/80 backdrop-blur-md border border-white/25 text-white hover:bg-white hover:text-stone-900 shadow-md transition-all active:scale-90"
              title={isPlaying ? "Pause Video" : "Play Video"}
              aria-label={isPlaying ? "Pause Video" : "Play Video"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
