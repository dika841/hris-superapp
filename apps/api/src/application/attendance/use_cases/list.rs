use chrono::NaiveDate;
use uuid::Uuid;

use crate::domain::attendance::{
    AttendanceLogWithEmployee, AttendanceRepository, AttendanceSummaryStats,
};
use crate::domain::errors::RepositoryError;

#[derive(Clone)]
pub struct ListAttendanceUseCase<A> {
    attendance_repo: A,
}

impl<A> ListAttendanceUseCase<A>
where
    A: AttendanceRepository,
{
    pub fn new(attendance_repo: A) -> Self {
        Self { attendance_repo }
    }

    pub async fn execute(
        &self,
        date: Option<NaiveDate>,
        employee_id: Option<Uuid>,
        status: Option<&str>,
        page: u64,
        page_size: u64,
    ) -> Result<(Vec<AttendanceLogWithEmployee>, u64), RepositoryError> {
        self.attendance_repo.list_logs(date, employee_id, status, page, page_size).await
    }

    pub async fn get_stats(
        &self,
        date: NaiveDate,
    ) -> Result<AttendanceSummaryStats, RepositoryError> {
        self.attendance_repo.get_stats_by_date(date).await
    }
}
