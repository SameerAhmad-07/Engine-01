import type { Simulation, SimulationSummary } from "@/types";
import { type SimulationPersistence, toSummary } from "./types";

const KEY = "vis:simulations:v2";

interface Store {
  [id: string]: Simulation;
}

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function write(store: Store) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // Quota or private-mode failure – degrade silently, the app still runs.
  }
}

/**
 * Default Phase 1 persistence. Completed simulations survive reloads without a
 * database. Implements the same interface as the API-backed adapter.
 */
export const localStoragePersistence: SimulationPersistence = {
  id: "local-storage",
  async list(): Promise<SimulationSummary[]> {
    return Object.values(read())
      .map(toSummary)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },
  async get(id: string): Promise<Simulation | null> {
    return read()[id] ?? null;
  },
  async save(simulation: Simulation): Promise<void> {
    const store = read();
    store[simulation.id] = simulation;
    write(store);
  },
  async remove(id: string): Promise<void> {
    const store = read();
    delete store[id];
    write(store);
  },
};
