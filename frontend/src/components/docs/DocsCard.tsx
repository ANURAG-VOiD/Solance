"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

/*
 * DocsCard — a quick-action / category card for the docs homepage.
 * Subtle hover elevation via Motion; matches the platform's white-card style.
 */
export function DocsCard({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Link href={href} className="group block h-full">
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="flex h-full flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md"
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-hover">
            <Icon className="h-5 w-5 text-brand" />
          </span>
          <ArrowUpRight className="h-4 w-4 text-text-muted transition-colors group-hover:text-brand" />
        </div>
        <h3 className="text-base font-semibold text-text">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{description}</p>
      </motion.div>
    </Link>
  );
}
