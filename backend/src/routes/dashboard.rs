use axum::{
    extract::State,
    http::StatusCode,
    middleware,
    routing::get,
    Json, Router,
};
use std::sync::Arc;

use crate::{
    auth::{middleware::require_auth, AuthUser},
    models::DashboardStatsResponse,
    services::dashboard_service::{DashboardService, DashboardServiceError},
    state::AppState,
};

pub fn router(state: Arc<AppState>) -> Router<Arc<AppState>> {
    Router::new()
        .route("/stats", get(get_dashboard_stats))
        .route_layer(middleware::from_fn_with_state(state, require_auth))
}

async fn get_dashboard_stats(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
) -> Result<Json<DashboardStatsResponse>, StatusCode> {
    match DashboardService::get_stats(&state.db, &auth.wallet).await {
        Ok(stats) => Ok(Json(stats)),
        Err(DashboardServiceError::Internal) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}
