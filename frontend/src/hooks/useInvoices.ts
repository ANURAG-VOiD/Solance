import { useAsyncData } from "@/hooks/useAsyncData";
import { listInvoices } from "@/services/invoices.service";

export function useInvoices() {
  return useAsyncData(() => listInvoices(), []);
}
