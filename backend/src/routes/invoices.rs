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
        Err(InvoiceServiceError::InvalidWallet | InvoiceServiceError::InvalidAmount | InvoiceServiceError::SameWallet) => {
            Err(StatusCode::BAD_REQUEST)
        }
        Err(InvoiceServiceError::Internal) => Err(StatusCode::INTERNAL_SERVER_ERROR),
        Err(InvoiceServiceError::InvalidStatus | InvoiceServiceError::NotFound | InvoiceServiceError::Forbidden) => {
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

async fn list_invoices(
    State(state): State<Arc<AppState>>,
    auth: AuthUser,
) -> Result<Json<Vec<Invoice>>, StatusCode> {
    match InvoiceService::list_invoices_for_wallet(&state.db, &auth.wallet).await {
        Ok(invoices) => Ok(Json(invoices)),
        Err(InvoiceServiceError::Internal) => Err(StatusCode::INTERNAL_SERVER_ERROR),
        Err(_) => Err(StatusCode::BAD_REQUEST),
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
        Err(InvoiceServiceError::NotFound) => Err(StatusCode::NOT_FOUND),
        Err(InvoiceServiceError::Forbidden) => Err(StatusCode::FORBIDDEN),
        Err(InvoiceServiceError::InvalidStatus) => Err(StatusCode::BAD_REQUEST),
        Err(InvoiceServiceError::Internal) => Err(StatusCode::INTERNAL_SERVER_ERROR),
        Err(_) => Err(StatusCode::BAD_REQUEST),
    }
}
