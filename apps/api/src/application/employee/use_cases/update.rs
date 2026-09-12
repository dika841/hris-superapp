use uuid::Uuid;
use crate::domain::employee::{Employee, EmployeePatch, EmployeeRepository};
use crate::domain::errors::RepositoryError;

pub struct UpdateEmployeeUseCase<R> {
    employee_repository: R,
}

impl<R: EmployeeRepository> UpdateEmployeeUseCase<R> {
    pub fn new(employee_repository: R) -> Self {
        Self { employee_repository }
    }

    pub async fn execute(&self, id: Uuid, patch: EmployeePatch) -> Result<Employee, RepositoryError> {
        self.employee_repository.update(id, patch).await
    }
}
