export function generateInvoiceNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  return `INV-${ts.slice(-8)}`;
}

export function defaultDueDate(daysFromNow = 14): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
