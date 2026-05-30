/** Core user entity — mirrors backend `User` model */
export interface User {
  id: string;
  wallet_address: string;
  title: string | null;
  bio: string | null;
  skills: string[] | null;
  avatar_cid: string | null;
  created_at: string;
}

export interface RequestNonceResponse {
  message: string;
  expires_at: string;
}

export interface VerifyResponse {
  token: string;
  user: User;
}

export interface AuthSession {
  token: string;
  user: User;
}

export type UserRole = "freelancer" | "client";

export type TaskStatus = "open" | "in_progress" | "completed" | "cancelled";

export interface Task {
  id: string;
  client_wallet: string;
  title: string;
  description: string;
  budget: string;
  status: TaskStatus;
  created_at: string;
}

export interface CreateTaskPayload {
  title: string;
  description: string;
  budget: string;
}

export type BidStatus = "pending" | "accepted" | "rejected";

export interface Bid {
  id: string;
  task_id: string;
  freelancer_wallet: string;
  cover_letter: string;
  proposed_amount: string;
  status: BidStatus;
  created_at: string;
}

export interface CreateBidPayload {
  cover_letter: string;
  proposed_amount: string;
}

export interface AcceptBidResponse {
  bid: Bid;
  task: Task;
  chat: Chat;
}

export interface MyBidWithTask {
  bid: Bid;
  task: Task;
}

export interface UserProfileUpdatePayload {
  title?: string;
  bio?: string;
  skills?: string[];
  avatar_cid?: string;
}

export interface Chat {
  id: string;
  client_wallet: string | null;
  freelancer_wallet: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_wallet: string;
  content: string;
  created_at: string;
}

export type InvoiceStatus =
  | "draft"
  | "pending"
  | "paid"
  | "rejected"
  | "cancelled";

export interface Invoice {
  id: string;
  sender_wallet: string;
  receiver_wallet: string;
  amount: string;
  status: InvoiceStatus;
  created_at: string;
}

export interface CreateInvoicePayload {
  receiver_wallet: string;
  amount: string;
}

export type NotificationType =
  | "application"
  | "proposal_accepted"
  | "proposal_rejected"
  | "message"
  | "invoice_paid"
  | "invoice_created"
  | "job_posted";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  href: string;
  created_at: string;
  read: boolean;
}

export interface DashboardStats {
  freelancer: {
    applied_jobs: number;
    active_contracts: number;
    unread_messages: number;
    pending_invoices: number;
  };
  client: {
    active_jobs: number;
    applications_received: number;
    ongoing_projects: number;
    pending_payments: number;
  };
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export interface FeaturedTalent {
  id: string;
  name: string;
  title: string;
  projects: number;
  rating: number;
  skills: string[];
  walletVerified: boolean;
}
