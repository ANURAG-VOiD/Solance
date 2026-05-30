# Solance Frontend Specification

## Overview

Solance is a wallet-native freelancer collaboration platform built on Solana where clients can publish tasks, freelancers can apply, both parties can communicate through real-time chat, and invoices can be managed directly within the platform.

The frontend should prioritize productivity and trust rather than typical crypto aesthetics. The user experience should feel closer to a modern freelance marketplace combined with a collaboration workspace.

---

# Core Principles

## Wallet Native Identity

* Wallet address acts as the primary identity.
* No email/password authentication.
* Users authenticate by signing a wallet message.
* Profiles are linked directly to wallet addresses.

## Role-Based Experience

There are two primary user roles:

### Freelancer

Can:

* Create and manage profile
* Browse jobs
* Submit proposals
* Chat with clients
* Create invoices
* Manage active work

### Client

Can:

* Publish jobs
* Review applications
* Chat with freelancers
* Approve work
* Pay invoices
* Manage projects

---

# Public Pages

## Landing Page

### Hero Section

Headline:

> Freelance on Solana. Get hired, collaborate, and get paid directly to your wallet.

Actions:

* Connect Wallet
* Browse Opportunities

Visual Workflow:

Client Posts Job
→ Freelancers Apply
→ Chat & Collaborate
→ Create Invoice
→ Receive Payment

### How It Works

#### Post Work

Clients create tasks and define budgets.

#### Find Talent

Freelancers discover opportunities and submit proposals.

#### Collaborate

Built-in messaging system for project communication.

#### Get Paid

Invoices are generated and settled through the platform.

### Features Section

#### Wallet Native Identity

* Secure wallet-based authentication
* No passwords

#### Real-Time Communication

* Direct messaging
* Project discussions

#### Invoice Management

* Create invoices
* Track payments
* Monitor status

#### Reputation System (Future)

* Ratings
* Reviews
* Trust scores

### Marketplace Preview

Display sample jobs with:

* Title
* Budget
* Required skills
* Posted time

### Footer

Links:

* Documentation
* Terms
* Privacy Policy
* GitHub Repository

---

# Authentication

## Wallet Connection Flow

Connect Wallet
→ Request Nonce
→ Sign Message
→ Verify Signature
→ Create/Login User
→ Redirect to Dashboard

Supported Wallets:

* Phantom
* Solflare
* Backpack

---

# Global Layout

## Sidebar Navigation

Dashboard

Marketplace

Applications

Messages

Invoices

Profile

Settings

---

# Dashboard

Dashboard content changes based on user role.

---

# Freelancer Dashboard

## Statistics Cards

* Applied Jobs
* Active Contracts
* Unread Messages
* Pending Invoices

## Recent Activity

Examples:

* New client message
* Invoice paid
* Proposal accepted

## Active Work Section

Display ongoing projects.

Fields:

* Project Name
* Client
* Status
* Due Date

---

# Client Dashboard

## Statistics Cards

* Active Jobs
* Applications Received
* Ongoing Projects
* Pending Payments

## Recent Activity

Examples:

* New proposal received
* New freelancer message
* Invoice awaiting payment

## Published Jobs

List all active jobs.

---

# Profile Page

## User Information

Fields:

* Wallet Address
* Username
* Profile Picture
* Bio

## Skills

Examples:

* Rust
* Solana
* Anchor
* React
* Next.js
* PostgreSQL

## Portfolio

Fields:

* GitHub URL
* Website URL
* Project Links

## Reputation (Future)

* Ratings
* Reviews
* Completed Projects

---

# Marketplace

## Job Search

Features:

* Search by title
* Search by skill
* Search by keyword

## Filters

* Budget Range
* Category
* Skills
* Date Posted

## Job Card

Display:

* Title
* Budget
* Skills
* Description Preview
* Posted Date

Actions:

* View Details
* Apply

---

# Job Details Page

## Job Information

Fields:

* Title
* Description
* Budget
* Timeline
* Required Skills

## Client Information

Display:

* Username
* Number of Posted Jobs
* Reputation Score (Future)

## Actions

* Apply
* Message Client

---

# Application System

## Create Proposal

Fields:

* Proposal Text
* Expected Budget
* Delivery Timeline
* Portfolio Links

## Application Management

Status Types:

* Pending
* Accepted
* Rejected

Freelancers can track all submitted proposals.

Clients can review all incoming proposals.

---

# Messages

## Conversations List

Display:

* User Name
* Last Message
* Timestamp
* Unread Count

## Chat Window

Features:

* Real-time messages
* Message history
* Typing indicator (Future)
* File attachments (Future)

---

# Invoices

## Invoice List

Fields:

* Invoice Number
* Client
* Amount
* Status
* Created Date

Statuses:

* Draft
* Pending
* Paid
* Cancelled

## Invoice Details

Fields:

* Invoice ID
* Freelancer
* Client
* Description
* Amount
* Due Date
* Status

Actions:

* Pay Invoice
* Download PDF
* Mark Paid

---

# Notifications

## Notification Types

* New Job Application
* Proposal Accepted
* Proposal Rejected
* New Message
* Invoice Paid
* Invoice Created

## Notification Center

Accessible from header notification icon.

---

# Settings

## Profile Settings

* Username
* Profile Picture
* Bio

## Wallet Settings

* Connected Wallet
* Wallet Address

## Notification Preferences

* In-App Notifications
* Email Notifications (Future)

---

# UI Components

## Shared Components

### Navbar

### Sidebar

### Page Header

### Statistic Cards

### Job Card

### Proposal Card

### Invoice Card

### Chat Bubble

### Notification Item

### Loading Skeletons

### Empty States

### Error States

---

# Recommended Frontend Structure

frontend/

├── app/

├── components/

│   ├── dashboard/

│   ├── marketplace/

│   ├── profile/

│   ├── chat/

│   ├── invoices/

│   └── shared/

├── hooks/

├── lib/

├── services/

├── store/

├── types/

└── assets/

---

# Future Features

## Escrow Payments

Funds locked until project completion.

## Reputation System

Ratings and reviews.

## Milestone-Based Contracts

Multiple payment stages.

## Team Collaboration

Multiple freelancers on one project.

## DAO Hiring

Organizations hiring through Solance.

## On-Chain Verification

Portfolio and reputation stored on-chain.

---

# MVP Scope

The initial frontend release should include:

1. Wallet Authentication
2. Dashboard
3. Profile Management
4. Job Marketplace
5. Job Creation
6. Applications
7. Messaging
8. Invoice Management
9. Notifications

These features directly align with the current backend progress and existing database schema.
