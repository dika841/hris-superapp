use chrono::{Datelike, NaiveDate, Utc};
use uuid::Uuid;

use crate::domain::errors::RepositoryError;
use crate::domain::leave::{
    LeaveBalanceWithType, LeaveRepository, LeaveRequestWithDetails,
    LeaveSummaryStats, LeaveType,
};

#[derive(Clone)]
pub struct ListLeaveUseCase<L> {
    leave_repo: L,
}

impl<L> ListLeaveUseCase<L>
where
    L: LeaveRepository,
{
    pub fn new(leave_repo: L) -> Self {
        Self { leave_repo }
    }

    pub async fn list_types(&self) -> Result<Vec<LeaveType>, RepositoryError> {
        self.leave_repo.list_leave_types().await
    }

    pub async fn list_balances(
        &self,
        employee_id: Uuid,
        year: Option<i32>,
    ) -> Result<Vec<LeaveBalanceWithType>, RepositoryError> {
        let current_year = year.unwrap_or_else(|| Utc::now().year());
        self.leave_repo.list_balances_by_employee(employee_id, current_year).await
    }

    pub async fn list_requests(
        &self,
        employee_id: Option<Uuid>,
        status: Option<&str>,
        year: Option<i32>,
        page: u64,
        page_size: u64,
    ) -> Result<(Vec<LeaveRequestWithDetails>, u64), RepositoryError> {
        self.leave_repo.list_requests(employee_id, status, year, page, page_size).await
    }

    pub async fn get_stats(
        &self,
        today: NaiveDate,
    ) -> Result<LeaveSummaryStats, RepositoryError> {
        self.leave_repo.get_leave_stats(today).await
    }
}
