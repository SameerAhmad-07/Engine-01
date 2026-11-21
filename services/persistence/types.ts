import type { Simulation, SimulationSummary } from "@/types";

export interface SimulationPersistence {
  readonly id: string;
  list(): Promise<SimulationSummary[]>;
  get(id: string): Promise<Simulation | null>;
  save(simulation: Simulation): Promise<void>;
  remove(id: string): Promise<void>;
}

export function toSummary(sim: Simulation): SimulationSummary {
  return {
    id: sim.id,
    name: sim.name,
    createdAt: sim.createdAt,
    updatedAt: sim.updatedAt,
    status: sim.status,
    audienceSize: sim.audience.audienceSize,
    verdictLabel: sim.verdict?.label ?? null,
    totalReachPct: sim.metrics?.totalReachPct ?? null,
  };
}
