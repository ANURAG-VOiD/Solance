use axum::{
    extract::{Path, State},
    http::StatusCode,
    middleware,
    routing::patch,
    Json, Router,
};
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    auth::{middleware::require_auth, AuthUser},
    models::AcceptBidResponse,
    services::bid_service::{BidService, BidServiceError},
    state::AppState,
};

pub fn router(state: Arc<AppState>) -> Router<Arc<AppState>> {
    Router::new()
        .route("/{id}/accept", patch(accept_bid))
        .route_layer(middleware::from_fn_with_state(state, require_auth))
}

async fn accept_bid(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<AcceptBidResponse>, StatusCode> {
    match BidService::accept_bid(&state.db, id, &auth.wallet).await {
        Ok(response) => Ok(Json(response)),
        Err(BidServiceError::NotFound) => Err(StatusCode::NOT_FOUND),
        Err(BidServiceError::Forbidden) => Err(StatusCode::FORBIDDEN),
        Err(BidServiceError::TaskNotOpen | BidServiceError::Conflict) => Err(StatusCode::BAD_REQUEST),
        Err(BidServiceError::Internal) => Err(StatusCode::INTERNAL_SERVER_ERROR),
        Err(_) => Err(StatusCode::BAD_REQUEST),
    }
}
