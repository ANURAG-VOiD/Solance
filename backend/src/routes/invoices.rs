use axum::{
    extract::{Path, State},
    http::StatusCode,
    middleware,
    routing::{get, post},
    Json, Router,
};
use rust_decimal::Decimal;
use serde::Deserialize;
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    auth::{middleware::require_auth, AuthUser},
    models::Invoice,
    services::invoice_service::{CreateInvoiceInput, InvoiceService, InvoiceServiceError},
    state::AppState,
};

#[derive(Debug, Deserialize)]
pub struct CreateInvoiceRequest {
    pub receiver_wallet: String,
    pub amount: Decimal,
}

#[derive(Debug, Deserialize)]
pub struct UpdateInvoiceRequest {
    pub status: String,
}

pub fn router(state: Arc<AppState>) -> Router<Arc<AppState>> {
    Router::new()
        .route("/", post(create_invoice))
        .route("/{id}", get(get_invoice).patch(update_invoice))
        .route_layer(middleware::from_fn_with_state(state, require_auth))
}

async fn create_invoice(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Json(payload): Json<CreateInvoiceRequest>,
) -> Result<(StatusCode, Json<Invoice>), StatusCode> {
    match InvoiceService::create_invoice(
        &state.db,
        CreateInvoiceInput {
            sender_wallet: auth.wallet,
            receiver_wallet: payload.receiver_wallet,
            amount: payload.amount,
        },
    )
    .await
    {
        Ok(invoice) => Ok((StatusCode::CREATED, Json(invoice))),
        Err(InvoiceServiceError::InvalidWallet | InvoiceServiceError::InvalidAmount | InvoiceServiceError::SameWallet) => {
            Err(StatusCode::BAD_REQUEST)
        }
        Err(InvoiceServiceError::Internal) => Err(StatusCode::INTERNAL_SERVER_ERROR),
        Err(InvoiceServiceError::InvalidStatus | InvoiceServiceError::NotFound | InvoiceServiceError::Forbidden) => {
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

async fn get_invoice(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<Invoice>, StatusCode> {
    match InvoiceService::get_invoice(&state.db, id, &auth.wallet).await {
        Ok(invoice) => Ok(Json(invoice)),
        Err(InvoiceServiceError::NotFound) => Err(StatusCode::NOT_FOUND),
        Err(InvoiceServiceError::Forbidden) => Err(StatusCode::FORBIDDEN),
        Err(InvoiceServiceError::Internal) => Err(StatusCode::INTERNAL_SERVER_ERROR),
        Err(_) => Err(StatusCode::BAD_REQUEST),
    }
}

async fn update_invoice(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateInvoiceRequest>,
) -> Result<Json<Invoice>, StatusCode> {
    match InvoiceService::update_status(&state.db, id, &auth.wallet, &payload.status).await {
        Ok(invoice) => Ok(Json(invoice)),
        Err(InvoiceServiceError::NotFound) => Err(StatusCode::NOT_FOUND),
        Err(InvoiceServiceError::Forbidden) => Err(StatusCode::FORBIDDEN),
        Err(InvoiceServiceError::InvalidStatus) => Err(StatusCode::BAD_REQUEST),
        Err(InvoiceServiceError::Internal) => Err(StatusCode::INTERNAL_SERVER_ERROR),
        Err(_) => Err(StatusCode::BAD_REQUEST),
    }
}
