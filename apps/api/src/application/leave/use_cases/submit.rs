use chrono::{Datelike, NaiveDate, Utc, Weekday};
use serde::Deserialize;
use uuid::Uuid;

use crate::domain::employee::EmployeeRepository;
use crate::domain::errors::RepositoryError;
use crate::domain::leave::{
    LeaveBalance, LeaveRepository, LeaveRequest, LeaveStatus,
};

#[derive(Debug, Clone, Deserialize)]
pub struct SubmitLeaveRequestCommand {
    pub employee_id: Uuid,
    pub leave_type_id: Uuid,
    pub start_date: NaiveDate,
    pub end_date: NaiveDate,
    pub reason: String,
    pub attachment_url: Option<String>,
}

#[derive(Clone)]
pub struct SubmitLeaveRequestUseCase<L, E> {
    leave_repo: L,
    employee_repo: E,
}

/// Counts working days between start_date and end_date (inclusive),
/// skipping Saturdays and Sundays.
pub fn calculate_working_days(start: NaiveDate, end: NaiveDate) -> i32 {
    let mut count = 0;
    let mut curr = start;
    while curr <= end {
        let weekday = curr.weekday();
        if weekday != Weekday::Sat && weekday != Weekday::Sun {
            count += 1;
        }
        curr = curr.succ_opt().unwrap_or(curr);
        if curr == start {
            break;
        }
    }
    count
}

impl<L, E> SubmitLeaveRequestUseCase<L, E>
where
    L: LeaveRepository,
    E: EmployeeRepository,
{
    pub fn new(leave_repo: L, employee_repo: E) -> Self {
        Self {
            leave_repo,
            employee_repo,
        }
    }

    pub async fn execute(
        &self,
        cmd: SubmitLeaveRequestCommand,
    ) -> Result<LeaveRequest, RepositoryError> {
        if cmd.start_date > cmd.end_date {
            return Err(RepositoryError::Conflict("Start date must be before or equal to end date".into()));
        }

        // Validate employee exists and active
        let employee = self.employee_repo
            .find_by_id(cmd.employee_id)
            .await?
            .ok_or(RepositoryError::NotFound)?;

        if !employee.is_active {
            return Err(RepositoryError::Conflict("Employee is inactive".into()));
        }

        // Validate leave type exists
        let leave_type = self.leave_repo
            .find_leave_type_by_id(cmd.leave_type_id)
            .await?
            .ok_or(RepositoryError::NotFound)?;

        if leave_type.requires_attachment && cmd.attachment_url.is_none() {
            return Err(RepositoryError::Conflict(
                format!("Leave type '{}' requires a supporting medical/official document", leave_type.name)
            ));
        }

        let total_days = calculate_working_days(cmd.start_date, cmd.end_date);
        if total_days <= 0 {
            return Err(RepositoryError::Conflict("Selected range contains zero working days".into()));
        }

        let year = cmd.start_date.year();

        // Check quota if type has default allocation
        if leave_type.default_days_per_year > 0 {
            let balance = match self.leave_repo.find_balance(cmd.employee_id, cmd.leave_type_id, year).await? {
                Some(b) => b,
                None => {
                    // Initialize default balance if not yet seeded
                    let new_b = LeaveBalance {
                        id: Uuid::new_v4(),
                        employee_id: cmd.employee_id,
                        leave_type_id: cmd.leave_type_id,
                        year,
                        allocated_days: leave_type.default_days_per_year,
                        used_days: 0,
                        pending_days: 0,
                        remaining_days: leave_type.default_days_per_year,
                        created_at: Utc::now(),
                        updated_at: Utc::now(),
                    };
                    self.leave_repo.create_balance(new_b).await?
                }
            };

            if balance.remaining_days < total_days {
                return Err(RepositoryError::Conflict(format!(
                    "Insufficient leave balance: requested {} days, remaining {} days",
                    total_days, balance.remaining_days
                )));
            }

            // Reserve pending days
            let mut updated_balance = balance;
            updated_balance.pending_days += total_days;
            updated_balance.remaining_days = updated_balance.allocated_days - updated_balance.used_days - updated_balance.pending_days;
            self.leave_repo.update_balance(updated_balance).await?;
        }

        let now = Utc::now();
        let request = LeaveRequest {
            id: Uuid::new_v4(),
            employee_id: cmd.employee_id,
            leave_type_id: cmd.leave_type_id,
            start_date: cmd.start_date,
            end_date: cmd.end_date,
            total_days,
            reason: cmd.reason,
            attachment_url: cmd.attachment_url,
            status: LeaveStatus::Pending,
            approved_by: None,
            approval_notes: None,
            approved_at: None,
            created_at: now,
            updated_at: now,
        };

        self.leave_repo.create_request(request).await
    }
}
