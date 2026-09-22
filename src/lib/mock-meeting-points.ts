export type MeetingPointType = "vet" | "sponsor";

export interface MeetingPoint {
  id: string;
  name: string;
  address: string;
  hours: string;
  type: MeetingPointType;
  sponsorLabel?: string;
  lat: number;
  lng: number;
}

export const MOCK_MEETING_POINTS: MeetingPoint[] = [
  {
    id: "mp1",
    name: "Veterinaria Patitas",
    address: "Thames 1420, Palermo, CABA",
    hours: "Lun–Vie 9–19 · Sáb 9–13",
    type: "vet",
    lat: -34.5895,
    lng: -58.428,
  },
  {
    id: "mp2",
    name: "Centro Mascotas Belgrano",
    address: "Av. Cabildo 2100, Belgrano",
    hours: "Todos los días 10–20",
    type: "vet",
    lat: -34.562,
    lng: -58.458,
  },
  {
    id: "mp3",
    name: "PetShop Barrio Norte",
    address: "Santa Fe 3200, Palermo",
    hours: "Lun–Sáb 10–21",
    type: "sponsor",
    sponsorLabel: "Auspiciante",
    lat: -34.595,
    lng: -58.41,
  },
  {
    id: "mp4",
    name: "Punto seguro — Municipalidad (demo)",
    address: "Plaza Serrano, Palermo",
    hours: "24 h (espacio público iluminado)",
    type: "sponsor",
    sponsorLabel: "Punto fijo",
    lat: -34.5889,
    lng: -58.4302,
  },
];
