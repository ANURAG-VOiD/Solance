use sqlx::PgPool;

use crate::{
    models::{User, UserProfileUpdateRequest},
    repositories::user::UserRepository,
};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum UserServiceError {
    NotFound,
    Internal,
}

impl std::fmt::Display for UserServiceError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::NotFound => write!(f, "user not found"),
            Self::Internal => write!(f, "internal user error"),
        }
    }
}

impl std::error::Error for UserServiceError {}

pub struct UserService;

impl UserService {
    /// Lists freelancers that have completed a public profile, capped at `limit`.
    pub async fn list_talent(pool: &PgPool, limit: i64) -> Result<Vec<User>, UserServiceError> {
        UserRepository::new(pool.clone())
            .list_with_profiles(limit)
            .await
            .map_err(|_| UserServiceError::Internal)
    }

    pub async fn update_profile(
        pool: &PgPool,
        wallet_address: &str,
        profile: UserProfileUpdateRequest,
    ) -> Result<User, UserServiceError> {
        UserRepository::new(pool.clone())
            .update_profile(wallet_address, &profile)
            .await
            .map_err(|error| match error {
                sqlx::Error::RowNotFound => UserServiceError::NotFound,
                _ => UserServiceError::Internal,
            })
    }
}
