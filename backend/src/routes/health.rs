use axum::{Json, Router, routing::get};
use serde::Serialize;

use crate::state::AppState;
use std::sync::Arc; // Make sure this path matches your project structure

// 1. Explicitly type the Router to expect Arc<AppState>
pub fn router() -> Router<Arc<AppState>> {
    Router::new().route("/", get(health_check)) // Adjust the path string if needed based on your setup
}

// 2. The handler remains the same
async fn health_check() -> &'static str {
    "System is healthy"
}
#[derive(Serialize)]
struct HealthResponse {
    status: String,
    service: String,
}
