use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Represents a wallet-authenticated user in the system.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: Uuid,
    pub wallet_address: String,
    pub created_at: String,
}
