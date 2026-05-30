//! In-memory store for single-use wallet authentication nonces (MVP).

use chrono::{DateTime, Utc};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct StoredNonce {
    pub wallet_address: String,
    pub nonce_id: Uuid,
    pub message: String,
    pub expires_at: DateTime<Utc>,
}

#[derive(Clone, Default)]
pub struct NonceStore {
    inner: Arc<RwLock<HashMap<String, StoredNonce>>>,
}

impl NonceStore {
    pub fn new() -> Self {
        Self {
            inner: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Replace any existing nonce for this wallet with a fresh challenge.
    pub async fn upsert(&self, wallet_address: String, nonce: StoredNonce) {
        self.inner
            .write()
            .await
            .insert(wallet_address, nonce);
    }

    /// Return a stored nonce if it exists and has not expired.
    pub async fn get(&self, wallet_address: &str) -> Option<StoredNonce> {
        let map = self.inner.read().await;
        map.get(wallet_address)
            .filter(|nonce| nonce.expires_at > Utc::now())
            .cloned()
    }

    /// Remove and return a nonce (used during signature verification).
    pub async fn take(&self, wallet_address: &str) -> Option<StoredNonce> {
        let mut map = self.inner.write().await;
        map.remove(wallet_address).filter(|nonce| nonce.expires_at > Utc::now())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Duration;

    #[tokio::test]
    async fn upsert_and_get_returns_active_nonce() {
        let store = NonceStore::new();
        let wallet = "wallet123".to_string();
        let nonce = StoredNonce {
            wallet_address: wallet.clone(),
            nonce_id: Uuid::new_v4(),
            message: "test message".to_string(),
            expires_at: Utc::now() + Duration::minutes(5),
        };

        store.upsert(wallet.clone(), nonce.clone()).await;

        let fetched = store.get(&wallet).await.expect("nonce should exist");
        assert_eq!(fetched.message, nonce.message);
    }

    #[tokio::test]
    async fn get_returns_none_for_expired_nonce() {
        let store = NonceStore::new();
        let wallet = "wallet123".to_string();
        let nonce = StoredNonce {
            wallet_address: wallet.clone(),
            nonce_id: Uuid::new_v4(),
            message: "expired".to_string(),
            expires_at: Utc::now() - Duration::seconds(1),
        };

        store.upsert(wallet.clone(), nonce).await;

        assert!(store.get(&wallet).await.is_none());
    }
}
