"use client";

import { useEffect } from "react";

const THEME_KEY = "sv_theme";

function applyTheme(theme: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // localStorage bisa diblokir; tema tetap berlaku untuk sesi ini.
  }
}

export default function ThemeToggle() {
  useEffect(() => {
    function syncFromStorage(event: StorageEvent) {
      if (
        event.key === THEME_KEY &&
        (event.newValue === "light" || event.newValue === "dark")
      ) {
        document.documentElement.setAttribute("data-theme", event.newValue);
      }
    }

    const system = window.matchMedia("(prefers-color-scheme: light)");
    function followSystem() {
      try {
        if (localStorage.getItem(THEME_KEY)) return;
      } catch {
        return;
      }
      document.documentElement.setAttribute(
        "data-theme",
        system.matches ? "light" : "dark",
      );
    }

    window.addEventListener("storage", syncFromStorage);
    system.addEventListener("change", followSystem);
    return () => {
      window.removeEventListener("storage", syncFromStorage);
      system.removeEventListener("change", followSystem);
    };
  }, []);

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    applyTheme(current === "light" ? "dark" : "light");
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="Ganti mode terang atau gelap"
      title="Ganti mode terang/gelap"
    >
      <span className="theme-toggle-icon theme-icon-sun" aria-hidden="true">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" />
        </svg>
      </span>
      <span className="theme-toggle-icon theme-icon-moon" aria-hidden="true">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </span>
      <span className="theme-toggle-label" aria-hidden="true">
        Tema
      </span>
    </button>
  );
}
