import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Clout City: Hollywood Music",
    short_name: "Clout City",
    description: "Arrive in Hollywood as a nobody with an instrument. Play loud. Blow up.",
    // Every page on the site is the app, so iOS keeps it full screen (as in Clout City NYC).
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#14111A",
    theme_color: "#14111A",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
