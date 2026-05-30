import type { ReactNode } from "react";
import { DocsPageHeader, Section } from "@/components/docs/content";

/** A single question/answer pair (kept out of the TOC — only sections appear). */
function QA({ q, children }: { q: string; children: ReactNode }) {
  return (
    <div className="border-b border-border pb-4 last:border-0">
      <p className="font-semibold text-text">{q}</p>
      <p className="mt-1.5 text-[15px] leading-7 text-slate-600">{children}</p>
    </div>
  );
}

export default function FaqPage() {
  return (
    <article>
      <DocsPageHeader
        eyebrow="Resources"
        title="FAQ"
        description="Answers to the most common questions about using Solance."
      />

      <Section title="Accounts & wallets">
        <div className="space-y-4">
          <QA q="Why do I need a wallet?">
            Your Solana wallet is your identity on Solance. It replaces emails and passwords,
            proves who you are by signing a message, and is where you receive payments.
          </QA>
          <QA q="Which wallets are supported?">
            Popular Solana wallets such as Phantom and Solflare are supported through the
            Solana Wallet Adapter.
          </QA>
          <QA q="Do I need an email or password?">
            No. Authentication is entirely wallet-based — there is nothing to remember and no
            password to leak.
          </QA>
          <QA q="Can I change my wallet?">
            Each wallet is a distinct identity. You can sign in with a different wallet, but
            it will be treated as a separate account with its own profile and history.
          </QA>
          <QA q="Is signing a message the same as sending a transaction?">
            No. Signing the login message is free, happens off-chain, and never moves funds —
            it only proves you control the wallet.
          </QA>
          <QA q="What information is stored about me?">
            Only what you add to your profile (title, bio, skills, avatar) plus your public
            wallet address. There are no passwords and no required personal data.
          </QA>
          <QA q="Can one wallet be both a client and a freelancer?">
            Yes. Switch between client and freelancer roles anytime from the workspace top
            bar.
          </QA>
        </div>
      </Section>

      <Section title="Jobs & applications">
        <div className="space-y-4">
          <QA q="How do I post a job?">
            From the workspace, open “Post a Job”, add a title, description, skills, and a
            budget in SOL, then publish it to the marketplace.
          </QA>
          <QA q="How do I apply to a job?">
            Open a job in the marketplace and submit a proposal with a cover letter and your
            proposed amount.
          </QA>
          <QA q="What happens when a client accepts my proposal?">
            The job moves to in-progress and a conversation is created automatically so you
            can begin collaborating.
          </QA>
          <QA q="Can I edit or cancel a job after posting?">
            Job owners manage their postings from “My Jobs”. A job can be cancelled if it is
            no longer needed.
          </QA>
          <QA q="How many jobs can I apply to?">
            There is no hard limit — apply to as many relevant jobs as you can deliver on.
          </QA>
          <QA q="How do I message a client before applying?">
            Messaging opens automatically when a proposal is accepted. Use your cover letter
            to ask clarifying questions up front.
          </QA>
        </div>
      </Section>

      <Section title="Invoices & payments">
        <div className="space-y-4">
          <QA q="How do invoices work?">
            A freelancer creates an invoice addressed to the client&apos;s wallet for an
            amount in SOL. It moves from draft to pending to paid as it&apos;s sent and
            settled.
          </QA>
          <QA q="How are payments processed?">
            Payments are native Solana transactions sent directly from the client&apos;s
            wallet to the freelancer&apos;s wallet. Solance never holds your funds.
          </QA>
          <QA q="How long do payments take?">
            Solana settles quickly — once the transaction is confirmed, funds are available
            and the invoice is marked paid.
          </QA>
          <QA q="Are there platform fees on payments?">
            Payments are wallet-to-wallet, so there is no platform escrow cut. You pay
            standard Solana network fees.
          </QA>
          <QA q="Can a payment be reversed?">
            No. On-chain transactions are final once confirmed — always verify the amount and
            recipient first.
          </QA>
          <QA q="What currency are invoices in?">
            Invoices are denominated in SOL.
          </QA>
          <QA q="Is there escrow?">
            Milestone-based escrow is planned. Today, payments are direct transfers tied to
            invoices.
          </QA>
        </div>
      </Section>

      <Section title="Security">
        <div className="space-y-4">
          <QA q="Will Solance ever ask for my seed phrase?">
            Never. No legitimate Solance page or person will ask for your seed phrase or
            private key.
          </QA>
          <QA q="Is Solance custodial?">
            No. Solance is non-custodial — your keys and funds always stay in your wallet.
          </QA>
          <QA q="How is my login protected from replay attacks?">
            Each login uses a unique, time-limited nonce, so a captured signature cannot be
            reused.
          </QA>
          <QA q="What should I do on a shared device?">
            Sign out and disconnect your wallet when you&apos;re done, and verify the URL
            before signing anything.
          </QA>
        </div>
      </Section>
    </article>
  );
}
