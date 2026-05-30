use sqlx::PgPool;
use uuid::Uuid;
use crate::models::User;

use axum::{routing::get, Router};
use std::sync::Arc;
use crate::AppState;

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/health", get(health_check))
}

async fn health_check() -> &'static str {
    "User API is online"
}

pub struct UserRepository {
    pool: PgPool,
}

impl UserRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    /// Creates a new user with a unique wallet address
    pub async fn create(&self, wallet_address: &str) -> Result<User, sqlx::Error> {
        let user = sqlx::query_as::<_, User>(
            r#"
            INSERT INTO users (id, wallet_address, created_at)
            VALUES ($1, $2, NOW())
            RETURNING id, wallet_address, created_at
            "#
        )
        .bind(Uuid::new_v4())
        .bind(wallet_address)
        .fetch_one(&self.pool)
        .await?;

        Ok(user)
    }

    /// Returns an existing user or creates one keyed by wallet address.
    pub async fn upsert_by_wallet(&self, wallet_address: &str) -> Result<User, sqlx::Error> {
        if let Some(user) = self.get_by_wallet(wallet_address).await? {
            return Ok(user);
        }

        self.create(wallet_address).await
    }

    /// Fetches a user by their wallet address (used for Auth later)
    pub async fn get_by_wallet(&self, wallet_address: &str) -> Result<Option<User>, sqlx::Error> {
        let user = sqlx::query_as::<_, User>(
            r#"
            SELECT id, wallet_address, created_at 
            FROM users 
            WHERE wallet_address = $1
            "#
        )
        .bind(wallet_address)
        .fetch_optional(&self.pool)
        .await?;

        Ok(user)
    }

    /// Fetches a user by their UUID
    pub async fn get_by_id(&self, id: Uuid) -> Result<Option<User>, sqlx::Error> {
        let user = sqlx::query_as::<_, User>(
            r#"
            SELECT id, wallet_address, created_at 
            FROM users 
            WHERE id = $1
            "#
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(user)
    }
}