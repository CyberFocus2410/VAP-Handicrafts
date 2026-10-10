import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface PolaroidFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  alt: string;
  caption?: string;
  subcaption?: string;
  width?: number;
  height?: number;
  rotation?: "left" | "right" | "none";
  priority?: boolean;
}

export function PolaroidFrame({
  src,
  alt,
  caption,
  subcaption,
  width = 600,
  height = 750,
  rotation = "none",
  priority = false,
  className,
  ...props
}: PolaroidFrameProps) {
  const rotationClass = {
    left: "-rotate-2 motion-reduce:rotate-0",
    right: "rotate-2 motion-reduce:rotate-0",
    none: "rotate-0",
  }[rotation];

  return (
    <div
      className={cn(
        "group relative inline-block rounded-sm bg-surface p-3 pb-5 shadow-card transition-transform duration-300 hover:scale-[1.02] motion-reduce:hover:scale-100",
        rotationClass,
        className
      )}
      {...props}
    >
      {/* Photo Frame Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2px] bg-beige/40">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 320px"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100"
        />
      </div>

      {/* Handwritten / Editorial Caption Area */}
      {(caption || subcaption) && (
        <div className="mt-3 text-center">
          {caption && (
            <p className="font-serif text-sm font-medium tracking-wide text-cocoa">
              {caption}
            </p>
          )}
          {subcaption && (
            <p className="mt-0.5 text-xs text-cocoa-muted">{subcaption}</p>
          )}
        </div>
      )}
    </div>
  );
}
