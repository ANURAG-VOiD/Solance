use rust_decimal::Decimal;
use sqlx::{PgPool, Postgres, Transaction};
use uuid::Uuid;

use crate::models::{Bid, Chat, MyBidWithTask, Task};

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

    pub async fn list_by_freelancer_wallet(
        &self,
        wallet: &str,
    ) -> Result<Vec<MyBidWithTask>, sqlx::Error> {
        #[derive(sqlx::FromRow)]
        struct MyBidTaskRow {
            bid_id: Uuid,
            bid_task_id: Uuid,
            bid_freelancer_wallet: String,
            bid_cover_letter: String,
            bid_proposed_amount: Decimal,
            bid_status: String,
            bid_created_at: chrono::DateTime<chrono::Utc>,
            task_id: Uuid,
            task_client_wallet: String,
            task_title: String,
            task_description: String,
            task_budget: Decimal,
            task_status: String,
            task_created_at: chrono::DateTime<chrono::Utc>,
        }

        let rows = sqlx::query_as::<_, MyBidTaskRow>(
            r#"
            SELECT
                b.id AS bid_id,
                b.task_id AS bid_task_id,
                b.freelancer_wallet AS bid_freelancer_wallet,
                b.cover_letter AS bid_cover_letter,
                b.proposed_amount AS bid_proposed_amount,
                b.status AS bid_status,
                b.created_at AS bid_created_at,
                t.id AS task_id,
                t.client_wallet AS task_client_wallet,
                t.title AS task_title,
                t.description AS task_description,
                t.budget AS task_budget,
                t.status AS task_status,
                t.created_at AS task_created_at
            FROM bids b
            INNER JOIN tasks t ON t.id = b.task_id
            WHERE b.freelancer_wallet = $1
            ORDER BY b.created_at DESC
            "#,
        )
        .bind(wallet)
        .fetch_all(&self.pool)
        .await?;

        Ok(rows
            .into_iter()
            .map(|row| MyBidWithTask {
                bid: Bid {
                    id: row.bid_id,
                    task_id: row.bid_task_id,
                    freelancer_wallet: row.bid_freelancer_wallet,
                    cover_letter: row.bid_cover_letter,
                    proposed_amount: row.bid_proposed_amount,
                    status: row.bid_status,
                    created_at: row.bid_created_at,
                },
                task: Task {
                    id: row.task_id,
                    client_wallet: row.task_client_wallet,
                    title: row.task_title,
                    description: row.task_description,
                    budget: row.task_budget,
                    status: row.task_status,
                    created_at: row.task_created_at,
                },
            })
            .collect())
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
