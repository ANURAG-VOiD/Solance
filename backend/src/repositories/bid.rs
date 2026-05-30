use rust_decimal::Decimal;
use sqlx::{PgPool, Postgres, Transaction};
use uuid::Uuid;

use crate::models::{Bid, Chat, Task};

pub struct BidRepository {
    pool: PgPool,
}

impl BidRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn create(
        &self,
        task_id: Uuid,
        freelancer_wallet: &str,
        cover_letter: &str,
        proposed_amount: Decimal,
    ) -> Result<Bid, sqlx::Error> {
        sqlx::query_as::<_, Bid>(
            r#"
            INSERT INTO bids (task_id, freelancer_wallet, cover_letter, proposed_amount, status, created_at)
            VALUES ($1, $2, $3, $4, 'pending', NOW())
            RETURNING id, task_id, freelancer_wallet, cover_letter, proposed_amount, status, created_at
            "#,
        )
        .bind(task_id)
        .bind(freelancer_wallet)
        .bind(cover_letter)
        .bind(proposed_amount)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn get_by_id(&self, id: Uuid) -> Result<Option<Bid>, sqlx::Error> {
        sqlx::query_as::<_, Bid>(
            r#"
            SELECT id, task_id, freelancer_wallet, cover_letter, proposed_amount, status, created_at
            FROM bids
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
    }

    pub async fn list_by_task_id(&self, task_id: Uuid) -> Result<Vec<Bid>, sqlx::Error> {
        sqlx::query_as::<_, Bid>(
            r#"
            SELECT id, task_id, freelancer_wallet, cover_letter, proposed_amount, status, created_at
            FROM bids
            WHERE task_id = $1
            ORDER BY created_at ASC
            "#,
        )
        .bind(task_id)
        .fetch_all(&self.pool)
        .await
    }

    /// Accepts a bid, rejects competing pending bids, moves task to in_progress, and opens a chat room.
    pub async fn accept_bid_with_chat(
        &self,
        bid_id: Uuid,
        client_wallet: &str,
    ) -> Result<(Bid, Task, Chat), sqlx::Error> {
        let mut tx: Transaction<'_, Postgres> = self.pool.begin().await?;

        let bid = sqlx::query_as::<_, Bid>(
            r#"
            SELECT id, task_id, freelancer_wallet, cover_letter, proposed_amount, status, created_at
            FROM bids
            WHERE id = $1
            FOR UPDATE
            "#,
        )
        .bind(bid_id)
        .fetch_optional(&mut *tx)
        .await?
        .ok_or(sqlx::Error::RowNotFound)?;

        let task = sqlx::query_as::<_, Task>(
            r#"
            SELECT id, client_wallet, title, description, budget, status, created_at
            FROM tasks
            WHERE id = $1
            FOR UPDATE
            "#,
        )
        .bind(bid.task_id)
        .fetch_one(&mut *tx)
        .await?;

        if task.client_wallet != client_wallet {
            return Err(sqlx::Error::RowNotFound);
        }

        if task.status != "open" {
            return Err(sqlx::Error::RowNotFound);
        }

        if bid.status != "pending" {
            return Err(sqlx::Error::RowNotFound);
        }

        let accepted_bid = sqlx::query_as::<_, Bid>(
            r#"
            UPDATE bids
            SET status = 'accepted'
            WHERE id = $1
            RETURNING id, task_id, freelancer_wallet, cover_letter, proposed_amount, status, created_at
            "#,
        )
        .bind(bid_id)
        .fetch_one(&mut *tx)
        .await?;

        sqlx::query(
            r#"
            UPDATE bids
            SET status = 'rejected'
            WHERE task_id = $1 AND id != $2 AND status = 'pending'
            "#,
        )
        .bind(task.id)
        .bind(bid_id)
        .execute(&mut *tx)
        .await?;

        let updated_task = sqlx::query_as::<_, Task>(
            r#"
            UPDATE tasks
            SET status = 'in_progress'
            WHERE id = $1
            RETURNING id, client_wallet, title, description, budget, status, created_at
            "#,
        )
        .bind(task.id)
        .fetch_one(&mut *tx)
        .await?;

        let chat = sqlx::query_as::<_, Chat>(
            r#"
            INSERT INTO chats (id, client_wallet, freelancer_wallet, created_at)
            VALUES ($1, $2, $3, NOW())
            RETURNING id, client_wallet, freelancer_wallet, created_at
            "#,
        )
        .bind(Uuid::new_v4())
        .bind(&task.client_wallet)
        .bind(&accepted_bid.freelancer_wallet)
        .fetch_one(&mut *tx)
        .await?;

        tx.commit().await?;

        Ok((accepted_bid, updated_task, chat))
    }
}
