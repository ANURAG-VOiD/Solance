import {
  DocsPageHeader,
  Section,
  P,
  Bullets,
  Callout,
  Flow,
} from "@/components/docs/content";

export default function CollaborationDocsPage() {
  return (
    <article>
      <DocsPageHeader
        eyebrow="Platform"
        title="Collaboration"
        description="Real-time messaging keeps clients and freelancers aligned without leaving Solance."
      />

      <Section title="Messaging system">
        <P>
          Solance includes a built-in chat so project communication lives next to the work
          itself. Conversations are tied to a client and a freelancer wallet.
        </P>
        <Bullets
          items={[
            "Message history is preserved per conversation.",
            "Conversations are created automatically when a proposal is accepted.",
            "Each message records the sender wallet and a timestamp.",
          ]}
        />
      </Section>

      <Section title="Conversations">
        <P>
          The Messages view lists your conversations with the latest message and unread
          count. Selecting one opens the full thread for that engagement.
        </P>
      </Section>

      <Section title="Notifications">
        <P>
          The notification center (the bell in the top bar) surfaces important events so you
          never miss activity.
        </P>
        <Bullets
          items={[
            "New job applications and proposal decisions.",
            "New messages from a client or freelancer.",
            "Invoice created and invoice paid events.",
          ]}
        />
        <Callout type="tip">
          Use “Mark all read” to clear the badge once you&apos;ve caught up.
        </Callout>
      </Section>

      <Section title="Attachments">
        <P>
          File attachments are on the roadmap. Today, share links to repositories, specs, or
          deliverables directly in the conversation.
        </P>
      </Section>

      <Section title="Communication workflow">
        <P>A typical collaboration flows like this:</P>
        <Flow
          steps={[
            { title: "Proposal accepted", detail: "A conversation opens automatically." },
            { title: "Align on scope", detail: "Clarify milestones and expectations." },
            { title: "Share progress", detail: "Post updates and deliverable links." },
            { title: "Invoice & close", detail: "Submit an invoice when work is done." },
          ]}
        />
      </Section>
    </article>
  );
}
