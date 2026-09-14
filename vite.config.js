import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

const description = "Jehlum Cafe — a mountain river, a remembered landscape, and a generous table.";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,
      manifest: {
        id: "/",
        name: "Jehlum Cafe",
        short_name: "Jehlum",
        description,
        lang: "en",
        dir: "ltr",
        theme_color: "#102a2b",
        background_color: "#173b36",
        display: "standalone",
        display_override: ["standalone", "minimal-ui"],
        orientation: "any",
        start_url: "/",
        scope: "/",
        categories: ["food", "lifestyle"],
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "pwa-512x512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          { src: "icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
        ],
        shortcuts: [
          { name: "Menu", short_name: "Menu", description: "Browse the Jehlum Cafe menu", url: "/#menu" },
          { name: "Jhelum Direct", short_name: "Direct", description: "Order pickup or delivery", url: "/#direct" },
          { name: "Your order", short_name: "Order", description: "Review your order", url: "/#cart" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,webp,ico,webmanifest}", "pwa-*.png", "apple-touch-icon.png"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "jehlum-images",
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
