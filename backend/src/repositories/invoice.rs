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

    /// Creates a new invoice between a client and a freelancer
    pub async fn create(&self, client_id: Uuid, freelancer_id: Uuid, amount: i64) -> Result<Invoice, sqlx::Error> {
        let invoice = sqlx::query_as::<_, Invoice>(
            r#"
            INSERT INTO invoices (id, client_id, freelancer_id, amount, status, created_at)
            VALUES ($1, $2, $3, $4, 'pending', NOW())
            RETURNING id, client_id, freelancer_id, amount, status, created_at
            "#
        )
        .bind(Uuid::new_v4())
        .bind(client_id)
        .bind(freelancer_id)
        .bind(amount)
        .fetch_one(&self.pool)
        .await?;

        Ok(invoice)
    }
}