export type NotificationKind =
  | "match"
  | "puede_ser"
  | "confirmacion"
  | "sponsor";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  detail: string;
  createdAt: string;
  read: boolean;
  sponsorName?: string;
  sponsorBadge?: "Auspiciante" | "Oferta";
}

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    kind: "match",
    title: "¡Posible match con Luna!",
    body: "Lucas cree que encontró a tu mascota en Villa Crespo.",
    detail:
      "Revisá la publicación y confirmá si es Luna. Si coinciden, podrán coordinar un encuentro seguro.",
    createdAt: "Hace 2 h",
    read: false,
  },
  {
    id: "n2",
    kind: "puede_ser",
    title: "Alguien marcó «Puede ser»",
    body: "Un vecino vio tu aviso de Thor y quiere contactarse.",
    detail:
      "Es una señal de interés, no un match confirmado. Podés escribirle por el teléfono del aviso o esperar más datos.",
    createdAt: "Ayer",
    read: false,
  },
  {
    id: "n3",
    kind: "confirmacion",
    title: "Match confirmado (demo)",
    body: "Coordiná el encuentro con el punto de entrega o en domicilio.",
    detail:
      "Recordá llevar documentación del animal y acordar un lugar con buena luz y tránsito.",
    createdAt: "Hace 3 días",
    read: true,
  },
  {
    id: "n4",
    kind: "sponsor",
    title: "15% en consulta veterinaria",
    body: "Veterinaria Patitas — auspiciante PawFinder.",
    detail:
      "Presentá este aviso en recepción. Válido para consulta clínica hasta fin de mes. No reemplaza urgencias.",
    createdAt: "Hace 5 días",
    read: false,
    sponsorName: "Veterinaria Patitas",
    sponsorBadge: "Auspiciante",
  },
  {
    id: "n5",
    kind: "sponsor",
    title: "Kit identificación con descuento",
    body: "PetShop Barrio Norte — oferta para dueños activos en PawFinder.",
    detail:
      "Placa + chip de demostración. Mostrá la app en caja. Stock limitado en sucursal Palermo.",
    createdAt: "Hace 1 semana",
    read: true,
    sponsorName: "PetShop Barrio Norte",
    sponsorBadge: "Oferta",
  },
];

export function notificationKindLabel(kind: NotificationKind): string {
  switch (kind) {
    case "match":
      return "Match";
    case "puede_ser":
      return "Puede ser";
    case "confirmacion":
      return "Confirmación";
    case "sponsor":
      return "Auspiciante";
  }
}
