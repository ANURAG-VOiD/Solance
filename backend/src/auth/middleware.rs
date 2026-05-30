//! JWT authentication middleware and request extractor.

use axum::{
    extract::{FromRequestParts, State},
    http::{request::Parts, StatusCode},
    middleware::Next,
    response::Response,
};
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    auth::jwt::validate_token,
    state::AppState,
};

/// Authenticated user identity attached to protected requests.
#[derive(Debug, Clone)]
pub struct AuthUser {
    pub user_id: Uuid,
    pub wallet: String,
}

impl<S> FromRequestParts<S> for AuthUser
where
    S: Send + Sync,
{
    type Rejection = StatusCode;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        parts
            .extensions
            .get::<AuthUser>()
            .cloned()
            .ok_or(StatusCode::UNAUTHORIZED)
    }
}

/// Middleware: validate Bearer JWT and attach `AuthUser` to request extensions.
pub async fn require_auth(
    State(state): State<Arc<AppState>>,
    mut request: axum::http::Request<axum::body::Body>,
    next: Next,
) -> Result<Response, StatusCode> {
    let token = request
        .headers()
        .get(axum::http::header::AUTHORIZATION)
        .and_then(|value| value.to_str().ok())
        .and_then(|value| value.strip_prefix("Bearer "))
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let claims = validate_token(token, &state.jwt_secret).map_err(|_| StatusCode::UNAUTHORIZED)?;

    request.extensions_mut().insert(AuthUser {
        user_id: claims.sub,
        wallet: claims.wallet,
    });

    Ok(next.run(request).await)
}
