"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Menu, ChevronRight } from "lucide-react";

import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { DocsTOC, MobileTOC } from "@/components/docs/DocsTOC";
import { DocsSearch } from "@/components/docs/DocsSearch";

const GITHUB_URL = "https://github.com/ANURAG-VOiD/Solance";

// lucide-react v1 dropped brand glyphs, so the GitHub mark is inlined here.
function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .5C5.73.5.67 5.57.67 11.85c0 5.02 3.25 9.28 7.76 10.79.57.1.78-.25.78-.55v-2.1c-3.16.69-3.83-1.34-3.83-1.34-.52-1.31-1.27-1.66-1.27-1.66-1.03-.71.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.74 2.66 1.24 3.31.95.1-.73.4-1.24.72-1.52-2.52-.29-5.18-1.26-5.18-5.62 0-1.24.44-2.26 1.17-3.06-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.15 1.17a10.9 10.9 0 0 1 5.74 0c2.18-1.48 3.14-1.17 3.14-1.17.62 1.57.23 2.73.11 3.02.73.8 1.17 1.82 1.17 3.06 0 4.37-2.67 5.33-5.2 5.61.41.36.78 1.06.78 2.14v3.17c0 .31.21.66.79.55a11.36 11.36 0 0 0 7.75-10.79C23.33 5.57 18.27.5 12 .5Z" />
    </svg>
  );
}

/*
 * DocsLayout — the documentation shell: a sticky top header (logo, search,
 * GitHub, Launch App) over a three-column body (left nav, readable content,
 * right table of contents). The sidebar collapses into a drawer on mobile and
 * the TOC tucks behind a disclosure.
 */
export function DocsLayout({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-void text-text">
      <header className="sticky top-0 z-40 border-b border-border bg-void/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="Open documentation menu"
            className="rounded-md p-2 text-text-muted hover:bg-surface-hover lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-solana text-sm font-bold text-white">
              S
            </span>
            <span className="hidden text-base font-semibold tracking-tight sm:block">
              Solance
            </span>
            <span className="hidden rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-text-muted sm:block">
              Docs
            </span>
          </Link>

          <div className="flex flex-1 justify-center px-2">
            <DocsSearch />
          </div>

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-text-muted transition-colors hover:text-text sm:flex"
          >
            <GithubMark className="h-4 w-4" />
          </a>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 rounded-full bg-brand px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-brand-hover"
          >
            Launch App
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] gap-8 px-4 sm:px-6">
        <DocsSidebar open={navOpen} onClose={() => setNavOpen(false)} />

        <main className="min-w-0 flex-1 py-10">
          <div id="docs-main" className="mx-auto max-w-[850px]">
            <MobileTOC />
            {children}
          </div>
        </main>

        <DocsTOC />
      </div>
    </div>
  );
}
