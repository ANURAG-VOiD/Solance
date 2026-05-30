//! JWT validation for authenticated wallet sessions.

use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::models::User;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum JwtError {
    EncodingFailed,
    InvalidToken,
}

impl std::fmt::Display for JwtError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::EncodingFailed => write!(f, "failed to encode JWT"),
            Self::InvalidToken => write!(f, "invalid or expired JWT"),
        }
    }
}

impl std::error::Error for JwtError {}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub sub: Uuid,
    pub wallet: String,
    pub exp: i64,
    pub iat: i64,
}

const TOKEN_TTL: Duration = Duration::days(7);

/// Issue a signed JWT for an authenticated user.
pub fn issue_token(user: &User, jwt_secret: &str) -> Result<String, JwtError> {
    let now = Utc::now();
    let claims = Claims {
        sub: user.id,
        wallet: user.wallet_address.clone(),
        exp: (now + TOKEN_TTL).timestamp(),
        iat: now.timestamp(),
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(jwt_secret.as_bytes()),
    )
    .map_err(|_| JwtError::EncodingFailed)
}

/// Validate a JWT and return its claims.
pub fn validate_token(token: &str, jwt_secret: &str) -> Result<Claims, JwtError> {
    decode::<Claims>(
        token,
        &DecodingKey::from_secret(jwt_secret.as_bytes()),
        &Validation::default(),
    )
    .map(|data| data.claims)
    .map_err(|_| JwtError::InvalidToken)
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;

    #[test]
    fn issue_and_validate_token_roundtrip() {
        let user = User {
            id: Uuid::new_v4(),
            wallet_address: "7YLw3qnPNM5uomPqiA2GUydD2dDDHHVfhssNzKZpkadb".to_string(),
            created_at: Utc::now(),
        };

        let secret = "test-secret";
        let token = issue_token(&user, secret).expect("token should be issued");
        let claims = validate_token(&token, secret).expect("token should validate");

        assert_eq!(claims.sub, user.id);
        assert_eq!(claims.wallet, user.wallet_address);
    }

    #[test]
    fn validate_token_rejects_invalid_secret() {
        let user = User {
            id: Uuid::new_v4(),
            wallet_address: "7YLw3qnPNM5uomPqiA2GUydD2dDDHHVfhssNzKZpkadb".to_string(),
            created_at: Utc::now(),
        };

        let token = issue_token(&user, "secret-a").expect("token should be issued");
        let err = validate_token(&token, "secret-b").unwrap_err();
        assert_eq!(err, JwtError::InvalidToken);
    }
}
