"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { DEMO_PENDING_MATCH, INITIAL_FEED } from "@/lib/mock-pets";
import {
  MOCK_NOTIFICATIONS,
  type AppNotification,
} from "@/lib/mock-notifications";
import {
  MOCK_MEETING_POINTS,
  type MeetingPoint,
} from "@/lib/mock-meeting-points";
import { INITIAL_OWNED_REPORTS } from "@/lib/mock-owned-reports";
import type {
  OwnedReport,
  PendingMatch,
  PetPost,
  PublishDraft,
  ReportStatus,
} from "@/types/pet";
import type { FeedViewMode } from "@/components/feed/feed-view-toggle";

const USER_NAME_KEY = "pawfinder-demo-user";

const userNameListeners = new Set<() => void>();

function readStoredUserName(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(USER_NAME_KEY);
  } catch {
    return null;
  }
}

function subscribeUserName(onChange: () => void) {
  userNameListeners.add(onChange);
  return () => {
    userNameListeners.delete(onChange);
  };
}

function notifyUserNameChange() {
  userNameListeners.forEach((listener) => listener());
}

export type EncounterResult =
  | { mode: "home" }
  | { mode: "point"; point: MeetingPoint };

interface PawFinderContextValue {
  feedViewMode: FeedViewMode;
  setFeedViewMode: (mode: FeedViewMode) => void;
  feedSearchQuery: string;
  setFeedSearchQuery: (query: string) => void;
  userName: string | null;
  enterApp: (name?: string) => void;
  feedStack: PetPost[];
  allPosts: PetPost[];
  swipeCard: (direction: "left" | "right", postId: string) => void;
  resetFeed: () => void;
  publishPost: (draft: PublishDraft) => void;
  ownedReports: OwnedReport[];
  updateReportStatus: (reportId: string, status: ReportStatus) => void;
  updateOwnedReport: (
    reportId: string,
    changes: Pick<OwnedReport, "name" | "description" | "locationLabel">,
  ) => void;
  pendingMatch: PendingMatch | null;
  restoreDemoMatch: () => void;
  beginEncounterAfterConfirm: () => void;
  rejectMatch: () => void;
  encounterMatch: PendingMatch | null;
  encounterResult: EncounterResult | null;
  completeEncounterAtHome: () => void;
  completeEncounterAtPoint: (pointId: string) => void;
  clearEncounterFlow: () => void;
  notifications: AppNotification[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  resetNotificationsDemo: () => void;
  lastPublishSuccess: boolean;
  clearPublishSuccess: () => void;
}

const PawFinderContext = createContext<PawFinderContextValue | null>(null);

function draftToPost(draft: PublishDraft): PetPost {
  return {
    id: `user-${Date.now()}`,
    kind: draft.kind,
    name: draft.name || (draft.kind === "found" ? "Sin nombre" : "Mascota"),
    species: draft.species,
    breed: draft.breed || undefined,
    description: draft.description,
    locationLabel: draft.locationLabel,
    lat: draft.lat,
    lng: draft.lng,
    imageUrl: draft.imageUrl,
    contactName: draft.contactName,
    contactPhone: draft.contactPhone,
    contactEmail: draft.contactEmail || undefined,
    reportedAt: new Date().toISOString().slice(0, 10),
  };
}

export function PawFinderProvider({ children }: { children: ReactNode }) {
  const userName = useSyncExternalStore(
    subscribeUserName,
    readStoredUserName,
    () => null,
  );
  const [allPosts, setAllPosts] = useState<PetPost[]>(INITIAL_FEED);
  const [feedStack, setFeedStack] = useState<PetPost[]>(INITIAL_FEED);
  const [ownedReports, setOwnedReports] = useState<OwnedReport[]>(
    INITIAL_OWNED_REPORTS,
  );
  const [pendingMatch, setPendingMatch] = useState<PendingMatch | null>(
    DEMO_PENDING_MATCH,
  );
  const [encounterMatch, setEncounterMatch] = useState<PendingMatch | null>(
    null,
  );
  const [encounterResult, setEncounterResult] = useState<EncounterResult | null>(
    null,
  );
  const [notifications, setNotifications] =
    useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const [lastPublishSuccess, setLastPublishSuccess] = useState(false);
  const [feedViewMode, setFeedViewMode] = useState<FeedViewMode>("swipe");
  const [feedSearchQuery, setFeedSearchQuery] = useState("");

  const enterApp = useCallback((name?: string) => {
    const display = name?.trim() || "Vecino/a";
    try {
      sessionStorage.setItem(USER_NAME_KEY, display);
    } catch {
      /* ignore */
    }
    notifyUserNameChange();
  }, []);

  const swipeCard = useCallback(
    (direction: "left" | "right", postId: string) => {
      setFeedStack((prev) => prev.filter((p) => p.id !== postId));
      if (direction === "right") {
        const post = allPosts.find((p) => p.id === postId);
        if (post?.kind === "found" && post.name.toLowerCase().includes("luna")) {
          setPendingMatch(DEMO_PENDING_MATCH);
        }
      }
    },
    [allPosts],
  );

  const resetFeed = useCallback(() => {
    setFeedStack(allPosts);
  }, [allPosts]);

  const publishPost = useCallback((draft: PublishDraft) => {
    const post = draftToPost(draft);
    setAllPosts((prev) => [post, ...prev]);
    setFeedStack((prev) => [post, ...prev]);
    setOwnedReports((prev) => [
      {
        ...post,
        status: "active",
        candidateCount: 0,
        views: 0,
        updatedAt: "Recien publicado",
      },
      ...prev,
    ]);
    setLastPublishSuccess(true);
  }, []);

  const updateReportStatus = useCallback(
    (reportId: string, status: ReportStatus) => {
      setOwnedReports((prev) =>
        prev.map((report) =>
          report.id === reportId
            ? { ...report, status, updatedAt: "Actualizado recien" }
            : report,
        ),
      );

      if (status === "active") {
        const report = ownedReports.find((item) => item.id === reportId);
        if (report) {
          setAllPosts((prev) =>
            prev.some((post) => post.id === reportId)
              ? prev
              : [report, ...prev],
          );
          setFeedStack((prev) =>
            prev.some((post) => post.id === reportId)
              ? prev
              : [report, ...prev],
          );
        }
        return;
      }

      setAllPosts((prev) => prev.filter((post) => post.id !== reportId));
      setFeedStack((prev) => prev.filter((post) => post.id !== reportId));
    },
    [ownedReports],
  );

  const updateOwnedReport = useCallback(
    (
      reportId: string,
      changes: Pick<OwnedReport, "name" | "description" | "locationLabel">,
    ) => {
      setOwnedReports((prev) =>
        prev.map((report) =>
          report.id === reportId
            ? { ...report, ...changes, updatedAt: "Editado recien" }
            : report,
        ),
      );
      setAllPosts((prev) =>
        prev.map((post) =>
          post.id === reportId ? { ...post, ...changes } : post,
        ),
      );
      setFeedStack((prev) =>
        prev.map((post) =>
          post.id === reportId ? { ...post, ...changes } : post,
        ),
      );
    },
    [],
  );

  const restoreDemoMatch = useCallback(() => {
    setPendingMatch(DEMO_PENDING_MATCH);
    setEncounterMatch(null);
    setEncounterResult(null);
  }, []);

  const beginEncounterAfterConfirm = useCallback(() => {
    if (!pendingMatch) return;
    setEncounterMatch(pendingMatch);
    setEncounterResult(null);
    setPendingMatch(null);
  }, [pendingMatch]);

  const rejectMatch = useCallback(() => {
    setPendingMatch(null);
  }, []);

  const completeEncounterAtHome = useCallback(() => {
    setEncounterResult({ mode: "home" });
  }, []);

  const completeEncounterAtPoint = useCallback((pointId: string) => {
    const point = MOCK_MEETING_POINTS.find((p) => p.id === pointId);
    if (point) {
      setEncounterResult({ mode: "point", point });
    }
  }, []);

  const clearEncounterFlow = useCallback(() => {
    setEncounterMatch(null);
    setEncounterResult(null);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const resetNotificationsDemo = useCallback(() => {
    setNotifications(MOCK_NOTIFICATIONS);
  }, []);

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
      enterApp,
      feedViewMode,
      setFeedViewMode,
      feedSearchQuery,
      setFeedSearchQuery,
      feedStack,
      allPosts,
      swipeCard,
      resetFeed,
      publishPost,
      ownedReports,
      updateReportStatus,
      updateOwnedReport,
      pendingMatch,
      restoreDemoMatch,
      beginEncounterAfterConfirm,
      rejectMatch,
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
      enterApp,
      feedViewMode,
      feedSearchQuery,
      feedStack,
      allPosts,
      swipeCard,
      resetFeed,
      publishPost,
      ownedReports,
      updateReportStatus,
      updateOwnedReport,
      pendingMatch,
      restoreDemoMatch,
      beginEncounterAfterConfirm,
      rejectMatch,
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
    <PawFinderContext.Provider value={value}>{children}</PawFinderContext.Provider>
  );
}

export function usePawFinder() {
  const ctx = useContext(PawFinderContext);
  if (!ctx) {
    throw new Error("usePawFinder debe usarse dentro de PawFinderProvider");
  }
  return ctx;
}
