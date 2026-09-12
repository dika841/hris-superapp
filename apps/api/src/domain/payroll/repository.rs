use std::future::Future;
use uuid::Uuid;
use super::entity::{NewPayrollRecord, PayrollRecord};
use crate::domain::errors::RepositoryError;

pub trait PayrollRepository: Send + Sync {
    fn find_by_id(&self, id: Uuid)
        -> impl Future<Output = Result<Option<PayrollRecord>, RepositoryError>> + Send;
    fn find_by_employee_period(&self, employee_id: Uuid, month: i32, year: i32)
        -> impl Future<Output = Result<Option<PayrollRecord>, RepositoryError>> + Send;
    fn create(&self, record: NewPayrollRecord)
        -> impl Future<Output = Result<PayrollRecord, RepositoryError>> + Send;
    fn mark_as_paid(&self, id: Uuid)
        -> impl Future<Output = Result<PayrollRecord, RepositoryError>> + Send;
    fn list_by_period(&self, month: i32, year: i32)
        -> impl Future<Output = Result<Vec<PayrollRecord>, RepositoryError>> + Send;
    fn list_by_employee(&self, employee_id: Uuid)
        -> impl Future<Output = Result<Vec<PayrollRecord>, RepositoryError>> + Send;
}
