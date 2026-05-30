import type { Metadata } from "next";
import { DocsLayout } from "@/components/docs/DocsLayout";

export const metadata: Metadata = {
  title: "Documentation · Solance",
  description: "Everything you need to understand, use, and build with Solance.",
};

export default function DocsRouteLayout({ children }: { children: React.ReactNode }) {
  return <DocsLayout>{children}</DocsLayout>;
}
