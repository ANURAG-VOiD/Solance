import {
  DocsPageHeader,
  Section,
  P,
  Bullets,
  Numbered,
  Callout,
} from "@/components/docs/content";

export default function ClientGuidePage() {
  return (
    <article>
      <DocsPageHeader
        eyebrow="Overview"
        title="For Clients"
        description="Post work, find verified talent, collaborate, and settle invoices on-chain."
      />

      <Section title="Posting jobs">
        <P>Create a job from the workspace to reach freelancers in the marketplace.</P>
        <Numbered
          items={[
            "Open Post a Job from the sidebar or dashboard.",
            "Add a clear title and a detailed description.",
            "Specify the required skills and a budget in SOL.",
            "Preview, then publish — your job appears in the marketplace.",
          ]}
        />
      </Section>

      <Section title="Reviewing applicants">
        <P>
          Each job collects proposals from freelancers. Review cover letters, proposed
          amounts, and applicant profiles to compare candidates.
        </P>
        <Bullets
          items={[
            "Open a job&apos;s Applicants view to see every proposal.",
            "Inspect each applicant&apos;s wallet-verified profile and skills.",
            "Message a candidate to clarify scope before deciding.",
          ]}
        />
      </Section>

      <Section title="Hiring freelancers">
        <P>
          Accept the proposal that fits best. Accepting creates a conversation between you
          and the freelancer and marks the job as in progress.
        </P>
        <Callout type="info" title="What happens on accept">
          The accepted bid, the task, and a new chat are created together so collaboration
          can start immediately.
        </Callout>
      </Section>

      <Section title="Managing projects">
        <P>
          Track ongoing projects and conversations from your dashboard. Use messaging to
          align on milestones and review deliverables as work progresses.
        </P>
      </Section>

      <Section title="Reviewing invoices">
        <P>
          When a freelancer submits an invoice, it appears in your Invoices view as pending.
          Review the amount and the work delivered before paying.
        </P>
      </Section>

      <Section title="Making payments">
        <P>
          Approve and pay an invoice directly from your wallet. The payment is a standard
          Solana transaction — once confirmed, the invoice is marked paid for both parties.
        </P>
        <Callout type="warning" title="Double-check the recipient">
          Always confirm the freelancer&apos;s wallet address on the invoice before
          authorising a payment. On-chain transactions cannot be reversed.
        </Callout>
      </Section>
    </article>
  );
}
