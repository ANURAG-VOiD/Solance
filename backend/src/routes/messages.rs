use axum::{
    extract::{Path, State},
    http::StatusCode,
    middleware,
    routing::{get, post},
    Json, Router,
};
use serde::Deserialize;
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    auth::{middleware::require_auth, AuthUser},
    models::Message,
    repositories::chat::ChatRepository,
    services::message_service::{CreateMessageInput, MessageService, MessageServiceError},
    services::notification_service::{CreateNotificationInput, NotificationService},
    state::AppState,
};

#[derive(Debug, Deserialize)]
pub struct CreateMessageRequest {
    pub chat_id: Uuid,
    pub content: String,
}

pub fn router(state: Arc<AppState>) -> Router<Arc<AppState>> {
    Router::new()
        .route("/", post(create_message))
        .route("/{chat_id}", get(list_messages))
        .route_layer(middleware::from_fn_with_state(state, require_auth))
}

async fn create_message(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Json(payload): Json<CreateMessageRequest>,
) -> Result<(StatusCode, Json<Message>), StatusCode> {
    let chat = ChatRepository::new(state.db.clone())
        .get_by_id(payload.chat_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    match MessageService::create_message(
        &state.db,
        CreateMessageInput {
            chat_id: payload.chat_id,
            sender_wallet: auth.wallet.clone(),
            content: payload.content,
        },
    )
    .await
    {
        Ok(message) => {
            if let Some(chat) = chat {
                let recipient = if chat.client_wallet.as_deref() == Some(auth.wallet.as_str()) {
                    chat.freelancer_wallet
                } else {
                    chat.client_wallet
                };

                if let Some(recipient_wallet) = recipient {
                    let _ = NotificationService::create_notification(
                        &state.db,
                        &state.realtime,
                        CreateNotificationInput {
                            user_wallet: recipient_wallet,
                            notification_type: "message".to_string(),
                            title: "New message".to_string(),
                            body: "You received a new chat message.".to_string(),
                            href: format!("/messages/{}", payload.chat_id),
                        },
                    )
                    .await;
                }
            }

            Ok((StatusCode::CREATED, Json(message)))
        }
        Err(MessageServiceError::ChatNotFound) => Err(StatusCode::NOT_FOUND),
        Err(MessageServiceError::EmptyContent) => Err(StatusCode::BAD_REQUEST),
        Err(MessageServiceError::Internal) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

async fn list_messages(
    State(state): State<Arc<AppState>>,
    Path(chat_id): Path<Uuid>,
    _auth: AuthUser,
) -> Result<Json<Vec<Message>>, StatusCode> {
    match MessageService::list_by_chat(&state.db, chat_id).await {
        Ok(messages) => Ok(Json(messages)),
        Err(MessageServiceError::ChatNotFound) => Err(StatusCode::NOT_FOUND),
        Err(MessageServiceError::EmptyContent) => Err(StatusCode::BAD_REQUEST),
        Err(MessageServiceError::Internal) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}
