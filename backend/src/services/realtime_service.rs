use serde::Serialize;
use tokio::sync::broadcast;

use crate::models::Notification;

#[derive(Debug, Clone, Serialize)]
pub struct WsEvent {
    pub event: &'static str,
    pub wallet: String,
    pub payload: Notification,
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
            payload: notification,
        });
    }
}
