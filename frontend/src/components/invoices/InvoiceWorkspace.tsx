"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { ProjectSelector } from "@/components/invoices/ProjectSelector";
import { ClientInfoCard } from "@/components/invoices/ClientInfoCard";
import { InvoiceDetailsSection } from "@/components/invoices/InvoiceDetailsSection";
import { InvoicePreviewPanel } from "@/components/invoices/InvoicePreviewPanel";
import { SolanaPaymentSection } from "@/components/invoices/SolanaPaymentSection";
import { InvoiceKanban } from "@/components/invoices/InvoiceKanban";
import { Button } from "@/components/shared/ui/Button";
import { Card } from "@/components/shared/ui/Card";
import { LoadingState } from "@/components/shared/states/LoadingState";
import { EmptyState } from "@/components/shared/states/EmptyState";
import { ErrorState } from "@/components/shared/states/ErrorState";
import { useFreelancerProjects } from "@/hooks/useFreelancerProjects";
import { useInvoiceForm } from "@/hooks/useInvoiceForm";
import { useInvoices } from "@/hooks/useInvoices";
import { useAuth } from "@/context/AuthContext";
import { createInvoice } from "@/services/invoices.service";
import type { InvoicePricingType } from "@/types/invoice";

export function InvoiceWorkspace() {
  const { user } = useAuth();
  const projects = useFreelancerProjects();
  const invoices = useInvoices();
  const form = useInvoiceForm();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPipeline, setShowPipeline] = useState(true);
  const projectList = useMemo(() => projects.data ?? [], [projects.data]);

  const selectedProject = useMemo(
    () => projectList.find((p) => p.taskId === form.selectedProjectId) ?? null,
    [projectList, form.selectedProjectId],
  );

  const handleSelectProject = (project: (typeof projectList)[number]) => {
    form.selectProject(project);
  };

  const handlePricingType = (type: InvoicePricingType) => {
    if (!selectedProject) return;
    form.setPricingType(type, selectedProject.agreedAmount);
  };

  const handleMilestone = (pct: string) => {
    if (!selectedProject) return;
    form.setMilestonePercent(pct, selectedProject.agreedAmount);
  };

  const handleGenerate = async () => {
    if (!selectedProject || !form.validate()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const totalStr = form.calculations.total.toFixed(6).replace(/\.?0+$/, "");

      await createInvoice({
        receiver_wallet: form.client.walletAddress.trim(),
        amount: totalStr,
      });

      form.resetForm();
      invoices.reload();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to generate invoice");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Invoice workspace"
        description="Select a project, review auto-filled details, preview, and generate"
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowPipeline((v) => !v)}
            >
              {showPipeline ? "Hide" : "Show"} pipeline
            </Button>
            <Link href="/marketplace">
              <Button variant="secondary" size="sm">Browse jobs</Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-7">
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand" />
              <h2 className="text-sm font-semibold">Step 1 — Select project</h2>
            </div>

            {projects.isLoading && <LoadingState label="Loading your projects…" />}
            {projects.error && (
              <ErrorState message={projects.error} onRetry={projects.reload} />
            )}
            {!projects.isLoading && !projects.error && projectList.length === 0 && (
              <EmptyState
                title="No active projects"
                description="Apply to jobs and get hired to generate project-aware invoices. Accepted work appears here automatically."
                action={{ label: "Browse marketplace", href: "/marketplace" }}
              />
            )}
            {!projects.isLoading && projectList.length > 0 && (
              <ProjectSelector
                projects={projectList}
                selectedId={form.selectedProjectId}
                onSelect={handleSelectProject}
                error={form.errors.project}
              />
            )}
          </Card>

          {selectedProject && (
            <>
              <ClientInfoCard
                client={form.client}
                onChange={(patch) => {
                  form.updateClient(patch);
                }}
                autoFilled
                error={form.errors.wallet}
              />

              <InvoiceDetailsSection
                project={selectedProject}
                details={form.details}
                onChange={(patch) => {
                  form.updateDetails(patch);
                }}
                onPricingTypeChange={handlePricingType}
                onMilestoneChange={handleMilestone}
                calculations={form.calculations}
                errors={{
                  amount: form.errors.amount,
                  dueDate: form.errors.dueDate,
                }}
              />

              <SolanaPaymentSection
                clientWallet={form.client.walletAddress}
                freelancerWallet={user?.wallet_address ?? ""}
                amount={form.calculations.total.toFixed(4)}
                currency={form.details.currency}
              />

              {submitError && (
                <p role="alert" className="text-sm text-danger">{submitError}</p>
              )}

              <Button
                size="lg"
                className="w-full sm:w-auto"
                onClick={handleGenerate}
                disabled={submitting}
              >
                <Plus className="h-4 w-4" />
                {submitting ? "Generating…" : "Generate & send invoice"}
              </Button>
            </>
          )}
        </div>

        <div className="xl:col-span-5">
          <InvoicePreviewPanel
            meta={
              selectedProject
                ? form.buildMeta(selectedProject)
                : null
            }
            client={form.client}
            details={form.details}
            calculations={form.calculations}
            freelancerWallet={user?.wallet_address ?? ""}
            freelancerName={user?.title ?? user?.wallet_address ?? ""}
          />
        </div>
      </div>

      {showPipeline && (
        <div className="mt-10 border-t border-border pt-8">
          {invoices.isLoading && <LoadingState />}
          {invoices.error && (
            <ErrorState message={invoices.error} onRetry={invoices.reload} />
          )}
          {!invoices.isLoading && !invoices.error && (invoices.data?.length ?? 0) === 0 && (
            <EmptyState
              title="No invoices yet"
              description="Generate your first invoice to start tracking payment progress."
            />
          )}
          {!invoices.isLoading && (invoices.data?.length ?? 0) > 0 && (
            <InvoiceKanban invoices={invoices.data!} />
          )}
        </div>
      )}
    </div>
  );
}
