"use client";

import { useEffect, useSyncExternalStore } from "react";

export type ThemeMode = "system" | "light" | "dark";

function subscribeTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("cartograph-theme-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("cartograph-theme-change", callback);
  };
}

function getThemeSnapshot(): ThemeMode {
  return (localStorage.getItem("cartograph-theme") as ThemeMode) || "system";
}

function getThemeServerSnapshot(): ThemeMode {
  return "system";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot
  );

  function applyTheme(next: ThemeMode) {
    localStorage.setItem("cartograph-theme", next);
    window.dispatchEvent(new Event("cartograph-theme-change"));

    const isDark =
      next === "dark" ||
      (next === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    const root = document.documentElement;
    root.setAttribute("data-theme", next);

    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      const current = localStorage.getItem("cartograph-theme") || "system";
      if (current === "system") {
        if (e.matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };

    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  return (
    <div className="flex items-center gap-2.5 text-xs font-mono">
      <button
        type="button"
        onClick={() => applyTheme("system")}
        className={`cursor-pointer transition-colors ${
          theme === "system"
            ? "text-zinc-900 dark:text-zinc-100 font-semibold"
            : "text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
        }`}
      >
        system
      </button>
      <button
        type="button"
        onClick={() => applyTheme("light")}
        className={`cursor-pointer transition-colors ${
          theme === "light"
            ? "text-zinc-900 dark:text-zinc-100 font-semibold"
            : "text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
        }`}
      >
        light
      </button>
      <button
        type="button"
        onClick={() => applyTheme("dark")}
        className={`cursor-pointer transition-colors ${
          theme === "dark"
            ? "text-zinc-900 dark:text-zinc-100 font-semibold"
            : "text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
        }`}
      >
        dark
      </button>
    </div>
  );
}
