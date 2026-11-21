import type { Simulation, SimulationSummary } from "@/types";
import type { SimulationPersistence } from "./types";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return (await res.json()) as T;
}

/**
 * API-backed persistence. Active when a database is configured; talks to the
 * route handlers under /app/api/simulations.
 */
export const apiPersistence: SimulationPersistence = {
  id: "api",
  async list(): Promise<SimulationSummary[]> {
    return json(await fetch("/api/simulations", { cache: "no-store" }));
  },
  async get(id: string): Promise<Simulation | null> {
    const res = await fetch(`/api/simulations/${id}`, { cache: "no-store" });
    if (res.status === 404) return null;
    return json(res);
  },
  async save(simulation: Simulation): Promise<void> {
    await json(
      await fetch(`/api/simulations/${simulation.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(simulation),
      }),
    );
  },
  async remove(id: string): Promise<void> {
    await fetch(`/api/simulations/${id}`, { method: "DELETE" });
  },
};
