use axum::{
    extract::{Path, State},
    http::StatusCode,
    middleware,
    routing::{get, post},
    Json, Router,
};
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    auth::{middleware::require_auth, AuthUser},
    error::{api_error, ApiError},
    models::{Bid, CreateBidRequest, CreateTaskRequest, Task},
    services::{
        bid_service::{BidService, BidServiceError},
        notification_service::{CreateNotificationInput, NotificationService},
        task_service::{TaskService, TaskServiceError},
    },
    state::AppState,
};

pub fn router(state: Arc<AppState>) -> Router<Arc<AppState>> {
    let public = Router::new()
        .route("/", get(list_open_tasks))
        .route("/{id}", get(get_task));

    let protected = Router::new()
        .route("/", post(create_task))
        .route("/mine", get(list_my_tasks))
        .route("/{id}/bids", post(create_bid).get(list_bids))
        .route_layer(middleware::from_fn_with_state(state, require_auth));

    public.merge(protected)
}

async fn create_task(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Json(payload): Json<CreateTaskRequest>,
) -> Result<(StatusCode, Json<Task>), StatusCode> {
    match TaskService::create_task(&state.db, &auth.wallet, payload).await {
        Ok(task) => Ok((StatusCode::CREATED, Json(task))),
        Err(
            TaskServiceError::InvalidTitle
            | TaskServiceError::InvalidDescription
            | TaskServiceError::InvalidBudget,
        ) => Err(StatusCode::BAD_REQUEST),
        Err(TaskServiceError::Internal) => Err(StatusCode::INTERNAL_SERVER_ERROR),
        Err(TaskServiceError::NotFound) => Err(StatusCode::NOT_FOUND),
    }
}

async fn list_my_tasks(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
) -> Result<Json<Vec<Task>>, StatusCode> {
    match TaskService::list_my_tasks(&state.db, &auth.wallet).await {
        Ok(tasks) => Ok(Json(tasks)),
        Err(TaskServiceError::Internal) => Err(StatusCode::INTERNAL_SERVER_ERROR),
        Err(_) => Err(StatusCode::BAD_REQUEST),
    }
}

async fn list_open_tasks(
    State(state): State<Arc<AppState>>,
) -> Result<Json<Vec<Task>>, StatusCode> {
    match TaskService::list_open_tasks(&state.db).await {
        Ok(tasks) => Ok(Json(tasks)),
        Err(TaskServiceError::Internal) => Err(StatusCode::INTERNAL_SERVER_ERROR),
        Err(_) => Err(StatusCode::BAD_REQUEST),
    }
}

async fn get_task(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<Json<Task>, StatusCode> {
    match TaskService::get_task(&state.db, id).await {
        Ok(task) => Ok(Json(task)),
        Err(TaskServiceError::NotFound) => Err(StatusCode::NOT_FOUND),
        Err(TaskServiceError::Internal) => Err(StatusCode::INTERNAL_SERVER_ERROR),
        Err(_) => Err(StatusCode::BAD_REQUEST),
    }
}

async fn create_bid(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Path(task_id): Path<Uuid>,
    Json(payload): Json<CreateBidRequest>,
) -> Result<(StatusCode, Json<Bid>), ApiError> {
    match BidService::create_bid(&state.db, task_id, &auth.wallet, payload).await {
        Ok(bid) => {
            if let Ok(task) = TaskService::get_task(&state.db, task_id).await {
                let _ = NotificationService::create_notification(
                    &state.db,
                    &state.realtime,
                    CreateNotificationInput {
                        user_wallet: task.client_wallet,
                        notification_type: "application".to_string(),
                        title: "New proposal received".to_string(),
                        body: format!("A freelancer submitted a bid on '{}'.", task.title),
                        href: format!("/jobs/{}/applicants", task.id),
                    },
                )
                .await;
            }
            Ok((StatusCode::CREATED, Json(bid)))
        }
        Err(
            e @ (BidServiceError::InvalidCoverLetter
            | BidServiceError::InvalidAmount
            | BidServiceError::SameWallet
            | BidServiceError::TaskNotOpen),
        ) => Err(api_error(StatusCode::BAD_REQUEST, e.to_string())),
        Err(BidServiceError::TaskNotFound) => {
            Err(api_error(StatusCode::NOT_FOUND, BidServiceError::TaskNotFound.to_string()))
        }
        Err(BidServiceError::DuplicateBid) => {
            Err(api_error(StatusCode::CONFLICT, BidServiceError::DuplicateBid.to_string()))
        }
        Err(BidServiceError::Internal) => {
            Err(api_error(
                StatusCode::INTERNAL_SERVER_ERROR,
                BidServiceError::Internal.to_string(),
            ))
        }
        Err(e @ (BidServiceError::Forbidden | BidServiceError::NotFound)) => {
            Err(api_error(StatusCode::FORBIDDEN, e.to_string()))
        }
        Err(BidServiceError::BidStateConflict) => {
            Err(api_error(StatusCode::CONFLICT, BidServiceError::BidStateConflict.to_string()))
        }
    }
}

async fn list_bids(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Path(task_id): Path<Uuid>,
) -> Result<Json<Vec<Bid>>, StatusCode> {
    match BidService::list_bids_for_task(&state.db, task_id, &auth.wallet).await {
        Ok(bids) => Ok(Json(bids)),
        Err(BidServiceError::TaskNotFound) => Err(StatusCode::NOT_FOUND),
        Err(BidServiceError::Forbidden) => Err(StatusCode::FORBIDDEN),
        Err(BidServiceError::Internal) => Err(StatusCode::INTERNAL_SERVER_ERROR),
        Err(_) => Err(StatusCode::BAD_REQUEST),
    }
}
