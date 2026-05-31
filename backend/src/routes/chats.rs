use axum::{Json, Router, extract::State, http::StatusCode, middleware, routing::post};
use std::sync::Arc;

use crate::{
    auth::{AuthUser, middleware::require_auth},
    error::{ApiError, api_error},
    models::Chat,
    services::chat_service::{ChatService, ChatServiceError},
    state::AppState,
};

pub fn router(state: Arc<AppState>) -> Router<Arc<AppState>> {
    Router::new()
        .route("/", post(create_chat).get(list_chats))
        .route_layer(middleware::from_fn_with_state(state, require_auth))
}

async fn create_chat(
    State(state): State<Arc<AppState>>,
    _auth: AuthUser,
) -> Result<(StatusCode, Json<Chat>), ApiError> {
    match ChatService::create_chat(&state.db).await {
        Ok(chat) => Ok((StatusCode::CREATED, Json(chat))),
        Err(ChatServiceError::Internal) => Err(api_error(
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to create chat channel",
        )),
    }
}

async fn list_chats(
    State(state): State<Arc<AppState>>,
    _auth: AuthUser,
) -> Result<Json<Vec<Chat>>, ApiError> {
    match ChatService::list_chats(&state.db).await {
        Ok(chats) => Ok(Json(chats)),
        Err(ChatServiceError::Internal) => Err(api_error(
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to load chats",
        )),
    }
}
