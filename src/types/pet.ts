export type PetKind = "lost" | "found";

export type ReportStatus = "active" | "reviewing" | "paused" | "resolved";

export interface PetPost {
  id: string;
  kind: PetKind;
  name: string;
  species: string;
  breed?: string;
  color?: string;
  size?: string;
  sex?: string;
  ageLabel?: string;
  collar?: string;
  description: string;
  locationLabel: string;
  lat: number;
  lng: number;
  imageUrl: string;
  imageUrls?: string[];
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  reportedAt: string;
}

export interface PendingMatch {
  id: string;
  foundPost: PetPost;
  message: string;
  finderName: string;
}

export type SightingStatusUi = "open" | "contact_shared";

export interface PendingSighting {
  id: string;
  status: SightingStatusUi;
  note: string;
  locationLabel: string;
  lat: number;
  lng: number;
  seenAt: string | null;
  imageUrl: string | null;
  imageUrls: string[];
  reporterName: string;
  contactPhone: string | null;
  lostPost: {
    id: string;
    name: string;
    imageUrl: string;
    imageUrls?: string[];
  };
  createdAt: string;
}

export interface PuedeSerChoice {
  targetLostPostId: string;
  targetName: string;
}

export interface PublishPayload extends PublishDraft {
  cloudinaryPublicId?: string;
  cloudinaryPublicIds?: string[];
}

export interface PublishDraft {
  kind: PetKind;
  name: string;
  species: string;
  breed: string;
  color: string;
  size: string;
  sex: string;
  ageLabel: string;
  collar: string;
  description: string;
  locationLabel: string;
  lat: number;
  lng: number;
  imageUrl: string;
  imageUrls: string[];
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  targetLostPostId?: string;
}

export interface SightingDraft {
  lostPostId: string;
  note: string;
  locationLabel: string;
  lat: number;
  lng: number;
  seenAt?: string;
  imageUrl?: string;
  imageUrls?: string[];
  cloudinaryPublicId?: string;
  cloudinaryPublicIds?: string[];
  contactName: string;
  contactPhone: string;
}

export interface OwnedSighting {
  id: string;
  status: "open" | "contact_shared" | "dismissed";
  note: string;
  locationLabel: string;
  seenAt: string | null;
  imageUrl: string | null;
  imageUrls: string[];
  createdAt: string;
  lostPost: {
    id: string;
    name: string;
    imageUrl: string;
    imageUrls?: string[];
  };
}

export interface OwnedReport extends PetPost {
  status: ReportStatus;
  candidateCount: number;
  views: number;
  updatedAt: string;
}
