use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    middleware,
    routing::{get, patch, post},
};
use serde::Deserialize;
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    auth::{AuthUser, middleware::require_auth},
    error::{ApiError, api_error},
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
        .route("/talent", get(list_talent))
        .route("/by-wallet/{wallet}", get(get_user_by_wallet))
        .route("/{id}", get(get_user_by_id));

    let protected = Router::new()
        .route("/profile", patch(update_profile))
        .route_layer(middleware::from_fn_with_state(state, require_auth));

    public.merge(protected)
}

async fn create_user(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateUserRequest>,
) -> Result<(StatusCode, Json<User>), ApiError> {
    let repo = UserRepository::new(state.db.clone());

    match repo.create(&payload.wallet_address).await {
        Ok(user) => Ok((StatusCode::CREATED, Json(user))),
        Err(e) => {
            eprintln!("Failed to create user: {}", e);
            Err(api_error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to create user",
            ))
        }
    }
}

/// Public: list freelancers with completed profiles for landing-page discovery.
async fn list_talent(State(state): State<Arc<AppState>>) -> Result<Json<Vec<User>>, ApiError> {
    match UserService::list_talent(&state.db, 12).await {
        Ok(users) => Ok(Json(users)),
        Err(_) => Err(api_error(
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to load talent",
        )),
    }
}

/// Public: resolve a user by wallet address so other parties (e.g. a client on
/// an invoice) can be displayed by their profile name instead of a raw wallet.
async fn get_user_by_wallet(
    State(state): State<Arc<AppState>>,
    Path(wallet): Path<String>,
) -> Result<Json<User>, ApiError> {
    let repo = UserRepository::new(state.db.clone());

    match repo.get_by_wallet(&wallet).await {
        Ok(Some(user)) => Ok(Json(user)),
        Ok(None) => Err(api_error(StatusCode::NOT_FOUND, "User not found")),
        Err(e) => {
            eprintln!("Failed to fetch user by wallet: {}", e);
            Err(api_error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to load user",
            ))
        }
    }
}

async fn get_user_by_id(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<Json<User>, ApiError> {
    let repo = UserRepository::new(state.db.clone());

    match repo.get_by_id(id).await {
        Ok(Some(user)) => Ok(Json(user)),
        Ok(None) => Err(api_error(StatusCode::NOT_FOUND, "User not found")),
        Err(e) => {
            eprintln!("Failed to fetch user: {}", e);
            Err(api_error(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to load user",
            ))
        }
    }
}

async fn update_profile(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Json(payload): Json<UserProfileUpdateRequest>,
) -> Result<Json<User>, ApiError> {
    match UserService::update_profile(&state.db, &auth.wallet, payload).await {
        Ok(user) => Ok(Json(user)),
        Err(UserServiceError::NotFound) => Err(api_error(StatusCode::NOT_FOUND, "User not found")),
        Err(UserServiceError::Internal) => Err(api_error(
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to update profile",
        )),
    }
}
