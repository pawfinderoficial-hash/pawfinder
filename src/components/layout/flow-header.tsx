"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function FlowHeader({ title }: { title: string }) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-xl">
      <div className="relative mx-auto flex h-14 max-w-lg items-center justify-center px-14 md:max-w-2xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-3 flex size-10 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-muted"
          title="Volver"
          aria-label="Volver"
        >
          <ArrowLeft className="size-6" />
        </button>
        <h1 className="truncate text-center text-base font-semibold text-foreground">
          {title}
        </h1>
      </div>
    </header>
  );
}
