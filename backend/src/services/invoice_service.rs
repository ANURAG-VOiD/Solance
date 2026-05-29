use uuid::Uuid;

use crate::models::invoice::{Invoice, InvoiceStatus};

/// Encapsulates invoice creation, retrieval, and payment status updates.
pub struct InvoiceService;

impl InvoiceService {
    pub async fn create_invoice(
        sender_wallet: &str,
        receiver_wallet: &str,
        amount: u64,
    ) -> Result<Invoice, String> {
        todo!(
            "Create invoice from {sender_wallet} to {receiver_wallet} for {amount} lamports"
        )
    }

    pub async fn get_invoice_by_id(id: Uuid) -> Result<Invoice, String> {
        todo!("Fetch invoice by id: {id}")
    }

    pub async fn update_invoice_status(
        id: Uuid,
        status: InvoiceStatus,
    ) -> Result<Invoice, String> {
        todo!("Update invoice {id} status to {status:?}")
    }
}
