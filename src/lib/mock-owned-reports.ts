import { INITIAL_FEED } from "@/lib/mock-pets";
import type { OwnedReport } from "@/types/pet";

const luna = INITIAL_FEED.find((post) => post.id === "1");

if (!luna) {
  throw new Error("El aviso demo de Luna no esta disponible");
}

export const INITIAL_OWNED_REPORTS: OwnedReport[] = [
  {
    ...luna,
    status: "active",
    candidateCount: 2,
    views: 184,
    updatedAt: "Hoy, 09:42",
  },
  {
    id: "owner-thor",
    kind: "lost",
    name: "Thor",
    species: "Perro",
    breed: "Ovejero aleman",
    description:
      "Macho adulto, collar azul y una pequena mancha blanca en el pecho. Se perdio durante una tormenta.",
    locationLabel: "Caballito - Parque Rivadavia",
    lat: -34.6176,
    lng: -58.4327,
    imageUrl:
      "https://images.unsplash.com/photo-1553882809-a4f57e59501d?w=800&q=80",
    contactName: "Maria G.",
    contactPhone: "+54 11 5555-0110",
    contactEmail: "maria@ejemplo.com.ar",
    reportedAt: "2026-08-28",
    status: "paused",
    candidateCount: 1,
    views: 96,
    updatedAt: "Hace 2 dias",
  },
];
