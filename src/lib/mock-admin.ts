export type ModerationItem = {
  id: string;
  title: string;
  reason: string;
  reportedBy: string;
  createdAt: string;
  priority: "high" | "medium" | "low";
  category: "duplicate" | "personal_data" | "image";
  location: string;
  imageUrl: string;
};

export const MODERATION_QUEUE: ModerationItem[] = [
  {
    id: "mod-1",
    title: "Aviso duplicado de Rocky",
    reason: "Posible duplicado publicado desde dos cuentas diferentes.",
    reportedBy: "Deteccion automatica",
    createdAt: "Hace 18 min",
    priority: "high",
    category: "duplicate",
    location: "Belgrano, CABA",
    imageUrl:
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80",
  },
  {
    id: "mod-2",
    title: "Telefono visible en la descripcion",
    reason: "La publicacion incluye datos personales en un campo publico.",
    reportedBy: "Ana V.",
    createdAt: "Hace 1 h",
    priority: "medium",
    category: "personal_data",
    location: "Recoleta, CABA",
    imageUrl:
      "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=400&q=80",
  },
  {
    id: "mod-3",
    title: "Imagen que no corresponde",
    reason: "Un usuario marco la fotografia como contenido irrelevante.",
    reportedBy: "Lucas R.",
    createdAt: "Hace 3 h",
    priority: "low",
    category: "image",
    location: "Villa Crespo, CABA",
    imageUrl:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80",
  },
];

export const ADMIN_CASES = [
  { id: "PF-1048", pet: "Luna", type: "Perdida", area: "Palermo", status: "Coincidencia", age: "3 dias", candidates: 2 },
  { id: "PF-1047", pet: "Sin nombre", type: "Encontrada", area: "Villa Crespo", status: "Activo", age: "4 dias", candidates: 1 },
  { id: "PF-1046", pet: "Rocky", type: "Perdida", area: "Belgrano", status: "En revision", age: "6 dias", candidates: 0 },
  { id: "PF-1045", pet: "Michi", type: "Perdida", area: "Almagro", status: "Resuelto", age: "7 dias", candidates: 3 },
  { id: "PF-1044", pet: "Perrita tranquila", type: "Encontrada", area: "Recoleta", status: "Activo", age: "5 dias", candidates: 0 },
];

export const ADMIN_USERS = [
  { name: "Maria Gonzalez", email: "maria@ejemplo.com.ar", reports: 2, resolved: 1, status: "Verificado", joined: "12 sep 2026" },
  { name: "Lucas Rodriguez", email: "lucas@ejemplo.com.ar", reports: 1, resolved: 0, status: "Activo", joined: "14 sep 2026" },
  { name: "Carla Fernandez", email: "carla@ejemplo.com.ar", reports: 1, resolved: 1, status: "Verificado", joined: "15 sep 2026" },
  { name: "Diego Perez", email: "diego@ejemplo.com.ar", reports: 3, resolved: 0, status: "En revision", joined: "10 sep 2026" },
];

export const ADMIN_SPONSORS = [
  { name: "Veterinaria Patitas", category: "Veterinaria", benefit: "15% en consulta", status: "Activo", impressions: 1240 },
  { name: "PetShop Barrio Norte", category: "Pet shop", benefit: "Kit de identificacion", status: "Activo", impressions: 870 },
  { name: "Centro Mascotas Belgrano", category: "Veterinaria", benefit: "Punto seguro", status: "Borrador", impressions: 0 },
];
