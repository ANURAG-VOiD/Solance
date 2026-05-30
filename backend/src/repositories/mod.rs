pub mod user;
pub mod chat;
pub mod message;
pub mod invoice;
use axum::Router;
use std::sync::Arc;
use crate::AppState;


/// Combines all sub-routers under the main /api scope
pub fn app_router() -> Router<Arc<AppState>> {
    Router::new()
        .nest("/users", user::routes())
}