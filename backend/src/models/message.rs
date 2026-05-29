use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Represents a message sent within a chat.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    pub id: Uuid,
    pub chat_id: Uuid,
    pub sender_wallet: String,
    pub content: String,
    pub created_at: String,
}
