import type { PetPost as DbPetPost, Notification as DbNotification } from "@prisma/client";
import type { AppNotification } from "@/lib/mock-notifications";
import type { OwnedReport, PetKind, PetPost, ReportStatus } from "@/types/pet";

function mapKind(kind: DbPetPost["kind"]): PetKind {
  return kind === "LOST" ? "lost" : "found";
}

function mapStatus(status: DbPetPost["status"]): ReportStatus {
  const table: Record<DbPetPost["status"], ReportStatus> = {
    ACTIVE: "active",
    REVIEWING: "reviewing",
    PAUSED: "paused",
    RESOLVED: "resolved",
  };
  return table[status];
}

export function toPetPost(
  post: DbPetPost,
  options?: { includeContact?: boolean },
): PetPost {
  const includeContact = options?.includeContact ?? false;
  return {
    id: post.id,
    kind: mapKind(post.kind),
    name: post.name,
    species: post.species,
    breed: post.breed ?? undefined,
    description: post.description,
    locationLabel: post.locationLabel,
    lat: post.lat,
    lng: post.lng,
    imageUrl: post.imageUrl,
    contactName: includeContact ? post.contactName : "",
    contactPhone: includeContact ? post.contactPhone : "",
    contactEmail: includeContact ? post.contactEmail ?? undefined : undefined,
    reportedAt: post.reportedAt.toISOString().slice(0, 10),
  };
}

export function toOwnedReport(
  post: DbPetPost,
  candidateCount = 0,
): OwnedReport {
  return {
    ...toPetPost(post, { includeContact: true }),
    status: mapStatus(post.status),
    candidateCount,
    views: post.views,
    updatedAt: post.updatedAt.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
    }),
  };
}

function formatRelative(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "Hace unos minutos";
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Ayer";
  return `Hace ${days} días`;
}

function mapNotificationKind(
  type: DbNotification["type"],
): AppNotification["kind"] {
  switch (type) {
    case "MATCH":
      return "match";
    case "MATCH_CONFIRMED":
      return "confirmacion";
    case "MATCH_REJECTED":
      return "puede_ser";
    case "SPONSOR":
      return "sponsor";
    default:
      return "puede_ser";
  }
}

export function toAppNotification(n: DbNotification): AppNotification {
  return {
    id: n.id,
    kind: mapNotificationKind(n.type),
    title: n.title,
    body: n.body,
    detail: n.body,
    createdAt: formatRelative(n.createdAt),
    read: n.read,
    sponsorName: n.type === "SPONSOR" ? "PetShop Barrio Norte" : undefined,
    sponsorBadge: n.type === "SPONSOR" ? "Auspiciante" : undefined,
  };
}

export const SPONSOR_NOTIFICATION_MOCKS: AppNotification[] = [
  {
    id: "sponsor-mock-1",
    kind: "sponsor",
    title: "20% en accesorios",
    body: "PetShop Barrio Norte — auspiciante PawFinder.",
    detail: "Mostrá tu aviso activo en caja y accedé al beneficio (demo).",
    createdAt: "Esta semana",
    read: true,
    sponsorName: "PetShop Barrio Norte",
    sponsorBadge: "Auspiciante",
  },
];
