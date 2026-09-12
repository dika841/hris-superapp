use uuid::Uuid;
use crate::domain::employee::{Employee, EmployeeRepository};
use crate::domain::errors::RepositoryError;

pub struct EmployeeDetailUseCase<R> {
    employee_repository: R,
}

impl<R: EmployeeRepository> EmployeeDetailUseCase<R> {
    pub fn new(employee_repository: R) -> Self {
        Self { employee_repository }
    }

    pub async fn execute(&self, id: Uuid) -> Result<Option<Employee>, RepositoryError> {
        self.employee_repository.find_by_id(id).await
    }
}
