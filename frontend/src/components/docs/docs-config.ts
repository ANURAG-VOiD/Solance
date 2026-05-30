/**
 * Central docs configuration: the sidebar navigation tree and a flat,
 * client-side search index. Both the sidebar and search consume this so the
 * navigation stays in sync with a single source of truth.
 */

import type { LucideIcon } from "lucide-react";
import {
  Rocket,
  UserRound,
  Building2,
  KeyRound,
  Briefcase,
  MessagesSquare,
  ReceiptText,
  Wallet,
  ShieldCheck,
  HelpCircle,
  Boxes,
  Code2,
} from "lucide-react";

export interface DocsNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Short blurb shown on cards and search results. */
  description: string;
  /** Section headings on the page — powers search + relevance. */
  sections: string[];
}

export interface DocsNavGroup {
  label: string;
  items: DocsNavItem[];
}

export const DOCS_NAV: DocsNavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Getting Started",
        href: "/docs/getting-started",
        icon: Rocket,
        description: "What Solance is, how it works, and the end-to-end workflow.",
        sections: [
          "What is Solance",
          "How Solance Works",
          "Wallet-Based Identity",
          "Platform Overview",
          "Quick Start",
        ],
      },
      {
        title: "For Freelancers",
        href: "/docs/freelancers",
        icon: UserRound,
        description: "Create a profile, apply to jobs, and get paid to your wallet.",
        sections: [
          "Creating your profile",
          "Applying to jobs",
          "Messaging clients",
          "Managing work",
          "Creating invoices",
          "Receiving payments",
          "Best practices",
        ],
      },
      {
        title: "For Clients",
        href: "/docs/clients",
        icon: Building2,
        description: "Post jobs, review applicants, and settle invoices on-chain.",
        sections: [
          "Posting jobs",
          "Reviewing applicants",
          "Hiring freelancers",
          "Managing projects",
          "Reviewing invoices",
          "Making payments",
        ],
      },
    ],
  },
  {
    label: "Platform",
    items: [
      {
        title: "Wallet Authentication",
        href: "/docs/wallet-authentication",
        icon: KeyRound,
        description: "Passwordless sign-in with nonce generation and message signing.",
        sections: [
          "Wallet login flow",
          "Nonce generation",
          "Message signing",
          "Verification",
          "Session creation",
        ],
      },
      {
        title: "Jobs",
        href: "/docs/jobs",
        icon: Briefcase,
        description: "The job lifecycle from draft to completed.",
        sections: [
          "Job lifecycle",
          "Draft",
          "Published",
          "Applications",
          "Accepted",
          "Completed",
        ],
      },
      {
        title: "Collaboration",
        href: "/docs/collaboration",
        icon: MessagesSquare,
        description: "Real-time messaging, conversations, and notifications.",
        sections: [
          "Messaging system",
          "Conversations",
          "Notifications",
          "Attachments",
          "Communication workflow",
        ],
      },
      {
        title: "Invoicing",
        href: "/docs/invoicing",
        icon: ReceiptText,
        description: "Create invoices, track payments, and review history.",
        sections: [
          "Invoice creation",
          "Invoice states",
          "Payment tracking",
          "Invoice history",
        ],
      },
      {
        title: "Payments",
        href: "/docs/payments",
        icon: Wallet,
        description: "Solana payments, confirmations, and the future escrow system.",
        sections: [
          "Solana payments",
          "Transaction confirmations",
          "Wallet interactions",
          "Future escrow system",
        ],
      },
    ],
  },
  {
    label: "Resources",
    items: [
      {
        title: "Security",
        href: "/docs/security",
        icon: ShieldCheck,
        description: "Wallet security, signature verification, and data protection.",
        sections: [
          "Wallet security",
          "Signature verification",
          "Authentication",
          "Data protection",
          "Best practices",
        ],
      },
      {
        title: "FAQ",
        href: "/docs/faq",
        icon: HelpCircle,
        description: "Answers to the most common questions about Solance.",
        sections: ["Accounts & wallets", "Jobs & applications", "Invoices & payments", "Security"],
      },
      {
        title: "Architecture",
        href: "/docs/architecture",
        icon: Boxes,
        description: "How the frontend, backend, database, and Solana fit together.",
        sections: ["System overview", "Frontend", "Backend", "Database", "Blockchain"],
      },
      {
        title: "API Reference",
        href: "/docs/api-reference",
        icon: Code2,
        description: "Authentication endpoints and resource APIs with examples.",
        sections: ["Conventions", "Authentication", "Users", "Jobs", "Applications", "Chats", "Messages", "Invoices"],
      },
    ],
  },
];

/** Flattened list of every nav item (handy for cards and search). */
export const DOCS_ITEMS: DocsNavItem[] = DOCS_NAV.flatMap((group) => group.items);

export interface DocsSearchEntry {
  title: string;
  href: string;
  /** What kind of match this is — a page or a section within a page. */
  kind: "page" | "section";
  /** Parent page title (for sections). */
  page: string;
  description?: string;
}

/**
 * Build a flat search index of pages + their sections. Sections deep-link to
 * the matching heading anchor on the page (ids are slugified consistently).
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const DOCS_SEARCH_INDEX: DocsSearchEntry[] = DOCS_ITEMS.flatMap((item) => {
  const pageEntry: DocsSearchEntry = {
    title: item.title,
    href: item.href,
    kind: "page",
    page: item.title,
    description: item.description,
  };
  const sectionEntries: DocsSearchEntry[] = item.sections.map((section) => ({
    title: section,
    href: `${item.href}#${slugify(section)}`,
    kind: "section",
    page: item.title,
  }));
  return [pageEntry, ...sectionEntries];
});
