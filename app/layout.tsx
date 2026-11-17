import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpensaVoice — Suaramu, Didengerin",
  description:
    "Kotak aspirasi digital OSIS SMP Negeri 1 Dander. Tulis ide atau keluhan, bisa anonim, dan cek statusnya pakai kode.",
  applicationName: "SpensaVoice",
  openGraph: {
    title: "SpensaVoice",
    description: "Kotak aspirasi digital OSIS SMP Negeri 1 Dander.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1220",
  width: "device-width",
  initialScale: 1,
};

// Pasang tema sebelum paint supaya nggak ada kedipan terang/gelap.
const themeInit = `(function () {
  try {
    var saved = localStorage.getItem("sv_theme");
    var theme = saved === "light" || saved === "dark"
      ? saved
      : (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    document.documentElement.setAttribute("data-theme", theme);
  } catch (error) {}
})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.cdnfonts.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.cdnfonts.com/css/minecrafter"
          rel="stylesheet"
        />
        <link
          href="https://fonts.cdnfonts.com/css/minecraft-ten"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
