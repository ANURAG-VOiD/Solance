# Solance Frontend Design Rules

## Mission

Build Solance as a premium SaaS-grade Web3 freelancing platform.

Do NOT create generic crypto landing pages.

Do NOT use excessive gradients, floating blobs, glassmorphism everywhere, or "Web3 vaporwave" aesthetics.

The UI should feel closer to:

* Linear
* Stripe Dashboard
* Upwork
* Notion
* GitHub
* Vercel

than typical crypto projects.

---

# Design Philosophy

Solance is a professional freelancing platform.

Users should feel:

* Trust
* Professionalism
* Clarity
* Speed
* Focus

Every screen should prioritize functionality over decoration.

---

# Visual Style

## Color Palette

Primary:

* Neutral Slate
* Zinc
* Gray

Accent:

* Solana Purple
* Solana Green

Use accent colors only for:

* CTAs
* Status indicators
* Active navigation

Avoid rainbow gradients.

---

# Layout Rules

## Landing Page

Structure:

Hero
↓
How Solance Works
↓
Featured Freelancers
↓
Featured Jobs
↓
Benefits
↓
FAQ
↓
Footer

No oversized marketing sections.

No unnecessary animations.

---

## Dashboard

The dashboard is the heart of the application.

Layout:

Sidebar (left)
Navbar (top)
Content Area (center)

Always visible navigation.

Never hide critical actions behind multiple clicks.

---

# Component Rules

Every component must:

* Have loading state
* Have empty state
* Have error state
* Be responsive
* Be keyboard accessible

No dead buttons.

No placeholder actions.

---

# Freelancer Experience

Freelancer should be able to:

1. Connect wallet
2. Complete profile
3. Browse jobs
4. Submit proposal
5. Chat with client
6. Create invoice
7. Track payments

All accessible within 3 clicks.

---

# Client Experience

Client should be able to:

1. Connect wallet
2. Create job
3. Review applicants
4. Chat with freelancer
5. Approve invoice
6. Pay invoice

All accessible within 3 clicks.

---

# Dashboard Modules

Required:

* Overview
* Jobs
* Freelancers
* Messages
* Invoices
* Notifications
* Settings

Future:

* Escrow
* Reputation
* Analytics

---

# Cards

Cards should be:

* Compact
* Information dense
* Clean spacing
* Minimal borders

Avoid oversized cards.

---

# Tables

Use tables for:

* Applicants
* Invoices
* Payments
* Job Management

Do not replace tables with large cards on desktop.

---

# Forms

Use:

* Step-by-step validation
* Clear labels
* Inline errors

Never use placeholder-only labels.

---

# Mobile

All screens must support:

* 320px
* 768px
* 1280px

Sidebar becomes drawer on mobile.

---

# UX Principles

Before creating a page ask:

1. What is the user's goal?
2. What action should be most visible?
3. Can this be completed in fewer clicks?
4. Is there unnecessary visual noise?

If yes, simplify.

---

# Solance Identity

Solance is not a crypto app.

Solance is a professional operating system for freelancers and clients powered by Solana.
