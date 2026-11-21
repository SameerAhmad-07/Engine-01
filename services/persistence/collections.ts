/**
 * Generic localStorage-backed collection store used by the Phase 3 platform
 * layer (agents, tickets, activity, experiments, reports, knowledge). Shares the
 * same persistence strategy and browser as the simulation store so the whole
 * app works off one client-side database.
 */

const PREFIX = "vis:platform:v1:";

export interface Identified {
  id: string;
}

function read<T>(name: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PREFIX + name);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(name: string, rows: T[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + name, JSON.stringify(rows));
  } catch {
    /* quota / private mode — degrade silently */
  }
}

export class Collection<T extends Identified> {
  constructor(private readonly name: string) {}

  all(): T[] {
    return read<T>(this.name);
  }

  get(id: string): T | null {
    return this.all().find((r) => r.id === id) ?? null;
  }

  upsert(row: T): T {
    const rows = this.all();
    const idx = rows.findIndex((r) => r.id === row.id);
    if (idx >= 0) rows[idx] = row;
    else rows.unshift(row);
    write(this.name, rows);
    return row;
  }

  upsertMany(items: T[]): void {
    const rows = this.all();
    for (const item of items) {
      const idx = rows.findIndex((r) => r.id === item.id);
      if (idx >= 0) rows[idx] = item;
      else rows.unshift(item);
    }
    write(this.name, rows);
  }

  remove(id: string): void {
    write(
      this.name,
      this.all().filter((r) => r.id !== id),
    );
  }

  clear(): void {
    write(this.name, []);
  }
}

export function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
