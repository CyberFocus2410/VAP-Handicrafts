"use client";

import * as React from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { type ProductImage } from "@/server/catalogue/types";
import { cn } from "@/lib/utils";
import { ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  images: ProductImage[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [isZoomOpen, setIsZoomOpen] = React.useState(false);

  const activeImage = images[selectedIndex] ?? images[0];

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrev();
    if (e.key === "ArrowRight") handleNext();
  };

  if (!activeImage) {
    return (
      <div className="aspect-[4/5] rounded-md bg-beige/20 flex items-center justify-center text-cocoa-muted">
        No image available
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-4"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label="Product Image Gallery (use left and right arrow keys to navigate)"
    >
      {/* Main Image Display */}
      <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-md border border-border bg-surface shadow-card">
        <Image
          src={activeImage.url}
          alt={activeImage.alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-center transition-transform duration-300"
        />

        {/* Zoom Lightbox Trigger */}
        <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 text-cocoa shadow-sm backdrop-blur-sm transition-opacity hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Zoom product image"
            >
              <ZoomIn className="h-4 w-4" aria-hidden="true" />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl p-2 bg-surface/95 border-border">
            <div className="relative aspect-[4/5] max-h-[85vh] w-full overflow-hidden rounded-sm">
              <Image
                src={activeImage.url}
                alt={activeImage.alt}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>
            <p className="mt-2 text-center text-xs text-cocoa-muted px-4">
              {activeImage.alt}
            </p>
          </DialogContent>
        </Dialog>

        {/* Gallery Carousel Controls (if multiple images) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-surface/80 text-cocoa shadow-sm backdrop-blur-sm hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-surface/80 text-cocoa shadow-sm backdrop-blur-sm hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1" role="tablist" aria-label="Image Thumbnails">
          {images.map((img, idx) => (
            <button
              key={img.id}
              role="tab"
              aria-selected={idx === selectedIndex}
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                "relative aspect-[4/5] h-20 w-16 shrink-0 overflow-hidden rounded-sm border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                idx === selectedIndex
                  ? "border-rose-deep ring-1 ring-rose-deep"
                  : "border-border/60 opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={img.url}
                alt={`Thumbnail ${idx + 1}`}
                fill
                sizes="64px"
                className="object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
