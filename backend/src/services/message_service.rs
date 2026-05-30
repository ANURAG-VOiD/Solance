use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    models::Message,
    repositories::{chat::ChatRepository, message::MessageRepository},
};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MessageServiceError {
    ChatNotFound,
    EmptyContent,
    Internal,
}

impl std::fmt::Display for MessageServiceError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::ChatNotFound => write!(f, "chat not found"),
            Self::EmptyContent => write!(f, "message content cannot be empty"),
            Self::Internal => write!(f, "internal message error"),
        }
    }
}

impl std::error::Error for MessageServiceError {}

pub struct CreateMessageInput {
    pub chat_id: Uuid,
    pub sender_wallet: String,
    pub content: String,
}

pub struct MessageService;

impl MessageService {
    pub async fn create_message(
        pool: &PgPool,
        input: CreateMessageInput,
    ) -> Result<Message, MessageServiceError> {
        let content = input.content.trim();
        if content.is_empty() {
            return Err(MessageServiceError::EmptyContent);
        }

        let chat_repo = ChatRepository::new(pool.clone());
        if chat_repo.get_by_id(input.chat_id).await.map_err(|_| MessageServiceError::Internal)?.is_none() {
            return Err(MessageServiceError::ChatNotFound);
        }

        MessageRepository::new(pool.clone())
            .create(input.chat_id, &input.sender_wallet, content)
            .await
            .map_err(|_| MessageServiceError::Internal)
    }

    pub async fn list_by_chat(
        pool: &PgPool,
        chat_id: Uuid,
    ) -> Result<Vec<Message>, MessageServiceError> {
        let chat_repo = ChatRepository::new(pool.clone());
        if chat_repo.get_by_id(chat_id).await.map_err(|_| MessageServiceError::Internal)?.is_none() {
            return Err(MessageServiceError::ChatNotFound);
        }

        MessageRepository::new(pool.clone())
            .get_by_chat_id(chat_id)
            .await
            .map_err(|_| MessageServiceError::Internal)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn empty_content_is_rejected() {
        let content = "   ".trim();
        assert!(content.is_empty());
    }
}
