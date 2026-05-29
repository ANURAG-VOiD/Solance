use crate::models::user::User;

/// Handles wallet nonce issuance and signature verification.
pub struct AuthService;

impl AuthService {
    pub async fn request_nonce(wallet_address: &str) -> String {
        todo!("Generate and store nonce for wallet: {wallet_address}")
    }

    pub async fn verify_signature(
        wallet_address: &str,
        signature: &str,
    ) -> Result<User, String> {
        let _ = signature;
        todo!("Verify signature for wallet: {wallet_address}")
    }

    pub async fn find_or_create_user(wallet_address: &str) -> Result<User, String> {
        todo!("Find existing user or create one for wallet: {wallet_address}")
    }
}
