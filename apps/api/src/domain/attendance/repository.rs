use std::future::Future;
use chrono::NaiveDate;
use uuid::Uuid;
use super::entity::{
    AttendanceLog, AttendanceLogWithEmployee, AttendanceSummaryStats, WorkSchedule,
};
use crate::domain::errors::RepositoryError;

pub trait AttendanceRepository: Send + Sync {
    fn find_by_employee_and_date(
        &self,
        employee_id: Uuid,
        date: NaiveDate,
    ) -> impl Future<Output = Result<Option<AttendanceLog>, RepositoryError>> + Send;

    fn create_log(
        &self,
        log: AttendanceLog,
    ) -> impl Future<Output = Result<AttendanceLog, RepositoryError>> + Send;

    fn update_log(
        &self,
        log: AttendanceLog,
    ) -> impl Future<Output = Result<AttendanceLog, RepositoryError>> + Send;

    fn list_logs(
        &self,
        date: Option<NaiveDate>,
        employee_id: Option<Uuid>,
        status: Option<&str>,
        page: u64,
        page_size: u64,
    ) -> impl Future<Output = Result<(Vec<AttendanceLogWithEmployee>, u64), RepositoryError>> + Send;

    fn get_default_schedule(
        &self,
    ) -> impl Future<Output = Result<Option<WorkSchedule>, RepositoryError>> + Send;

    fn create_schedule(
        &self,
        schedule: WorkSchedule,
    ) -> impl Future<Output = Result<WorkSchedule, RepositoryError>> + Send;

    fn find_unclosed_shifts(
        &self,
        target_date: NaiveDate,
    ) -> impl Future<Output = Result<Vec<AttendanceLog>, RepositoryError>> + Send;

    fn get_stats_by_date(
        &self,
        date: NaiveDate,
    ) -> impl Future<Output = Result<AttendanceSummaryStats, RepositoryError>> + Send;
}
