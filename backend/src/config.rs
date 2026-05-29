use std::env;

/// Application configuration loaded from environment variables.
pub struct Config {
    pub port: String,
    pub database_url: String,
}

impl Config {
    /// Loads configuration from the process environment.
    /// `PORT` defaults to `"3000"` when not set.
    /// Panics if `DATABASE_URL` is not set.
    pub fn from_env() -> Self {
        let port = env::var("PORT").unwrap_or_else(|_| "3000".to_string());
        let database_url =
            env::var("DATABASE_URL").expect("DATABASE_URL must be set");

        Self {
            port,
            database_url,
        }
    }
}
