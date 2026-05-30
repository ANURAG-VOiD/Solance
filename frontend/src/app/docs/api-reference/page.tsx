import {
  DocsPageHeader,
  Section,
  P,
  Bullets,
  Callout,
  CodeBlock,
  Code,
} from "@/components/docs/content";

export default function ApiReferenceDocsPage() {
  return (
    <article>
      <DocsPageHeader
        eyebrow="Resources"
        title="API Reference"
        description="The Solance HTTP API — authentication today, with resource endpoints for the wider platform."
      />

      <Section title="Conventions">
        <P>
          The API is JSON over HTTP. Authenticated endpoints require a bearer token obtained
          from the wallet sign-in flow.
        </P>
        <Bullets
          items={[
            <>Base path: <Code>/api</Code></>,
            <>Auth header: <Code>Authorization: Bearer &lt;jwt&gt;</Code></>,
            <>Content type: <Code>application/json</Code></>,
          ]}
        />
        <CodeBlock
          language="json"
          code={`// Error shape
{
  "message": "Human-readable error",
  "status": 400
}`}
        />
      </Section>

      <Section title="Authentication">
        <P>Obtain a session by requesting a nonce and verifying a signed message.</P>
        <CodeBlock
          language="http"
          code={`POST /api/auth/request-nonce
{ "wallet_address": "7xR...92K" }
→ { "message": "Sign in to Solance: <nonce>", "expires_at": "..." }

POST /api/auth/verify
{ "wallet_address": "7xR...92K", "signature": "5Hb...c2", "message": "..." }
→ { "token": "<jwt>", "user": { ... } }

GET /api/auth/me            (Authorization: Bearer <jwt>)
→ { "id": "...", "wallet_address": "7xR...92K", "title": "Rust Developer" }`}
        />
        <Callout type="info">
          See <a className="text-brand underline" href="/docs/wallet-authentication">Wallet Authentication</a> for the full handshake and security model.
        </Callout>
      </Section>

      <Section title="Users">
        <P>Read public profiles and update your own wallet-linked profile.</P>
        <CodeBlock
          language="http"
          code={`GET /api/users/:id
→ { "id": "...", "wallet_address": "...", "title": "...", "bio": "...", "skills": ["Rust"] }

PATCH /api/users/profile    (Authorization: Bearer <jwt>)
{ "title": "Rust Developer", "bio": "...", "skills": ["Rust","Solana"], "avatar_cid": "bafy..." }
→ { ...updated user }`}
        />
      </Section>

      <Section title="Jobs">
        <P>Create and browse jobs (tasks) in the marketplace.</P>
        <CodeBlock
          language="http"
          code={`GET /api/tasks                          // list open jobs
GET /api/tasks/:id                      // job details

POST /api/tasks            (Authorization: Bearer <jwt>)
{ "title": "Rust backend developer", "description": "...", "budget": "4" }
→ { "id": "...", "status": "open", ... }`}
        />
      </Section>

      <Section title="Applications">
        <P>Submit proposals (bids) and, as a client, accept one.</P>
        <CodeBlock
          language="http"
          code={`POST /api/tasks/:id/bids   (Authorization: Bearer <jwt>)
{ "cover_letter": "...", "proposed_amount": "4" }
→ { "id": "...", "status": "pending", ... }

POST /api/bids/:id/accept  (Authorization: Bearer <jwt>)
→ { "bid": {...}, "task": {...}, "chat": {...} }`}
        />
      </Section>

      <Section title="Chats">
        <P>List the conversations tied to your wallet.</P>
        <CodeBlock
          language="http"
          code={`GET /api/chats             (Authorization: Bearer <jwt>)
→ [ { "id": "...", "client_wallet": "...", "freelancer_wallet": "..." } ]`}
        />
      </Section>

      <Section title="Messages">
        <P>Read and send messages within a conversation.</P>
        <CodeBlock
          language="http"
          code={`GET /api/chats/:id/messages   (Authorization: Bearer <jwt>)
→ [ { "id": "...", "sender_wallet": "...", "content": "...", "created_at": "..." } ]

POST /api/chats/:id/messages  (Authorization: Bearer <jwt>)
{ "content": "Running integration tests now." }
→ { "id": "...", ... }`}
        />
      </Section>

      <Section title="Invoices">
        <P>Create invoices between wallets and track their status.</P>
        <CodeBlock
          language="http"
          code={`GET /api/invoices          (Authorization: Bearer <jwt>)
→ [ { "id": "...", "amount": "2.5", "status": "pending" } ]

POST /api/invoices         (Authorization: Bearer <jwt>)
{ "receiver_wallet": "7xR...92K", "amount": "2.5" }
→ { "id": "...", "status": "draft", ... }`}
        />
        <Callout type="warning">
          Endpoint shapes may evolve as the platform grows; the authentication flow is
          stable today.
        </Callout>
      </Section>
    </article>
  );
}
