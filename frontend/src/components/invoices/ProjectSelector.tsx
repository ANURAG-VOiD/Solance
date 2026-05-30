"use client";

import { useMemo, useState } from "react";
import { Search, Briefcase, CheckCircle2 } from "lucide-react";

import type { FreelancerProject } from "@/types/invoice";
import { formatSol, truncateWallet, cn } from "@/lib/utils";
import { Badge } from "@/components/shared/ui/Badge";

interface ProjectSelectorProps {
  projects: FreelancerProject[];
  selectedId: string | null;
  onSelect: (project: FreelancerProject) => void;
  error?: string;
}

export function ProjectSelector({
  projects,
  selectedId,
  onSelect,
  error,
}: ProjectSelectorProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.task.title.toLowerCase().includes(q) ||
        p.task.description.toLowerCase().includes(q) ||
        p.clientWallet.toLowerCase().includes(q),
    );
  }, [projects, query]);

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="project-search" className="mb-1.5 block text-sm font-medium">
          Select project
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden />
          <input
            id="project-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, client wallet…"
            className="h-10 w-full rounded-md border border-border bg-void pl-9 pr-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        {error && <p role="alert" className="mt-1 text-xs text-danger">{error}</p>}
      </div>

      <ul className="max-h-64 space-y-2 overflow-y-auto" role="listbox" aria-label="Active projects">
        {filtered.length === 0 && (
          <li className="rounded-md border border-dashed border-border px-3 py-4 text-sm text-text-muted">
            No projects match your search.
          </li>
        )}
        {filtered.map((project) => {
          const selected = selectedId === project.taskId;
          return (
            <li key={project.taskId}>
              <button
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => onSelect(project)}
                className={cn(
                  "w-full rounded-md border px-3 py-3 text-left transition-colors",
                  selected
                    ? "border-brand bg-brand/10 ring-1 ring-brand/30"
                    : "border-border bg-void hover:border-brand/40 hover:bg-surface-hover",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{project.task.title}</p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      Client {truncateWallet(project.clientWallet)}
                    </p>
                  </div>
                  <Badge variant={project.task.status === "in_progress" ? "brand" : "success"}>
                    {project.task.status.replace("_", " ")}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-text-muted">
                    <Briefcase className="h-3 w-3" />
                    {formatSol(project.agreedAmount)} agreed
                  </span>
                  {selected && <CheckCircle2 className="h-4 w-4 text-brand" />}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
