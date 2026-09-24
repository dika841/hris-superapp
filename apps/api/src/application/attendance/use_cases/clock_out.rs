use chrono::{NaiveDate, NaiveTime, Timelike, Utc};
use chrono_tz::Asia::Jakarta;
use rust_decimal::Decimal;
use serde::Deserialize;
use uuid::Uuid;

use crate::domain::attendance::{AttendanceLog, AttendanceRepository, AttendanceStatus};
use crate::domain::errors::RepositoryError;

#[derive(Debug, Clone, Deserialize)]
pub struct ClockOutCommand {
    pub employee_id: Uuid,
    pub ip: Option<String>,
    pub latitude: Option<Decimal>,
    pub longitude: Option<Decimal>,
    pub notes: Option<String>,
}

#[derive(Clone)]
pub struct ClockOutUseCase<A> {
    attendance_repo: A,
}

impl<A> ClockOutUseCase<A>
where
    A: AttendanceRepository,
{
    pub fn new(attendance_repo: A) -> Self {
        Self { attendance_repo }
    }

    pub async fn execute(&self, cmd: ClockOutCommand) -> Result<AttendanceLog, RepositoryError> {
        let now_utc = Utc::now();
        let now_wib = now_utc.with_timezone(&Jakarta);
        let today: NaiveDate = now_wib.date_naive();

        let mut log = self.attendance_repo
            .find_by_employee_and_date(cmd.employee_id, today)
            .await?
            .ok_or_else(|| RepositoryError::Conflict("No check-in record found for today. Please clock in first.".into()))?;

        if log.check_in.is_none() {
            return Err(RepositoryError::Conflict("No check-in recorded for today. Please clock in first.".into()));
        }

        if log.check_out.is_some() {
            return Err(RepositoryError::Conflict(
                format!("Employee has already clocked out today at {}", log.check_out.unwrap().with_timezone(&Jakarta).format("%H:%M:%S WIB"))
            ));
        }

        // Get schedule info to calculate overtime or early departure
        let schedule = self.attendance_repo.get_default_schedule().await?;
        let end_time_str = schedule.as_ref().map(|s| s.end_time.clone()).unwrap_or_else(|| "18:00:00".to_string());
        let end_time = NaiveTime::parse_from_str(&end_time_str, "%H:%M:%S")
            .unwrap_or_else(|_| NaiveTime::from_hms_opt(18, 0, 0).unwrap());

        let current_time = now_wib.time();
        let schedule_end_minutes = end_time.hour() * 60 + end_time.minute();
        let current_minutes = current_time.hour() * 60 + current_time.minute();

        // Calculate overtime if check-out is > schedule end time + 30 mins
        let overtime_mins = if current_minutes > schedule_end_minutes + 30 {
            (current_minutes - schedule_end_minutes) as i32
        } else {
            0
        };

        // Determine status: if not already Late, and leaving early, set to EarlyDeparture
        if current_minutes < schedule_end_minutes && log.status != AttendanceStatus::Late {
            log.status = AttendanceStatus::EarlyDeparture;
        }

        log.check_out = Some(now_utc);
        log.overtime_minutes = overtime_mins;
        log.check_out_ip = cmd.ip;
        log.check_out_latitude = cmd.latitude;
        log.check_out_longitude = cmd.longitude;
        if let Some(n) = cmd.notes {
            log.notes = match log.notes {
                Some(prev) => Some(format!("{} | Out: {}", prev, n)),
                None => Some(format!("Out: {}", n)),
            };
        }
        log.updated_at = now_utc;

        self.attendance_repo.update_log(log).await
    }
}
