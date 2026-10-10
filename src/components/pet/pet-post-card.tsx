"use client";

import { Flag, MapPin } from "lucide-react";
import { PetKindBadge } from "@/components/feed/pet-kind-badge";
import { ImageGallery } from "@/components/pet/image-gallery";
import type { PetPost } from "@/types/pet";
import { cn } from "@/lib/utils";

export type PetPostCardProps = {
  post: PetPost;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  showContact?: boolean;
  compact?: boolean;
  descriptionLineClamp?: 2 | 3 | 4 | 5;
  imageOverlay?: React.ReactNode;
  onReport?: () => void;
};

export function PetPostCard({
  post,
  className,
  imageClassName = "aspect-[4/3]",
  priority,
  showContact = false,
  compact = false,
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
      <ImageGallery
        images={post.imageUrls?.length ? post.imageUrls : [post.imageUrl]}
        alt={`Foto de ${post.name}`}
        className={cn("w-full shrink-0", imageClassName)}
        priority={priority}
        overlay={
          <>
            <div className="absolute left-3 top-3">
              <PetKindBadge kind={post.kind} />
            </div>
            {imageOverlay}
          </>
        }
      />

      <div className={cn(compact ? "space-y-1.5 px-4 py-3" : "space-y-3 px-5 py-5")}>
        <h2
          className={cn(
            "pf-heading-card font-heading font-semibold",
            compact && "text-xl",
          )}
        >
          {post.name}
        </h2>
        {speciesLine ? (
          <p
            className={cn(
              "text-sm text-muted-foreground",
              compact ? "leading-snug" : "leading-relaxed",
            )}
          >
            {speciesLine}
          </p>
        ) : null}
        <p
          className={cn(
            "pf-prose-comfort text-muted-foreground",
            descriptionLineClamp === 2 && "line-clamp-2",
            descriptionLineClamp === 3 && "line-clamp-3",
            descriptionLineClamp === 4 && "line-clamp-4",
            descriptionLineClamp === 5 && "line-clamp-5",
            compact && "text-sm leading-snug",
          )}
        >
          {post.description}
        </p>
        <p
          className={cn(
            "flex items-start gap-1.5 text-sm font-medium text-foreground/85",
            compact && "text-xs leading-snug",
          )}
        >
          <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
          <span className={cn(compact && "line-clamp-2")}>
            {post.locationLabel}
          </span>
        </p>
        {!compact ? (
          <p className="text-xs text-muted-foreground">
            La ubicacion mostrada es aproximada para proteger a las personas involucradas.
          </p>
        ) : null}
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
