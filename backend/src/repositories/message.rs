use sqlx::PgPool;
use uuid::Uuid;

use crate::models::Message;

pub struct MessageRepository {
    pool: PgPool,
}

impl MessageRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn create(
        &self,
        chat_id: Uuid,
        sender_wallet: &str,
        content: &str,
    ) -> Result<Message, sqlx::Error> {
        let message = sqlx::query_as::<_, Message>(
            r#"
            INSERT INTO messages (id, chat_id, sender_wallet, content, created_at)
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING id, chat_id, sender_wallet, content, created_at
            "#,
        )
        .bind(Uuid::new_v4())
        .bind(chat_id)
        .bind(sender_wallet)
        .bind(content)
        .fetch_one(&self.pool)
        .await?;

        Ok(message)
    }

    pub async fn get_by_chat_id(&self, chat_id: Uuid) -> Result<Vec<Message>, sqlx::Error> {
        let messages = sqlx::query_as::<_, Message>(
            r#"
            SELECT id, chat_id, sender_wallet, content, created_at
            FROM messages
            WHERE chat_id = $1
            ORDER BY created_at ASC
            "#,
        )
        .bind(chat_id)
        .fetch_all(&self.pool)
        .await?;

        Ok(messages)
    }
}
