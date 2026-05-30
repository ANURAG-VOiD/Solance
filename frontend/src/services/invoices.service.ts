import { authFetch } from "@/services/api-client";
import type { CreateInvoicePayload, Invoice } from "@/types";

export async function createInvoice(
  payload: CreateInvoicePayload,
): Promise<Invoice> {
  return authFetch<Invoice>("/api/invoices", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getInvoice(id: string): Promise<Invoice> {
  return authFetch<Invoice>(`/api/invoices/${id}`);
}

export async function updateInvoiceStatus(
  id: string,
  status: string,
): Promise<Invoice> {
  return authFetch<Invoice>(`/api/invoices/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function listInvoices(): Promise<Invoice[]> {
  return authFetch<Invoice[]>("/api/invoices");
}
