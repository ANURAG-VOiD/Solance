use std::env;

/// Application configuration loaded from environment variables.
pub struct Config {
    pub port: String,
}

impl Config {
    /// Loads configuration from the process environment.
    /// `PORT` defaults to `"3000"` when not set.
    pub fn from_env() -> Self {
        let port = env::var("PORT").unwrap_or_else(|_| "3000".to_string());

        Self { port }
    }
}
