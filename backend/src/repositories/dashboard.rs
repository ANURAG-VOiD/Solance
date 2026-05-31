use sqlx::PgPool;

pub struct DashboardRepository {
    pool: PgPool,
}

impl DashboardRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn count_applied_jobs(&self, wallet: &str) -> Result<i64, sqlx::Error> {
        sqlx::query_scalar::<_, i64>(
            r#"
            SELECT COUNT(*)::BIGINT
            FROM bids
            WHERE freelancer_wallet = $1
            "#,
        )
        .bind(wallet)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn count_active_contracts(&self, wallet: &str) -> Result<i64, sqlx::Error> {
        sqlx::query_scalar::<_, i64>(
            r#"
            SELECT COUNT(*)::BIGINT
            FROM bids
            WHERE freelancer_wallet = $1 AND status = 'accepted'
            "#,
        )
        .bind(wallet)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn count_joined_chats(&self, wallet: &str) -> Result<i64, sqlx::Error> {
        sqlx::query_scalar::<_, i64>(
            r#"
            SELECT COUNT(*)::BIGINT
            FROM chats
            WHERE client_wallet = $1 OR freelancer_wallet = $1
            "#,
        )
        .bind(wallet)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn count_pending_invoices_to_receive(
        &self,
        wallet: &str,
    ) -> Result<i64, sqlx::Error> {
        sqlx::query_scalar::<_, i64>(
            r#"
            SELECT COUNT(*)::BIGINT
            FROM invoices
            WHERE sender_wallet = $1 AND status = 'pending'
            "#,
        )
        .bind(wallet)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn count_active_jobs(&self, wallet: &str) -> Result<i64, sqlx::Error> {
        sqlx::query_scalar::<_, i64>(
            r#"
            SELECT COUNT(*)::BIGINT
            FROM tasks
            WHERE client_wallet = $1
              AND status IN ('open', 'in_progress')
            "#,
        )
        .bind(wallet)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn count_applications_received(&self, wallet: &str) -> Result<i64, sqlx::Error> {
        sqlx::query_scalar::<_, i64>(
            r#"
            SELECT COUNT(*)::BIGINT
            FROM bids b
            INNER JOIN tasks t ON t.id = b.task_id
            WHERE t.client_wallet = $1
            "#,
        )
        .bind(wallet)
        .fetch_one(&self.pool)
        .await
    }

    pub async fn count_pending_payments(&self, wallet: &str) -> Result<i64, sqlx::Error> {
        sqlx::query_scalar::<_, i64>(
            r#"
            SELECT COUNT(*)::BIGINT
            FROM invoices
            WHERE receiver_wallet = $1 AND status = 'pending'
            "#,
        )
        .bind(wallet)
        .fetch_one(&self.pool)
        .await
    }
}
