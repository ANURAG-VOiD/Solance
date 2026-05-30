import { EmptyState } from "@/components/shared/states/EmptyState";

export function FeaturedTalent() {
  return (
    <section id="talent" className="py-16">
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand">Live Feed</p>
        <h2 className="text-xl font-semibold">Featured Talent</h2>
        <div className="mt-8">
          <EmptyState
            title="Talent feed coming soon"
            description="We are shipping a backend-powered featured talent API so this section reflects real, verified profiles."
          />
        </div>
      </div>
    </section>
  );
}
