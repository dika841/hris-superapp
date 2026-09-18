use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use crate::domain::employee::EmployeeRepository;
use crate::domain::errors::RepositoryError;
use crate::domain::payroll::{
    calculate_bpjs, get_ter_rate, NewPayrollRecord, PayrollRecord,
    PayrollRepository, TERCategory,
};

#[derive(Debug, Deserialize)]
pub struct BatchCalculatePayrollCommand {
    pub period_month: i32,
    pub period_year: i32,
    pub skip_existing: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BatchPayrollSummary {
    pub period_month: i32,
    pub period_year: i32,
    pub total_active_employees: usize,
    pub processed_count: usize,
    pub skipped_count: usize,
    pub total_gross_salary: Decimal,
    pub total_pph21_amount: Decimal,
    pub total_bpjs_amount: Decimal,
    pub total_take_home_pay: Decimal,
    pub records: Vec<PayrollRecord>,
}

pub struct BatchCalculatePayrollUseCase<E, P> {
    employee_repository: E,
    payroll_repository: P,
}

impl<E: EmployeeRepository, P: PayrollRepository> BatchCalculatePayrollUseCase<E, P> {
    pub fn new(employee_repository: E, payroll_repository: P) -> Self {
        Self {
            employee_repository,
            payroll_repository,
        }
    }

    pub async fn execute(
        &self,
        cmd: BatchCalculatePayrollCommand,
    ) -> Result<BatchPayrollSummary, RepositoryError> {
        // 1. Fetch all active employees
        let (active_employees, total_count) = self
            .employee_repository
            .list(1, 10000, None, None, Some(true))
            .await?;

        let mut processed_records = Vec::new();
        let mut skipped_count = 0;
        let mut total_gross_salary = Decimal::ZERO;
        let mut total_pph21_amount = Decimal::ZERO;
        let mut total_bpjs_amount = Decimal::ZERO;
        let mut total_take_home_pay = Decimal::ZERO;

        for employee in active_employees {
            // Check if record already exists for this period
            if let Some(existing) = self
                .payroll_repository
                .find_by_employee_period(employee.id, cmd.period_month, cmd.period_year)
                .await?
            {
                if cmd.skip_existing {
                    skipped_count += 1;
                    total_gross_salary += existing.gross_salary;
                    total_pph21_amount += existing.pph21_amount;
                    total_bpjs_amount += existing.bpjs_jht_employee
                        + existing.bpjs_jp_employee
                        + existing.bpjs_kes_employee;
                    total_take_home_pay += existing.take_home_pay;
                    processed_records.push(existing);
                    continue;
                }
            }

            // Calculate deterministic payroll
            let overtime_pay = Decimal::ZERO;
            let overtime_hours = Decimal::ZERO;
            let bonus = Decimal::ZERO;
            let gross_salary = employee.basic_salary + employee.allowance_fixed;

            let ter_cat = TERCategory::from_ptkp(&employee.ptkp_status);
            let ter_rate = get_ter_rate(ter_cat, gross_salary);
            let pph21_amount = (gross_salary * ter_rate).round_dp(0);

            let bpjs = calculate_bpjs(employee.basic_salary);
            let total_deductions = pph21_amount + bpjs.total_employee_deduction;
            let take_home_pay = gross_salary - total_deductions;

            let ter_str = match ter_cat {
                TERCategory::A => "TER A",
                TERCategory::B => "TER B",
                TERCategory::C => "TER C",
            };

            let new_record = NewPayrollRecord {
                id: Uuid::new_v4(),
                employee_id: employee.id,
                period_month: cmd.period_month,
                period_year: cmd.period_year,
                basic_salary: employee.basic_salary,
                allowance_fixed: employee.allowance_fixed,
                overtime_hours,
                overtime_pay,
                bonus,
                gross_salary,
                ter_category: ter_str.to_string(),
                ter_rate,
                pph21_amount,
                bpjs_jht_employee: bpjs.jht_employee,
                bpjs_jp_employee: bpjs.jp_employee,
                bpjs_kes_employee: bpjs.kes_employee,
                total_deductions,
                take_home_pay,
            };

            let record = self.payroll_repository.create(new_record).await?;

            total_gross_salary += gross_salary;
            total_pph21_amount += pph21_amount;
            total_bpjs_amount += bpjs.total_employee_deduction;
            total_take_home_pay += take_home_pay;
            processed_records.push(record);
        }

        let processed_count = processed_records.len().saturating_sub(skipped_count);

        tracing::info!(
            month = cmd.period_month,
            year = cmd.period_year,
            total_active = total_count,
            processed = processed_count,
            skipped = skipped_count,
            "Batch payroll generation completed"
        );

        Ok(BatchPayrollSummary {
            period_month: cmd.period_month,
            period_year: cmd.period_year,
            total_active_employees: total_count as usize,
            processed_count,
            skipped_count,
            total_gross_salary,
            total_pph21_amount,
            total_bpjs_amount,
            total_take_home_pay,
            records: processed_records,
        })
    }
}
