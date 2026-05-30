use rust_decimal::Decimal;
use sqlx::PgPool;
use uuid::Uuid;

use crate::models::Invoice;

pub struct InvoiceRepository {
    pool: PgPool,
}

impl InvoiceRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn create(
        &self,
        sender_wallet: &str,
        receiver_wallet: &str,
        amount: Decimal,
    ) -> Result<Invoice, sqlx::Error> {
        let invoice = sqlx::query_as::<_, Invoice>(
            r#"
            INSERT INTO invoices (id, sender_wallet, receiver_wallet, amount, status, created_at)
            VALUES ($1, $2, $3, $4, 'pending', NOW())
            RETURNING id, sender_wallet, receiver_wallet, amount, status, created_at
            "#,
        )
        .bind(Uuid::new_v4())
        .bind(sender_wallet)
        .bind(receiver_wallet)
        .bind(amount)
        .fetch_one(&self.pool)
        .await?;

        Ok(invoice)
    }

    pub async fn get_by_id(&self, id: Uuid) -> Result<Option<Invoice>, sqlx::Error> {
        let invoice = sqlx::query_as::<_, Invoice>(
            r#"
            SELECT id, sender_wallet, receiver_wallet, amount, status, created_at
            FROM invoices
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(invoice)
    }

    pub async fn update_status(&self, id: Uuid, status: &str) -> Result<Invoice, sqlx::Error> {
        let invoice = sqlx::query_as::<_, Invoice>(
            r#"
            UPDATE invoices
            SET status = $2
            WHERE id = $1
            RETURNING id, sender_wallet, receiver_wallet, amount, status, created_at
            "#,
        )
        .bind(id)
        .bind(status)
        .fetch_one(&self.pool)
        .await?;

        Ok(invoice)
    }
}
