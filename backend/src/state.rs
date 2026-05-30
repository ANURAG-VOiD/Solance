use crate::auth::nonce_store::NonceStore;
use crate::db::DbPool;

/// Shared application state available to route handlers.
#[derive(Clone)]
pub struct AppState {
    pub db: DbPool,
    pub nonces: NonceStore,
    pub jwt_secret: String,
}
