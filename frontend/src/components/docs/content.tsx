/**
 * Documentation content primitives — the typographic building blocks used by
 * every docs page (headings, callouts, code blocks, tables, workflows).
 * Headings derive stable slug ids so the right-hand TOC and search anchors
 * resolve to the same target. Presentational only (safe as server components).
 */

import type { ReactNode } from "react";
import { ChevronDown, Info, Lightbulb, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import { slugify } from "@/components/docs/docs-config";

export function DocsPageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-10 border-b border-border pb-8">
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-4xl font-semibold tracking-tight text-text">
        {title}
      </h1>
      {description && (
        <p className="mt-3 text-lg leading-relaxed text-text-muted">{description}</p>
      )}
    </header>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="scroll-mt-28 pt-10 first:pt-0">
      <h2
        id={slugify(title)}
        className="font-display text-2xl font-semibold tracking-tight text-text"
      >
        {title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export function SubSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="scroll-mt-28 pt-6">
      <h3
        id={slugify(title)}
        className="text-lg font-semibold tracking-tight text-text"
      >
        {title}
      </h3>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p className="text-[15px] leading-7 text-slate-600">{children}</p>;
}

export function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-md border border-border bg-surface-hover px-1.5 py-0.5 font-mono text-[13px] text-text">
      {children}
    </code>
  );
}

export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-[15px] leading-7 text-slate-600">
          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand/50" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function Numbered({ items }: { items: ReactNode[] }) {
  return (
    <ol className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-[15px] leading-7 text-slate-600">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand">
            {i + 1}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

const CALLOUT_STYLES = {
  info: { icon: Info, ring: "border-blue-200 bg-blue-50/60", tone: "text-blue-600" },
  tip: { icon: Lightbulb, ring: "border-emerald-200 bg-emerald-50/60", tone: "text-emerald-600" },
  warning: { icon: TriangleAlert, ring: "border-amber-200 bg-amber-50/60", tone: "text-amber-600" },
} as const;

export function Callout({
  type = "info",
  title,
  children,
}: {
  type?: keyof typeof CALLOUT_STYLES;
  title?: string;
  children: ReactNode;
}) {
  const { icon: Icon, ring, tone } = CALLOUT_STYLES[type];
  return (
    <div className={cn("flex gap-3 rounded-2xl border p-4", ring)}>
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", tone)} />
      <div className="text-sm leading-6 text-slate-700">
        {title && <p className="mb-1 font-semibold text-text">{title}</p>}
        {children}
      </div>
    </div>
  );
}

export function CodeBlock({
  code,
  language = "bash",
}: {
  code: string;
  language?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#1c2540] bg-[#0c1326]">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
          {language}
        </span>
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
        </div>
      </div>
      <pre className="overflow-x-auto px-4 py-4 text-[13px] leading-6">
        <code className="font-mono text-slate-200">{code}</code>
      </pre>
    </div>
  );
}

export function DocsTable({
  head,
  rows,
}: {
  head: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-hover">
            {head.map((h) => (
              <th key={h} className="px-4 py-2.5 font-semibold text-text">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 align-top text-slate-600">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Vertical workflow with connecting chevrons (e.g. job lifecycle). */
export function Flow({ steps }: { steps: { title: string; detail?: string }[] }) {
  return (
    <div className="flex flex-col items-stretch gap-0">
      {steps.map((step, i) => (
        <div key={step.title}>
          <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <p className="text-sm font-semibold text-text">{step.title}</p>
            {step.detail && <p className="mt-1 text-sm text-text-muted">{step.detail}</p>}
          </div>
          {i < steps.length - 1 && (
            <div className="flex justify-center py-2" aria-hidden="true">
              <ChevronDown className="h-4 w-4 text-text-muted" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
