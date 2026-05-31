pub mod models;

mod auth;
mod config;
mod db;
mod error;
mod repositories;
mod routes;
mod services;
mod state;

use auth::nonce_store::NonceStore;
use axum::Router;
use axum::http::{HeaderValue, Method, header};
use config::Config;
use db::create_pool;
use services::realtime_service::RealtimeHub;
use state::AppState;
use std::sync::Arc;
use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let config = Config::from_env();

    let pool = create_pool(&config.database_url)
        .await
        .expect("Failed to initialize database");

    let app_state = Arc::new(AppState {
        db: pool,
        nonces: NonceStore::new(),
        jwt_secret: config.jwt_secret.clone(),
        // Keep a bounded buffer so slow websocket clients do not block writers.
        realtime: RealtimeHub::new(512),
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
        .nest("/api/invoices", routes::invoices::router(app_state.clone()))
        .nest("/api/tasks", routes::tasks::router(app_state.clone()))
        .nest("/api/bids", routes::bids::router(app_state.clone()))
        .nest("/api/users", routes::user::router(app_state.clone()))
        .nest(
            "/api/dashboard",
            routes::dashboard::router(app_state.clone()),
        )
        .nest(
            "/api/notifications",
            routes::notifications::router(app_state.clone()),
        )
        .nest("/api/ws", routes::ws::router(app_state.clone()))
        .layer(cors)
        .with_state(app_state);

    let listener = TcpListener::bind(&addr).await.expect("Failed to bind port");

    println!("Solance backend running on http://{}", addr);

    axum::serve(listener, app).await.expect("Server failed");
}
