use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    models::Notification,
    repositories::notification::NotificationRepository,
    services::realtime_service::RealtimeHub,
};

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum NotificationServiceError {
    NotFound,
    Unavailable(String),
    Internal,
}

impl std::fmt::Display for NotificationServiceError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::NotFound => write!(f, "notification not found"),
            Self::Unavailable(message) => write!(f, "{message}"),
            Self::Internal => write!(f, "failed to load notifications"),
        }
    }
}

impl std::error::Error for NotificationServiceError {}

impl NotificationServiceError {
    fn from_sqlx(error: sqlx::Error) -> Self {
        tracing::error!(%error, "notification database operation failed");

        if let sqlx::Error::Database(db_error) = &error {
            // PostgreSQL undefined_table
            if db_error.code().as_deref() == Some("42P01") {
                return Self::Unavailable(
                    "Notifications table is missing. Run database migrations.".into(),
                );
            }
        }

        Self::Internal
    }
}

pub struct CreateNotificationInput {
    pub user_wallet: String,
    pub notification_type: String,
    pub title: String,
    pub body: String,
    pub href: String,
}

pub struct NotificationService;

impl NotificationService {
    pub async fn create_notification(
        pool: &PgPool,
        realtime: &RealtimeHub,
        input: CreateNotificationInput,
    ) -> Result<Notification, NotificationServiceError> {
        let notification = NotificationRepository::new(pool.clone())
            .create(
                &input.user_wallet,
                &input.notification_type,
                &input.title,
                &input.body,
                &input.href,
            )
            .await
            .map_err(NotificationServiceError::from_sqlx)?;

        // Broadcast after persistence to keep websocket payload consistent with API fetches.
        realtime.publish_notification(&input.user_wallet, notification.clone());
        Ok(notification)
    }

    pub async fn list_notifications(
        pool: &PgPool,
        wallet: &str,
    ) -> Result<Vec<Notification>, NotificationServiceError> {
        NotificationRepository::new(pool.clone())
            .list_by_wallet(wallet)
            .await
            .map_err(NotificationServiceError::from_sqlx)
    }

    pub async fn mark_read(
        pool: &PgPool,
        wallet: &str,
        id: Uuid,
    ) -> Result<Notification, NotificationServiceError> {
        NotificationRepository::new(pool.clone())
            .mark_read(wallet, id)
            .await
            .map_err(|error| match error {
                sqlx::Error::RowNotFound => NotificationServiceError::NotFound,
                other => NotificationServiceError::from_sqlx(other),
            })
    }

    pub async fn mark_all_read(
        pool: &PgPool,
        wallet: &str,
    ) -> Result<u64, NotificationServiceError> {
        NotificationRepository::new(pool.clone())
            .mark_all_read(wallet)
            .await
            .map_err(NotificationServiceError::from_sqlx)
    }
}
