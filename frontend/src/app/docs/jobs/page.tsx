import {
  DocsPageHeader,
  Section,
  P,
  Callout,
  Flow,
  DocsTable,
  Code,
} from "@/components/docs/content";

export default function JobsDocsPage() {
  return (
    <article>
      <DocsPageHeader
        eyebrow="Platform"
        title="Jobs"
        description="How work moves through Solance — from a draft idea to a completed contract."
      />

      <Section title="Job lifecycle">
        <P>Every job advances through a predictable set of states:</P>
        <Flow
          steps={[
            { title: "Draft", detail: "Job is being prepared and is not yet visible." },
            { title: "Published", detail: "Job is live in the marketplace and open to proposals." },
            { title: "Applications", detail: "Freelancers submit cover letters and amounts." },
            { title: "Accepted", detail: "A proposal is accepted; collaboration begins." },
            { title: "Completed", detail: "Work is delivered and the contract is closed." },
          ]}
        />
        <DocsTable
          head={["State", "Visible to", "Next action"]}
          rows={[
            [<Code key="d">draft</Code>, "Owner only", "Publish"],
            [<Code key="p">published / open</Code>, "Marketplace", "Receive applications"],
            [<Code key="a">in_progress</Code>, "Client & freelancer", "Collaborate, invoice"],
            [<Code key="c">completed</Code>, "Client & freelancer", "Leave feedback (future)"],
            [<Code key="x">cancelled</Code>, "Owner", "Re-post if needed"],
          ]}
        />
      </Section>

      <Section title="Draft">
        <P>
          A draft captures the title, description, required skills, and budget. Nothing is
          visible to freelancers until you publish.
        </P>
      </Section>

      <Section title="Published">
        <P>
          A published job appears in the marketplace where freelancers can search and filter
          for it. This is the <Code>open</Code> state in the API.
        </P>
      </Section>

      <Section title="Applications">
        <P>
          Freelancers submit proposals containing a cover letter and a proposed amount. The
          client reviews all applicants for the job from the Applicants view.
        </P>
        <Callout type="info">
          Accepting a proposal atomically updates the bid, the task, and opens a chat between
          both parties.
        </Callout>
      </Section>

      <Section title="Accepted">
        <P>
          Once a proposal is accepted, the job moves to in-progress and a conversation is
          created. Other proposals for that job are closed.
        </P>
      </Section>

      <Section title="Completed">
        <P>
          After deliverables are approved and the final invoice is paid, the job is marked
          completed and becomes part of both parties&apos; on-chain track record.
        </P>
      </Section>
    </article>
  );
}
