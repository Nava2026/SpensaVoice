import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Izinkan akses dev lewat tunnel sementara (cloudflared trycloudflare).
  allowedDevOrigins: ["*.trycloudflare.com"],
};

export default nextConfig;
