import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SnapPrint",
    short_name: "SnapPrint",
    description: "Income, expenses, and invoices for your 3D printing business.",
    start_url: "/",
    display: "standalone",
    background_color: "#f9f9f7",
    theme_color: "#2a78d6",
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png" },
    ],
  };
}
