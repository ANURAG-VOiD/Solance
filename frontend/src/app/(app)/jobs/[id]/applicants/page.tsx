import { ApplicantsPageContent } from "@/components/marketplace/ApplicantsPageContent";

export default async function ApplicantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ApplicantsPageContent taskId={id} />;
}
