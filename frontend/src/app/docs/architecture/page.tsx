import {
  DocsPageHeader,
  Section,
  P,
  Bullets,
  Flow,
  DocsTable,
  Callout,
} from "@/components/docs/content";

export default function ArchitectureDocsPage() {
  return (
    <article>
      <DocsPageHeader
        eyebrow="Resources"
        title="Architecture"
        description="How Solance is built — a typed React frontend, a Rust API, PostgreSQL, and Solana for settlement."
      />

      <Section title="System overview">
        <P>
          Solance is a layered system. The browser talks to a Rust API over HTTP; the API
          persists data in PostgreSQL and verifies wallet signatures; payments settle on
          Solana.
        </P>
        <Flow
          steps={[
            { title: "Frontend", detail: "Next.js · React · TypeScript · Tailwind · Motion" },
            { title: "Backend", detail: "Rust · Axum REST API · JWT sessions" },
            { title: "Database", detail: "PostgreSQL · SQLx (compile-time checked queries)" },
            { title: "Blockchain", detail: "Solana · Wallet Adapter · on-chain settlement" },
          ]}
        />
      </Section>

      <Section title="Frontend">
        <P>
          The client is a Next.js App Router application written in TypeScript and styled
          with Tailwind CSS v4. Motion powers subtle animations, and the Solana Wallet
          Adapter handles wallet connections.
        </P>
        <Bullets
          items={[
            "App Router with public landing/docs and an auth-gated workspace.",
            "Semantic design tokens drive a consistent light, premium theme.",
            "Client-side data hooks with loading, empty, and error states.",
          ]}
        />
      </Section>

      <Section title="Backend">
        <P>
          The API is a Rust service built on Axum. It exposes REST endpoints for auth, users,
          jobs, applications, chats, messages, and invoices, and issues JWT sessions after
          wallet verification.
        </P>
        <DocsTable
          head={["Concern", "Technology"]}
          rows={[
            ["HTTP framework", "Axum"],
            ["Language", "Rust"],
            ["Auth", "Wallet signature verification + JWT"],
            ["Data access", "SQLx"],
          ]}
        />
      </Section>

      <Section title="Database">
        <P>
          PostgreSQL stores users, tasks, bids, chats, messages, and invoices. SQLx provides
          compile-time-checked queries, catching schema mismatches before they ship.
        </P>
        <Callout type="info">
          Identity is keyed on the wallet address, so records across the schema reference the
          same wallet-native identity.
        </Callout>
      </Section>

      <Section title="Blockchain">
        <P>
          Solana provides identity (via wallet signatures) and settlement (via SOL
          transfers). Payments are direct wallet-to-wallet transactions, with milestone
          escrow planned as a future on-chain enhancement.
        </P>
      </Section>
    </article>
  );
}
