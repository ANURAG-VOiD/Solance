use chrono::{Duration, Utc};
use sqlx::PgPool;
use std::fmt;
use uuid::Uuid;

use crate::{
    auth::{
        jwt::{issue_token, JwtError},
        models::{RequestNonceRequest, RequestNonceResponse, VerifyRequest, VerifyResponse},
        nonce_store::{NonceStore, StoredNonce},
        signature::{validate_wallet_address, verify_signature, SignatureError},
    },
    repositories::user::UserRepository,
};

const NONCE_TTL: Duration = Duration::minutes(5);

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AuthServiceError {
    InvalidWallet,
    NonceExpired,
    MessageMismatch,
    InvalidSignature,
    Internal,
}

impl fmt::Display for AuthServiceError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::InvalidWallet => write!(f, "invalid wallet address"),
            Self::NonceExpired => write!(f, "nonce missing or expired"),
            Self::MessageMismatch => write!(f, "message does not match stored nonce"),
            Self::InvalidSignature => write!(f, "signature verification failed"),
            Self::Internal => write!(f, "internal auth error"),
        }
    }
}

impl std::error::Error for AuthServiceError {}

pub struct AuthService;

impl AuthService {
    /// Generate a time-limited sign-in message and store it for later verification.
    pub async fn request_nonce(
        store: &NonceStore,
        payload: &RequestNonceRequest,
    ) -> Result<RequestNonceResponse, AuthServiceError> {
        validate_wallet_address(&payload.wallet_address).map_err(|_| AuthServiceError::InvalidWallet)?;

        let nonce_id = Uuid::new_v4();
        let timestamp = Utc::now();
        let expires_at = timestamp + NONCE_TTL;

        let message = format!(
            "Sign in to Solance\nNonce: {nonce_id}\nTimestamp: {}",
            timestamp.to_rfc3339()
        );

        let stored = StoredNonce {
            wallet_address: payload.wallet_address.clone(),
            nonce_id,
            message: message.clone(),
            expires_at,
        };

        store.upsert(payload.wallet_address.clone(), stored).await;

        Ok(RequestNonceResponse { message, expires_at })
    }

    /// Verify a wallet signature, upsert the user, and issue a JWT.
    pub async fn verify(
        store: &NonceStore,
        pool: &PgPool,
        jwt_secret: &str,
        payload: &VerifyRequest,
    ) -> Result<VerifyResponse, AuthServiceError> {
        validate_wallet_address(&payload.wallet_address).map_err(|_| AuthServiceError::InvalidWallet)?;

        let stored = store
            .take(&payload.wallet_address)
            .await
            .ok_or(AuthServiceError::NonceExpired)?;

        if stored.message != payload.message {
            return Err(AuthServiceError::MessageMismatch);
        }

        verify_signature(
            &payload.wallet_address,
            &payload.message,
            &payload.signature,
        )
        .map_err(map_signature_error)?;

        let repo = UserRepository::new(pool.clone());
        let user = repo
            .upsert_by_wallet(&payload.wallet_address)
            .await
            .map_err(|_| AuthServiceError::Internal)?;

        let token = issue_token(&user, jwt_secret).map_err(map_jwt_error)?;

        Ok(VerifyResponse { token, user })
    }
}

fn map_signature_error(error: SignatureError) -> AuthServiceError {
    match error {
        SignatureError::InvalidWalletAddress(_) => AuthServiceError::InvalidWallet,
        SignatureError::InvalidSignatureEncoding(_) | SignatureError::VerificationFailed => {
            AuthServiceError::InvalidSignature
        }
    }
}

fn map_jwt_error(_error: JwtError) -> AuthServiceError {
    AuthServiceError::Internal
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::auth::nonce_store::NonceStore;
    use ed25519_dalek::{Signer, SigningKey};

    fn valid_wallet_address() -> String {
        let signing_key = SigningKey::from_bytes(&[3u8; 32]);
        bs58::encode(signing_key.verifying_key().as_bytes()).into_string()
    }

    fn sign_message(signing_key: &SigningKey, message: &str) -> String {
        bs58::encode(signing_key.sign(message.as_bytes()).to_bytes()).into_string()
    }

    #[tokio::test]
    async fn request_nonce_stores_message_for_valid_wallet() {
        let store = NonceStore::new();
        let wallet_address = valid_wallet_address();
        let payload = RequestNonceRequest {
            wallet_address: wallet_address.clone(),
        };

        let response = AuthService::request_nonce(&store, &payload)
            .await
            .expect("nonce should be created");

        assert!(response.message.contains("Sign in to Solance"));
        assert!(response.message.contains("Nonce:"));
        assert!(response.expires_at > Utc::now());

        let stored = store.get(&wallet_address).await.expect("nonce should be stored");
        assert_eq!(stored.message, response.message);
    }

    #[tokio::test]
    async fn request_nonce_rejects_invalid_wallet() {
        let store = NonceStore::new();
        let payload = RequestNonceRequest {
            wallet_address: "not-a-wallet".to_string(),
        };

        let err = AuthService::request_nonce(&store, &payload)
            .await
            .unwrap_err();

        assert_eq!(err, AuthServiceError::InvalidWallet);
    }

    #[tokio::test]
    async fn verify_rejects_missing_nonce() {
        let store = NonceStore::new();
        let wallet_address = valid_wallet_address();
        let payload = VerifyRequest {
            wallet_address,
            signature: "invalid".to_string(),
            message: "Sign in to Solance".to_string(),
        };

        let err = AuthService::verify(&store, &make_dummy_pool(), "secret", &payload)
            .await
            .unwrap_err();

        assert_eq!(err, AuthServiceError::NonceExpired);
    }

    #[tokio::test]
    async fn verify_rejects_message_mismatch() {
        let store = NonceStore::new();
        let signing_key = SigningKey::from_bytes(&[3u8; 32]);
        let wallet_address = valid_wallet_address();
        let nonce_response = AuthService::request_nonce(
            &store,
            &RequestNonceRequest {
                wallet_address: wallet_address.clone(),
            },
        )
        .await
        .expect("nonce should be created");

        let payload = VerifyRequest {
            wallet_address,
            signature: sign_message(&signing_key, &nonce_response.message),
            message: "Sign in to Solance\nNonce: wrong\nTimestamp: 2026-01-01T00:00:00Z".to_string(),
        };

        let err = AuthService::verify(&store, &make_dummy_pool(), "secret", &payload)
            .await
            .unwrap_err();

        assert_eq!(err, AuthServiceError::MessageMismatch);
    }

    #[tokio::test]
    async fn verify_rejects_invalid_signature() {
        let store = NonceStore::new();
        let wallet_address = valid_wallet_address();
        let nonce_response = AuthService::request_nonce(
            &store,
            &RequestNonceRequest {
                wallet_address: wallet_address.clone(),
            },
        )
        .await
        .expect("nonce should be created");

        let payload = VerifyRequest {
            wallet_address,
            signature: "1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111".to_string(),
            message: nonce_response.message,
        };

        let err = AuthService::verify(&store, &make_dummy_pool(), "secret", &payload)
            .await
            .unwrap_err();

        assert_eq!(err, AuthServiceError::InvalidSignature);
    }

    fn make_dummy_pool() -> PgPool {
        PgPool::connect_lazy("postgres://invalid:invalid@localhost:1/invalid")
            .expect("lazy pool should be created")
    }
}
