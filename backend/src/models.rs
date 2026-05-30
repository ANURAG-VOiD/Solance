use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: Uuid,
    pub wallet_address: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Chat {
    pub id: Uuid,
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
    pub client_id: Uuid,
    pub freelancer_id: Uuid,
    pub amount: i64, // Using i64 for BIGINT (can represent lamports)
    pub status: String,
    pub created_at: DateTime<Utc>,
}