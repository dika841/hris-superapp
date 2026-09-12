use chrono::NaiveDate;
use rust_decimal::Decimal;
use uuid::Uuid;
use crate::domain::employee::{Employee, EmployeeRepository, EmploymentStatus, NewEmployee, PTKPStatus};
use crate::domain::errors::RepositoryError;

pub struct CreateEmployeeCommand {
    pub user_id: Option<Uuid>,
    pub employee_code: String,
    pub full_name: String,
    pub national_id: String,
    pub npwp: Option<String>,
    pub department: String,
    pub position: String,
    pub employment_status: EmploymentStatus,
    pub join_date: NaiveDate,
    pub basic_salary: Decimal,
    pub allowance_fixed: Decimal,
    pub ptkp_status: PTKPStatus,
    pub bank_name: Option<String>,
    pub bank_account: Option<String>,
}

pub struct CreateEmployeeUseCase<R> {
    employee_repository: R,
}

impl<R: EmployeeRepository> CreateEmployeeUseCase<R> {
    pub fn new(employee_repository: R) -> Self {
        Self { employee_repository }
    }

    pub async fn execute(&self, cmd: CreateEmployeeCommand) -> Result<Employee, RepositoryError> {
        if self.employee_repository.find_by_code(&cmd.employee_code).await?.is_some() {
            return Err(RepositoryError::Conflict("Employee code already in use".into()));
        }

        let new_employee = NewEmployee {
            id: Uuid::new_v4(),
            user_id: cmd.user_id,
            employee_code: cmd.employee_code,
            full_name: cmd.full_name,
            national_id: cmd.national_id,
            npwp: cmd.npwp,
            department: cmd.department,
            position: cmd.position,
            employment_status: cmd.employment_status,
            join_date: cmd.join_date,
            basic_salary: cmd.basic_salary,
            allowance_fixed: cmd.allowance_fixed,
            ptkp_status: cmd.ptkp_status,
            bank_name: cmd.bank_name,
            bank_account: cmd.bank_account,
        };

        let employee = self.employee_repository.create(new_employee).await?;
        tracing::info!(employee_id = %employee.id, code = %employee.employee_code, "Employee created");
        Ok(employee)
    }
}
