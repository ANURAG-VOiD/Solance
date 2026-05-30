"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { List } from "lucide-react";

import { cn } from "@/lib/utils";

interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * Scans the rendered docs content for h2/h3[id] headings and tracks the active
 * one via IntersectionObserver. Re-scans on route change. Shared by the desktop
 * TOC aside and the mobile disclosure so the logic lives in one place.
 */
function useHeadings(): { headings: Heading[]; activeId: string } {
  const pathname = usePathname();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const root = document.getElementById("docs-main");
    if (!root) return;

    const nodes = Array.from(root.querySelectorAll<HTMLElement>("h2[id], h3[id]"));
    const found: Heading[] = nodes.map((node) => ({
      id: node.id,
      text: node.textContent ?? "",
      level: node.tagName === "H2" ? 2 : 3,
    }));
    setHeadings(found);
    setActiveId(found[0]?.id ?? "");

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [pathname]);

  return { headings, activeId };
}

function TocLinks({
  headings,
  activeId,
  onNavigate,
}: {
  headings: Heading[];
  activeId: string;
  onNavigate?: () => void;
}) {
  return (
    <ul className="space-y-1.5 text-sm">
      {headings.map((h) => (
        <li key={h.id} className={cn(h.level === 3 && "pl-3")}>
          <a
            href={`#${h.id}`}
            onClick={onNavigate}
            className={cn(
              "block border-l-2 py-0.5 pl-3 transition-colors",
              activeId === h.id
                ? "border-brand font-medium text-brand"
                : "border-transparent text-text-muted hover:text-text",
            )}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Desktop right-hand table of contents (sticky). */
export function DocsTOC() {
  const { headings, activeId } = useHeadings();
  if (headings.length === 0) return null;

  return (
    <aside className="hidden w-56 shrink-0 xl:block">
      <div className="sticky top-24 py-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
          On this page
        </p>
        <nav aria-label="Table of contents">
          <TocLinks headings={headings} activeId={activeId} />
        </nav>
      </div>
    </aside>
  );
}

/** Mobile / tablet table of contents, tucked behind a disclosure button. */
export function MobileTOC() {
  const { headings, activeId } = useHeadings();
  const [open, setOpen] = useState(false);
  if (headings.length === 0) return null;

  return (
    <div className="mb-8 rounded-2xl border border-border bg-surface xl:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-text"
      >
        <List className="h-4 w-4 text-text-muted" />
        On this page
      </button>
      {open && (
        <nav aria-label="Table of contents" className="border-t border-border px-3 py-3">
          <TocLinks headings={headings} activeId={activeId} onNavigate={() => setOpen(false)} />
        </nav>
      )}
    </div>
  );
}
