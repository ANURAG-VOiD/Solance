import { InvoiceDetailContent } from "@/components/invoices/InvoiceDetailContent";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <InvoiceDetailContent invoiceId={id} />;
}
