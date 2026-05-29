use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Lifecycle states for a Solana Pay invoice.
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum InvoiceStatus {
    Pending,
    Paid,
    Cancelled,
}

/// Represents a payment request between two wallet addresses.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Invoice {
    pub id: Uuid,
    pub sender_wallet: String,
    pub receiver_wallet: String,
    pub amount: u64,
    pub status: InvoiceStatus,
    pub created_at: String,
}
