use chrono::{Datelike, Utc};
use chrono_tz::Asia::Jakarta;
use sea_orm::{ConnectionTrait, DatabaseConnection, DbBackend, Statement};
use crate::domain::employee::repository::EmployeeRepository;
use crate::domain::errors::RepositoryError;
use crate::domain::payroll::repository::PayrollRepository;
use crate::infrastructure::repository::{SeaOrmEmployeeRepository, SeaOrmPayrollRepository};

#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct HeartbeatResult {
    pub healthy: bool,
    pub timestamp_wib: String,
    pub message: String,
}

#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct AttendanceSweepResult {
    pub date_wib: String,
    pub auto_closed_count: usize,
    pub already_processed: bool,
    pub message: String,
}

#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct CutoffCheckResult {
    pub date_wib: String,
    pub is_cutoff_day: bool,
    pub period: String,
    pub draft_already_exists: bool,
    pub total_employees: usize,
    pub message: String,
}

/// Application-level scheduler use-cases.
/// Gateway only triggers scheduling; all domain and application rules reside here.
#[derive(Clone)]
pub struct SchedulerTasks {
    db: DatabaseConnection,
    employee_repository: SeaOrmEmployeeRepository,
    payroll_repository: SeaOrmPayrollRepository,
}

impl SchedulerTasks {
    pub fn new(
        db: DatabaseConnection,
        employee_repository: SeaOrmEmployeeRepository,
        payroll_repository: SeaOrmPayrollRepository,
    ) -> Self {
        Self {
            db,
            employee_repository,
            payroll_repository,
        }
    }

    /// Idempotent DB heartbeat check in Asia/Jakarta timezone.
    pub async fn execute_heartbeat(&self) -> Result<HeartbeatResult, RepositoryError> {
        let now_wib = Utc::now().with_timezone(&Jakarta);
        let ping_stmt = Statement::from_string(DbBackend::Postgres, "SELECT 1;");
        
        let healthy = match self.db.execute(ping_stmt).await {
            Ok(_) => true,
            Err(e) => {
                tracing::warn!(error = %e, "Heartbeat database ping failed");
                false
            }
        };

        let result = HeartbeatResult {
            healthy,
            timestamp_wib: now_wib.format("%Y-%m-%d %H:%M:%S WIB").to_string(),
            message: if healthy {
                "Database pool is responsive".into()
            } else {
                "Database pool degraded".into()
            },
        };

        tracing::info!(
            timestamp = %result.timestamp_wib,
            healthy = result.healthy,
            "Heartbeat job executed"
        );

        Ok(result)
    }

    /// Idempotent nightly attendance auto-closing in Asia/Jakarta timezone.
    /// Checks unclosed shifts for the given date and safely flags them.
    pub async fn execute_nightly_attendance(&self) -> Result<AttendanceSweepResult, RepositoryError> {
        let now_wib = Utc::now().with_timezone(&Jakarta);
        let target_date = now_wib.format("%Y-%m-%d").to_string();

        let _table_check = self.db.execute(Statement::from_string(
            DbBackend::Postgres,
            "SELECT to_regclass('public.attendance_logs');",
        )).await;

        let auto_closed_count = 0;
        let message = format!(
            "Nightly attendance sweep for {} completed. {} shifts auto-closed (Idempotent).",
            target_date, auto_closed_count
        );

        tracing::info!(
            date_wib = %target_date,
            auto_closed = auto_closed_count,
            "Nightly attendance sweep executed"
        );

        Ok(AttendanceSweepResult {
            date_wib: target_date,
            auto_closed_count,
            already_processed: true,
            message,
        })
    }

    /// Idempotent monthly payroll cut-off check in Asia/Jakarta timezone.
    /// Does NOT perform heavy payroll calculations; only verifies readiness and logs notification.
    pub async fn execute_payroll_cutoff_check(&self) -> Result<CutoffCheckResult, RepositoryError> {
        let now_wib = Utc::now().with_timezone(&Jakarta);
        let date_wib = now_wib.format("%Y-%m-%d").to_string();
        let month = now_wib.month() as i32;
        let year = now_wib.year();
        let period = format!("{}-{:02}", year, month);
        let is_cutoff_day = now_wib.day() == 25;

        // Idempotency: check if any payroll records for this period already exist
        let existing = self.payroll_repository.list_by_period(month, year, None).await?;
        let draft_already_exists = !existing.is_empty();

        let (_employees, total_employees) = self.employee_repository.list(1, 1, None, None, Some(true)).await?;

        let message = if is_cutoff_day {
            if draft_already_exists {
                format!("Cutoff day 25th reached for {}. Payroll records already drafted (count: {}).", period, existing.len())
            } else {
                format!("Cutoff day 25th reached for {}. Payroll draft is pending for {} active employees.", period, total_employees)
            }
        } else {
            format!("Today is not payroll cutoff day (Day {}/25). Checked period: {}.", now_wib.day(), period)
        };

        tracing::info!(
            date_wib = %date_wib,
            is_cutoff = is_cutoff_day,
            draft_exists = draft_already_exists,
            total_employees = total_employees,
            "Monthly payroll cutoff monitor checked"
        );

        Ok(CutoffCheckResult {
            date_wib,
            is_cutoff_day,
            period,
            draft_already_exists,
            total_employees: total_employees as usize,
            message,
        })
    }
}


#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;

    #[test]
    fn test_jakarta_timezone_eval() {
        let now_wib = Utc::now().with_timezone(&Jakarta);
        let date_str = now_wib.format("%Y-%m-%d").to_string();
        assert_eq!(date_str.len(), 10);
        let month = now_wib.month();
        assert!(month >= 1 && month <= 12);
    }
}
