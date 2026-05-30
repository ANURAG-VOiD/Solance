use axum::{
    extract::{Path, State},
    http::StatusCode,
    middleware,
    routing::{get, patch, post},
    Json, Router,
};
use serde::Deserialize;
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    auth::{middleware::require_auth, AuthUser},
    models::{User, UserProfileUpdateRequest},
    repositories::user::UserRepository,
    services::user_service::{UserService, UserServiceError},
    state::AppState,
};

#[derive(Deserialize)]
pub struct CreateUserRequest {
    pub wallet_address: String,
}

pub fn router(state: Arc<AppState>) -> Router<Arc<AppState>> {
    let public = Router::new()
        .route("/", post(create_user))
        .route("/{id}", get(get_user_by_id));

    let protected = Router::new()
        .route("/profile", patch(update_profile))
        .route_layer(middleware::from_fn_with_state(state, require_auth));

    public.merge(protected)
}

async fn create_user(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateUserRequest>,
) -> Result<(StatusCode, Json<User>), StatusCode> {
    let repo = UserRepository::new(state.db.clone());

    match repo.create(&payload.wallet_address).await {
        Ok(user) => Ok((StatusCode::CREATED, Json(user))),
        Err(e) => {
            eprintln!("Failed to create user: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

async fn get_user_by_id(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<Json<User>, StatusCode> {
    let repo = UserRepository::new(state.db.clone());

    match repo.get_by_id(id).await {
        Ok(Some(user)) => Ok(Json(user)),
        Ok(None) => Err(StatusCode::NOT_FOUND),
        Err(e) => {
            eprintln!("Failed to fetch user: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

async fn update_profile(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Json(payload): Json<UserProfileUpdateRequest>,
) -> Result<Json<User>, StatusCode> {
    match UserService::update_profile(&state.db, &auth.wallet, payload).await {
        Ok(user) => Ok(Json(user)),
        Err(UserServiceError::NotFound) => Err(StatusCode::NOT_FOUND),
        Err(UserServiceError::Internal) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}
