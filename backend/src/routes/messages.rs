use axum::{Json, Router, extract::Path, routing::{get, post}};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Registers message send and retrieval endpoints.
pub fn router() -> Router {
    Router::new()
        .route("/messages", post(send_message))
        .route("/messages/{chat_id}", get(list_messages))
}

#[derive(Debug, Deserialize)]
struct SendMessageBody {
    chat_id: Uuid,
    content: String,
}

#[derive(Debug, Serialize)]
struct MessageResponse {
    id: Uuid,
    chat_id: Uuid,
    sender_wallet: String,
    content: String,
}

async fn send_message(Json(_body): Json<SendMessageBody>) -> Json<MessageResponse> {
    todo!("Persist a message in the given chat")
}

async fn list_messages(Path(_chat_id): Path<Uuid>) -> Json<Vec<MessageResponse>> {
    todo!("Return messages for the given chat")
}
