use axum::{Json, Router, extract::Path, routing::{get, patch, post}};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::models::invoice::InvoiceStatus;

/// Registers invoice creation, retrieval, and status update endpoints.
pub fn router() -> Router {
    Router::new()
        .route("/invoices", post(create_invoice))
        .route("/invoices/{id}", get(get_invoice))
        .route("/invoices/{id}", patch(update_invoice))
}

#[derive(Debug, Deserialize)]
struct CreateInvoiceBody {
    receiver_wallet: String,
    amount: u64,
}

#[derive(Debug, Deserialize)]
struct UpdateInvoiceBody {
    status: InvoiceStatus,
}

#[derive(Debug, Serialize)]
struct InvoiceResponse {
    id: Uuid,
    sender_wallet: String,
    receiver_wallet: String,
    amount: u64,
    status: InvoiceStatus,
}

async fn create_invoice(Json(_body): Json<CreateInvoiceBody>) -> Json<InvoiceResponse> {
    todo!("Create a new invoice")
}

async fn get_invoice(Path(_id): Path<Uuid>) -> Json<InvoiceResponse> {
    todo!("Fetch invoice by id")
}

async fn update_invoice(
    Path(_id): Path<Uuid>,
    Json(_body): Json<UpdateInvoiceBody>,
) -> Json<InvoiceResponse> {
    todo!("Update invoice status (e.g. mark as paid)")
}
