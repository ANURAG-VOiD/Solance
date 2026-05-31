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
    /// Panics if `DATABASE_URL` or `JWT_SECRET` is not set, if `JWT_SECRET` is
    /// shorter than 32 characters, or if `FRONTEND_URL` looks like a dev value
    /// while running at a non-debug log level.
    pub fn from_env() -> Self {
        let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());
        let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
        let jwt_secret = env::var("JWT_SECRET").expect("JWT_SECRET must be set");

        if jwt_secret.len() < 32 {
            panic!(
                "JWT_SECRET must be at least 32 characters (got {}). \
                 Generate one with: openssl rand -hex 32",
                jwt_secret.len()
            );
        }

        let frontend_url =
            env::var("FRONTEND_URL").unwrap_or_else(|_| "http://localhost:3000".to_string());

        // Warn if FRONTEND_URL looks like a local dev value in a non-dev context.
        let rust_log = env::var("RUST_LOG").unwrap_or_default().to_lowercase();
        let is_dev_log = rust_log.contains("debug") || rust_log.contains("trace");
        if frontend_url.contains("localhost") && !is_dev_log {
            panic!(
                "FRONTEND_URL contains 'localhost' ({}) but RUST_LOG is '{}'. \
                 This looks like a dev value being used in a non-dev context. \
                 Set FRONTEND_URL to your production origin, or set RUST_LOG=debug \
                 to suppress this check.",
                frontend_url, rust_log
            );
        }

        Self {
            port,
            database_url,
            jwt_secret,
            frontend_url,
        }
    }
}
