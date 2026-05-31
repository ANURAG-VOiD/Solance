use sqlx::PgPool;
use uuid::Uuid;

use crate::models::{User, UserProfileUpdateRequest};

pub struct UserRepository {
    pool: PgPool,
}

impl UserRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    /// Creates a new user with a unique wallet address
    pub async fn create(&self, wallet_address: &str) -> Result<User, sqlx::Error> {
        sqlx::query_as::<_, User>(
            r#"
            INSERT INTO users (id, wallet_address, created_at)
            VALUES ($1, $2, NOW())
            RETURNING id, wallet_address, title, bio, skills, avatar_cid, created_at
            "#,
        )
        .bind(Uuid::new_v4())
        .bind(wallet_address)
        .fetch_one(&self.pool)
        .await
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
        sqlx::query_as::<_, User>(
            r#"
            SELECT id, wallet_address, title, bio, skills, avatar_cid, created_at
            FROM users
            WHERE wallet_address = $1
            "#,
        )
        .bind(wallet_address)
        .fetch_optional(&self.pool)
        .await
    }

    /// Fetches a user by their UUID
    pub async fn get_by_id(&self, id: Uuid) -> Result<Option<User>, sqlx::Error> {
        sqlx::query_as::<_, User>(
            r#"
            SELECT id, wallet_address, title, bio, skills, avatar_cid, created_at
            FROM users
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
    }

    /// Returns users who have published a public profile (i.e. set a title),
    /// most recently joined first. Powers the landing-page "featured talent"
    /// section so it reflects real freelancers instead of static cards.
    pub async fn list_with_profiles(&self, limit: i64) -> Result<Vec<User>, sqlx::Error> {
        sqlx::query_as::<_, User>(
            r#"
            SELECT id, wallet_address, title, bio, skills, avatar_cid, created_at
            FROM users
            WHERE title IS NOT NULL AND btrim(title) <> ''
            ORDER BY created_at DESC
            LIMIT $1
            "#,
        )
        .bind(limit)
        .fetch_all(&self.pool)
        .await
    }

    /// Updates Web3 profile fields for the wallet owner.
    pub async fn update_profile(
        &self,
        wallet_address: &str,
        profile: &UserProfileUpdateRequest,
    ) -> Result<User, sqlx::Error> {
        sqlx::query_as::<_, User>(
            r#"
            UPDATE users
            SET
                title = COALESCE($2, title),
                bio = COALESCE($3, bio),
                skills = COALESCE($4, skills),
                avatar_cid = COALESCE($5, avatar_cid)
            WHERE wallet_address = $1
            RETURNING id, wallet_address, title, bio, skills, avatar_cid, created_at
            "#,
        )
        .bind(wallet_address)
        .bind(&profile.title)
        .bind(&profile.bio)
        .bind(&profile.skills)
        .bind(&profile.avatar_cid)
        .fetch_one(&self.pool)
        .await
    }
}
