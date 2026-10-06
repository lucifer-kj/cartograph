"use client";

import { useEffect, useState } from "react";

export type ThemeMode = "system" | "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("cartograph-theme") as ThemeMode) || "system";
    }
    return "system";
  });

  function applyTheme(next: ThemeMode) {
    setTheme(next);
    localStorage.setItem("cartograph-theme", next);

    const root = document.documentElement;
    root.setAttribute("data-theme", next);

    let isDark = false;
    if (next === "dark") {
      isDark = true;
    } else if (next === "light") {
      isDark = false;
    } else {
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    if (isDark) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
  }

  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      const root = document.documentElement;
      if (e.matches) {
        root.classList.add("dark");
        root.classList.remove("light");
      } else {
        root.classList.remove("dark");
        root.classList.add("light");
      }
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme]);

  return (
    <div className="flex items-center rounded border border-surface-border bg-surface p-0.5 text-xs font-mono">
      <button
        type="button"
        onClick={() => applyTheme("system")}
        className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
          theme === "system"
            ? "bg-background font-medium text-foreground shadow-xs border border-surface-border"
            : "text-muted hover:text-foreground"
        }`}
        title="Follow system color preference"
      >
        system
      </button>
      <button
        type="button"
        onClick={() => applyTheme("light")}
        className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
          theme === "light"
            ? "bg-background font-medium text-foreground shadow-xs border border-surface-border"
            : "text-muted hover:text-foreground"
        }`}
        title="Force light theme"
      >
        light
      </button>
      <button
        type="button"
        onClick={() => applyTheme("dark")}
        className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
          theme === "dark"
            ? "bg-background font-medium text-foreground shadow-xs border border-surface-border"
            : "text-muted hover:text-foreground"
        }`}
        title="Force dark theme"
      >
        dark
      </button>
    </div>
  );
}
