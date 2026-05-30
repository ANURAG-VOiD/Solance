pub mod models;

mod auth;
mod config;
mod state;
mod error;
mod routes;
mod services;
mod repositories;
mod db;

use axum::http::{header, HeaderValue, Method};
use axum::Router;
use config::Config;
use db::create_pool;
use state::AppState;
use auth::nonce_store::NonceStore;
use std::sync::Arc;
use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let config = Config::from_env();

    let pool = create_pool(&config.database_url)
        .await
        .expect("Failed to connect to database");

    let app_state = Arc::new(AppState {
        db: pool,
        nonces: NonceStore::new(),
        jwt_secret: config.jwt_secret.clone(),
    });

    let cors = CorsLayer::new()
        .allow_origin(
            config
                .frontend_url
                .parse::<HeaderValue>()
                .expect("FRONTEND_URL must be a valid header value"),
        )
        .allow_methods([Method::GET, Method::POST, Method::PATCH, Method::OPTIONS])
        .allow_headers([header::AUTHORIZATION, header::CONTENT_TYPE]);

    let addr = format!("0.0.0.0:{}", config.port);

    let app = Router::new()
        .nest("/api/health", routes::health::router())
        .nest("/api/auth", routes::auth::router(app_state.clone()))
        .nest("/api/chats", routes::chats::router(app_state.clone()))
        .nest("/api/messages", routes::messages::router(app_state.clone()))
        .nest("/api/users", routes::user::router())
        .layer(cors)
        .with_state(app_state);

    let listener = TcpListener::bind(&addr)
        .await
        .expect("Failed to bind port");

    println!("Solance backend running on http://{}", addr);

    axum::serve(listener, app)
        .await
        .expect("Server failed");
}
