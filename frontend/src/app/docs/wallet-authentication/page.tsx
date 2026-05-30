import {
  DocsPageHeader,
  Section,
  P,
  Bullets,
  Callout,
  CodeBlock,
  Flow,
  Code,
} from "@/components/docs/content";

export default function WalletAuthenticationPage() {
  return (
    <article>
      <DocsPageHeader
        eyebrow="Platform"
        title="Wallet Authentication"
        description="Solance authenticates users by proving wallet ownership through a signed message — no passwords, no email."
      />

      <Section title="Wallet login flow">
        <P>
          Authentication is a challenge–response handshake. The server issues a one-time
          message, the wallet signs it, and the server verifies the signature before
          issuing a session token.
        </P>
        <Flow
          steps={[
            { title: "Connect Wallet", detail: "User selects a Solana wallet (Phantom, Solflare…)." },
            { title: "Request Nonce", detail: "Client asks the server for a unique message to sign." },
            { title: "Sign Message", detail: "Wallet signs the message locally with the private key." },
            { title: "Verify Signature", detail: "Server validates the signature against the address." },
            { title: "Create Session", detail: "Server returns a JWT; the client stores it." },
          ]}
        />
      </Section>

      <Section title="Nonce generation">
        <P>
          The client requests a nonce for the connecting wallet. The server returns a unique
          message (including an expiry) that must be signed.
        </P>
        <CodeBlock
          language="http"
          code={`POST /api/auth/request-nonce
Content-Type: application/json

{ "wallet_address": "7xR...92K" }

200 OK
{
  "message": "Sign in to Solance: <nonce>",
  "expires_at": "2026-05-31T12:00:00Z"
}`}
        />
        <Callout type="info" title="Why a nonce?">
          A single-use, time-limited message prevents replay attacks — a captured signature
          cannot be reused after the nonce expires.
        </Callout>
      </Section>

      <Section title="Message signing">
        <P>
          The client encodes the message and asks the wallet to sign it. The signature is
          base58-encoded before being sent back to the server.
        </P>
        <CodeBlock
          language="typescript"
          code={`const { message } = await requestNonce(walletAddress);
const signatureBytes = await signMessage(
  new TextEncoder().encode(message),
);
const signature = bs58.encode(signatureBytes);`}
        />
      </Section>

      <Section title="Verification">
        <P>
          The server verifies that the signature was produced by the private key for the
          given wallet address. If valid, it creates the user on first sign-in or loads the
          existing record.
        </P>
        <CodeBlock
          language="http"
          code={`POST /api/auth/verify
Content-Type: application/json

{
  "wallet_address": "7xR...92K",
  "signature": "5Hb...c2",
  "message": "Sign in to Solance: <nonce>"
}

200 OK
{
  "token": "<jwt>",
  "user": { "id": "...", "wallet_address": "7xR...92K", "title": null }
}`}
        />
      </Section>

      <Section title="Session creation">
        <P>
          On success the server returns a signed JWT. The client persists it and attaches it
          as a bearer token on authenticated requests.
        </P>
        <CodeBlock
          language="http"
          code={`GET /api/auth/me
Authorization: Bearer <jwt>`}
        />
        <Bullets
          items={[
            <>New wallets (no <Code>title</Code>) are routed to profile onboarding.</>,
            "Sessions are restored on reload from local storage.",
            "Signing out clears the session and disconnects the wallet.",
          ]}
        />
      </Section>
    </article>
  );
}
