use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: Uuid,
    pub wallet_address: String,
    pub title: Option<String>,
    pub bio: Option<String>,
    pub skills: Option<Vec<String>>,
    pub avatar_cid: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct UserProfileUpdateRequest {
    pub title: Option<String>,
    pub bio: Option<String>,
    pub skills: Option<Vec<String>>,
    pub avatar_cid: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Chat {
    pub id: Uuid,
    pub client_wallet: Option<String>,
    pub freelancer_wallet: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Message {
    pub id: Uuid,
    pub chat_id: Uuid,
    pub sender_wallet: String,
    pub content: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Invoice {
    pub id: Uuid,
    pub sender_wallet: String,
    pub receiver_wallet: String,
    pub amount: Decimal,
    pub status: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Notification {
    pub id: Uuid,
    pub user_wallet: String,
    pub notification_type: String,
    pub title: String,
    pub body: String,
    pub href: String,
    pub read: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Task {
    pub id: Uuid,
    pub client_wallet: String,
    pub title: String,
    pub description: String,
    pub budget: Decimal,
    pub status: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateTaskRequest {
    pub title: String,
    pub description: String,
    pub budget: Decimal,
}

#[derive(Debug, Deserialize)]
pub struct UpdateTaskStatusRequest {
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Bid {
    pub id: Uuid,
    pub task_id: Uuid,
    pub freelancer_wallet: String,
    pub cover_letter: String,
    pub proposed_amount: Decimal,
    pub status: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateBidRequest {
    pub cover_letter: String,
    pub proposed_amount: Decimal,
}

#[derive(Debug, Deserialize)]
pub struct UpdateBidStatusRequest {
    pub status: String,
}

#[derive(Debug, Serialize)]
pub struct AcceptBidResponse {
    pub bid: Bid,
    pub task: Task,
    pub chat: Chat,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DashboardStatsResponse {
    pub freelancer: FreelancerDashboardStats,
    pub client: ClientDashboardStats,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FreelancerDashboardStats {
    pub applied_jobs: i64,
    pub active_contracts: i64,
    pub unread_messages: i64,
    pub pending_invoices: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ClientDashboardStats {
    pub active_jobs: i64,
    pub applications_received: i64,
    pub ongoing_projects: i64,
    pub pending_payments: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MyBidWithTask {
    pub bid: Bid,
    pub task: Task,
}
