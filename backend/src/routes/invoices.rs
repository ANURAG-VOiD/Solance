use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    middleware,
    routing::{get, post},
};
use rust_decimal::Decimal;
use serde::Deserialize;
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    auth::{AuthUser, middleware::require_auth},
    error::{ApiError, api_error},
    models::Invoice,
    services::{
        invoice_service::{CreateInvoiceInput, InvoiceService, InvoiceServiceError},
        notification_service::{CreateNotificationInput, NotificationService},
    },
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
        .route("/", post(create_invoice).get(list_invoices))
        .route("/{id}", get(get_invoice).patch(update_invoice))
        .route_layer(middleware::from_fn_with_state(state, require_auth))
}

async fn create_invoice(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Json(payload): Json<CreateInvoiceRequest>,
) -> Result<(StatusCode, Json<Invoice>), ApiError> {
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
        Ok(invoice) => {
            let _ = NotificationService::create_notification(
                &state.db,
                &state.realtime,
                CreateNotificationInput {
                    user_wallet: invoice.receiver_wallet.clone(),
                    notification_type: "invoice_created".to_string(),
                    title: "New invoice received".to_string(),
                    body: format!("You received an invoice for {} SOL.", invoice.amount),
                    href: "/invoices".to_string(),
                },
            )
            .await;

            Ok((StatusCode::CREATED, Json(invoice)))
        }
        Err(InvoiceServiceError::InvalidWallet) => Err(api_error(
            StatusCode::BAD_REQUEST,
            "Invalid receiver wallet address",
        )),
        Err(InvoiceServiceError::InvalidAmount) => Err(api_error(
            StatusCode::BAD_REQUEST,
            "Invoice amount must be greater than zero",
        )),
        Err(InvoiceServiceError::SameWallet) => Err(api_error(
            StatusCode::BAD_REQUEST,
            "Sender and receiver wallets must be different",
        )),
        Err(
            InvoiceServiceError::Internal
            | InvoiceServiceError::InvalidStatus
            | InvoiceServiceError::NotFound
            | InvoiceServiceError::Forbidden,
        ) => Err(api_error(
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to create invoice",
        )),
    }
}

async fn list_invoices(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
) -> Result<Json<Vec<Invoice>>, ApiError> {
    match InvoiceService::list_invoices_for_wallet(&state.db, &auth.wallet).await {
        Ok(invoices) => Ok(Json(invoices)),
        Err(_) => Err(api_error(
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to load invoices",
        )),
    }
}

async fn get_invoice(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<Invoice>, ApiError> {
    match InvoiceService::get_invoice(&state.db, id, &auth.wallet).await {
        Ok(invoice) => Ok(Json(invoice)),
        Err(InvoiceServiceError::NotFound) => {
            Err(api_error(StatusCode::NOT_FOUND, "Invoice not found"))
        }
        Err(InvoiceServiceError::Forbidden) => Err(api_error(
            StatusCode::FORBIDDEN,
            "You do not have access to this invoice",
        )),
        Err(_) => Err(api_error(
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to load invoice",
        )),
    }
}

async fn update_invoice(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateInvoiceRequest>,
) -> Result<Json<Invoice>, ApiError> {
    match InvoiceService::update_status(&state.db, id, &auth.wallet, &payload.status).await {
        Ok(invoice) => {
            if invoice.status == "paid" {
                let _ = NotificationService::create_notification(
                    &state.db,
                    &state.realtime,
                    CreateNotificationInput {
                        user_wallet: invoice.sender_wallet.clone(),
                        notification_type: "invoice_paid".to_string(),
                        title: "Invoice paid".to_string(),
                        body: format!("Invoice {} has been marked as paid.", invoice.id),
                        href: "/invoices".to_string(),
                    },
                )
                .await;
            }

            Ok(Json(invoice))
        }
        Err(InvoiceServiceError::NotFound) => {
            Err(api_error(StatusCode::NOT_FOUND, "Invoice not found"))
        }
        Err(InvoiceServiceError::Forbidden) => Err(api_error(
            StatusCode::FORBIDDEN,
            "You are not allowed to update this invoice",
        )),
        Err(InvoiceServiceError::InvalidStatus) => {
            Err(api_error(StatusCode::BAD_REQUEST, "Invalid invoice status"))
        }
        Err(_) => Err(api_error(
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to update invoice",
        )),
    }
}
