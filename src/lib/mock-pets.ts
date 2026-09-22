import type { PetPost, PendingMatch } from "@/types/pet";

/** Centro aproximado: Palermo, CABA */
export const MAP_DEFAULT_CENTER = { lat: -34.5875, lng: -58.425 };

export const INITIAL_FEED: PetPost[] = [
  {
    id: "1",
    kind: "lost",
    name: "Luna",
    species: "Perro",
    breed: "Mestiza mediana",
    description:
      "Collar rojo con chapita. Muy miedosa pero cariñosa. Se escapó del patio el sábado a la tarde.",
    locationLabel: "Palermo, CABA — cerca de Plaza Serrano",
    lat: -34.5889,
    lng: -58.4302,
    imageUrl:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
    contactName: "María G.",
    contactPhone: "+54 11 5555-0101",
    contactEmail: "maria@ejemplo.com.ar",
    reportedAt: "2026-09-12",
  },
  {
    id: "2",
    kind: "found",
    name: "Sin nombre",
    species: "Gato",
    breed: "Naranja atigrado",
    description:
      "Gatito joven, muy sociable. Lo encontramos en la vereda, parece perdido. Tiene buen estado.",
    locationLabel: "Villa Crespo — Av. Corrientes y Acevedo",
    lat: -34.6012,
    lng: -58.441,
    imageUrl:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80",
    contactName: "Lucas R.",
    contactPhone: "+54 11 5555-0202",
    reportedAt: "2026-09-14",
  },
  {
    id: "3",
    kind: "lost",
    name: "Rocky",
    species: "Perro",
    breed: "Bulldog francés",
    description:
      "Macho, color arena. Sin collar. Última vez visto cerca del parque. Responde a su nombre.",
    locationLabel: "Belgrano — Av. Cabildo y Juramento",
    lat: -34.5621,
    lng: -58.458,
    imageUrl:
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80",
    contactName: "Diego P.",
    contactPhone: "+54 11 5555-0303",
    reportedAt: "2026-09-10",
  },
  {
    id: "4",
    kind: "found",
    name: "Perrita tranquila",
    species: "Perro",
    breed: "Caniche pequeño",
    description:
      "Blanca, pelo rizado. Estaba bajo un banco en la plaza. Buscamos a su familia.",
    locationLabel: "Recoleta — Plaza Francia",
    lat: -34.5835,
    lng: -58.393,
    imageUrl:
      "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=800&q=80",
    contactName: "Ana V.",
    contactPhone: "+54 11 5555-0404",
    reportedAt: "2026-09-13",
  },
  {
    id: "5",
    kind: "lost",
    name: "Michi",
    species: "Gato",
    breed: "Siamés",
    description:
      "Ojos azules, collar con cascabel. Escapó por la ventana. Tiene chip pero sin datos actualizados.",
    locationLabel: "Almagro — Medrano y Rivadavia",
    lat: -34.609,
    lng: -58.422,
    imageUrl:
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&q=80",
    contactName: "Sofía L.",
    contactPhone: "+54 11 5555-0505",
    reportedAt: "2026-09-11",
  },
  {
    id: "6",
    kind: "found",
    name: "Cachorro grande",
    species: "Perro",
    breed: "Labrador",
    description:
      "Macho, collar verde sin datos. Muy juguetón. Lo tenemos en casa temporalmente.",
    locationLabel: "Colegiales — Federico Lacroze",
    lat: -34.574,
    lng: -58.448,
    imageUrl:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&q=80",
    contactName: "Julián M.",
    contactPhone: "+54 11 5555-0606",
    reportedAt: "2026-09-15",
  },
];

export const DEMO_PENDING_MATCH: PendingMatch = {
  id: "match-demo-1",
  foundPost: {
    id: "found-match-1",
    kind: "found",
    name: "¿Es Luna?",
    species: "Perro",
    breed: "Mestiza mediana, collar rojo",
    description:
      "Encontramos esta perrita en Palermo cerca de la plaza. Tiene collar rojo y es muy tímida.",
    locationLabel: "Palermo — a 2 cuadras de Plaza Serrano",
    lat: -34.5895,
    lng: -58.428,
    imageUrl:
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80",
    contactName: "Carla F.",
    contactPhone: "+54 11 5555-0707",
    reportedAt: "2026-09-15",
  },
  message:
    "Hola María, creemos que encontramos a Luna. ¿Podés confirmar si es tu mascota?",
  finderName: "Carla F.",
};
