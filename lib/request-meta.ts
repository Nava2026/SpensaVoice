import type { Device } from "./types";

/** Ambil IP klien dari header proxy Vercel / standar. */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return (
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

/** Parse user agent secara kasar jadi mobile / desktop / unknown. */
export function getDevice(userAgent: string): Device {
  if (!userAgent) return "unknown";
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(ua)) return "mobile";
  if (/mobi|android|iphone|ipod|windows phone/.test(ua)) return "mobile";
  if (/windows|macintosh|linux|cros/.test(ua)) return "desktop";
  return "unknown";
}

/** IP disamarkan untuk tampilan admin: 103.xxx.xxx.42 */
export function maskIp(ip: string): string {
  if (!ip || ip === "unknown") return "unknown";
  if (ip.includes(":")) {
    const parts = ip.split(":");
    return `${parts[0]}:****:${parts[parts.length - 1] || "****"}`;
  }
  const parts = ip.split(".");
  if (parts.length !== 4) return ip;
  return `${parts[0]}.xxx.xxx.${parts[3]}`;
}

/** Ringkas user agent panjang jadi sesuatu yang enak dibaca. */
export function shortUserAgent(userAgent: string): string {
  if (!userAgent) return "unknown";
  if (userAgent.length <= 80) return userAgent;
  return `${userAgent.slice(0, 77)}...`;
}
