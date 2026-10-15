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

  // Smooth mouse tilt handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Realistic 3D tilt angles (up to +/- 16 degrees)
    const rotateY = ((x - centerX) / centerX) * 16;
    const rotateX = -((y - centerY) / centerY) * 16;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ x: rotateX, y: rotateY });
    setGlare({ x: glareX, y: glareY, opacity: 0.42 });
  };

  // Touch move support for mobile 3D tilt
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || !e.touches[0]) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * 12;
    const rotateX = -((y - centerY) / centerY) * 12;

    setTilt({ x: rotateX, y: rotateY });
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.35,
    });
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
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseLeave}
      data-testid="hero-static-fallback"
      className="relative w-full max-w-[460px] mx-auto select-none cursor-pointer [perspective:1400px]"
      aria-label="3D Interactive Shell Jewellery Showcase Video"
    >
      {/* 3D Ambient Dynamic Light Aura Behind Video */}
      <div
        className="absolute -inset-6 rounded-[32px] bg-gradient-to-tr from-rose-400/30 via-amber-300/25 to-[#D4AF37]/30 blur-3xl -z-10 transition-all duration-500 pointer-events-none"
        style={{
          transform: isHovered
            ? `translate3d(${-tilt.y * 1.5}px, ${tilt.x * 1.5}px, -20px) scale(1.08)`
            : "translate3d(0, 0, -20px) scale(1)",
          opacity: isHovered ? 0.95 : 0.65,
        }}
      />

      {/* 3D Transforming Showcase Frame */}
      <div
        className="relative rounded-[26px] p-[3px] bg-gradient-to-tr from-[#D4AF37] via-rose-300/80 to-[#F5D77F] shadow-[0_25px_60px_-15px_rgba(45,26,22,0.35)] transition-transform duration-150 ease-out [transform-style:preserve-3d]"
        style={{
          transform: isHovered
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.035, 1.035, 1.035)`
            : "rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
        }}
      >
        {/* Inner Video Housing */}
        <div className="relative aspect-[9/16] sm:aspect-[4/5] w-full overflow-hidden rounded-[23px] bg-stone-900 border border-white/25 [transform-style:preserve-3d]">
          <video
            ref={videoRef}
            poster="/images/hero-fallback.webp"
            preload="metadata"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-center transition-transform duration-300"
            style={{
              transform: isHovered ? "scale(1.02)" : "scale(1)",
            }}
          >
            <source src="/videos/hero-showcase-mobile.mp4" media="(max-width: 768px)" type="video/mp4" />
            <source src="/videos/hero-showcase-v2.mp4" type="video/mp4" />
          </video>

          {/* Dynamic 3D Specular Light Sheen / Holographic Glare */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-200"
            style={{
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, ${glare.opacity}) 0%, rgba(255, 255, 255, 0.08) 35%, rgba(255, 255, 255, 0) 65%)`,
            }}
          />

          {/* Subtle Top Vignette Gradient for Controls Contrast */}
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />

          {/* Floating 3D Badge: Top Left (Depth = 55px) */}
          <div
            className="absolute top-4 left-4 z-20 transition-transform duration-150 pointer-events-none"
            style={{
              transform: isHovered ? "translateZ(55px)" : "translateZ(0px)",
            }}
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900/85 backdrop-blur-md border border-white/30 shadow-xl text-ivory">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-semibold tracking-wide flex items-center gap-1.5 text-white">
                <Gem className="w-3.5 h-3.5 text-amber-300" />
                Handcrafted Shell Jewellery
              </span>
            </div>
          </div>

          {/* Floating 3D Controls: Top Right (Depth = 60px) */}
          <div
            className="absolute top-4 right-4 z-20 flex items-center gap-2 transition-transform duration-150"
            style={{
              transform: isHovered ? "translateZ(60px)" : "translateZ(0px)",
            }}
          >
            <button
              type="button"
              onClick={toggleMute}
              className="p-2 rounded-full bg-stone-900/85 backdrop-blur-md border border-white/30 text-white hover:bg-white hover:text-stone-900 shadow-lg transition-all active:scale-90"
              title={isMuted ? "Unmute Video" : "Mute Video"}
              aria-label={isMuted ? "Unmute Video" : "Mute Video"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={togglePlay}
              className="p-2 rounded-full bg-stone-900/85 backdrop-blur-md border border-white/30 text-white hover:bg-white hover:text-stone-900 shadow-lg transition-all active:scale-90"
              title={isPlaying ? "Pause Video" : "Play Video"}
              aria-label={isPlaying ? "Pause Video" : "Play Video"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Bottom Floating 3D Specular Shimmer Edge */}
          <div
            className="absolute bottom-2 inset-x-8 h-1 rounded-full bg-gradient-to-r from-transparent via-amber-200/40 to-transparent pointer-events-none transition-transform duration-200"
            style={{
              transform: isHovered ? "translateZ(30px) scaleX(1.1)" : "translateZ(0px)",
              opacity: isHovered ? 0.9 : 0.3,
            }}
          />
        </div>
      </div>
    </div>
  );
}
