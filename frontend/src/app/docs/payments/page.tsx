import {
  DocsPageHeader,
  Section,
  P,
  Bullets,
  Callout,
} from "@/components/docs/content";

export default function PaymentsDocsPage() {
  return (
    <article>
      <DocsPageHeader
        eyebrow="Platform"
        title="Payments"
        description="Payments on Solance are native Solana transactions settled directly between wallets."
      />

      <Section title="Solana payments">
        <P>
          Settlement happens in SOL on the Solana network. Because payments go wallet-to-
          wallet, there is no platform escrow cut and no payout delay — when a transaction
          confirms, the funds are in the recipient&apos;s wallet.
        </P>
        <Bullets
          items={[
            "Low fees and fast finality on Solana.",
            "No intermediary holds your funds.",
            "Payments are tied to invoices for a clear record.",
          ]}
        />
      </Section>

      <Section title="Transaction confirmations">
        <P>
          A payment is authorised in your wallet and broadcast to the network. Once the
          transaction reaches a confirmed state, Solance updates the related invoice to paid.
        </P>
        <Callout type="info" title="Finality">
          Solana transactions are irreversible once confirmed. Review the amount and
          recipient before approving.
        </Callout>
      </Section>

      <Section title="Wallet interactions">
        <P>
          Your wallet is the signer for every payment. Solance never has custody of your
          keys or funds — it only prepares the transaction for you to approve.
        </P>
        <Bullets
          items={[
            "Approve transactions explicitly in your wallet.",
            "The platform never requests your private key or seed phrase.",
            "You can disconnect your wallet at any time.",
          ]}
        />
      </Section>

      <Section title="Future escrow system">
        <P>
          Milestone-based escrow is on the roadmap. Funds will be lockable in a program and
          released on agreed milestones, adding protection for larger engagements while
          keeping settlement on-chain.
        </P>
        <Callout type="tip" title="Roadmap">
          Escrow, milestone contracts, and on-chain reputation are planned enhancements —
          today&apos;s payments are direct wallet-to-wallet transfers.
        </Callout>
      </Section>
    </article>
  );
}
