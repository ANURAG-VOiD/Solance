use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    middleware,
    routing::{get, patch},
};
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    auth::{AuthUser, middleware::require_auth},
    error::{ApiError, api_error},
    models::{AcceptBidResponse, MyBidWithTask},
    services::{
        bid_service::{BidService, BidServiceError},
        notification_service::{CreateNotificationInput, NotificationService},
    },
    state::AppState,
};

pub fn router(state: Arc<AppState>) -> Router<Arc<AppState>> {
    Router::new()
        .route("/mine", get(list_my_bids))
        .route("/{id}/accept", patch(accept_bid))
        .route_layer(middleware::from_fn_with_state(state, require_auth))
}

async fn list_my_bids(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
) -> Result<Json<Vec<MyBidWithTask>>, ApiError> {
    match BidService::list_my_bids(&state.db, &auth.wallet).await {
        Ok(bids) => Ok(Json(bids)),
        Err(_) => Err(api_error(
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to load your applications",
        )),
    }
}

async fn accept_bid(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<AcceptBidResponse>, ApiError> {
    match BidService::accept_bid(&state.db, id, &auth.wallet).await {
        Ok(response) => {
            let _ = NotificationService::create_notification(
                &state.db,
                &state.realtime,
                CreateNotificationInput {
                    user_wallet: response.bid.freelancer_wallet.clone(),
                    notification_type: "proposal_accepted".to_string(),
                    title: "Proposal accepted".to_string(),
                    body: format!("Your bid for '{}' was accepted.", response.task.title),
                    href: format!("/messages/{}", response.chat.id),
                },
            )
            .await;

            Ok(Json(response))
        }
        Err(BidServiceError::NotFound) => Err(api_error(StatusCode::NOT_FOUND, "Bid not found")),
        Err(BidServiceError::Forbidden) => Err(api_error(
            StatusCode::FORBIDDEN,
            "Only the job owner can accept this bid",
        )),
        Err(e @ (BidServiceError::TaskNotOpen | BidServiceError::BidStateConflict)) => {
            Err(api_error(StatusCode::BAD_REQUEST, e.to_string()))
        }
        Err(_) => Err(api_error(
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to accept bid",
        )),
    }
}
