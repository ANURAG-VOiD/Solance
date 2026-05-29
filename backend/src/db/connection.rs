use sqlx::postgres::PgPoolOptions;
use sqlx::{Pool, Postgres};

pub type DbPool = Pool<Postgres>;

/// Creates a PostgreSQL connection pool with a maximum of 5 connections.
pub async fn create_pool(database_url: &str) -> Result<DbPool, sqlx::Error> {
    PgPoolOptions::new()
        .max_connections(5)
        .connect(database_url)
        .await
}
