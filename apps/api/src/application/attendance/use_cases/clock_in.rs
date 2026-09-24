use chrono::{NaiveDate, NaiveTime, Timelike, Utc};
use chrono_tz::Asia::Jakarta;
use rust_decimal::Decimal;
use serde::Deserialize;
use uuid::Uuid;

use crate::domain::attendance::{AttendanceLog, AttendanceRepository, AttendanceStatus};
use crate::domain::employee::EmployeeRepository;
use crate::domain::errors::RepositoryError;

#[derive(Debug, Clone, Deserialize)]
pub struct ClockInCommand {
    pub employee_id: Uuid,
    pub ip: Option<String>,
    pub latitude: Option<Decimal>,
    pub longitude: Option<Decimal>,
    pub notes: Option<String>,
}

#[derive(Clone)]
pub struct ClockInUseCase<A, E> {
    attendance_repo: A,
    employee_repo: E,
}

impl<A, E> ClockInUseCase<A, E>
where
    A: AttendanceRepository,
    E: EmployeeRepository,
{
    pub fn new(attendance_repo: A, employee_repo: E) -> Self {
        Self {
            attendance_repo,
            employee_repo,
        }
    }

    pub async fn execute(&self, cmd: ClockInCommand) -> Result<AttendanceLog, RepositoryError> {
        // Validate employee exists and is active
        let employee = self.employee_repo
            .find_by_id(cmd.employee_id)
            .await?
            .ok_or(RepositoryError::NotFound)?;

        if !employee.is_active {
            return Err(RepositoryError::Conflict("Employee is not active".into()));
        }

        let now_utc = Utc::now();
        let now_wib = now_utc.with_timezone(&Jakarta);
        let today: NaiveDate = now_wib.date_naive();

        // Check if log already exists for today
        if let Some(existing) = self.attendance_repo.find_by_employee_and_date(cmd.employee_id, today).await? {
            if existing.check_in.is_some() {
                return Err(RepositoryError::Conflict(
                    format!("Employee has already clocked in today at {}", existing.check_in.unwrap().with_timezone(&Jakarta).format("%H:%M:%S WIB"))
                ));
            }
        }

        // Get default schedule or fallback to 09:00 - 18:00
        let schedule = self.attendance_repo.get_default_schedule().await?;
        let (schedule_id, start_time_str, late_tolerance) = match &schedule {
            Some(s) => (Some(s.id), s.start_time.clone(), s.late_tolerance_minutes),
            None => (None, "09:00:00".to_string(), 15),
        };

        // Parse schedule start time
        let start_time = NaiveTime::parse_from_str(&start_time_str, "%H:%M:%S")
            .unwrap_or_else(|_| NaiveTime::from_hms_opt(9, 0, 0).unwrap());

        let current_time = now_wib.time();
        let schedule_minutes = start_time.hour() * 60 + start_time.minute();
        let current_minutes = current_time.hour() * 60 + current_time.minute();

        let (status, late_duration) = if current_minutes > schedule_minutes + (late_tolerance as u32) {
            let late_mins = current_minutes.saturating_sub(schedule_minutes) as i32;
            (AttendanceStatus::Late, late_mins)
        } else {
            (AttendanceStatus::Present, 0)
        };

        let log = AttendanceLog {
            id: Uuid::new_v4(),
            employee_id: cmd.employee_id,
            date: today,
            schedule_id,
            check_in: Some(now_utc),
            check_out: None,
            status,
            late_duration_minutes: late_duration,
            overtime_minutes: 0,
            check_in_ip: cmd.ip,
            check_in_latitude: cmd.latitude,
            check_in_longitude: cmd.longitude,
            check_out_ip: None,
            check_out_latitude: None,
            check_out_longitude: None,
            notes: cmd.notes,
            auto_closed: false,
            created_at: now_utc,
            updated_at: now_utc,
        };

        self.attendance_repo.create_log(log).await
    }
}
