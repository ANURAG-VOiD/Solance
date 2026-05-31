"use client";

import { useCallback, useMemo, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { fetchUserByWallet } from "@/services/users.service";
import {
  defaultDueDate,
  generateInvoiceNumber,
  todayIso,
} from "@/lib/invoice-storage";
import { truncateWallet } from "@/lib/utils";
import type {
  FreelancerProject,
  InvoiceClientDraft,
  InvoiceDetailsDraft,
  InvoiceDraftMeta,
  InvoiceFormErrors,
  InvoiceFormMode,
  InvoicePricingType,
} from "@/types/invoice";

function emptyClient(): InvoiceClientDraft {
  return {
    name: "",
    walletAddress: "",
    email: "",
    companyName: "",
    billingAddress: "",
  };
}

function emptyDetails(): InvoiceDetailsDraft {
  return {
    invoiceNumber: generateInvoiceNumber(),
    issueDate: todayIso(),
    dueDate: defaultDueDate(),
    currency: "SOL",
    amount: "",
    taxPercent: "0",
    discountPercent: "0",
    notes: "",
    paymentTerms: "Net 14 — payment due upon milestone acceptance via Solana.",
    pricingType: "fixed",
    milestonePercent: "100",
    lineItemDescription: "",
  };
}

/**
 * Blank invoices have no agreed project amount, so they default to the "custom"
 * pricing type with an empty, user-entered amount.
 */
function blankDetails(): InvoiceDetailsDraft {
  return {
    ...emptyDetails(),
    pricingType: "custom",
  };
}

function clientFromProject(project: FreelancerProject): InvoiceClientDraft {
  return {
    name: truncateWallet(project.clientWallet, 6),
    walletAddress: project.clientWallet,
    email: "",
    companyName: "",
    billingAddress: "",
  };
}

function detailsFromProject(project: FreelancerProject): InvoiceDetailsDraft {
  return {
    ...emptyDetails(),
    amount: project.agreedAmount,
    lineItemDescription: project.task.description.slice(0, 500),
    invoiceNumber: generateInvoiceNumber(),
  };
}

export function useInvoiceForm() {
  const { user } = useAuth();
  // "idle" → nothing started; "project" → invoicing an accepted job;
  // "blank" → a from-scratch invoice with manually entered details.
  const [mode, setMode] = useState<InvoiceFormMode>("idle");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [client, setClient] = useState<InvoiceClientDraft>(emptyClient());
  const [details, setDetails] = useState<InvoiceDetailsDraft>(emptyDetails());
  const [errors, setErrors] = useState<InvoiceFormErrors>({});

  const selectProject = useCallback(
    (project: FreelancerProject | null) => {
      if (!project) {
        setSelectedProjectId(null);
        setMode("idle");
        return;
      }
      setMode("project");
      setSelectedProjectId(project.taskId);
      const baseClient = clientFromProject(project);
      setClient(baseClient);
      setDetails(detailsFromProject(project));
      setErrors({});

      // Enrich the auto-filled client name with their on-chain profile title.
      // Falls back silently to the truncated wallet when the client has no
      // profile (404) or the lookup fails.
      void fetchUserByWallet(project.clientWallet)
        .then((clientUser) => {
          const title = clientUser?.title?.trim();
          if (!title) return;
          setClient((prev) =>
            // Only replace the auto-filled placeholder — never a name the user
            // has manually edited — and only if this is still the same client.
            prev.walletAddress === project.clientWallet &&
            prev.name === baseClient.name
              ? { ...prev, name: title }
              : prev,
          );
        })
        .catch(() => {
          // Keep the truncated-wallet fallback on any lookup error.
        });
    },
    [],
  );

  // Start a blank, from-scratch invoice: clears any selected project and resets
  // to empty client + details so the user can fill everything in manually.
  const startBlank = useCallback(() => {
    setMode("blank");
    setSelectedProjectId(null);
    setClient(emptyClient());
    setDetails(blankDetails());
    setErrors({});
  }, []);

  const updateClient = useCallback((patch: Partial<InvoiceClientDraft>) => {
    setClient((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateDetails = useCallback((patch: Partial<InvoiceDetailsDraft>) => {
    setDetails((prev) => ({ ...prev, ...patch }));
  }, []);

  const setPricingType = useCallback(
    (type: InvoicePricingType, agreedAmount: string) => {
      setDetails((prev) => {
        let amount = prev.amount;
        if (type === "fixed") amount = agreedAmount;
        if (type === "milestone") {
          const pct = parseFloat(prev.milestonePercent) || 100;
          amount = ((parseFloat(agreedAmount) || 0) * (pct / 100)).toFixed(6).replace(/\.?0+$/, "");
        }
        return { ...prev, pricingType: type, amount };
      });
    },
    [],
  );

  const setMilestonePercent = useCallback((pct: string, agreedAmount: string) => {
    setDetails((prev) => {
      const amount = ((parseFloat(agreedAmount) || 0) * ((parseFloat(pct) || 0) / 100))
        .toFixed(6)
        .replace(/\.?0+$/, "");
      return { ...prev, milestonePercent: pct, amount, pricingType: "milestone" };
    });
  }, []);

  const calculations = useMemo(() => {
    const subtotal = parseFloat(details.amount) || 0;
    const taxPct = parseFloat(details.taxPercent) || 0;
    const discPct = parseFloat(details.discountPercent) || 0;
    const taxAmount = subtotal * (taxPct / 100);
    const discountAmount = subtotal * (discPct / 100);
    const total = Math.max(0, subtotal + taxAmount - discountAmount);
    return { subtotal, taxAmount, discountAmount, total, taxPct, discPct };
  }, [details.amount, details.taxPercent, details.discountPercent]);

  const buildMeta = useCallback(
    (project: FreelancerProject): InvoiceDraftMeta => ({
      projectId: project.taskId,
      projectTitle: project.task.title,
      projectDescription: project.task.description,
      projectStatus: project.task.status,
      projectStartDate: project.task.created_at,
      projectBudget: project.task.budget,
      client,
      details,
      freelancerWallet: user?.wallet_address ?? "",
      freelancerName: user?.title ?? truncateWallet(user?.wallet_address ?? "", 6),
    }),
    [client, details, user],
  );

  const persistDraft = useCallback(() => {
    // Draft persistence is intentionally disabled to avoid stale client-only state.
  }, []);

  const validate = useCallback((): boolean => {
    const next: InvoiceFormErrors = {};
    // A project is only required in project mode; blank invoices need none.
    if (mode === "project" && !selectedProjectId) {
      next.project = "Select a project to continue";
    }
    const amount = parseFloat(details.amount);
    if (!details.amount.trim() || Number.isNaN(amount) || amount <= 0) {
      next.amount = "Enter a valid amount greater than zero";
    }
    if (!client.walletAddress.trim()) {
      next.wallet = "Client wallet address is required";
    }
    if (details.dueDate && details.issueDate && details.dueDate < details.issueDate) {
      next.dueDate = "Due date must be on or after issue date";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [mode, selectedProjectId, details, client.walletAddress]);

  const resetForm = useCallback(() => {
    setMode("idle");
    setSelectedProjectId(null);
    setClient(emptyClient());
    setDetails(emptyDetails());
    setErrors({});
  }, []);

  return {
    mode,
    selectedProjectId,
    client,
    details,
    errors,
    calculations,
    selectProject,
    startBlank,
    updateClient,
    updateDetails,
    setPricingType,
    setMilestonePercent,
    buildMeta,
    persistDraft,
    validate,
    resetForm,
  };
}
