use crate::domain::employee::{Employee, EmployeeRepository};
use crate::domain::errors::RepositoryError;

pub struct ListEmployeesUseCase<R> {
    employee_repository: R,
}

impl<R: EmployeeRepository> ListEmployeesUseCase<R> {
    pub fn new(employee_repository: R) -> Self {
        Self { employee_repository }
    }

    pub async fn execute(
        &self,
        page: u64,
        page_size: u64,
        department: Option<&str>,
        search: Option<&str>,
        is_active: Option<bool>,
    ) -> Result<(Vec<Employee>, u64), RepositoryError> {
        self.employee_repository
            .list(page, page_size, department, search, is_active)
            .await
    }
}
