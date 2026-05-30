"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BadgeCheck, Sparkles, Upload } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/shared/ui/Input";
import { Textarea } from "@/components/shared/ui/Textarea";
import { Button } from "@/components/shared/ui/Button";
import { Badge } from "@/components/shared/ui/Badge";
import { Card } from "@/components/shared/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "@/services/users.service";
import { avatarUrlFromCid, truncateWallet } from "@/lib/utils";

const SUGGESTED_SKILLS = ["Rust", "Solana", "Anchor", "React", "PostgreSQL"];

export function ProfilePageContent() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Set during first-time onboarding by AuthContext.signIn. `next` holds the
  // route the visitor was originally headed to (e.g. /jobs/new).
  const isOnboarding = searchParams.get("onboarding") === "1";
  const nextRoute = searchParams.get("next");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [avatarCid, setAvatarCid] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    setTitle(user.title ?? "");
    setBio(user.bio ?? "");
    setSkills(user.skills ?? []);
    setAvatarCid(user.avatar_cid ?? "");
  }, [user]);

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || skills.includes(s)) return;
    setSkills((p) => [...p, s]);
    setSkillInput("");
  };

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarCid(`bafy${Date.now().toString(36)}${file.name.slice(0, 6)}`);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await updateProfile({ title: title.trim() || undefined, bio: bio.trim() || undefined, skills: skills.length ? skills : undefined, avatar_cid: avatarCid.trim() || undefined });
      await refreshUser();
      setSuccess(true);
      // After onboarding, continue to the route the visitor originally wanted
      // (e.g. post a job); otherwise drop them into their dashboard.
      if (isOnboarding) {
        router.push(nextRoute ?? "/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const avatarUrl = avatarUrlFromCid(avatarCid);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={isOnboarding ? "Welcome to Solance" : "My Profile"}
        description={
          isOnboarding
            ? "Set up your profile so clients and freelancers know who they're working with."
            : "LinkedIn-style developer card linked to your wallet"
        }
      />

      {isOnboarding && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-brand/20 bg-brand/5 p-4">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          <div>
            <p className="text-sm font-semibold">Your wallet is connected — finish your profile</p>
            <p className="mt-0.5 text-sm text-text-muted">
              Add a name, avatar and skills. {nextRoute ? "We'll take you to the next step right after." : "You can update these anytime."}
            </p>
          </div>
        </div>
      )}

      <Card className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-void">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-semibold text-brand">{user?.wallet_address.slice(0, 2).toUpperCase() ?? "?"}</span>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-border bg-surface-hover">
              <Upload className="h-3.5 w-3.5" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            </label>
          </div>
          <div>
            <h2 className="text-lg font-semibold">{title || "Developer Profile"}</h2>
            <p className="font-mono text-sm text-text-muted">{user ? truncateWallet(user.wallet_address) : "—"}</p>
            <Badge variant="brand" className="mt-2"><BadgeCheck className="h-3 w-3" /> Wallet Verified</Badge>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-md border border-border bg-surface p-4">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Rust Developer" />
        <Textarea label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={5} />
        <Input label="Avatar CID (IPFS/Pinata)" value={avatarCid} onChange={(e) => setAvatarCid(e.target.value)} hint="Content hash for profile image" />
        <div>
          <p className="mb-2 text-sm font-medium">Skills</p>
          <div className="mb-2 flex flex-wrap gap-1">{skills.map((s) => (
            <Badge key={s}>{s}<button type="button" className="ml-1" aria-label={`Remove ${s}`} onClick={() => setSkills((p) => p.filter((x) => x !== s))}>×</button></Badge>
          ))}</div>
          <div className="flex gap-2">
            <input aria-label="Skill" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} className="h-9 flex-1 rounded-md border border-border bg-void px-3 text-sm" placeholder="Add skill" />
            <Button type="button" variant="secondary" onClick={addSkill}>Add</Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">{SUGGESTED_SKILLS.filter((s) => !skills.includes(s)).map((s) => (
            <button key={s} type="button" className="text-xs text-brand hover:underline" onClick={() => setSkills((p) => [...p, s])}>+ {s}</button>
          ))}</div>
        </div>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        {success && <p className="text-sm text-success">Profile saved.</p>}
        <Button type="submit" disabled={saving}>
          {saving
            ? "Saving…"
            : isOnboarding
              ? nextRoute
                ? "Save & continue"
                : "Save & go to dashboard"
              : "Save profile"}
        </Button>
      </form>
    </div>
  );
}
