use sqlx::PgPool;
use uuid::Uuid;

use crate::models::Chat;

pub struct ChatRepository {
    pool: PgPool,
}

impl ChatRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn create(&self) -> Result<Chat, sqlx::Error> {
        let chat = sqlx::query_as::<_, Chat>(
            r#"
            INSERT INTO chats (id, created_at)
            VALUES ($1, NOW())
            RETURNING id, created_at
            "#,
        )
        .bind(Uuid::new_v4())
        .fetch_one(&self.pool)
        .await?;

        Ok(chat)
    }

    pub async fn get_by_id(&self, id: Uuid) -> Result<Option<Chat>, sqlx::Error> {
        let chat = sqlx::query_as::<_, Chat>(
            r#"
            SELECT id, created_at
            FROM chats
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(chat)
    }

    pub async fn list_all(&self) -> Result<Vec<Chat>, sqlx::Error> {
        let chats = sqlx::query_as::<_, Chat>(
            r#"
            SELECT id, created_at
            FROM chats
            ORDER BY created_at DESC
            "#,
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(chats)
    }
}
