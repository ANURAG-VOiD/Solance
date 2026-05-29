use uuid::Uuid;

use crate::models::chat::Chat;

/// Encapsulates chat creation and listing business logic.
pub struct ChatService;

impl ChatService {
    pub async fn create_chat() -> Result<Chat, String> {
        todo!("Create and persist a new chat")
    }

    pub async fn list_chats_for_wallet(_wallet_address: &str) -> Result<Vec<Chat>, String> {
        todo!("Return chats visible to the given wallet")
    }

    pub async fn get_chat_by_id(id: Uuid) -> Result<Chat, String> {
        todo!("Fetch chat by id: {id}")
    }
}
