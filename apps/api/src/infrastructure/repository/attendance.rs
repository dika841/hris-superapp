use std::collections::HashMap;
use chrono::{NaiveDate, Utc};
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, DbErr, EntityTrait, PaginatorTrait,
    QueryFilter, QueryOrder, Set,
};
use uuid::Uuid;

use super::entities::attendance as attendance_entity;
use super::entities::employee as employee_entity;
use super::entities::work_schedule as work_schedule_entity;
use crate::domain::attendance::{
    AttendanceLog, AttendanceLogWithEmployee, AttendanceRepository, AttendanceStatus,
    AttendanceSummaryStats, WorkSchedule,
};
use crate::domain::errors::RepositoryError;

#[derive(Clone)]
pub struct SeaOrmAttendanceRepository {
    db: DatabaseConnection,
}

impl SeaOrmAttendanceRepository {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}

impl From<work_schedule_entity::Model> for WorkSchedule {
    fn from(m: work_schedule_entity::Model) -> Self {
        Self {
            id: m.id,
            name: m.name,
            start_time: m.start_time,
            end_time: m.end_time,
            late_tolerance_minutes: m.late_tolerance_minutes,
            is_default: m.is_default,
            created_at: m.created_at,
            updated_at: m.updated_at,
        }
    }
}

impl From<attendance_entity::Model> for AttendanceLog {
    fn from(m: attendance_entity::Model) -> Self {
        Self {
            id: m.id,
            employee_id: m.employee_id,
            date: m.date,
            schedule_id: m.schedule_id,
            check_in: m.check_in,
            check_out: m.check_out,
            status: AttendanceStatus::from_str(&m.status),
            late_duration_minutes: m.late_duration_minutes,
            overtime_minutes: m.overtime_minutes,
            check_in_ip: m.check_in_ip,
            check_in_latitude: m.check_in_latitude,
            check_in_longitude: m.check_in_longitude,
            check_out_ip: m.check_out_ip,
            check_out_latitude: m.check_out_latitude,
            check_out_longitude: m.check_out_longitude,
            notes: m.notes,
            auto_closed: m.auto_closed,
            created_at: m.created_at,
            updated_at: m.updated_at,
        }
    }
}

fn map_db_err(e: DbErr) -> RepositoryError {
    match e {
        DbErr::RecordNotFound(_) => RepositoryError::NotFound,
        other => {
            let msg = other.to_string();
            if msg.contains("unique") || msg.contains("duplicate") {
                RepositoryError::Conflict(msg)
            } else {
                RepositoryError::Database(msg)
            }
        }
    }
}

impl AttendanceRepository for SeaOrmAttendanceRepository {
    async fn find_by_employee_and_date(
        &self,
        employee_id: Uuid,
        date: NaiveDate,
    ) -> Result<Option<AttendanceLog>, RepositoryError> {
        attendance_entity::Entity::find()
            .filter(attendance_entity::Column::EmployeeId.eq(employee_id))
            .filter(attendance_entity::Column::Date.eq(date))
            .one(&self.db)
            .await
            .map(|opt| opt.map(Into::into))
            .map_err(map_db_err)
    }

    async fn create_log(
        &self,
        log: AttendanceLog,
    ) -> Result<AttendanceLog, RepositoryError> {
        let active = attendance_entity::ActiveModel {
            id: Set(log.id),
            employee_id: Set(log.employee_id),
            date: Set(log.date),
            schedule_id: Set(log.schedule_id),
            check_in: Set(log.check_in),
            check_out: Set(log.check_out),
            status: Set(log.status.as_str().to_string()),
            late_duration_minutes: Set(log.late_duration_minutes),
            overtime_minutes: Set(log.overtime_minutes),
            check_in_ip: Set(log.check_in_ip),
            check_in_latitude: Set(log.check_in_latitude),
            check_in_longitude: Set(log.check_in_longitude),
            check_out_ip: Set(log.check_out_ip),
            check_out_latitude: Set(log.check_out_latitude),
            check_out_longitude: Set(log.check_out_longitude),
            notes: Set(log.notes),
            auto_closed: Set(log.auto_closed),
            created_at: Set(log.created_at),
            updated_at: Set(log.updated_at),
        };

        active.insert(&self.db)
            .await
            .map(Into::into)
            .map_err(map_db_err)
    }

    async fn update_log(
        &self,
        log: AttendanceLog,
    ) -> Result<AttendanceLog, RepositoryError> {
        let existing = attendance_entity::Entity::find_by_id(log.id)
            .one(&self.db)
            .await
            .map_err(map_db_err)?
            .ok_or(RepositoryError::NotFound)?;

        let mut active: attendance_entity::ActiveModel = existing.into();
        active.schedule_id = Set(log.schedule_id);
        active.check_in = Set(log.check_in);
        active.check_out = Set(log.check_out);
        active.status = Set(log.status.as_str().to_string());
        active.late_duration_minutes = Set(log.late_duration_minutes);
        active.overtime_minutes = Set(log.overtime_minutes);
        active.check_in_ip = Set(log.check_in_ip);
        active.check_in_latitude = Set(log.check_in_latitude);
        active.check_in_longitude = Set(log.check_in_longitude);
        active.check_out_ip = Set(log.check_out_ip);
        active.check_out_latitude = Set(log.check_out_latitude);
        active.check_out_longitude = Set(log.check_out_longitude);
        active.notes = Set(log.notes);
        active.auto_closed = Set(log.auto_closed);
        active.updated_at = Set(Utc::now());

        active.update(&self.db)
            .await
            .map(Into::into)
            .map_err(map_db_err)
    }

    async fn list_logs(
        &self,
        date: Option<NaiveDate>,
        employee_id: Option<Uuid>,
        status: Option<&str>,
        page: u64,
        page_size: u64,
    ) -> Result<(Vec<AttendanceLogWithEmployee>, u64), RepositoryError> {
        let mut query = attendance_entity::Entity::find();

        if let Some(d) = date {
            query = query.filter(attendance_entity::Column::Date.eq(d));
        }

        if let Some(emp_id) = employee_id {
            query = query.filter(attendance_entity::Column::EmployeeId.eq(emp_id));
        }

        if let Some(st) = status {
            query = query.filter(attendance_entity::Column::Status.eq(st.to_lowercase()));
        }

        let paginator = query
            .order_by_desc(attendance_entity::Column::Date)
            .order_by_desc(attendance_entity::Column::CreatedAt)
            .paginate(&self.db, page_size);

        let total = paginator.num_items().await.map_err(map_db_err)?;
        let logs: Vec<attendance_entity::Model> = paginator
            .fetch_page(page.saturating_sub(1))
            .await
            .map_err(map_db_err)?;

        if logs.is_empty() {
            return Ok((Vec::new(), total));
        }

        // Fetch corresponding employees
        let employee_ids: Vec<Uuid> = logs.iter().map(|l| l.employee_id).collect();
        let employees: Vec<employee_entity::Model> = employee_entity::Entity::find()
            .filter(employee_entity::Column::Id.is_in(employee_ids))
            .all(&self.db)
            .await
            .map_err(map_db_err)?;

        let emp_map: HashMap<Uuid, employee_entity::Model> =
            employees.into_iter().map(|e| (e.id, e)).collect();

        let result = logs
            .into_iter()
            .map(|l| {
                let emp = emp_map.get(&l.employee_id);
                AttendanceLogWithEmployee {
                    id: l.id,
                    employee_id: l.employee_id,
                    employee_name: emp.map(|e| e.full_name.clone()).unwrap_or_else(|| "Unknown".to_string()),
                    employee_code: emp.map(|e| e.employee_code.clone()).unwrap_or_else(|| "-".to_string()),
                    department: emp.map(|e| e.department.clone()).unwrap_or_else(|| "-".to_string()),
                    date: l.date,
                    schedule_id: l.schedule_id,
                    check_in: l.check_in,
                    check_out: l.check_out,
                    status: AttendanceStatus::from_str(&l.status),
                    late_duration_minutes: l.late_duration_minutes,
                    overtime_minutes: l.overtime_minutes,
                    notes: l.notes,
                    auto_closed: l.auto_closed,
                }
            })
            .collect();

        Ok((result, total))
    }

    async fn get_default_schedule(&self) -> Result<Option<WorkSchedule>, RepositoryError> {
        work_schedule_entity::Entity::find()
            .filter(work_schedule_entity::Column::IsDefault.eq(true))
            .one(&self.db)
            .await
            .map(|opt| opt.map(Into::into))
            .map_err(map_db_err)
    }

    async fn create_schedule(
        &self,
        schedule: WorkSchedule,
    ) -> Result<WorkSchedule, RepositoryError> {
        let active = work_schedule_entity::ActiveModel {
            id: Set(schedule.id),
            name: Set(schedule.name),
            start_time: Set(schedule.start_time),
            end_time: Set(schedule.end_time),
            late_tolerance_minutes: Set(schedule.late_tolerance_minutes),
            is_default: Set(schedule.is_default),
            created_at: Set(schedule.created_at),
            updated_at: Set(schedule.updated_at),
        };

        active.insert(&self.db)
            .await
            .map(Into::into)
            .map_err(map_db_err)
    }

    async fn find_unclosed_shifts(
        &self,
        target_date: NaiveDate,
    ) -> Result<Vec<AttendanceLog>, RepositoryError> {
        attendance_entity::Entity::find()
            .filter(attendance_entity::Column::Date.lte(target_date))
            .filter(attendance_entity::Column::CheckOut.is_null())
            .filter(attendance_entity::Column::CheckIn.is_not_null())
            .filter(attendance_entity::Column::AutoClosed.eq(false))
            .all(&self.db)
            .await
            .map(|list| list.into_iter().map(Into::into).collect())
            .map_err(map_db_err)
    }

    async fn get_stats_by_date(
        &self,
        date: NaiveDate,
    ) -> Result<AttendanceSummaryStats, RepositoryError> {
        let logs: Vec<attendance_entity::Model> = attendance_entity::Entity::find()
            .filter(attendance_entity::Column::Date.eq(date))
            .all(&self.db)
            .await
            .map_err(map_db_err)?;

        let total_active_employees = employee_entity::Entity::find()
            .filter(employee_entity::Column::IsActive.eq(true))
            .count(&self.db)
            .await
            .map_err(map_db_err)?;

        let mut present_count = 0u64;
        let mut late_count = 0u64;
        let mut absent_count = 0u64;
        let mut leave_count = 0u64;
        let mut total_overtime_mins = 0i64;

        for l in &logs {
            match l.status.to_lowercase().as_str() {
                "present" => present_count += 1,
                "late" => {
                    present_count += 1;
                    late_count += 1;
                }
                "leave" => leave_count += 1,
                "absent" => absent_count += 1,
                _ => {}
            }
            total_overtime_mins += l.overtime_minutes as i64;
        }

        let present_rate = if total_active_employees > 0 {
            format!("{:.1}%", (present_count as f64 / total_active_employees as f64) * 100.0)
        } else {
            "100.0%".to_string()
        };

        let overtime_hours = format!("{:.1} Hrs", (total_overtime_mins as f64) / 60.0);

        Ok(AttendanceSummaryStats {
            date,
            present_count,
            late_count,
            absent_count,
            leave_count,
            total_active_employees,
            present_rate,
            total_overtime_hours: overtime_hours,
        })
    }
}
