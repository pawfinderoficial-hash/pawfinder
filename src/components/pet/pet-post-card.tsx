"use client";

import Image from "next/image";
import { Flag, MapPin } from "lucide-react";
import { PetKindBadge } from "@/components/feed/pet-kind-badge";
import type { PetPost } from "@/types/pet";
import { cn } from "@/lib/utils";

export type PetPostCardProps = {
  post: PetPost;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  showContact?: boolean;
  descriptionLineClamp?: 4 | 5;
  imageOverlay?: React.ReactNode;
  onReport?: () => void;
};

export function PetPostCard({
  post,
  className,
  imageClassName = "aspect-[4/3]",
  priority,
  showContact = false,
  descriptionLineClamp,
  imageOverlay,
  onReport,
}: PetPostCardProps) {
  const speciesLine = [post.species, post.breed].filter(Boolean).join(" · ");

  return (
    <div
      className={cn(
        "pf-surface flex flex-col overflow-hidden rounded-[1.35rem]",
        className,
      )}
    >
      <div className={cn("relative w-full shrink-0 bg-muted", imageClassName)}>
        <Image
          src={post.imageUrl}
          alt={`Foto de ${post.name}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 640px"
          priority={priority}
        />
        <div className="absolute left-3 top-3">
          <PetKindBadge kind={post.kind} />
        </div>
        {imageOverlay}
      </div>

      <div className="space-y-3 px-5 py-5">
        <h2 className="pf-heading-card font-heading font-semibold">
          {post.name}
        </h2>
        {speciesLine ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {speciesLine}
          </p>
        ) : null}
        <p
          className={cn(
            "pf-prose-comfort text-muted-foreground",
            descriptionLineClamp === 4 && "line-clamp-4",
            descriptionLineClamp === 5 && "line-clamp-5",
          )}
        >
          {post.description}
        </p>
        <p className="flex items-start gap-1.5 text-sm font-medium text-foreground/85">
          <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
          {post.locationLabel}
        </p>
        <p className="text-xs text-muted-foreground">
          La ubicacion mostrada es aproximada para proteger a las personas involucradas.
        </p>
        {showContact && post.contactName ? (
          <p className="text-xs text-muted-foreground">
            Contacto: {post.contactName}
            {post.contactPhone ? ` · ${post.contactPhone}` : ""}
          </p>
        ) : null}
        {onReport ? (
          <button
            type="button"
            onClick={onReport}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-destructive hover:underline"
          >
            <Flag className="size-3.5" />
            Reportar publicacion
          </button>
        ) : null}
      </div>
    </div>
  );
}
