export type PetKind = "lost" | "found";

export type ReportStatus = "active" | "reviewing" | "paused" | "resolved";

export interface PetPost {
  id: string;
  kind: PetKind;
  name: string;
  species: string;
  breed?: string;
  description: string;
  locationLabel: string;
  lat: number;
  lng: number;
  imageUrl: string;
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

export interface PublishPayload extends PublishDraft {
  cloudinaryPublicId?: string;
}

export interface PublishDraft {
  kind: PetKind;
  name: string;
  species: string;
  breed: string;
  description: string;
  locationLabel: string;
  lat: number;
  lng: number;
  imageUrl: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
}

export interface OwnedReport extends PetPost {
  status: ReportStatus;
  candidateCount: number;
  views: number;
  updatedAt: string;
}
