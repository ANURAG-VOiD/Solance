import Link from "next/link";
import type { Invoice } from "@/types";
import { formatSol, formatTimestamp, truncateWallet } from "@/lib/utils";
import { Badge } from "@/components/shared/ui/Badge";

function statusVariant(status: Invoice["status"]) {
  const map = {
    draft: "default",
    pending: "warning",
    paid: "success",
    rejected: "danger",
    cancelled: "danger",
  } as const;
  return map[status] ?? "default";
}

interface InvoiceRowProps {
  invoice: Invoice;
}

export function InvoiceRow({ invoice }: InvoiceRowProps) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-3 py-3 font-mono text-xs">
        <Link href={`/invoices/${invoice.id}`} className="text-accent hover:underline">
          {invoice.id.slice(0, 8)}…
        </Link>
      </td>
      <td className="px-3 py-3 text-sm">{truncateWallet(invoice.receiver_wallet)}</td>
      <td className="px-3 py-3 text-sm font-medium">{formatSol(invoice.amount)}</td>
      <td className="px-3 py-3">
        <Badge variant={statusVariant(invoice.status)}>{invoice.status}</Badge>
      </td>
      <td className="px-3 py-3 text-xs text-text-muted">
        {formatTimestamp(invoice.created_at)}
      </td>
    </tr>
  );
}
