use axum::extract::ws::{Message, WebSocket};
use axum::{
    Json, Router,
    extract::{Query, State, WebSocketUpgrade},
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::get,
};
use serde::Deserialize;
use std::sync::Arc;

use crate::{auth::jwt::validate_token, state::AppState};

/// Query parameters accepted on the WebSocket handshake.
///
/// Browsers cannot attach custom headers (such as `Authorization`) to a
/// WebSocket upgrade request, so the JWT is supplied as a `token` query
/// parameter instead of relying on the shared `require_auth` middleware.
#[derive(Debug, Deserialize)]
struct WsAuthParams {
    token: String,
}

pub fn router(_state: Arc<AppState>) -> Router<Arc<AppState>> {
    // NOTE: This router intentionally omits the `require_auth` middleware.
    // Authentication for the notifications socket is performed inline from the
    // `token` query parameter (see `notifications_ws`) because browser
    // WebSocket clients cannot send an `Authorization` header.
    Router::new()
        .route("/notifications", get(notifications_ws))
        .route("/health", get(ws_health))
}

async fn ws_health() -> Json<&'static str> {
    Json("ok")
}

async fn notifications_ws(
    ws: WebSocketUpgrade,
    State(state): State<Arc<AppState>>,
    Query(params): Query<WsAuthParams>,
) -> Response {
    // Validate the JWT before upgrading so unauthenticated clients never reach
    // the broadcast stream.
    let wallet = match validate_token(&params.token, &state.jwt_secret) {
        Ok(claims) => claims.wallet,
        Err(_) => {
            return (StatusCode::UNAUTHORIZED, "invalid or expired token").into_response();
        }
    };

    ws.on_upgrade(move |socket| handle_notifications_socket(socket, state, wallet))
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
