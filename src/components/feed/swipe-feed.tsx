"use client";

import {
  useImperativeHandle,
  useRef,
  forwardRef,
  useCallback,
  useMemo,
} from "react";
import { filterPetPosts } from "@/lib/filter-pets";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimationControls,
  PanInfo,
} from "framer-motion";
import { RotateCcw, SearchX } from "lucide-react";
import { usePawFinder } from "@/context/pawfinder-context";
import { Button } from "@/components/ui/button";
import { SwipeActions } from "@/components/feed/swipe-actions";
import { PetPostCard } from "@/components/pet/pet-post-card";
import type { PetPost } from "@/types/pet";
import { PawPrint } from "lucide-react";

const spring = { type: "spring" as const, stiffness: 340, damping: 28 };

export type SwipeCardHandle = {
  swipe: (dir: "left" | "right") => void;
};

const SwipeCard = forwardRef<
  SwipeCardHandle,
  {
    post: PetPost;
    onSwipe: (dir: "left" | "right") => void;
    isTop: boolean;
  }
>(function SwipeCard({ post, onSwipe, isTop }, ref) {
  const x = useMotionValue(0);
  const controls = useAnimationControls();
  const rotate = useTransform(x, [-200, 200], [-8, 8]);
  const opacitySkip = useTransform(x, [-100, 0], [1, 0]);
  const opacityLike = useTransform(x, [0, 100], [0, 1]);

  const flyOff = useCallback(
    async (dir: "left" | "right") => {
      if (!isTop) return;
      await controls.start({
        x: dir === "left" ? -420 : 420,
        opacity: 0,
        rotate: dir === "left" ? -12 : 12,
        transition: { ...spring, velocity: 2 },
      });
      onSwipe(dir);
    },
    [controls, isTop, onSwipe],
  );

  useImperativeHandle(ref, () => ({ swipe: flyOff }), [flyOff]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 90) flyOff("right");
    else if (info.offset.x < -90) flyOff("left");
    else controls.start({ x: 0, transition: spring });
  };

  const swipeOverlays = (
    <>
      <motion.div
        className="absolute left-5 top-[38%] rounded-xl bg-background/90 px-3 py-1.5 text-lg font-semibold tracking-wide text-destructive backdrop-blur-sm"
        style={{ opacity: opacitySkip }}
      >
        Pasar
      </motion.div>
      <motion.div
        className="absolute right-5 top-[38%] rounded-xl bg-background/90 px-3 py-1.5 text-lg font-semibold tracking-wide text-primary backdrop-blur-sm"
        style={{ opacity: opacityLike }}
      >
        Puede ser
      </motion.div>
    </>
  );

  return (
    <motion.article
      className="absolute inset-0 touch-pan-y overflow-hidden"
      style={{ x, rotate, zIndex: isTop ? 10 : 1 }}
      animate={controls}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.85}
      onDragEnd={handleDragEnd}
      whileTap={isTop ? { scale: 1.008 } : undefined}
      transition={spring}
    >
      <PetPostCard
        post={post}
        className="h-full min-h-0 border-0 shadow-none ring-0"
        imageClassName="aspect-[4/3] w-full"
        priority={isTop}
        descriptionLineClamp={5}
        imageOverlay={swipeOverlays}
      />
    </motion.article>
  );
});

export function SwipeFeed() {
  const { feedStack, feedSearchQuery, swipeCard, resetFeed, allPosts, setFeedSearchQuery } =
    usePawFinder();
  const visibleStack = useMemo(
    () => filterPetPosts(feedStack, feedSearchQuery),
    [feedStack, feedSearchQuery],
  );
  const top = visibleStack[0];
  const next = visibleStack[1];
  const cardRef = useRef<SwipeCardHandle>(null);

  const handleSwipe = (dir: "left" | "right") => {
    if (top) swipeCard(dir, top.id);
  };

  if (!top) {
    const isSearchActive = feedSearchQuery.trim().length > 0;
    const hasPostsLeft = feedStack.length > 0;

    if (isSearchActive && hasPostsLeft) {
      return (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="pf-empty-icon mb-4">
            <SearchX className="size-8" />
          </div>
          <h2 className="font-heading text-xl font-semibold">
            Ningún aviso coincide
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Probá otra raza, nombre o zona. La búsqueda incluye raza, especie,
            descripción y ubicación.
          </p>
          <Button
            className="mt-6 rounded-xl"
            variant="outline"
            onClick={() => setFeedSearchQuery("")}
          >
            Limpiar búsqueda
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="pf-empty-icon mb-4">
          <PawPrint className="size-8" />
        </div>
        <h2 className="font-heading text-xl font-semibold">
          No hay más publicaciones por ahora
        </h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Revisaste todas las mascotas del feed. Podés volver a cargar el demo o
          publicar una nueva aviso.
        </p>
        <Button className="mt-6 rounded-full" variant="outline" onClick={resetFeed}>
          <RotateCcw className="size-4" />
          Volver a ver publicaciones
        </Button>
        <p className="mt-4 text-xs text-muted-foreground">
          {allPosts.length} publicaciones en la comunidad
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <div
        className="relative mx-auto h-[min(82vh,700px)] w-full max-w-md"
      >
        {next ? (
          <motion.div
            className="absolute inset-0 scale-[0.96] opacity-50"
            initial={false}
            animate={{ scale: 0.96 }}
            transition={spring}
          >
            <div className="h-full rounded-[1.35rem] border border-border/40 bg-muted/80" />
          </motion.div>
        ) : null}
        <SwipeCard
          ref={cardRef}
          key={top.id}
          post={top}
          isTop
          onSwipe={handleSwipe}
        />
      </div>
      <SwipeActions
        className="mt-7"
        onPass={() => cardRef.current?.swipe("left")}
        onLike={() => cardRef.current?.swipe("right")}
      />
      <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">
        Deslizá o usá los botones · {visibleStack.length} restantes
      </p>
    </div>
  );
}
