use rust_decimal::Decimal;
use uuid::Uuid;
use crate::domain::employee::EmployeeRepository;
use crate::domain::errors::RepositoryError;
use crate::domain::payroll::{
    calculate_bpjs, calculate_overtime_pay, get_ter_rate, NewPayrollRecord, PayrollRecord,
    PayrollRepository, TERCategory,
};

pub struct CalculatePayrollCommand {
    pub employee_id: Uuid,
    pub period_month: i32,
    pub period_year: i32,
    pub overtime_hours: Decimal,
    pub bonus: Decimal,
}

pub struct CalculatePayrollUseCase<E, P> {
    employee_repository: E,
    payroll_repository: P,
}

impl<E: EmployeeRepository, P: PayrollRepository> CalculatePayrollUseCase<E, P> {
    pub fn new(employee_repository: E, payroll_repository: P) -> Self {
        Self { employee_repository, payroll_repository }
    }

    pub async fn execute(&self, cmd: CalculatePayrollCommand) -> Result<PayrollRecord, RepositoryError> {
        // 1. Get employee data
        let employee = self.employee_repository
            .find_by_id(cmd.employee_id)
            .await?
            .ok_or(RepositoryError::NotFound)?;

        // 2. Overtime pay calculation (PP 35/2021)
        let overtime_pay = calculate_overtime_pay(employee.basic_salary, cmd.overtime_hours);

        // 3. Gross salary
        let gross_salary = employee.basic_salary + employee.allowance_fixed + overtime_pay + cmd.bonus;

        // 4. TER category and rate calculation (PMK 168/2023)
        let ter_cat = TERCategory::from_ptkp(&employee.ptkp_status);
        let ter_rate = get_ter_rate(ter_cat, gross_salary);
        let pph21_amount = (gross_salary * ter_rate).round_dp(0);

        // 5. BPJS Deductions
        let bpjs = calculate_bpjs(employee.basic_salary);

        // 6. Total employee deductions & Take Home Pay
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
            overtime_hours: cmd.overtime_hours,
            overtime_pay,
            bonus: cmd.bonus,
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
        tracing::info!(
            payroll_id = %record.id,
            employee_id = %record.employee_id,
            month = record.period_month,
            year = record.period_year,
            "Payroll calculated successfully via PMK 168/2023 TER"
        );
        Ok(record)
    }
}
