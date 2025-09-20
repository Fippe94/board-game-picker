"use client";

const DEV_FALLBACK = "http://127.0.0.1:3030";

function normalizeUrl(url: string) {
  return url.replace(/\/$/, "");
}

export function getRealtimeUrl() {
  const envUrl = process.env.NEXT_PUBLIC_RT_URL?.trim() || "https://boardgameselector.com";
  if (envUrl) {
    return normalizeUrl(envUrl);
  }

  if (typeof window !== "undefined") {
    const { origin, hostname } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return DEV_FALLBACK;
    }
    return normalizeUrl(origin);
  }

  return DEV_FALLBACK;
}
