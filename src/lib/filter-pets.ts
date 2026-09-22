import type { PetPost } from "@/types/pet";

const KIND_LABELS: Record<PetPost["kind"], string[]> = {
  lost: ["perdida", "perdido", "busqueda", "búsqueda"],
  found: ["encontrada", "encontrado", "hallazgo"],
};

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

function postSearchBlob(post: PetPost): string {
  const kindWords = KIND_LABELS[post.kind].join(" ");
  return [
    post.name,
    post.species,
    post.breed ?? "",
    post.description,
    post.locationLabel,
    kindWords,
    post.kind === "lost" ? "perdida" : "encontrada",
  ]
    .join(" ")
    .trim();
}

export function filterPetPosts(posts: PetPost[], query: string): PetPost[] {
  const q = normalizeSearchText(query);
  if (!q) return posts;
  const tokens = q.split(/\s+/).filter(Boolean);
  return posts.filter((post) => {
    const blob = normalizeSearchText(postSearchBlob(post));
    return tokens.every((token) => blob.includes(token));
  });
}

export function sampleBreedFilters(posts: PetPost[], limit = 3): string[] {
  const seen = new Set<string>();
  const samples: string[] = [];
  for (const post of posts) {
    const breed = post.breed?.trim();
    if (!breed || seen.has(breed)) continue;
    seen.add(breed);
    samples.push(breed);
    if (samples.length >= limit) break;
  }
  return samples;
}
