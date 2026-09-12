use uuid::Uuid;
use crate::domain::errors::RepositoryError;
use crate::domain::payroll::{PayrollRecord, PayrollRepository};

pub struct MarkPayrollPaidUseCase<R> {
    payroll_repository: R,
}

impl<R: PayrollRepository> MarkPayrollPaidUseCase<R> {
    pub fn new(payroll_repository: R) -> Self {
        Self { payroll_repository }
    }

    pub async fn execute(&self, id: Uuid) -> Result<PayrollRecord, RepositoryError> {
        self.payroll_repository.mark_as_paid(id).await
    }
}
