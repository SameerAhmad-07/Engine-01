import { NextResponse } from "next/server";
import type { Simulation } from "@/types";
import { isDatabaseConfigured } from "@/database/client";
import {
  deleteSnapshot,
  getSnapshot,
  saveSnapshot,
} from "@/database/simulation-repository";

export const runtime = "nodejs";

function guard() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database not configured. Set DATABASE_URL to enable the API store." },
      { status: 501 },
    );
  }
  return null;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const blocked = guard();
  if (blocked) return blocked;
  const { id } = await params;
  const sim = await getSnapshot(id);
  if (!sim) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(sim);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const blocked = guard();
  if (blocked) return blocked;
  const { id } = await params;
  const sim = (await request.json()) as Simulation;
  await saveSnapshot({ ...sim, id });
  return NextResponse.json({ id });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const blocked = guard();
  if (blocked) return blocked;
  const { id } = await params;
  await deleteSnapshot(id);
  return new NextResponse(null, { status: 204 });
}
