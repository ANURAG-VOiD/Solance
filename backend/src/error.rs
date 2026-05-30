use axum::{http::StatusCode, Json};
use serde::Serialize;

/// Standard JSON error body returned by API handlers.
#[derive(Debug, Serialize)]
pub struct ErrorResponse {
    pub error: String,
}

impl ErrorResponse {
    pub fn new(message: impl Into<String>) -> Self {
        Self {
            error: message.into(),
        }
    }
}

pub type ApiError = (StatusCode, Json<ErrorResponse>);

pub fn api_error(status: StatusCode, message: impl Into<String>) -> ApiError {
    (status, Json(ErrorResponse::new(message)))
}
