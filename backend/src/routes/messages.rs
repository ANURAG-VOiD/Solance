use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    middleware,
    routing::{get, post},
};
use serde::Deserialize;
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    auth::{AuthUser, middleware::require_auth},
    error::{ApiError, api_error},
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
) -> Result<(StatusCode, Json<Message>), ApiError> {
    let chat = ChatRepository::new(state.db.clone())
        .get_by_id(payload.chat_id)
        .await
        .map_err(|_| api_error(StatusCode::INTERNAL_SERVER_ERROR, "Failed to load chat"))?;

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
                    // Live push: deliver the freshly persisted message to the
                    // other participant's realtime socket so their open
                    // conversation updates instantly instead of waiting for a
                    // poll. The sender already has the message from this POST's
                    // response, so we only target the recipient. The payload is
                    // the same serialized `Message` the REST endpoints return,
                    // keeping the client merge logic identical across paths.
                    state
                        .realtime
                        .publish_message(&recipient_wallet, message.clone());

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
        Err(MessageServiceError::ChatNotFound) => {
            Err(api_error(StatusCode::NOT_FOUND, "Chat not found"))
        }
        Err(MessageServiceError::EmptyContent) => Err(api_error(
            StatusCode::BAD_REQUEST,
            "Message content cannot be empty",
        )),
        Err(MessageServiceError::Internal) => Err(api_error(
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to send message",
        )),
    }
}

async fn list_messages(
    State(state): State<Arc<AppState>>,
    Path(chat_id): Path<Uuid>,
    _auth: AuthUser,
) -> Result<Json<Vec<Message>>, ApiError> {
    match MessageService::list_by_chat(&state.db, chat_id).await {
        Ok(messages) => Ok(Json(messages)),
        Err(MessageServiceError::ChatNotFound) => {
            Err(api_error(StatusCode::NOT_FOUND, "Chat not found"))
        }
        Err(MessageServiceError::EmptyContent) => {
            Err(api_error(StatusCode::BAD_REQUEST, "Invalid chat reference"))
        }
        Err(MessageServiceError::Internal) => Err(api_error(
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to load messages",
        )),
    }
}
