use crate::db::DbPool;

/// Shared application state available to route handlers.
#[derive(Clone)]
#[allow(dead_code)]
pub struct AppState {
    pub db: DbPool,
}
