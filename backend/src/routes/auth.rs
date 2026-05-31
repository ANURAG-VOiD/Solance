use axum::{
    Json, Router,
    extract::State,
    http::StatusCode,
    middleware,
    routing::{get, post},
};
use std::sync::Arc;

use crate::{
    auth::models::{RequestNonceRequest, RequestNonceResponse, VerifyRequest, VerifyResponse},
    auth::{AuthUser, middleware::require_auth},
    error::{ApiError, api_error},
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
) -> Result<(StatusCode, Json<RequestNonceResponse>), ApiError> {
    match AuthService::request_nonce(&state.nonces, &payload).await {
        Ok(response) => Ok((StatusCode::OK, Json(response))),
        Err(AuthServiceError::InvalidWallet) => {
            Err(api_error(StatusCode::BAD_REQUEST, "Invalid wallet address"))
        }
        Err(_) => Err(api_error(
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to generate authentication nonce",
        )),
    }
}

async fn verify(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<VerifyRequest>,
) -> Result<(StatusCode, Json<VerifyResponse>), ApiError> {
    match AuthService::verify(&state.nonces, &state.db, &state.jwt_secret, &payload).await {
        Ok(response) => Ok((StatusCode::OK, Json(response))),
        Err(AuthServiceError::InvalidWallet) => {
            Err(api_error(StatusCode::BAD_REQUEST, "Invalid wallet address"))
        }
        Err(AuthServiceError::MessageMismatch) => Err(api_error(
            StatusCode::BAD_REQUEST,
            "Signed message does not match the issued nonce",
        )),
        Err(AuthServiceError::NonceExpired) => Err(api_error(
            StatusCode::UNAUTHORIZED,
            "Authentication nonce has expired, please retry",
        )),
        Err(AuthServiceError::InvalidSignature) => Err(api_error(
            StatusCode::UNAUTHORIZED,
            "Signature verification failed",
        )),
        Err(AuthServiceError::Internal) => Err(api_error(
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to verify wallet signature",
        )),
    }
}

/// Protected route — returns the authenticated user from the JWT.
async fn me(State(state): State<Arc<AppState>>, auth: AuthUser) -> Result<Json<User>, ApiError> {
    let repo = UserRepository::new(state.db.clone());

    match repo.get_by_id(auth.user_id).await {
        Ok(Some(user)) => Ok(Json(user)),
        Ok(None) => Err(api_error(StatusCode::NOT_FOUND, "User not found")),
        Err(e) => {
            eprintln!("Failed to fetch authenticated user: {e}");
            Err(api_error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to load user profile",
            ))
        }
    }
}
