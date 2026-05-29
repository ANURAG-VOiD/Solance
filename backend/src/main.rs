mod config;
mod state;
mod error;

mod routes;
mod services;
mod models;
mod db;

use axum::Router;
use config::Config;
use tokio::net::TcpListener;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let config = Config::from_env();
    let addr = format!("0.0.0.0:{}", config.port);

    let app = Router::new().merge(routes::health::router());

    let listener = TcpListener::bind(&addr)
        .await
        .expect("Failed to bind port");

    println!("Server running on http://localhost:{}", config.port);

    axum::serve(listener, app)
        .await
        .expect("Server failed");
}
