"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft, FileText, Hash } from "lucide-react";

import { cn } from "@/lib/utils";
import { DOCS_SEARCH_INDEX, type DocsSearchEntry } from "@/components/docs/docs-config";

const MAX_RESULTS = 8;

/** Highlights every case-insensitive occurrence of `query` within `text`. */
function highlight(text: string, query: string) {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, "ig"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="rounded bg-brand/15 text-brand">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/*
 * DocsSearch — fully client-side documentation search over the static index in
 * docs-config. Filters pages + sections, highlights matches, and navigates with
 * client-side routing (no refresh). Keyboard: ⌘/Ctrl-K to focus, Esc to close.
 */
export function DocsSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo<DocsSearchEntry[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return DOCS_SEARCH_INDEX.filter((entry) => {
      const haystack = `${entry.title} ${entry.page} ${entry.description ?? ""}`.toLowerCase();
      return haystack.includes(q);
    }).slice(0, MAX_RESULTS);
  }, [query]);

  useEffect(() => setActiveIndex(0), [query]);

  // Close on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Global ⌘/Ctrl-K to focus search.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function go(entry: DocsSearchEntry) {
    router.push(entry.href);
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  }

  function onInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      go(results[activeIndex]);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="flex h-9 items-center gap-2 rounded-full border border-border bg-surface px-3 text-sm">
        <Search className="h-4 w-4 text-text-muted" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onInputKeyDown}
          placeholder="Search documentation…"
          aria-label="Search documentation"
          className="w-full bg-transparent text-text placeholder:text-text-muted focus:outline-none"
        />
        <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-text-muted sm:block">
          ⌘K
        </kbd>
      </div>

      {open && query.trim() && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-surface shadow-lg">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-text-muted">
              No results for “{query}”
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((entry, i) => (
                <li key={`${entry.href}-${i}`}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => go(entry)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm",
                      i === activeIndex ? "bg-surface-hover" : "hover:bg-surface-hover",
                    )}
                  >
                    {entry.kind === "page" ? (
                      <FileText className="h-4 w-4 shrink-0 text-text-muted" />
                    ) : (
                      <Hash className="h-4 w-4 shrink-0 text-text-muted" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-text">{highlight(entry.title, query)}</span>
                      {entry.kind === "section" && (
                        <span className="block truncate text-xs text-text-muted">{entry.page}</span>
                      )}
                    </span>
                    {i === activeIndex && (
                      <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
