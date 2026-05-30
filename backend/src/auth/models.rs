use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::models::User;

#[derive(Debug, Deserialize)]
pub struct RequestNonceRequest {
    pub wallet_address: String,
}

#[derive(Debug, Serialize)]
pub struct RequestNonceResponse {
    pub message: String,
    pub expires_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct VerifyRequest {
    pub wallet_address: String,
    pub signature: String,
    pub message: String,
}

#[derive(Debug, Serialize)]
pub struct VerifyResponse {
    pub token: String,
    pub user: User,
}
