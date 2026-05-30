use axum::{
    extract::{State, WebSocketUpgrade},
    http::StatusCode,
    middleware,
    response::Response,
    routing::get,
    Json, Router,
};
use axum::extract::ws::{Message, WebSocket};
use std::sync::Arc;

use crate::{
    auth::{middleware::require_auth, AuthUser},
    state::AppState,
};

pub fn router(state: Arc<AppState>) -> Router<Arc<AppState>> {
    Router::new()
        .route("/notifications", get(notifications_ws))
        .route("/health", get(ws_health))
        .route_layer(middleware::from_fn_with_state(state, require_auth))
}

async fn ws_health() -> Result<Json<&'static str>, StatusCode> {
    Ok(Json("ok"))
}

async fn notifications_ws(
    ws: WebSocketUpgrade,
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
) -> Response {
    ws.on_upgrade(move |socket| handle_notifications_socket(socket, state, auth.wallet))
}

async fn handle_notifications_socket(mut socket: WebSocket, state: Arc<AppState>, wallet: String) {
    let mut rx = state.realtime.subscribe();

    loop {
        tokio::select! {
            outbound = rx.recv() => {
                match outbound {
                    Ok(event) if event.wallet == wallet => {
                        match serde_json::to_string(&event) {
                            Ok(payload) => {
                                if socket.send(Message::Text(payload.into())).await.is_err() {
                                    break;
                                }
                            }
                            Err(_) => continue,
                        }
                    }
                    Ok(_) => continue,
                    Err(tokio::sync::broadcast::error::RecvError::Lagged(_)) => continue,
                    Err(tokio::sync::broadcast::error::RecvError::Closed) => break,
                }
            }
            inbound = socket.recv() => {
                match inbound {
                    Some(Ok(Message::Close(_))) | None => break,
                    Some(Ok(_)) => {}
                    Some(Err(_)) => break,
                }
            }
        }
    }
}
