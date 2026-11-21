import { NextResponse } from "next/server";
import type { Simulation } from "@/types";
import { isDatabaseConfigured } from "@/database/client";
import { listSnapshots, saveSnapshot } from "@/database/simulation-repository";

export const runtime = "nodejs";

function guard() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "Database not configured. Phase 1 uses client-side persistence; set DATABASE_URL to enable the API store.",
      },
      { status: 501 },
    );
  }
  return null;
}

export async function GET() {
  const blocked = guard();
  if (blocked) return blocked;
  return NextResponse.json(await listSnapshots());
}

export async function POST(request: Request) {
  const blocked = guard();
  if (blocked) return blocked;
  const sim = (await request.json()) as Simulation;
  await saveSnapshot(sim);
  return NextResponse.json({ id: sim.id }, { status: 201 });
}
