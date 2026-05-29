use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Represents a collaboration chat between users.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Chat {
    pub id: Uuid,
    pub created_at: String,
}
