export interface AuditEntry {
  ts: string;
  action: string;
  resource: string;
  detail: string;
}

/**
 * Server-side audit log. In-process ring buffer (a production deployment would
 * write to a durable store). Never contains secrets — actions and resource ids
 * only.
 */
const BUFFER: AuditEntry[] = [];
const MAX = 500;

export function auditLog(entry: Omit<AuditEntry, "ts">): void {
  const record: AuditEntry = { ts: new Date().toISOString(), ...entry };
  BUFFER.push(record);
  if (BUFFER.length > MAX) BUFFER.shift();
  if (process.env.NODE_ENV !== "test") {
    console.info(`[audit] ${record.action} ${record.resource} — ${record.detail}`);
  }
}

export function readAuditLog(limit = 100): AuditEntry[] {
  return BUFFER.slice(-limit).reverse();
}
