use sqlx::PgPool;
use uuid::Uuid;

use crate::models::Notification;

pub struct NotificationRepository {
    pool: PgPool,
}

impl NotificationRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn create(
        &self,
        user_wallet: &str,
        notification_type: &str,
        title: &str,
        body: &str,
        href: &str,
    ) -> Result<Notification, sqlx::Error> {
        sqlx::query_as::<_, Notification>(
            r#"
            INSERT INTO notifications (id, user_wallet, notification_type, title, body, href, read, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, FALSE, NOW())
            RETURNING id, user_wallet, notification_type, title, body, href, read, created_at
            "#,
        )
        .bind(Uuid::new_v4())
        .bind(user_wallet)
        .bind(notification_type)
        .bind(title)
        .bind(body)
        .bind(href)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn list_by_wallet(&self, wallet: &str) -> Result<Vec<Notification>, sqlx::Error> {
        sqlx::query_as::<_, Notification>(
            r#"
            SELECT id, user_wallet, notification_type, title, body, href, read, created_at
            FROM notifications
            WHERE user_wallet = $1
            ORDER BY created_at DESC
            LIMIT 100
            "#,
        )
        .bind(wallet)
        .fetch_all(&self.pool)
        .await
    }

    pub async fn mark_read(&self, wallet: &str, id: Uuid) -> Result<Notification, sqlx::Error> {
        sqlx::query_as::<_, Notification>(
            r#"
            UPDATE notifications
            SET read = TRUE
            WHERE user_wallet = $1 AND id = $2
            RETURNING id, user_wallet, notification_type, title, body, href, read, created_at
            "#,
        )
        .bind(wallet)
        .bind(id)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn mark_all_read(&self, wallet: &str) -> Result<u64, sqlx::Error> {
        let result = sqlx::query(
            r#"
            UPDATE notifications
            SET read = TRUE
            WHERE user_wallet = $1 AND read = FALSE
            "#,
        )
        .bind(wallet)
        .execute(&self.pool)
        .await?;

        Ok(result.rows_affected())
    }
}
