"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import type { AppNotification } from "@/lib/mock-notifications";
import { MOCK_MEETING_POINTS, type MeetingPoint } from "@/lib/mock-meeting-points";
import type {
  OwnedReport,
  OwnedSighting,
  PendingMatch,
  PendingSighting,
  PetPost,
  PublishPayload,
  PuedeSerChoice,
  ReportStatus,
  SightingDraft,
} from "@/types/pet";
import type { FeedViewMode } from "@/components/feed/feed-view-toggle";
import { PuedeSerChoiceSheet } from "@/components/feed/puede-ser-choice-sheet";

export type EncounterResult =
  | { mode: "home" }
  | { mode: "point"; point: MeetingPoint };

interface PawFinderContextValue {
  feedViewMode: FeedViewMode;
  setFeedViewMode: (mode: FeedViewMode) => void;
  feedSearchQuery: string;
  setFeedSearchQuery: (query: string) => void;
  userName: string | null;
  isLoading: boolean;
  refreshAll: () => Promise<void>;
  feedStack: PetPost[];
  allPosts: PetPost[];
  swipeCard: (direction: "left" | "right", postId: string) => void;
  resetFeed: () => void;
  publishPost: (draft: PublishPayload) => Promise<void>;
  publishSighting: (draft: SightingDraft) => Promise<void>;
  ownedReports: OwnedReport[];
  ownedSightings: OwnedSighting[];
  updateReportStatus: (reportId: string, status: ReportStatus) => Promise<void>;
  updateOwnedReport: (
    reportId: string,
    changes: Pick<OwnedReport, "name" | "description" | "locationLabel">,
  ) => Promise<void>;
  pendingMatch: PendingMatch | null;
  pendingSightings: PendingSighting[];
  restoreDemoMatch: () => void;
  beginEncounterAfterConfirm: () => Promise<void>;
  rejectMatch: () => Promise<void>;
  contactSighting: (sightingId: string) => Promise<{ contactPhone: string; contactName: string }>;
  dismissSighting: (sightingId: string) => Promise<void>;
  encounterMatch: PendingMatch | null;
  encounterResult: EncounterResult | null;
  completeEncounterAtHome: () => Promise<void>;
  completeEncounterAtPoint: (pointId: string) => Promise<void>;
  clearEncounterFlow: () => void;
  notifications: AppNotification[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  resetNotificationsDemo: () => void;
  lastPublishSuccess: boolean;
  clearPublishSuccess: () => void;
}

const PawFinderContext = createContext<PawFinderContextValue | null>(null);

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Error de red");
  }
  return res.json() as Promise<T>;
}

export function PawFinderProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const userName = session?.user?.name ?? session?.user?.email ?? null;

  const [allPosts, setAllPosts] = useState<PetPost[]>([]);
  const [feedStack, setFeedStack] = useState<PetPost[]>([]);
  const [ownedReports, setOwnedReports] = useState<OwnedReport[]>([]);
  const [ownedSightings, setOwnedSightings] = useState<OwnedSighting[]>([]);
  const [pendingMatch, setPendingMatch] = useState<PendingMatch | null>(null);
  const [pendingSightings, setPendingSightings] = useState<PendingSighting[]>(
    [],
  );
  const [encounterMatch, setEncounterMatch] = useState<PendingMatch | null>(null);
  const [encounterResult, setEncounterResult] = useState<EncounterResult | null>(
    null,
  );
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [lastPublishSuccess, setLastPublishSuccess] = useState(false);
  const [feedViewMode, setFeedViewMode] = useState<FeedViewMode>("swipe");
  const [feedSearchQuery, setFeedSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [puedeSerChoice, setPuedeSerChoice] = useState<PuedeSerChoice | null>(
    null,
  );
  const [choiceOpen, setChoiceOpen] = useState(false);

  const restoreFeedPost = useCallback(
    (postId: string) => {
      const post = allPosts.find((candidate) => candidate.id === postId);
      if (!post) return;
      setFeedStack((current) =>
        current.some((candidate) => candidate.id === postId)
          ? current
          : [post, ...current],
      );
    },
    [allPosts],
  );

  const refreshAll = useCallback(async () => {
    if (status !== "authenticated") return;
    setIsLoading(true);
    try {
      const [
        postsRes,
        mineRes,
        ownSightingsRes,
        pendingRes,
        encounterRes,
        notifRes,
        sightingsRes,
      ] = await Promise.all([
          fetchJson<{ posts: PetPost[] }>("/api/posts"),
          fetchJson<{ reports: OwnedReport[] }>("/api/posts/mine"),
          fetchJson<{ sightings: OwnedSighting[] }>("/api/sightings/mine"),
          fetchJson<{ pendingMatch: PendingMatch | null }>(
            "/api/matches/pending",
          ),
          fetchJson<{ encounterMatch: PendingMatch | null }>(
            "/api/matches/encounter",
          ),
          fetchJson<{ notifications: AppNotification[] }>(
            "/api/notifications",
          ),
          fetchJson<{ pendingSightings: PendingSighting[] }>(
            "/api/sightings/pending",
          ),
        ]);
      setAllPosts(postsRes.posts);
      setFeedStack(postsRes.posts);
      setOwnedReports(mineRes.reports);
      setOwnedSightings(ownSightingsRes.sightings);
      setPendingMatch(pendingRes.pendingMatch);
      setEncounterMatch(encounterRes.encounterMatch);
      setNotifications(notifRes.notifications);
      setPendingSightings(sightingsRes.pendingSightings);
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (status === "authenticated") {
        void refreshAll();
      }
      if (status === "unauthenticated") {
        setAllPosts([]);
        setFeedStack([]);
        setOwnedReports([]);
        setOwnedSightings([]);
        setPendingMatch(null);
        setPendingSightings([]);
        setEncounterMatch(null);
        setNotifications([]);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [status, refreshAll]);

  const swipeCard = useCallback(
    async (direction: "left" | "right", postId: string) => {
      setFeedStack((prev) => prev.filter((p) => p.id !== postId));
      if (direction === "right") {
        try {
          const res = await fetch("/api/matches", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ targetPostId: postId }),
          });
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
            needsChoice?: boolean;
            targetLostPostId?: string;
            targetName?: string;
            ok?: boolean;
          };
          if (res.ok && data.needsChoice && data.targetLostPostId) {
            setPuedeSerChoice({
              targetLostPostId: data.targetLostPostId,
              targetName: data.targetName || "esta mascota",
            });
            setChoiceOpen(true);
            return;
          }
          if (!res.ok) {
            throw new Error(data.error || "Error de red");
          }
          await refreshAll();
        } catch {
          restoreFeedPost(postId);
        }
      }
    },
    [refreshAll, restoreFeedPost],
  );

  const resetFeed = useCallback(() => {
    setFeedStack(allPosts);
  }, [allPosts]);

  const publishPost = useCallback(
    async (draft: PublishPayload) => {
      await fetchJson("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      setLastPublishSuccess(true);
      await refreshAll();
    },
    [refreshAll],
  );

  const publishSighting = useCallback(
    async (draft: SightingDraft) => {
      await fetchJson("/api/sightings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      await refreshAll();
    },
    [refreshAll],
  );

  const updateReportStatus = useCallback(
    async (reportId: string, statusValue: ReportStatus) => {
      await fetchJson(`/api/posts/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusValue }),
      });
      await refreshAll();
    },
    [refreshAll],
  );

  const updateOwnedReport = useCallback(
    async (
      reportId: string,
      changes: Pick<OwnedReport, "name" | "description" | "locationLabel">,
    ) => {
      await fetchJson(`/api/posts/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      await refreshAll();
    },
    [refreshAll],
  );

  const restoreDemoMatch = useCallback(() => {
    /* v1 real: sin demo match */
  }, []);

  const beginEncounterAfterConfirm = useCallback(async () => {
    if (!pendingMatch) return;
    await fetchJson(`/api/matches/${pendingMatch.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "confirm" }),
    });
    setEncounterMatch(pendingMatch);
    setEncounterResult(null);
    setPendingMatch(null);
    await refreshAll();
  }, [pendingMatch, refreshAll]);

  const rejectMatch = useCallback(async () => {
    if (!pendingMatch) return;
    await fetchJson(`/api/matches/${pendingMatch.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject" }),
    });
    setPendingMatch(null);
    await refreshAll();
  }, [pendingMatch, refreshAll]);

  const contactSighting = useCallback(
    async (sightingId: string) => {
      const data = await fetchJson<{
        contactPhone: string;
        contactName: string;
      }>(`/api/sightings/${sightingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "contact" }),
      });
      await refreshAll();
      return data;
    },
    [refreshAll],
  );

  const dismissSighting = useCallback(
    async (sightingId: string) => {
      await fetchJson(`/api/sightings/${sightingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dismiss" }),
      });
      await refreshAll();
    },
    [refreshAll],
  );

  const completeEncounterAtHome = useCallback(async () => {
    if (!encounterMatch) return;
    await fetchJson(`/api/matches/${encounterMatch.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "encounter", meetingMode: "home" }),
    });
    setEncounterResult({ mode: "home" });
    await refreshAll();
  }, [encounterMatch, refreshAll]);

  const completeEncounterAtPoint = useCallback(
    async (pointId: string) => {
      if (!encounterMatch) return;
      const point = MOCK_MEETING_POINTS.find((p) => p.id === pointId);
      await fetchJson(`/api/matches/${encounterMatch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "encounter",
          meetingMode: "point",
          meetingPointId: pointId,
        }),
      });
      if (point) {
        setEncounterResult({ mode: "point", point });
      }
      await refreshAll();
    },
    [encounterMatch, refreshAll],
  );

  const clearEncounterFlow = useCallback(() => {
    setEncounterMatch(null);
    setEncounterResult(null);
  }, []);

  const markNotificationRead = useCallback(async (id: string) => {
    if (id.startsWith("sponsor-")) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      return;
    }
    await fetchJson("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const clearAllNotifications = useCallback(async () => {
    await fetchJson("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clearAll: true }),
    });
    setNotifications((prev) => prev.filter((n) => n.id.startsWith("sponsor-")));
  }, []);

  const resetNotificationsDemo = useCallback(() => {
    void refreshAll();
  }, [refreshAll]);

  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const clearPublishSuccess = useCallback(() => {
    setLastPublishSuccess(false);
  }, []);

  const value = useMemo(
    () => ({
      userName,
      isLoading,
      refreshAll,
      feedViewMode,
      setFeedViewMode,
      feedSearchQuery,
      setFeedSearchQuery,
      feedStack,
      allPosts,
      swipeCard,
      resetFeed,
      publishPost,
      publishSighting,
      ownedReports,
      ownedSightings,
      updateReportStatus,
      updateOwnedReport,
      pendingMatch,
      pendingSightings,
      restoreDemoMatch,
      beginEncounterAfterConfirm,
      rejectMatch,
      contactSighting,
      dismissSighting,
      encounterMatch,
      encounterResult,
      completeEncounterAtHome,
      completeEncounterAtPoint,
      clearEncounterFlow,
      notifications,
      unreadNotificationCount,
      markNotificationRead,
      clearAllNotifications,
      resetNotificationsDemo,
      lastPublishSuccess,
      clearPublishSuccess,
    }),
    [
      userName,
      isLoading,
      refreshAll,
      feedViewMode,
      feedSearchQuery,
      feedStack,
      allPosts,
      swipeCard,
      resetFeed,
      publishPost,
      publishSighting,
      ownedReports,
      ownedSightings,
      updateReportStatus,
      updateOwnedReport,
      pendingMatch,
      pendingSightings,
      restoreDemoMatch,
      beginEncounterAfterConfirm,
      rejectMatch,
      contactSighting,
      dismissSighting,
      encounterMatch,
      encounterResult,
      completeEncounterAtHome,
      completeEncounterAtPoint,
      clearEncounterFlow,
      notifications,
      unreadNotificationCount,
      markNotificationRead,
      clearAllNotifications,
      resetNotificationsDemo,
      lastPublishSuccess,
      clearPublishSuccess,
    ],
  );

  return (
    <PawFinderContext.Provider value={value}>
      {children}
      <PuedeSerChoiceSheet
        choice={puedeSerChoice}
        open={choiceOpen}
        onOpenChange={(open) => {
          setChoiceOpen(open);
          if (!open) {
            if (puedeSerChoice) {
              restoreFeedPost(puedeSerChoice.targetLostPostId);
            }
            setPuedeSerChoice(null);
          }
        }}
      />
    </PawFinderContext.Provider>
  );
}

export function usePawFinder() {
  const ctx = useContext(PawFinderContext);
  if (!ctx) {
    throw new Error("usePawFinder debe usarse dentro de PawFinderProvider");
  }
  return ctx;
}
