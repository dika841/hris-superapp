use chrono::{NaiveDate, Utc};
use chrono_tz::Asia::Jakarta;
use serde::Serialize;
use uuid::Uuid;

use crate::domain::attendance::{AttendanceLog, AttendanceRepository, WorkSchedule};
use crate::domain::errors::RepositoryError;

#[derive(Debug, Clone, Serialize)]
pub struct TodayAttendanceResponse {
    pub date: NaiveDate,
    pub log: Option<AttendanceLog>,
    pub schedule: Option<WorkSchedule>,
    pub server_time_wib: String,
}

#[derive(Clone)]
pub struct TodayAttendanceUseCase<A> {
    attendance_repo: A,
}

impl<A> TodayAttendanceUseCase<A>
where
    A: AttendanceRepository,
{
    pub fn new(attendance_repo: A) -> Self {
        Self { attendance_repo }
    }

    pub async fn execute(&self, employee_id: Uuid) -> Result<TodayAttendanceResponse, RepositoryError> {
        let now_wib = Utc::now().with_timezone(&Jakarta);
        let today: NaiveDate = now_wib.date_naive();

        let log = self.attendance_repo.find_by_employee_and_date(employee_id, today).await?;
        let schedule = self.attendance_repo.get_default_schedule().await?;

        Ok(TodayAttendanceResponse {
            date: today,
            log,
            schedule,
            server_time_wib: now_wib.format("%H:%M:%S WIB").to_string(),
        })
    }
}
