//! Ed25519 signature verification for Solana wallet authentication.
//!
//! Solana wallets expose a base58-encoded 32-byte public key (`wallet_address`)
//! and sign UTF-8 messages with a base58-encoded 64-byte ed25519 signature.

use ed25519_dalek::{Signature, Verifier, VerifyingKey};
use std::fmt;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SignatureError {
    InvalidWalletAddress(String),
    InvalidSignatureEncoding(String),
    VerificationFailed,
}

impl fmt::Display for SignatureError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::InvalidWalletAddress(msg) => write!(f, "invalid wallet address: {msg}"),
            Self::InvalidSignatureEncoding(msg) => write!(f, "invalid signature encoding: {msg}"),
            Self::VerificationFailed => write!(f, "signature verification failed"),
        }
    }
}

impl std::error::Error for SignatureError {}

/// Validate that `wallet_address` is a well-formed Solana public key (base58, 32 bytes).
pub fn validate_wallet_address(wallet_address: &str) -> Result<(), SignatureError> {
    decode_wallet_address(wallet_address)?;
    Ok(())
}

/// Verify that `signature_base58` is a valid ed25519 signature over `message`
/// produced by the Solana wallet identified by `wallet_address`.
pub fn verify_signature(
    wallet_address: &str,
    message: &str,
    signature_base58: &str,
) -> Result<(), SignatureError> {
    let verifying_key = decode_wallet_address(wallet_address)?;
    let signature = decode_signature(signature_base58)?;

    verifying_key
        .verify(message.as_bytes(), &signature)
        .map_err(|_| SignatureError::VerificationFailed)
}

fn decode_wallet_address(wallet_address: &str) -> Result<VerifyingKey, SignatureError> {
    let pubkey_bytes = bs58::decode(wallet_address)
        .into_vec()
        .map_err(|e| SignatureError::InvalidWalletAddress(e.to_string()))?;

    let pubkey_array: [u8; 32] = pubkey_bytes
        .as_slice()
        .try_into()
        .map_err(|_| SignatureError::InvalidWalletAddress("expected 32-byte public key".into()))?;

    VerifyingKey::from_bytes(&pubkey_array)
        .map_err(|e| SignatureError::InvalidWalletAddress(e.to_string()))
}

fn decode_signature(signature_base58: &str) -> Result<Signature, SignatureError> {
    let sig_bytes = bs58::decode(signature_base58)
        .into_vec()
        .map_err(|e| SignatureError::InvalidSignatureEncoding(e.to_string()))?;

    let sig_array: [u8; 64] = sig_bytes
        .as_slice()
        .try_into()
        .map_err(|_| SignatureError::InvalidSignatureEncoding("expected 64-byte signature".into()))?;

    Ok(Signature::from_bytes(&sig_array))
}

#[cfg(test)]
mod tests {
    use super::*;
    use ed25519_dalek::{Signer, SigningKey};

    fn fixture_keypair() -> SigningKey {
        SigningKey::from_bytes(&[7u8; 32])
    }

    fn fixture_wallet_address(signing_key: &SigningKey) -> String {
        bs58::encode(signing_key.verifying_key().as_bytes()).into_string()
    }

    fn sign_message(signing_key: &SigningKey, message: &str) -> String {
        bs58::encode(signing_key.sign(message.as_bytes()).to_bytes()).into_string()
    }

    #[test]
    fn verify_signature_accepts_valid_solana_style_signature() {
        let signing_key = fixture_keypair();
        let wallet_address = fixture_wallet_address(&signing_key);
        let message = "Sign in to Solance\nNonce: abc-123\nTimestamp: 2026-05-30T00:00:00Z";
        let signature = sign_message(&signing_key, message);

        verify_signature(&wallet_address, message, &signature).unwrap();
    }

    #[test]
    fn verify_signature_rejects_tampered_message() {
        let signing_key = fixture_keypair();
        let wallet_address = fixture_wallet_address(&signing_key);
        let message = "Sign in to Solance\nNonce: abc-123";
        let signature = sign_message(&signing_key, message);

        let err = verify_signature(&wallet_address, "tampered message", &signature).unwrap_err();
        assert_eq!(err, SignatureError::VerificationFailed);
    }

    #[test]
    fn verify_signature_rejects_wrong_wallet() {
        let signing_key = fixture_keypair();
        let other_key = SigningKey::from_bytes(&[9u8; 32]);
        let wallet_address = fixture_wallet_address(&other_key);
        let message = "Sign in to Solance\nNonce: abc-123";
        let signature = sign_message(&signing_key, message);

        let err = verify_signature(&wallet_address, message, &signature).unwrap_err();
        assert_eq!(err, SignatureError::VerificationFailed);
    }

    #[test]
    fn verify_signature_rejects_invalid_wallet_address() {
        let err = verify_signature("not-valid-base58!!!", "msg", "sig").unwrap_err();
        assert!(matches!(err, SignatureError::InvalidWalletAddress(_)));
    }

    #[test]
    fn verify_signature_rejects_invalid_signature_length() {
        let signing_key = fixture_keypair();
        let wallet_address = fixture_wallet_address(&signing_key);

        let err = verify_signature(&wallet_address, "msg", "abc").unwrap_err();
        assert!(matches!(err, SignatureError::InvalidSignatureEncoding(_)));
    }
}
