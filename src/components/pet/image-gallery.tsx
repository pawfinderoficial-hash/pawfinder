"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minus, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ImageGalleryProps = {
  images: string[];
  alt: string;
  className?: string;
  priority?: boolean;
  overlay?: React.ReactNode;
  compact?: boolean;
};

export function ImageGallery({
  images,
  alt,
  className,
  priority,
  overlay,
  compact = false,
}: ImageGalleryProps) {
  const safeImages = images.filter(Boolean);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const touchStartX = useRef<number | null>(null);
  const pinchStart = useRef<{ distance: number; scale: number } | null>(null);
  const hasMultiple = safeImages.length > 1;
  const currentImage = safeImages[index] ?? safeImages[0];

  if (!currentImage) return null;

  const show = (nextIndex: number) => {
    setIndex((nextIndex + safeImages.length) % safeImages.length);
    setScale(1);
  };

  const touchDistance = (touches: React.TouchList) =>
    Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY,
    );

  return (
    <>
      <div className={cn("relative overflow-hidden bg-muted", className)}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute inset-0 z-10"
          aria-label={`Ampliar fotos de ${alt}`}
        >
          <Image
            src={currentImage}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 640px"
            priority={priority}
          />
          <span
            className={cn(
              "absolute flex items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm",
              compact ? "right-1 top-1 size-6" : "right-3 top-3 size-8",
            )}
          >
            <Maximize2 className={compact ? "size-3" : "size-4"} />
          </span>
        </button>
        <div className="pointer-events-none absolute inset-0 z-20">{overlay}</div>
        {hasMultiple ? (
          <>
            {!compact ? (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    show(index - 1);
                  }}
                  className="absolute left-2 top-1/2 z-30 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    show(index + 1);
                  }}
                  className="absolute right-2 top-1/2 z-30 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white"
                  aria-label="Foto siguiente"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            ) : null}
            <span
              className={cn(
                "absolute z-30 rounded-full bg-black/65 font-semibold text-white",
                compact
                  ? "bottom-1 right-1 px-1.5 py-0.5 text-[0.6rem]"
                  : "bottom-3 right-3 px-2 py-1 text-xs",
              )}
            >
              {index + 1}/{safeImages.length}
            </span>
          </>
        ) : null}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton
          className="!left-0 !top-0 !h-dvh !max-w-none !translate-x-0 !translate-y-0 overflow-hidden rounded-none bg-black p-0 text-white ring-0"
        >
          <DialogTitle className="sr-only">Fotos de {alt}</DialogTitle>
          <DialogDescription className="sr-only">
            Deslizá para cambiar de foto y usá dos dedos o los controles para ampliar.
          </DialogDescription>
          <div
            className="relative flex h-full w-full touch-none items-center justify-center overflow-hidden"
            onTouchStart={(event) => {
              if (event.touches.length === 2) {
                pinchStart.current = {
                  distance: touchDistance(event.touches),
                  scale,
                };
                touchStartX.current = null;
              } else if (event.touches.length === 1) {
                touchStartX.current = event.touches[0].clientX;
              }
            }}
            onTouchMove={(event) => {
              if (event.touches.length !== 2 || !pinchStart.current) return;
              const ratio = touchDistance(event.touches) / pinchStart.current.distance;
              setScale(Math.min(4, Math.max(1, pinchStart.current.scale * ratio)));
            }}
            onTouchEnd={(event) => {
              pinchStart.current = null;
              if (scale > 1 || touchStartX.current === null) return;
              const endX = event.changedTouches[0]?.clientX;
              if (endX === undefined) return;
              const distance = endX - touchStartX.current;
              if (Math.abs(distance) > 55) show(index + (distance < 0 ? 1 : -1));
              touchStartX.current = null;
            }}
          >
            <div
              className="relative h-[82dvh] w-full transition-transform duration-150"
              style={{ transform: `scale(${scale})` }}
            >
              <Image
                src={currentImage}
                alt={`${alt}, foto ${index + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {hasMultiple && scale === 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => show(index - 1)}
                  className="absolute left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={() => show(index + 1)}
                  className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white"
                  aria-label="Foto siguiente"
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            ) : null}

            <div className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/65 p-1.5">
              <button
                type="button"
                onClick={() => setScale((value) => Math.max(1, value - 0.5))}
                className="flex size-9 items-center justify-center rounded-full text-white disabled:opacity-40"
                disabled={scale <= 1}
                aria-label="Alejar foto"
              >
                <Minus className="size-5" />
              </button>
              <span className="min-w-14 text-center text-xs font-semibold">
                {hasMultiple ? `${index + 1}/${safeImages.length}` : `${Math.round(scale * 100)}%`}
              </span>
              <button
                type="button"
                onClick={() => setScale((value) => Math.min(4, value + 0.5))}
                className="flex size-9 items-center justify-center rounded-full text-white disabled:opacity-40"
                disabled={scale >= 4}
                aria-label="Ampliar foto"
              >
                <Plus className="size-5" />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
