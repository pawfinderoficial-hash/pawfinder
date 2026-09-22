"use client";

import { useEffect } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { SwipeFeed } from "@/components/feed/swipe-feed";
import { FeedList } from "@/components/feed/feed-list";
import { FeedViewToggle } from "@/components/feed/feed-view-toggle";
import { FeedSearch } from "@/components/feed/feed-search";
import { usePawFinder } from "@/context/pawfinder-context";

export default function FeedPage() {
  const {
    lastPublishSuccess,
    clearPublishSuccess,
    feedViewMode,
    setFeedViewMode,
    feedSearchQuery,
    setFeedSearchQuery,
    allPosts,
  } = usePawFinder();

  useEffect(() => {
    if (lastPublishSuccess) {
      const t = setTimeout(clearPublishSuccess, 4000);
      return () => clearTimeout(t);
    }
  }, [lastPublishSuccess, clearPublishSuccess]);

  const subtitle =
    feedViewMode === "swipe"
      ? "Deslizá para ayudar a reunir familias"
      : "Lista de avisos — tocá para ver el detalle";

  return (
    <>
      <AppHeader title="Explorar" subtitle={subtitle} />
      {lastPublishSuccess ? (
        <div
          className="mx-4 mt-3 rounded-2xl border border-primary/15 bg-primary/10 px-3 py-2.5 text-center text-sm text-foreground shadow-sm backdrop-blur-sm"
          role="status"
        >
          ¡Listo! Tu publicación ya aparece en el feed y en el mapa (solo en esta
          sesión).
        </div>
      ) : null}
      <div className="mx-auto max-w-md space-y-3 px-4 pt-3">
        <FeedViewToggle value={feedViewMode} onChange={setFeedViewMode} />
        <FeedSearch
          value={feedSearchQuery}
          onChange={setFeedSearchQuery}
          posts={allPosts}
        />
      </div>
      {feedViewMode === "swipe" ? <SwipeFeed /> : <FeedList />}
    </>
  );
}
