import type { Bid, Task } from "@/types";

export type InvoicePricingType = "fixed" | "milestone" | "custom";

/**
 * Drives the invoice workspace: "idle" before anything is started, "project"
 * when invoicing an accepted job, or "blank" for a from-scratch invoice.
 */
export type InvoiceFormMode = "idle" | "project" | "blank";

export interface FreelancerProject {
  taskId: string;
  task: Task;
  bid: Bid;
  /** Agreed amount from accepted bid */
  agreedAmount: string;
  clientWallet: string;
}

export interface InvoiceClientDraft {
  name: string;
  walletAddress: string;
  email: string;
  companyName: string;
  billingAddress: string;
}

export interface InvoiceDetailsDraft {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  amount: string;
  taxPercent: string;
  discountPercent: string;
  notes: string;
  paymentTerms: string;
  pricingType: InvoicePricingType;
  milestonePercent: string;
  lineItemDescription: string;
}

export interface InvoiceDraftMeta {
  projectId: string;
  projectTitle: string;
  projectDescription: string;
  projectStatus: string;
  projectStartDate: string;
  projectBudget: string;
  client: InvoiceClientDraft;
  details: InvoiceDetailsDraft;
  freelancerWallet: string;
  freelancerName: string;
}

export interface InvoiceFormErrors {
  project?: string;
  amount?: string;
  wallet?: string;
  dueDate?: string;
}
