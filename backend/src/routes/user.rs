use axum::{
    extract::{Path, State},
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    models::User,
    repositories::user::UserRepository,
    state::AppState,
};

// --- Payloads ---

#[derive(Deserialize)]
pub struct CreateUserRequest {
    pub wallet_address: String,
}

// --- Router ---

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/", post(create_user))
        .route("/{id}", get(get_user_by_id))
}

// --- Handlers ---

async fn create_user(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreateUserRequest>,
) -> Result<(StatusCode, Json<User>), StatusCode> {
    let repo = UserRepository::new(state.db.clone()); // Using the db pool from state
    
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