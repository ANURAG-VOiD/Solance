use rust_decimal::Decimal;
use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    models::{CreateTaskRequest, Task},
    repositories::task::TaskRepository,
};

pub const STATUS_OPEN: &str = "open";
pub const STATUS_IN_PROGRESS: &str = "in_progress";
pub const STATUS_COMPLETED: &str = "completed";
pub const STATUS_CANCELLED: &str = "cancelled";

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TaskServiceError {
    InvalidTitle,
    InvalidDescription,
    InvalidBudget,
    NotFound,
    Internal,
}

impl std::fmt::Display for TaskServiceError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::InvalidTitle => write!(f, "title must not be empty"),
            Self::InvalidDescription => write!(f, "description must not be empty"),
            Self::InvalidBudget => write!(f, "budget must be greater than zero"),
            Self::NotFound => write!(f, "task not found"),
            Self::Internal => write!(f, "internal task error"),
        }
    }
}

impl std::error::Error for TaskServiceError {}

pub struct TaskService;

impl TaskService {
    pub async fn create_task(
        pool: &PgPool,
        client_wallet: &str,
        payload: CreateTaskRequest,
    ) -> Result<Task, TaskServiceError> {
        if payload.title.trim().is_empty() {
            return Err(TaskServiceError::InvalidTitle);
        }

        if payload.description.trim().is_empty() {
            return Err(TaskServiceError::InvalidDescription);
        }

        if payload.budget <= Decimal::ZERO {
            return Err(TaskServiceError::InvalidBudget);
        }

        TaskRepository::new(pool.clone())
            .create(
                client_wallet,
                payload.title.trim(),
                payload.description.trim(),
                payload.budget,
            )
            .await
            .map_err(|_| TaskServiceError::Internal)
    }

    pub async fn get_task(pool: &PgPool, id: Uuid) -> Result<Task, TaskServiceError> {
        TaskRepository::new(pool.clone())
            .get_by_id(id)
            .await
            .map_err(|_| TaskServiceError::Internal)?
            .ok_or(TaskServiceError::NotFound)
    }

    pub async fn list_open_tasks(pool: &PgPool) -> Result<Vec<Task>, TaskServiceError> {
        TaskRepository::new(pool.clone())
            .list_open()
            .await
            .map_err(|_| TaskServiceError::Internal)
    }
}
