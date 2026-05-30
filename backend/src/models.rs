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
