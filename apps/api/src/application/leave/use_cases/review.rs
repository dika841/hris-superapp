use chrono::{Datelike, Utc, Weekday};
use serde::Deserialize;
use uuid::Uuid;

use crate::domain::attendance::{AttendanceLog, AttendanceRepository, AttendanceStatus};
use crate::domain::errors::RepositoryError;
use crate::domain::leave::{LeaveRepository, LeaveRequest, LeaveStatus};

#[derive(Debug, Clone, Deserialize)]
pub struct ReviewLeaveRequestCommand {
    pub request_id: Uuid,
    pub reviewer_id: Uuid,
    pub status: LeaveStatus, // Approved or Rejected
    pub approval_notes: Option<String>,
}

#[derive(Clone)]
pub struct ReviewLeaveRequestUseCase<L, A> {
    leave_repo: L,
    attendance_repo: A,
}

impl<L, A> ReviewLeaveRequestUseCase<L, A>
where
    L: LeaveRepository,
    A: AttendanceRepository,
{
    pub fn new(leave_repo: L, attendance_repo: A) -> Self {
        Self {
            leave_repo,
            attendance_repo,
        }
    }

    pub async fn execute(
        &self,
        cmd: ReviewLeaveRequestCommand,
    ) -> Result<LeaveRequest, RepositoryError> {
        let mut request = self.leave_repo
            .find_request_by_id(cmd.request_id)
            .await?
            .ok_or(RepositoryError::NotFound)?;

        if request.status != LeaveStatus::Pending {
            return Err(RepositoryError::Conflict(format!(
                "Cannot review leave request with status '{}'",
                request.status.as_str()
            )));
        }

        if cmd.status != LeaveStatus::Approved && cmd.status != LeaveStatus::Rejected {
            return Err(RepositoryError::Conflict("Review status must be either 'approved' or 'rejected'".into()));
        }

        let year = request.start_date.year();
        let total_days = request.total_days;

        // Retrieve leave balance if exists
        let balance_opt = self.leave_repo.find_balance(request.employee_id, request.leave_type_id, year).await?;

        if let Some(mut balance) = balance_opt {
            match cmd.status {
                LeaveStatus::Approved => {
                    balance.pending_days = balance.pending_days.saturating_sub(total_days);
                    balance.used_days += total_days;
                    balance.remaining_days = balance.allocated_days - balance.used_days - balance.pending_days;
                    self.leave_repo.update_balance(balance).await?;
                }
                LeaveStatus::Rejected => {
                    balance.pending_days = balance.pending_days.saturating_sub(total_days);
                    balance.remaining_days = balance.allocated_days - balance.used_days - balance.pending_days;
                    self.leave_repo.update_balance(balance).await?;
                }
                _ => {}
            }
        }

        let now = Utc::now();
        request.status = cmd.status.clone();
        request.approved_by = Some(cmd.reviewer_id);
        request.approval_notes = cmd.approval_notes;
        request.approved_at = Some(now);
        request.updated_at = now;

        let updated_request = self.leave_repo.update_request(request).await?;

        // If approved, automatically propagate leave status to attendance logs for working days
        if cmd.status == LeaveStatus::Approved {
            let mut curr = updated_request.start_date;
            while curr <= updated_request.end_date {
                let weekday = curr.weekday();
                if weekday != Weekday::Sat && weekday != Weekday::Sun {
                    // Check if an attendance log already exists
                    if let Ok(existing) = self.attendance_repo.find_by_employee_and_date(updated_request.employee_id, curr).await {
                        match existing {
                            Some(mut log) => {
                                log.status = AttendanceStatus::Leave;
                                log.notes = Some(format!("Approved Leave ({})", updated_request.reason));
                                log.updated_at = now;
                                let _ = self.attendance_repo.update_log(log).await;
                            }
                            None => {
                                let new_log = AttendanceLog {
                                    id: Uuid::new_v4(),
                                    employee_id: updated_request.employee_id,
                                    date: curr,
                                    schedule_id: None,
                                    check_in: None,
                                    check_out: None,
                                    status: AttendanceStatus::Leave,
                                    late_duration_minutes: 0,
                                    overtime_minutes: 0,
                                    check_in_ip: None,
                                    check_in_latitude: None,
                                    check_in_longitude: None,
                                    check_out_ip: None,
                                    check_out_latitude: None,
                                    check_out_longitude: None,
                                    notes: Some(format!("Approved Leave ({})", updated_request.reason)),
                                    auto_closed: false,
                                    created_at: now,
                                    updated_at: now,
                                };
                                let _ = self.attendance_repo.create_log(new_log).await;
                            }
                        }
                    }
                }
                curr = curr.succ_opt().unwrap_or(curr);
                if curr == updated_request.start_date {
                    break;
                }
            }
        }

        Ok(updated_request)
    }
}
