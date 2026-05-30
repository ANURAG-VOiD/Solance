use rust_decimal::Decimal;
use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    auth::signature::validate_wallet_address,
    models::Invoice,
    repositories::invoice::InvoiceRepository,
};

pub const STATUS_PENDING: &str = "pending";
pub const STATUS_PAID: &str = "paid";
pub const STATUS_CANCELLED: &str = "cancelled";

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum InvoiceServiceError {
    InvalidWallet,
    InvalidAmount,
    SameWallet,
    InvalidStatus,
    NotFound,
    Forbidden,
    Internal,
}

impl std::fmt::Display for InvoiceServiceError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::InvalidWallet => write!(f, "invalid wallet address"),
            Self::InvalidAmount => write!(f, "amount must be greater than zero"),
            Self::SameWallet => write!(f, "sender and receiver must differ"),
            Self::InvalidStatus => write!(f, "invalid invoice status"),
            Self::NotFound => write!(f, "invoice not found"),
            Self::Forbidden => write!(f, "not authorized for this invoice"),
            Self::Internal => write!(f, "internal invoice error"),
        }
    }
}

impl std::error::Error for InvoiceServiceError {}

pub struct CreateInvoiceInput {
    pub sender_wallet: String,
    pub receiver_wallet: String,
    pub amount: Decimal,
}

pub struct InvoiceService;

impl InvoiceService {
    pub async fn create_invoice(
        pool: &PgPool,
        input: CreateInvoiceInput,
    ) -> Result<Invoice, InvoiceServiceError> {
        validate_wallet_address(&input.receiver_wallet)
            .map_err(|_| InvoiceServiceError::InvalidWallet)?;

        if input.amount <= Decimal::ZERO {
            return Err(InvoiceServiceError::InvalidAmount);
        }

        if input.sender_wallet == input.receiver_wallet {
            return Err(InvoiceServiceError::SameWallet);
        }

        InvoiceRepository::new(pool.clone())
            .create(&input.sender_wallet, &input.receiver_wallet, input.amount)
            .await
            .map_err(|_| InvoiceServiceError::Internal)
    }

    pub async fn get_invoice(
        pool: &PgPool,
        id: Uuid,
        requester_wallet: &str,
    ) -> Result<Invoice, InvoiceServiceError> {
        let invoice = InvoiceRepository::new(pool.clone())
            .get_by_id(id)
            .await
            .map_err(|_| InvoiceServiceError::Internal)?
            .ok_or(InvoiceServiceError::NotFound)?;

        if !is_participant(&invoice, requester_wallet) {
            return Err(InvoiceServiceError::Forbidden);
        }

        Ok(invoice)
    }

    pub async fn list_invoices_for_wallet(
        pool: &PgPool,
        wallet: &str,
    ) -> Result<Vec<Invoice>, InvoiceServiceError> {
        InvoiceRepository::new(pool.clone())
            .list_by_wallet(wallet)
            .await
            .map_err(|_| InvoiceServiceError::Internal)
    }

    pub async fn update_status(
        pool: &PgPool,
        id: Uuid,
        requester_wallet: &str,
        status: &str,
    ) -> Result<Invoice, InvoiceServiceError> {
        if !is_valid_status(status) {
            return Err(InvoiceServiceError::InvalidStatus);
        }

        let invoice = InvoiceRepository::new(pool.clone())
            .get_by_id(id)
            .await
            .map_err(|_| InvoiceServiceError::Internal)?
            .ok_or(InvoiceServiceError::NotFound)?;

        if !is_participant(&invoice, requester_wallet) {
            return Err(InvoiceServiceError::Forbidden);
        }

        InvoiceRepository::new(pool.clone())
            .update_status(id, status)
            .await
            .map_err(|_| InvoiceServiceError::Internal)
    }
}

fn is_participant(invoice: &Invoice, wallet: &str) -> bool {
    invoice.sender_wallet == wallet || invoice.receiver_wallet == wallet
}

fn is_valid_status(status: &str) -> bool {
    matches!(status, STATUS_PENDING | STATUS_PAID | STATUS_CANCELLED)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn valid_statuses_are_recognized() {
        assert!(is_valid_status(STATUS_PENDING));
        assert!(is_valid_status(STATUS_PAID));
        assert!(is_valid_status(STATUS_CANCELLED));
        assert!(!is_valid_status("unknown"));
    }
}
