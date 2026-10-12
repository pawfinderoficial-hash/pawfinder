import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PawFinder",
    short_name: "PawFinder",
    description: "Reuní mascotas perdidas con su familia.",
    start_url: "/feed",
    display: "standalone",
    background_color: "#f5fcfc",
    theme_color: "#0f8b8d",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
