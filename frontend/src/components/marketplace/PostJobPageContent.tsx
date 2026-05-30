"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/shared/ui/Input";
import { Textarea } from "@/components/shared/ui/Textarea";
import { Button } from "@/components/shared/ui/Button";
import { Badge } from "@/components/shared/ui/Badge";
import { Card } from "@/components/shared/ui/Card";
import { createTask } from "@/services/tasks.service";

const STEPS = ["Details", "Budget & Skills", "Review"] as const;
const DEFAULT_SKILLS = ["Rust", "Solana", "Anchor", "React", "PostgreSQL"];

export function PostJobPageContent() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || skills.includes(s)) return;
    setSkills((p) => [...p, s]);
    setSkillInput("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (step < STEPS.length - 1) { setStep((s) => s + 1); return; }
    setSubmitting(true);
    setError(null);
    try {
      await createTask({ title: title.trim(), description: description.trim(), budget: budget.trim() });
      router.push("/jobs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post job");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Post a Project" description="Multi-step job listing for clients" />
      <div className="mb-6 flex gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className={`flex-1 rounded-md border px-3 py-2 text-center text-xs font-medium ${i === step ? "border-brand bg-brand/15 text-brand" : i < step ? "border-border bg-surface-hover" : "border-border text-text-muted"}`}>
            {i + 1}. {label}
          </div>
        ))}
      </div>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 0 && (
            <>
              <h2 className="text-sm font-semibold">Project details</h2>
              <p className="mb-4 text-xs text-text-muted">Describe what you need built</p>
              <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={6} required />
            </>
          )}
          {step === 1 && (
            <>
              <h2 className="text-sm font-semibold">Budget & skills</h2>
              <Input label="Budget (SOL)" value={budget} onChange={(e) => setBudget(e.target.value)} required />
              <Input label="Deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              <div>
                <p className="mb-2 text-sm font-medium">Required skills</p>
                <div className="mb-2 flex flex-wrap gap-1">{skills.map((s) => (
                  <Badge key={s}>{s}<button type="button" onClick={() => setSkills((p) => p.filter((x) => x !== s))}><X className="ml-1 h-3 w-3" /></button></Badge>
                ))}</div>
                <div className="flex gap-2">
                  <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} className="h-9 flex-1 rounded-md border border-border bg-void px-3 text-sm" placeholder="Add skill" />
                  <Button type="button" variant="secondary" onClick={addSkill}>Add</Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">{DEFAULT_SKILLS.filter((s) => !skills.includes(s)).map((s) => (
                  <button key={s} type="button" className="text-xs text-brand" onClick={() => setSkills((p) => [...p, s])}>+ {s}</button>
                ))}</div>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <h2 className="mb-4 text-sm font-semibold">Review</h2>
              <dl className="space-y-2 text-sm">
                <div><dt className="text-text-muted">Title</dt><dd>{title}</dd></div>
                <div><dt className="text-text-muted">Description</dt><dd className="whitespace-pre-wrap text-text-muted">{description}</dd></div>
                <div><dt className="text-text-muted">Budget</dt><dd className="font-semibold text-brand">{budget} SOL</dd></div>
                {deadline && <div><dt className="text-text-muted">Deadline</dt><dd>{deadline}</dd></div>}
                {skills.length > 0 && <div className="flex flex-wrap gap-1">{skills.map((s) => <Badge key={s}>{s}</Badge>)}</div>}
              </dl>
            </>
          )}
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <div className="flex gap-2">
            {step > 0 && <Button type="button" variant="secondary" onClick={() => setStep((s) => s - 1)}>Back</Button>}
            <Button type="submit" disabled={submitting}>{step < STEPS.length - 1 ? "Continue" : submitting ? "Posting…" : "Post project"}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
