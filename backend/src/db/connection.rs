use sqlx::postgres::PgPoolOptions;
use sqlx::{Pool, Postgres};

pub type DbPool = Pool<Postgres>;

#[derive(Debug)]
pub enum DbInitError {
    Pool(sqlx::Error),
    Migration(sqlx::migrate::MigrateError),
}

impl std::fmt::Display for DbInitError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Pool(err) => write!(f, "database connection failed: {err}"),
            Self::Migration(err) => write!(f, "database migration failed: {err}"),
        }
    }
}

impl std::error::Error for DbInitError {}

/// Creates a PostgreSQL connection pool and applies pending SQLx migrations.
pub async fn create_pool(database_url: &str) -> Result<DbPool, DbInitError> {
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(database_url)
        .await
        .map_err(DbInitError::Pool)?;

    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .map_err(DbInitError::Migration)?;

    Ok(pool)
}
