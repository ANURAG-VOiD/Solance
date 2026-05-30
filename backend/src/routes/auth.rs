use axum::{
    extract::State,
    http::StatusCode,
    middleware,
    routing::{get, post},
    Json, Router,
};
use std::sync::Arc;

use crate::{
    auth::{middleware::require_auth, AuthUser},
    auth::models::{RequestNonceRequest, RequestNonceResponse, VerifyRequest, VerifyResponse},
    models::User,
    repositories::user::UserRepository,
    services::auth_service::{AuthService, AuthServiceError},
    state::AppState,
};

pub fn router(state: Arc<AppState>) -> Router<Arc<AppState>> {
    let public = Router::new()
        .route("/request-nonce", post(request_nonce))
        .route("/verify", post(verify));

    let protected = Router::new()
        .route("/me", get(me))
        .route_layer(middleware::from_fn_with_state(state, require_auth));

    public.merge(protected)
}

async fn request_nonce(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<RequestNonceRequest>,
) -> Result<(StatusCode, Json<RequestNonceResponse>), StatusCode> {
    match AuthService::request_nonce(&state.nonces, &payload).await {
        Ok(response) => Ok((StatusCode::OK, Json(response))),
        Err(AuthServiceError::InvalidWallet) => Err(StatusCode::BAD_REQUEST),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

async fn verify(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<VerifyRequest>,
) -> Result<(StatusCode, Json<VerifyResponse>), StatusCode> {
    match AuthService::verify(
        &state.nonces,
        &state.db,
        &state.jwt_secret,
        &payload,
    )
    .await
    {
        Ok(response) => Ok((StatusCode::OK, Json(response))),
        Err(AuthServiceError::InvalidWallet | AuthServiceError::MessageMismatch) => {
            Err(StatusCode::BAD_REQUEST)
        }
        Err(AuthServiceError::NonceExpired | AuthServiceError::InvalidSignature) => {
            Err(StatusCode::UNAUTHORIZED)
        }
        Err(AuthServiceError::Internal) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

/// Protected route — returns the authenticated user from the JWT.
async fn me(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
) -> Result<Json<User>, StatusCode> {
    let repo = UserRepository::new(state.db.clone());

    match repo.get_by_id(auth.user_id).await {
        Ok(Some(user)) => Ok(Json(user)),
        Ok(None) => Err(StatusCode::NOT_FOUND),
        Err(e) => {
            eprintln!("Failed to fetch authenticated user: {e}");
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}
