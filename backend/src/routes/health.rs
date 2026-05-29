use axum::{routing::get, Json, Router};
use serde::Serialize;

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    service: String,
}

async fn health_check() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok".to_string(),
        service: "solance-backend".to_string(),
    })
}

pub fn router() -> Router {
    Router::new().route("/health", get(health_check))
}