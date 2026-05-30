import {
  DocsPageHeader,
  Section,
  P,
  Bullets,
  Callout,
} from "@/components/docs/content";

export default function SecurityDocsPage() {
  return (
    <article>
      <DocsPageHeader
        eyebrow="Resources"
        title="Security"
        description="How Solance keeps authentication trustworthy and your wallet in your control."
      />

      <Section title="Wallet security">
        <P>
          Solance is non-custodial. Your private keys never leave your wallet, and the
          platform never asks for your seed phrase. You approve every signature and
          transaction explicitly.
        </P>
        <Callout type="warning" title="Never share your seed phrase">
          No Solance page, email, or team member will ever ask for your seed phrase or
          private key. Anyone who does is attempting to scam you.
        </Callout>
      </Section>

      <Section title="Signature verification">
        <P>
          Sign-in relies on cryptographic signature verification. The server checks that the
          signed message was produced by the private key controlling the wallet address —
          proving ownership without exposing the key.
        </P>
      </Section>

      <Section title="Authentication">
        <P>
          Nonces are single-use and time-limited, preventing replay attacks. A successful
          verification issues a signed JWT session that is required for all authenticated
          actions.
        </P>
        <Bullets
          items={[
            "Each login challenge is unique and expires quickly.",
            "Sessions are bearer tokens attached to API requests.",
            "Signing out invalidates the local session and disconnects the wallet.",
          ]}
        />
      </Section>

      <Section title="Data protection">
        <P>
          Because identity is wallet-based, Solance collects no passwords and minimal
          personal data. Your profile contents are information you choose to add.
        </P>
      </Section>

      <Section title="Best practices">
        <Bullets
          items={[
            "Use a reputable wallet and keep it updated.",
            "Verify recipient addresses before approving payments.",
            "Disconnect your wallet on shared devices.",
            "Double-check the URL before signing any message.",
            "Treat unexpected signature requests with caution.",
          ]}
        />
      </Section>
    </article>
  );
}
