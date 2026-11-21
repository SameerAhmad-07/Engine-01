import { apiPersistence } from "./api";
import { localStoragePersistence } from "./local-storage";
import type { SimulationPersistence } from "./types";

export type { SimulationPersistence } from "./types";
export { toSummary } from "./types";

/**
 * Persistence strategy resolution.
 *
 * - `NEXT_PUBLIC_PERSISTENCE=api` opts into the database-backed adapter.
 * - Otherwise Phase 1 uses localStorage so the app is fully functional with no
 *   infrastructure.
 */
export function getPersistence(): SimulationPersistence {
  const mode = process.env.NEXT_PUBLIC_PERSISTENCE;
  if (mode === "api") return apiPersistence;
  return localStoragePersistence;
}

export const persistence = getPersistence();
