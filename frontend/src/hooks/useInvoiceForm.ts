"use client";

import { useCallback, useMemo, useState } from "react";

import { useAuth } from "@/context/AuthContext";
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
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [client, setClient] = useState<InvoiceClientDraft>(emptyClient());
  const [details, setDetails] = useState<InvoiceDetailsDraft>(emptyDetails());
  const [errors, setErrors] = useState<InvoiceFormErrors>({});

  const selectProject = useCallback(
    (project: FreelancerProject | null) => {
      if (!project) {
        setSelectedProjectId(null);
        return;
      }
      setSelectedProjectId(project.taskId);
      setClient(clientFromProject(project));
      setDetails(detailsFromProject(project));
      setErrors({});
    },
    [],
  );

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
    if (!selectedProjectId) next.project = "Select a project to continue";
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
  }, [selectedProjectId, details, client.walletAddress]);

  const resetForm = useCallback(() => {
    setSelectedProjectId(null);
    setClient(emptyClient());
    setDetails(emptyDetails());
    setErrors({});
  }, []);

  return {
    selectedProjectId,
    client,
    details,
    errors,
    calculations,
    selectProject,
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
