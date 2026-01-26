const workboxBuild = require("workbox-build");

// Path depends on your output folder, Next.js 16 App Router me usually .next/static
workboxBuild.generateSW({
  globDirectory: ".next", // ya agar export kar rahe ho to out folder
  globPatterns: [
    "**/*.{js,css,html,json,png,svg,ico}"
  ],
  swDest: "public/sw.js", // public folder me rakhna zaruri hai
  clientsClaim: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /\/api\/.*\/*.json/,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        expiration: { maxEntries: 50, maxAgeSeconds: 5 * 60 },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "image-cache",
        expiration: { maxEntries: 60, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
  ],
}).then(({ count, size }) => {
  console.log(`Service Worker generated. ${count} files, ${size} bytes.`);
});
