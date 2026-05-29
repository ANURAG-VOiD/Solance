mod config;
mod state;
mod error;

mod routes;
mod services;
mod models;
mod db;

use config::Config;
use db::create_pool;
use state::AppState;
use tokio::net::TcpListener;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let config = Config::from_env();

    let pool = create_pool(&config.database_url)
        .await
        .expect("Failed to connect to database");

    let _app_state = AppState { db: pool };

    let addr = format!("0.0.0.0:{}", config.port);

    let app = routes::health::router();

    let listener = TcpListener::bind(&addr)
        .await
        .expect("Failed to bind port");

    println!("Server running on http://localhost:{}", config.port);

    axum::serve(listener, app)
        .await
        .expect("Server failed");
}
