mod config;
mod state;
mod error;

mod routes;
mod services;
mod models;
mod db;

use axum::Router;
use tokio::net::TcpListener;

#[tokio::main]
async fn main() {
    let app = Router::new().merge(routes::health::router());

    let listener = TcpListener::bind("0.0.0.0:3000")
        .await
        .expect("Failed to bind port");

    println!("Server running on http://localhost:3000");

    axum::serve(listener, app)
        .await
        .expect("Server failed");
}