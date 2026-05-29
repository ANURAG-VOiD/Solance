use axum::{Json, Router, routing::{get, post}};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Registers chat creation and listing endpoints.
pub fn router() -> Router {
    Router::new()
        .route("/chats", post(create_chat))
        .route("/chats", get(list_chats))
}

#[derive(Debug, Deserialize)]
struct CreateChatBody {}

#[derive(Debug, Serialize)]
struct ChatResponse {
    id: Uuid,
}

async fn create_chat(Json(_body): Json<CreateChatBody>) -> Json<ChatResponse> {
    todo!("Create a new chat")
}

async fn list_chats() -> Json<Vec<ChatResponse>> {
    todo!("List chats for the authenticated wallet")
}
