use sqlx::PgPool;

use crate::{
    models::{ClientDashboardStats, DashboardStatsResponse, FreelancerDashboardStats},
    repositories::dashboard::DashboardRepository,
};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DashboardServiceError {
    Internal,
}

pub struct DashboardService;

impl DashboardService {
    pub async fn get_stats(
        pool: &PgPool,
        wallet: &str,
    ) -> Result<DashboardStatsResponse, DashboardServiceError> {
        let repo = DashboardRepository::new(pool.clone());

        // Fetch counts sequentially to keep logic straightforward and explicit.
        let applied_jobs = repo
            .count_applied_jobs(wallet)
            .await
            .map_err(|_| DashboardServiceError::Internal)?;
        let active_contracts = repo
            .count_active_contracts(wallet)
            .await
            .map_err(|_| DashboardServiceError::Internal)?;
        let joined_chats = repo
            .count_joined_chats(wallet)
            .await
            .map_err(|_| DashboardServiceError::Internal)?;
        let pending_invoices = repo
            .count_pending_invoices_to_receive(wallet)
            .await
            .map_err(|_| DashboardServiceError::Internal)?;

        let active_jobs = repo
            .count_active_jobs(wallet)
            .await
            .map_err(|_| DashboardServiceError::Internal)?;
        let applications_received = repo
            .count_applications_received(wallet)
            .await
            .map_err(|_| DashboardServiceError::Internal)?;
        let pending_payments = repo
            .count_pending_payments(wallet)
            .await
            .map_err(|_| DashboardServiceError::Internal)?;

        Ok(DashboardStatsResponse {
            freelancer: FreelancerDashboardStats {
                applied_jobs,
                active_contracts,
                // We currently proxy unread messages as active chat count.
                unread_messages: joined_chats,
                pending_invoices,
            },
            client: ClientDashboardStats {
                active_jobs,
                applications_received,
                ongoing_projects: joined_chats,
                pending_payments,
            },
        })
    }
}
