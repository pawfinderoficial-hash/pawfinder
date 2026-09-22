"use client";

import { motion } from "framer-motion";
import { Heart, X } from "lucide-react";
import { cn } from "@/lib/utils";

const tapSpring = { type: "spring" as const, stiffness: 520, damping: 32 };

type SwipeActionsProps = {
  onPass: () => void;
  onLike: () => void;
  className?: string;
};

export function SwipeActions({ onPass, onLike, className }: SwipeActionsProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-md gap-3",
        className,
      )}
    >
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        transition={tapSpring}
        onClick={onPass}
        className="pf-action-pass flex h-[3.25rem] flex-1 items-center justify-center gap-2.5 rounded-2xl px-4 text-[0.9375rem] font-medium"
        aria-label="Pasar"
      >
        <X
          className="size-[1.125rem] text-destructive/85"
          strokeWidth={2.25}
          aria-hidden
        />
        Pasar
      </motion.button>

      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        transition={tapSpring}
        onClick={onLike}
        className="pf-action-like flex h-[3.25rem] flex-1 items-center justify-center gap-2.5 rounded-2xl px-4 text-[0.9375rem] font-medium"
        aria-label="Puede ser"
      >
        <Heart
          className="size-[1.125rem] text-[var(--action-like-fg)]"
          fill="currentColor"
          strokeWidth={0}
          aria-hidden
        />
        Puede ser
      </motion.button>
    </div>
  );
}
