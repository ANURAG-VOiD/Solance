import { JobDetailContent } from "@/components/marketplace/JobDetailContent";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <JobDetailContent taskId={id} />;
}
