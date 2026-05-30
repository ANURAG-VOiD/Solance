use sqlx::PgPool;

use crate::{
    models::Chat,
    repositories::chat::ChatRepository,
};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ChatServiceError {
    Internal,
}

impl std::fmt::Display for ChatServiceError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Internal => write!(f, "internal chat error"),
        }
    }
}

impl std::error::Error for ChatServiceError {}

pub struct ChatService;

impl ChatService {
    pub async fn create_chat(pool: &PgPool) -> Result<Chat, ChatServiceError> {
        ChatRepository::new(pool.clone())
            .create()
            .await
            .map_err(|_| ChatServiceError::Internal)
    }

    pub async fn list_chats(pool: &PgPool) -> Result<Vec<Chat>, ChatServiceError> {
        ChatRepository::new(pool.clone())
            .list_all()
            .await
            .map_err(|_| ChatServiceError::Internal)
    }
}
