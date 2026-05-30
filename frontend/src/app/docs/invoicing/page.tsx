import {
  DocsPageHeader,
  Section,
  P,
  Bullets,
  Callout,
  Flow,
  DocsTable,
  Code,
} from "@/components/docs/content";

export default function InvoicingDocsPage() {
  return (
    <article>
      <DocsPageHeader
        eyebrow="Platform"
        title="Invoicing"
        description="Create invoices between wallets and track them through a transparent lifecycle."
      />

      <Section title="Invoice creation">
        <P>
          A freelancer creates an invoice addressed to the client&apos;s wallet, specifying
          the amount in SOL. Invoices reference the engagement so both parties share the same
          record.
        </P>
        <Callout type="warning" title="Verify the recipient">
          Confirm the receiver wallet address before sending — on-chain payments are final.
        </Callout>
      </Section>

      <Section title="Invoice states">
        <P>Invoices move through the following lifecycle:</P>
        <Flow
          steps={[
            { title: "Draft", detail: "Being prepared by the freelancer." },
            { title: "Sent", detail: "Delivered to the client for review." },
            { title: "Pending", detail: "Awaiting on-chain payment." },
            { title: "Paid", detail: "Payment confirmed on Solana." },
          ]}
        />
        <DocsTable
          head={["Status", "Meaning"]}
          rows={[
            [<Code key="d">draft</Code>, "Created but not yet sent."],
            [<Code key="p">pending</Code>, "Sent and awaiting payment."],
            [<Code key="paid">paid</Code>, "Settled — transaction confirmed."],
            [<Code key="r">rejected</Code>, "Declined by the client."],
            [<Code key="c">cancelled</Code>, "Withdrawn by the sender."],
          ]}
        />
      </Section>

      <Section title="Payment tracking">
        <P>
          Both client and freelancer can see an invoice&apos;s current status in real time.
          When payment is confirmed, the status flips to paid and a notification is sent.
        </P>
        <Bullets
          items={[
            "Clients see invoices awaiting their payment.",
            "Freelancers see which invoices are still pending.",
            "Status changes are reflected for both parties immediately.",
          ]}
        />
      </Section>

      <Section title="Invoice history">
        <P>
          Every invoice is retained, giving both parties a durable financial record of the
          engagement — useful for accounting and for building a verifiable track record.
        </P>
      </Section>
    </article>
  );
}
