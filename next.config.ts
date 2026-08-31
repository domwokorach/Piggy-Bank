import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // NOTE: kid/card detail routes are dynamic segments whose IDs are created
  // client-side at runtime (no backend yet — see services/ for where real
  // API calls will plug in). That's incompatible with `output: 'export'`,
  // which requires every dynamic param to be known at build time. Once a
  // real API/DB backs these routes, static export (or ISR) becomes viable
  // again and Capacitor can bundle the static `out/` build directly. Until
  // then, run Capacitor against a hosted/dev server URL via
  // `server.url` in capacitor.config.ts instead of `webDir`.
  images: {
    unoptimized: true,
  },
}

export default nextConfig
