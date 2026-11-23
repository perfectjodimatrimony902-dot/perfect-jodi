import { useSyncExternalStore } from "react";
import { createSeed, STATE_VERSION } from "@/data/seed";
import type { DemoState } from "./types";

const STORAGE_KEY = "perfect-jodi-demo-state";

let clientState: DemoState | null = null;
let serverState: DemoState | null = null;
const listeners = new Set<() => void>();

function load(): DemoState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState;
      if (parsed.version === STATE_VERSION) return parsed;
    }
  } catch {
    // Corrupt storage falls back to fresh demo data.
  }
  return createSeed();
}

export function getState(): DemoState {
  if (typeof window === "undefined") return getServerState();
  if (!clientState) clientState = load();
  return clientState;
}

function getServerState(): DemoState {
  if (!serverState) serverState = createSeed();
  return serverState;
}

export function setState(updater: (s: DemoState) => DemoState) {
  clientState = updater(getState());
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clientState));
  } catch {
    // Storage full or blocked: keep in memory for this session.
  }
  listeners.forEach((l) => l());
}

export function resetDemoState() {
  const session = getState().session;
  setState(() => ({ ...createSeed(), session }));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      clientState = load();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Whole demo state. Server render and hydration use fresh seed data; the client then switches to localStorage. */
export function useDemoState(): DemoState {
  return useSyncExternalStore(subscribe, getState, getServerState);
}

export function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
}
