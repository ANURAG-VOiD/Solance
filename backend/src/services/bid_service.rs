use rust_decimal::Decimal;
use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    models::{AcceptBidResponse, Bid, CreateBidRequest},
    repositories::{bid::BidRepository, task::TaskRepository},
};

pub const STATUS_PENDING: &str = "pending";
pub const STATUS_ACCEPTED: &str = "accepted";
pub const STATUS_REJECTED: &str = "rejected";

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BidServiceError {
    InvalidCoverLetter,
    InvalidAmount,
    SameWallet,
    TaskNotFound,
    TaskNotOpen,
    NotFound,
    Forbidden,
    Conflict,
    Internal,
}

impl std::fmt::Display for BidServiceError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::InvalidCoverLetter => write!(f, "cover letter must not be empty"),
            Self::InvalidAmount => write!(f, "proposed amount must be greater than zero"),
            Self::SameWallet => write!(f, "client cannot bid on their own task"),
            Self::TaskNotFound => write!(f, "task not found"),
            Self::TaskNotOpen => write!(f, "task is not open for bids"),
            Self::NotFound => write!(f, "bid not found"),
            Self::Forbidden => write!(f, "not authorized for this task"),
            Self::Conflict => write!(f, "bid conflict"),
            Self::Internal => write!(f, "internal bid error"),
        }
    }
}

impl std::error::Error for BidServiceError {}

pub struct BidService;

impl BidService {
    pub async fn create_bid(
        pool: &PgPool,
        task_id: Uuid,
        freelancer_wallet: &str,
        payload: CreateBidRequest,
    ) -> Result<Bid, BidServiceError> {
        if payload.cover_letter.trim().is_empty() {
            return Err(BidServiceError::InvalidCoverLetter);
        }

        if payload.proposed_amount <= Decimal::ZERO {
            return Err(BidServiceError::InvalidAmount);
        }

        let task = TaskRepository::new(pool.clone())
            .get_by_id(task_id)
            .await
            .map_err(|_| BidServiceError::Internal)?
            .ok_or(BidServiceError::TaskNotFound)?;

        if task.status != "open" {
            return Err(BidServiceError::TaskNotOpen);
        }

        if task.client_wallet == freelancer_wallet {
            return Err(BidServiceError::SameWallet);
        }

        BidRepository::new(pool.clone())
            .create(
                task_id,
                freelancer_wallet,
                payload.cover_letter.trim(),
                payload.proposed_amount,
            )
            .await
            .map_err(|error| {
                if let sqlx::Error::Database(db_error) = &error {
                    if db_error.constraint() == Some("bids_unique_freelancer_per_task") {
                        return BidServiceError::Conflict;
                    }
                }
                BidServiceError::Internal
            })
    }

    pub async fn list_bids_for_task(
        pool: &PgPool,
        task_id: Uuid,
        requester_wallet: &str,
    ) -> Result<Vec<Bid>, BidServiceError> {
        let task = TaskRepository::new(pool.clone())
            .get_by_id(task_id)
            .await
            .map_err(|_| BidServiceError::Internal)?
            .ok_or(BidServiceError::TaskNotFound)?;

        if task.client_wallet != requester_wallet {
            return Err(BidServiceError::Forbidden);
        }

        BidRepository::new(pool.clone())
            .list_by_task_id(task_id)
            .await
            .map_err(|_| BidServiceError::Internal)
    }

    pub async fn accept_bid(
        pool: &PgPool,
        bid_id: Uuid,
        client_wallet: &str,
    ) -> Result<AcceptBidResponse, BidServiceError> {
        let bid = BidRepository::new(pool.clone())
            .get_by_id(bid_id)
            .await
            .map_err(|_| BidServiceError::Internal)?
            .ok_or(BidServiceError::NotFound)?;

        let task = TaskRepository::new(pool.clone())
            .get_by_id(bid.task_id)
            .await
            .map_err(|_| BidServiceError::Internal)?
            .ok_or(BidServiceError::TaskNotFound)?;

        if task.client_wallet != client_wallet {
            return Err(BidServiceError::Forbidden);
        }

        if task.status != "open" {
            return Err(BidServiceError::TaskNotOpen);
        }

        if bid.status != "pending" {
            return Err(BidServiceError::Conflict);
        }

        BidRepository::new(pool.clone())
            .accept_bid_with_chat(bid_id, client_wallet)
            .await
            .map(|(bid, task, chat)| AcceptBidResponse { bid, task, chat })
            .map_err(|error| match error {
                sqlx::Error::RowNotFound => BidServiceError::Conflict,
                _ => BidServiceError::Internal,
            })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn bid_status_constants_are_stable() {
        assert_eq!(STATUS_PENDING, "pending");
        assert_eq!(STATUS_ACCEPTED, "accepted");
        assert_eq!(STATUS_REJECTED, "rejected");
    }
}
