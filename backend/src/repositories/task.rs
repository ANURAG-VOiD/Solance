use rust_decimal::Decimal;
use sqlx::PgPool;
use uuid::Uuid;

use crate::models::Task;

pub struct TaskRepository {
    pool: PgPool,
}

impl TaskRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn create(
        &self,
        client_wallet: &str,
        title: &str,
        description: &str,
        budget: Decimal,
    ) -> Result<Task, sqlx::Error> {
        sqlx::query_as::<_, Task>(
            r#"
            INSERT INTO tasks (client_wallet, title, description, budget, status, created_at)
            VALUES ($1, $2, $3, $4, 'open', NOW())
            RETURNING id, client_wallet, title, description, budget, status, created_at
            "#,
        )
        .bind(client_wallet)
        .bind(title)
        .bind(description)
        .bind(budget)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn get_by_id(&self, id: Uuid) -> Result<Option<Task>, sqlx::Error> {
        sqlx::query_as::<_, Task>(
            r#"
            SELECT id, client_wallet, title, description, budget, status, created_at
            FROM tasks
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
    }

    pub async fn list_open(&self) -> Result<Vec<Task>, sqlx::Error> {
        sqlx::query_as::<_, Task>(
            r#"
            SELECT id, client_wallet, title, description, budget, status, created_at
            FROM tasks
            WHERE status = 'open'
            ORDER BY created_at DESC
            "#,
        )
        .fetch_all(&self.pool)
        .await
    }

    pub async fn list_by_client_wallet(&self, wallet: &str) -> Result<Vec<Task>, sqlx::Error> {
        sqlx::query_as::<_, Task>(
            r#"
            SELECT id, client_wallet, title, description, budget, status, created_at
            FROM tasks
            WHERE client_wallet = $1
            ORDER BY created_at DESC
            "#,
        )
        .bind(wallet)
        .fetch_all(&self.pool)
        .await
    }

    pub async fn update_status(&self, id: Uuid, status: &str) -> Result<Task, sqlx::Error> {
        sqlx::query_as::<_, Task>(
            r#"
            UPDATE tasks
            SET status = $2
            WHERE id = $1
            RETURNING id, client_wallet, title, description, budget, status, created_at
            "#,
        )
        .bind(id)
        .bind(status)
        .fetch_one(&self.pool)
        .await
    }
}
