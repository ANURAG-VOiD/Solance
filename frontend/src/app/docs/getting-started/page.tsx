import {
  DocsPageHeader,
  Section,
  P,
  Bullets,
  Callout,
  Flow,
  Code,
} from "@/components/docs/content";

export default function GettingStartedPage() {
  return (
    <article>
      <DocsPageHeader
        eyebrow="Overview"
        title="Getting Started"
        description="Solance replaces accounts and passwords with your Solana wallet. This guide explains what the platform is and walks through the full workflow."
      />

      <Section title="What is Solance">
        <P>
          Solance is a wallet-native freelancing platform built on Solana. Clients post
          work, freelancers apply, both sides collaborate in real time, and invoices are
          settled directly between wallets — no intermediaries holding your funds or your
          identity.
        </P>
        <Bullets
          items={[
            <>No emails or passwords — your wallet <Code>address</Code> is your identity.</>,
            "Direct, on-chain payments in SOL between client and freelancer.",
            "Built-in messaging so projects stay in one place.",
            "Transparent invoices with a clear, trackable lifecycle.",
          ]}
        />
      </Section>

      <Section title="How Solance Works">
        <P>
          Every interaction is tied to a wallet. When you connect and sign a one-time
          message, Solance verifies that you control the wallet and issues a session — that
          session links your profile, jobs, messages, and invoices together.
        </P>
        <Callout type="info" title="Two roles, one account">
          The same wallet can act as a <strong>client</strong> (posting work) and a{" "}
          <strong>freelancer</strong> (applying to work). Switch roles anytime from the
          workspace top bar.
        </Callout>
      </Section>

      <Section title="Wallet-Based Identity">
        <P>
          Your Solana wallet address is your portable identity across Solance. Profiles,
          reputation, and payment history are anchored to it, so you own your data rather
          than renting it from a platform.
        </P>
        <Bullets
          items={[
            "Phantom, Solflare, and other Solana wallets are supported.",
            "Signing a message proves ownership without exposing your private key.",
            "No personal data is required to get started.",
          ]}
        />
      </Section>

      <Section title="Platform Overview">
        <P>The workspace is organised into a few core areas:</P>
        <Bullets
          items={[
            <><strong>Dashboard</strong> — your activity, stats, and quick actions.</>,
            <><strong>Marketplace</strong> — browse and search open jobs.</>,
            <><strong>Messages</strong> — real-time chat with clients and freelancers.</>,
            <><strong>Invoices</strong> — create, send, and track payments.</>,
            <><strong>Profile</strong> — your wallet-linked developer card.</>,
          ]}
        />
      </Section>

      <Section title="Quick Start">
        <P>The end-to-end journey on Solance looks like this:</P>
        <Flow
          steps={[
            { title: "Connect Wallet", detail: "Sign in by signing a message — no password." },
            { title: "Create Profile", detail: "Add a name, avatar, bio, and skills." },
            { title: "Post or Apply", detail: "Clients post jobs; freelancers submit proposals." },
            { title: "Collaborate", detail: "Chat and align on scope in real time." },
            { title: "Invoice", detail: "Generate an invoice for completed work." },
            { title: "Get Paid", detail: "Receive SOL directly to your wallet." },
          ]}
        />
        <Callout type="tip" title="Ready to dive in?">
          Freelancers should continue to the <a className="text-brand underline" href="/docs/freelancers">Freelancer Guide</a>; clients should read the{" "}
          <a className="text-brand underline" href="/docs/clients">Client Guide</a>.
        </Callout>
      </Section>
    </article>
  );
}
