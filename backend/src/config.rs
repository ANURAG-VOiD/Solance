use std::env;

/// Application configuration loaded from environment variables.
pub struct Config {
    pub port: String,
    pub database_url: String,
    pub jwt_secret: String,
    pub frontend_url: String,
}

impl Config {
    /// Loads configuration from the process environment.
    /// `PORT` defaults to `"8080"` when not set.
    /// Panics if `DATABASE_URL` or `JWT_SECRET` is not set.
    pub fn from_env() -> Self {
        let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());
        let database_url =
            env::var("DATABASE_URL").expect("DATABASE_URL must be set");
        let jwt_secret = env::var("JWT_SECRET").expect("JWT_SECRET must be set");
        let frontend_url =
            env::var("FRONTEND_URL").unwrap_or_else(|_| "http://localhost:3000".to_string());

        Self {
            port,
            database_url,
            jwt_secret,
            frontend_url,
        }
    }
}
