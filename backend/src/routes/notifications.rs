use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    middleware,
    routing::{get, patch},
};
use serde::Serialize;
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    auth::{AuthUser, middleware::require_auth},
    error::{ApiError, api_error},
    models::Notification,
    services::notification_service::{NotificationService, NotificationServiceError},
    state::AppState,
};

#[derive(Debug, Serialize)]
struct MarkAllReadResponse {
    updated: u64,
}

pub fn router(state: Arc<AppState>) -> Router<Arc<AppState>> {
    Router::new()
        .route("/", get(list_notifications))
        .route("/read-all", patch(mark_all_read))
        .route("/{id}/read", patch(mark_read))
        .route_layer(middleware::from_fn_with_state(state, require_auth))
}

fn notification_error(err: NotificationServiceError) -> ApiError {
    match err {
        NotificationServiceError::NotFound => api_error(StatusCode::NOT_FOUND, err.to_string()),
        NotificationServiceError::Unavailable(message) => {
            api_error(StatusCode::SERVICE_UNAVAILABLE, message)
        }
        NotificationServiceError::Internal => {
            api_error(StatusCode::INTERNAL_SERVER_ERROR, err.to_string())
        }
    }
}

async fn list_notifications(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
) -> Result<Json<Vec<Notification>>, ApiError> {
    NotificationService::list_notifications(&state.db, &auth.wallet)
        .await
        .map(Json)
        .map_err(notification_error)
}

async fn mark_read(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<Notification>, ApiError> {
    NotificationService::mark_read(&state.db, &auth.wallet, id)
        .await
        .map(Json)
        .map_err(notification_error)
}

async fn mark_all_read(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
) -> Result<Json<MarkAllReadResponse>, ApiError> {
    NotificationService::mark_all_read(&state.db, &auth.wallet)
        .await
        .map(|updated| Json(MarkAllReadResponse { updated }))
        .map_err(notification_error)
}
