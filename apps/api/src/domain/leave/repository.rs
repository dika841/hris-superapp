use std::future::Future;
use chrono::NaiveDate;
use uuid::Uuid;

use super::entity::{
    LeaveBalance, LeaveBalanceWithType, LeaveRequest, LeaveRequestWithDetails,
    LeaveSummaryStats, LeaveType,
};
use crate::domain::errors::RepositoryError;

pub trait LeaveRepository: Send + Sync {
    fn list_leave_types(
        &self,
    ) -> impl Future<Output = Result<Vec<LeaveType>, RepositoryError>> + Send;

    fn find_leave_type_by_id(
        &self,
        id: Uuid,
    ) -> impl Future<Output = Result<Option<LeaveType>, RepositoryError>> + Send;

    fn find_leave_type_by_code(
        &self,
        code: &str,
    ) -> impl Future<Output = Result<Option<LeaveType>, RepositoryError>> + Send;

    fn create_leave_type(
        &self,
        leave_type: LeaveType,
    ) -> impl Future<Output = Result<LeaveType, RepositoryError>> + Send;

    fn find_balance(
        &self,
        employee_id: Uuid,
        leave_type_id: Uuid,
        year: i32,
    ) -> impl Future<Output = Result<Option<LeaveBalance>, RepositoryError>> + Send;

    fn list_balances_by_employee(
        &self,
        employee_id: Uuid,
        year: i32,
    ) -> impl Future<Output = Result<Vec<LeaveBalanceWithType>, RepositoryError>> + Send;

    fn create_balance(
        &self,
        balance: LeaveBalance,
    ) -> impl Future<Output = Result<LeaveBalance, RepositoryError>> + Send;

    fn update_balance(
        &self,
        balance: LeaveBalance,
    ) -> impl Future<Output = Result<LeaveBalance, RepositoryError>> + Send;

    fn create_request(
        &self,
        request: LeaveRequest,
    ) -> impl Future<Output = Result<LeaveRequest, RepositoryError>> + Send;

    fn find_request_by_id(
        &self,
        id: Uuid,
    ) -> impl Future<Output = Result<Option<LeaveRequest>, RepositoryError>> + Send;

    fn update_request(
        &self,
        request: LeaveRequest,
    ) -> impl Future<Output = Result<LeaveRequest, RepositoryError>> + Send;

    fn list_requests(
        &self,
        employee_id: Option<Uuid>,
        status: Option<&str>,
        year: Option<i32>,
        page: u64,
        page_size: u64,
    ) -> impl Future<Output = Result<(Vec<LeaveRequestWithDetails>, u64), RepositoryError>> + Send;

    fn get_leave_stats(
        &self,
        today: NaiveDate,
    ) -> impl Future<Output = Result<LeaveSummaryStats, RepositoryError>> + Send;
}
