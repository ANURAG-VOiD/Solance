import {
  DocsPageHeader,
  Section,
  P,
  Bullets,
  Numbered,
  Callout,
  Code,
} from "@/components/docs/content";

export default function FreelancerGuidePage() {
  return (
    <article>
      <DocsPageHeader
        eyebrow="Overview"
        title="For Freelancers"
        description="Everything you need to find work, collaborate, and get paid to your wallet on Solance."
      />

      <Section title="Creating your profile">
        <P>
          Your profile is your wallet-linked developer card. After your first sign-in you
          are guided to complete it.
        </P>
        <Numbered
          items={[
            <>Open <Code>Profile</Code> from the sidebar.</>,
            "Add a title (your display name) and an avatar.",
            "Write a short bio describing what you build.",
            "Add skills such as Rust, Solana, Anchor, React, or PostgreSQL.",
          ]}
        />
        <Callout type="tip" title="Stand out">
          Profiles with a clear title, a focused skill list, and a concise bio receive more
          responses from clients.
        </Callout>
      </Section>

      <Section title="Applying to jobs">
        <P>
          Browse the Marketplace, open a job that fits, and submit a proposal with your
          cover letter and proposed amount.
        </P>
        <Bullets
          items={[
            "Search and filter by skill, budget, and category.",
            "Tailor each cover letter to the specific job.",
            "Propose a realistic amount in SOL and a delivery timeline.",
          ]}
        />
      </Section>

      <Section title="Messaging clients">
        <P>
          When a client accepts your proposal, a conversation is created automatically. Use
          it to clarify scope, share progress, and agree on milestones — everything stays in
          one thread.
        </P>
      </Section>

      <Section title="Managing work">
        <P>
          Track your active contracts from the Dashboard. Each accepted job shows its status
          so you always know what is in progress and what is awaiting review.
        </P>
      </Section>

      <Section title="Creating invoices">
        <P>
          When a milestone or project is complete, generate an invoice addressed to the
          client&apos;s wallet. The invoice records the amount and moves through a clear
          lifecycle from draft to paid.
        </P>
        <Callout type="info">
          See <a className="text-brand underline" href="/docs/invoicing">Invoicing</a> for the full lifecycle and{" "}
          <a className="text-brand underline" href="/docs/payments">Payments</a> for how settlement works.
        </Callout>
      </Section>

      <Section title="Receiving payments">
        <P>
          Payments settle directly to your wallet in SOL. There is no payout delay and no
          platform escrow cut — once a transaction is confirmed on Solana, the funds are
          yours.
        </P>
      </Section>

      <Section title="Best practices">
        <Bullets
          items={[
            "Keep your profile and skills current.",
            "Respond to messages promptly to build trust.",
            "Agree on scope and milestones before starting.",
            "Invoice consistently as milestones complete.",
            "Verify the client wallet address before sending an invoice.",
          ]}
        />
      </Section>
    </article>
  );
}
