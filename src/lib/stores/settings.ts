// src/lib/stores/settings.ts

import { writable } from "svelte/store";
import { browser } from "$app/environment";

// -------------------------------------------------------------------------
// Types
// -------------------------------------------------------------------------

export type Theme = "light" | "dark" | "system";
export type FontSize = "small" | "medium" | "large";

export interface Settings {
  theme: Theme;
  fontSize: FontSize;
  unreadOnly: boolean;
  markReadOnOpen: boolean;
}

// -------------------------------------------------------------------------
// Defaults
// -------------------------------------------------------------------------

const defaults: Settings = {
  theme: "system",
  fontSize: "medium",
  unreadOnly: false,
  markReadOnOpen: true,
};

// -------------------------------------------------------------------------
// Persistence (localStorage)
// -------------------------------------------------------------------------

function loadSettings(): Settings {
  if (!browser) return defaults;
  try {
    const stored = localStorage.getItem("open-airss:settings");
    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
  } catch {
    return defaults;
  }
}

function saveSettings(s: Settings): void {
  if (!browser) return;
  try {
    localStorage.setItem("open-airss:settings", JSON.stringify(s));
  } catch {
    // storage unavailable — fail silently
  }
}

// -------------------------------------------------------------------------
// Store
// -------------------------------------------------------------------------

function createSettings() {
  const { subscribe, set, update } = writable<Settings>(loadSettings());

  return {
    subscribe,
    set(value: Settings) {
      saveSettings(value);
      set(value);
    },
    update(fn: (s: Settings) => Settings) {
      update((current) => {
        const next = fn(current);
        saveSettings(next);
        return next;
      });
    },
    setTheme(theme: Theme) {
      this.update((s) => ({ ...s, theme }));
    },
    setFontSize(fontSize: FontSize) {
      this.update((s) => ({ ...s, fontSize }));
    },
    toggleUnreadOnly() {
      this.update((s) => ({ ...s, unreadOnly: !s.unreadOnly }));
    },
    toggleMarkReadOnOpen() {
      this.update((s) => ({ ...s, markReadOnOpen: !s.markReadOnOpen }));
    },
    reset() {
      this.set(defaults);
    },
  };
}

export const settings = createSettings();
