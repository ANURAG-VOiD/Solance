use axum::{Json, Router, routing::post};
use serde::{Deserialize, Serialize};

/// Registers wallet authentication endpoints.
pub fn router() -> Router {
    Router::new()
        .route("/auth/request-nonce", post(request_nonce))
        .route("/auth/verify", post(verify_signature))
}

#[derive(Debug, Deserialize)]
struct RequestNonceBody {
    wallet_address: String,
}

#[derive(Debug, Serialize)]
struct RequestNonceResponse {
    nonce: String,
}

#[derive(Debug, Deserialize)]
struct VerifySignatureBody {
    wallet_address: String,
    signature: String,
}

#[derive(Debug, Serialize)]
struct VerifySignatureResponse {
    token: String,
}

async fn request_nonce(Json(_body): Json<RequestNonceBody>) -> Json<RequestNonceResponse> {
    todo!("Issue a nonce for wallet signature verification")
}

async fn verify_signature(Json(_body): Json<VerifySignatureBody>) -> Json<VerifySignatureResponse> {
    todo!("Verify wallet signature and return session token")
}
