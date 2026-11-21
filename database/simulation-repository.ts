import type { Prisma } from "@prisma/client";
import type { Simulation, SimulationSummary } from "@/types";
import { prisma } from "./client";

/**
 * Phase 1 repository. Persists the simulation aggregate as a JSON document.
 * Phase 2 replaces this with a normalised mapping onto the relational models in
 * schema.prisma; the interface stays the same.
 */

export async function listSnapshots(): Promise<SimulationSummary[]> {
  const rows = await prisma.simulationSnapshot.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return rows.map((row) => {
    const data = row.data as unknown as Simulation;
    return {
      id: row.id,
      name: row.name,
      createdAt: data.createdAt,
      updatedAt: row.updatedAt.toISOString(),
      status: data.status,
      audienceSize: data.audience.audienceSize,
      verdictLabel: data.verdict?.label ?? null,
      totalReachPct: data.metrics?.totalReachPct ?? null,
    };
  });
}

export async function getSnapshot(id: string): Promise<Simulation | null> {
  const row = await prisma.simulationSnapshot.findUnique({ where: { id } });
  return row ? (row.data as unknown as Simulation) : null;
}

export async function saveSnapshot(sim: Simulation): Promise<void> {
  const data = sim as unknown as Prisma.InputJsonValue;
  await prisma.simulationSnapshot.upsert({
    where: { id: sim.id },
    create: { id: sim.id, name: sim.name, status: sim.status, data },
    update: { name: sim.name, status: sim.status, data },
  });
}

export async function deleteSnapshot(id: string): Promise<void> {
  await prisma.simulationSnapshot.delete({ where: { id } }).catch(() => undefined);
}
