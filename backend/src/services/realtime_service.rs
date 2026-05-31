use serde::Serialize;
use tokio::sync::broadcast;

use crate::models::{Message, Notification};

/// Concrete payload carried by a realtime event.
///
/// Serialized with `#[serde(untagged)]` so the wire shape is a bare object of
/// the inner model's fields (e.g. `{ "id": ..., "content": ... }`). This keeps
/// the envelope backward compatible with the existing notifications consumer:
/// the `event` discriminator on `WsEvent` remains the single source of truth
/// for clients deciding how to interpret `payload`.
#[derive(Debug, Clone, Serialize)]
#[serde(untagged)]
pub enum WsPayload {
    Notification(Notification),
    Message(Message),
}

#[derive(Debug, Clone, Serialize)]
pub struct WsEvent {
    pub event: &'static str,
    pub wallet: String,
    pub payload: WsPayload,
}

#[derive(Clone)]
pub struct RealtimeHub {
    tx: broadcast::Sender<WsEvent>,
}

impl RealtimeHub {
    pub fn new(buffer: usize) -> Self {
        let (tx, _) = broadcast::channel(buffer);
        Self { tx }
    }

    pub fn subscribe(&self) -> broadcast::Receiver<WsEvent> {
        self.tx.subscribe()
    }

    pub fn publish_notification(&self, wallet: &str, notification: Notification) {
        let _ = self.tx.send(WsEvent {
            event: "notification.created",
            wallet: wallet.to_string(),
            payload: WsPayload::Notification(notification),
        });
    }

    /// Push a newly persisted chat message to a single participant's socket.
    ///
    /// Recipient authorization is the caller's responsibility: `wallet` must be
    /// the other chat participant, and the WebSocket handler additionally only
    /// forwards events whose `wallet` matches the authenticated connection, so
    /// messages never leak to unrelated clients.
    pub fn publish_message(&self, wallet: &str, message: Message) {
        let _ = self.tx.send(WsEvent {
            event: "message.created",
            wallet: wallet.to_string(),
            payload: WsPayload::Message(message),
        });
    }
}
