use crate::domain::errors::RepositoryError;
use crate::domain::payroll::{PayrollRecord, PayrollRepository};

pub struct ListPayrollUseCase<R> {
    payroll_repository: R,
}

impl<R: PayrollRepository> ListPayrollUseCase<R> {
    pub fn new(payroll_repository: R) -> Self {
        Self { payroll_repository }
    }

    pub async fn execute(&self, month: i32, year: i32) -> Result<Vec<PayrollRecord>, RepositoryError> {
        self.payroll_repository.list_by_period(month, year).await
    }
}
