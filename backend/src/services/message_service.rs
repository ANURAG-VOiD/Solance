use uuid::Uuid;

use crate::models::message::Message;

/// Encapsulates message send and retrieval business logic.
pub struct MessageService;

impl MessageService {
    pub async fn send_message(
        chat_id: Uuid,
        sender_wallet: &str,
        content: &str,
    ) -> Result<Message, String> {
        todo!("Send message in chat {chat_id} from {sender_wallet}: {content}")
    }

    pub async fn list_messages_for_chat(chat_id: Uuid) -> Result<Vec<Message>, String> {
        todo!("List messages for chat: {chat_id}")
    }
}
