use std::future::Future;
use uuid::Uuid;
use super::entity::{Employee, EmployeePatch, NewEmployee};
use crate::domain::errors::RepositoryError;

pub trait EmployeeRepository: Send + Sync {
    fn find_by_id(&self, id: Uuid)
        -> impl Future<Output = Result<Option<Employee>, RepositoryError>> + Send;
    fn find_by_code(&self, code: &str)
        -> impl Future<Output = Result<Option<Employee>, RepositoryError>> + Send;
    fn find_by_user_id(&self, user_id: Uuid)
        -> impl Future<Output = Result<Option<Employee>, RepositoryError>> + Send;
    fn create(&self, employee: NewEmployee)
        -> impl Future<Output = Result<Employee, RepositoryError>> + Send;
    fn update(&self, id: Uuid, patch: EmployeePatch)
        -> impl Future<Output = Result<Employee, RepositoryError>> + Send;
    fn delete(&self, id: Uuid)
        -> impl Future<Output = Result<(), RepositoryError>> + Send;
    fn list(
        &self,
        page: u64,
        page_size: u64,
        department: Option<&str>,
        search: Option<&str>,
        is_active: Option<bool>,
    ) -> impl Future<Output = Result<(Vec<Employee>, u64), RepositoryError>> + Send;
}
