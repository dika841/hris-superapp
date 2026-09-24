use std::collections::HashMap;
use chrono::{Datelike, NaiveDate, Utc};
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, DbErr, EntityTrait, PaginatorTrait,
    QueryFilter, QueryOrder, Set,
};
use uuid::Uuid;

use super::entities::employee as employee_entity;
use super::entities::leave_balance as balance_entity;
use super::entities::leave_request as request_entity;
use super::entities::leave_type as type_entity;
use crate::domain::errors::RepositoryError;
use crate::domain::leave::{
    LeaveBalance, LeaveBalanceWithType, LeaveRepository, LeaveRequest,
    LeaveRequestWithDetails, LeaveStatus, LeaveSummaryStats, LeaveType,
};

#[derive(Clone)]
pub struct SeaOrmLeaveRepository {
    db: DatabaseConnection,
}

impl SeaOrmLeaveRepository {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}

impl From<type_entity::Model> for LeaveType {
    fn from(m: type_entity::Model) -> Self {
        Self {
            id: m.id,
            code: m.code,
            name: m.name,
            default_days_per_year: m.default_days_per_year,
            is_paid: m.is_paid,
            requires_attachment: m.requires_attachment,
            created_at: m.created_at,
            updated_at: m.updated_at,
        }
    }
}

impl From<balance_entity::Model> for LeaveBalance {
    fn from(m: balance_entity::Model) -> Self {
        Self {
            id: m.id,
            employee_id: m.employee_id,
            leave_type_id: m.leave_type_id,
            year: m.year,
            allocated_days: m.allocated_days,
            used_days: m.used_days,
            pending_days: m.pending_days,
            remaining_days: m.remaining_days,
            created_at: m.created_at,
            updated_at: m.updated_at,
        }
    }
}

impl From<request_entity::Model> for LeaveRequest {
    fn from(m: request_entity::Model) -> Self {
        Self {
            id: m.id,
            employee_id: m.employee_id,
            leave_type_id: m.leave_type_id,
            start_date: m.start_date,
            end_date: m.end_date,
            total_days: m.total_days,
            reason: m.reason,
            attachment_url: m.attachment_url,
            status: LeaveStatus::from_str(&m.status),
            approved_by: m.approved_by,
            approval_notes: m.approval_notes,
            approved_at: m.approved_at,
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

impl LeaveRepository for SeaOrmLeaveRepository {
    async fn list_leave_types(&self) -> Result<Vec<LeaveType>, RepositoryError> {
        type_entity::Entity::find()
            .order_by_asc(type_entity::Column::Code)
            .all(&self.db)
            .await
            .map(|list| list.into_iter().map(Into::into).collect())
            .map_err(map_db_err)
    }

    async fn find_leave_type_by_id(&self, id: Uuid) -> Result<Option<LeaveType>, RepositoryError> {
        type_entity::Entity::find_by_id(id)
            .one(&self.db)
            .await
            .map(|opt| opt.map(Into::into))
            .map_err(map_db_err)
    }

    async fn find_leave_type_by_code(&self, code: &str) -> Result<Option<LeaveType>, RepositoryError> {
        type_entity::Entity::find()
            .filter(type_entity::Column::Code.eq(code))
            .one(&self.db)
            .await
            .map(|opt| opt.map(Into::into))
            .map_err(map_db_err)
    }

    async fn create_leave_type(&self, leave_type: LeaveType) -> Result<LeaveType, RepositoryError> {
        let active = type_entity::ActiveModel {
            id: Set(leave_type.id),
            code: Set(leave_type.code),
            name: Set(leave_type.name),
            default_days_per_year: Set(leave_type.default_days_per_year),
            is_paid: Set(leave_type.is_paid),
            requires_attachment: Set(leave_type.requires_attachment),
            created_at: Set(leave_type.created_at),
            updated_at: Set(leave_type.updated_at),
        };

        active.insert(&self.db)
            .await
            .map(Into::into)
            .map_err(map_db_err)
    }

    async fn find_balance(
        &self,
        employee_id: Uuid,
        leave_type_id: Uuid,
        year: i32,
    ) -> Result<Option<LeaveBalance>, RepositoryError> {
        balance_entity::Entity::find()
            .filter(balance_entity::Column::EmployeeId.eq(employee_id))
            .filter(balance_entity::Column::LeaveTypeId.eq(leave_type_id))
            .filter(balance_entity::Column::Year.eq(year))
            .one(&self.db)
            .await
            .map(|opt| opt.map(Into::into))
            .map_err(map_db_err)
    }

    async fn list_balances_by_employee(
        &self,
        employee_id: Uuid,
        year: i32,
    ) -> Result<Vec<LeaveBalanceWithType>, RepositoryError> {
        let balances = balance_entity::Entity::find()
            .filter(balance_entity::Column::EmployeeId.eq(employee_id))
            .filter(balance_entity::Column::Year.eq(year))
            .all(&self.db)
            .await
            .map_err(map_db_err)?;

        let types = self.list_leave_types().await?;
        let type_map: HashMap<Uuid, LeaveType> = types.into_iter().map(|t| (t.id, t)).collect();

        let result = balances
            .into_iter()
            .map(|b| {
                let lt = type_map.get(&b.leave_type_id);
                LeaveBalanceWithType {
                    id: b.id,
                    employee_id: b.employee_id,
                    leave_type_id: b.leave_type_id,
                    leave_type_code: lt.map(|t| t.code.clone()).unwrap_or_else(|| "UNKNOWN".into()),
                    leave_type_name: lt.map(|t| t.name.clone()).unwrap_or_else(|| "Unknown Type".into()),
                    year: b.year,
                    allocated_days: b.allocated_days,
                    used_days: b.used_days,
                    pending_days: b.pending_days,
                    remaining_days: b.remaining_days,
                    is_paid: lt.map(|t| t.is_paid).unwrap_or(true),
                }
            })
            .collect();

        Ok(result)
    }

    async fn create_balance(&self, balance: LeaveBalance) -> Result<LeaveBalance, RepositoryError> {
        let active = balance_entity::ActiveModel {
            id: Set(balance.id),
            employee_id: Set(balance.employee_id),
            leave_type_id: Set(balance.leave_type_id),
            year: Set(balance.year),
            allocated_days: Set(balance.allocated_days),
            used_days: Set(balance.used_days),
            pending_days: Set(balance.pending_days),
            remaining_days: Set(balance.remaining_days),
            created_at: Set(balance.created_at),
            updated_at: Set(balance.updated_at),
        };

        active.insert(&self.db)
            .await
            .map(Into::into)
            .map_err(map_db_err)
    }

    async fn update_balance(&self, balance: LeaveBalance) -> Result<LeaveBalance, RepositoryError> {
        let existing = balance_entity::Entity::find_by_id(balance.id)
            .one(&self.db)
            .await
            .map_err(map_db_err)?
            .ok_or(RepositoryError::NotFound)?;

        let mut active: balance_entity::ActiveModel = existing.into();
        active.allocated_days = Set(balance.allocated_days);
        active.used_days = Set(balance.used_days);
        active.pending_days = Set(balance.pending_days);
        active.remaining_days = Set(balance.remaining_days);
        active.updated_at = Set(Utc::now());

        active.update(&self.db)
            .await
            .map(Into::into)
            .map_err(map_db_err)
    }

    async fn create_request(&self, request: LeaveRequest) -> Result<LeaveRequest, RepositoryError> {
        let active = request_entity::ActiveModel {
            id: Set(request.id),
            employee_id: Set(request.employee_id),
            leave_type_id: Set(request.leave_type_id),
            start_date: Set(request.start_date),
            end_date: Set(request.end_date),
            total_days: Set(request.total_days),
            reason: Set(request.reason),
            attachment_url: Set(request.attachment_url),
            status: Set(request.status.as_str().to_string()),
            approved_by: Set(request.approved_by),
            approval_notes: Set(request.approval_notes),
            approved_at: Set(request.approved_at),
            created_at: Set(request.created_at),
            updated_at: Set(request.updated_at),
        };

        active.insert(&self.db)
            .await
            .map(Into::into)
            .map_err(map_db_err)
    }

    async fn find_request_by_id(&self, id: Uuid) -> Result<Option<LeaveRequest>, RepositoryError> {
        request_entity::Entity::find_by_id(id)
            .one(&self.db)
            .await
            .map(|opt| opt.map(Into::into))
            .map_err(map_db_err)
    }

    async fn update_request(&self, request: LeaveRequest) -> Result<LeaveRequest, RepositoryError> {
        let existing = request_entity::Entity::find_by_id(request.id)
            .one(&self.db)
            .await
            .map_err(map_db_err)?
            .ok_or(RepositoryError::NotFound)?;

        let mut active: request_entity::ActiveModel = existing.into();
        active.status = Set(request.status.as_str().to_string());
        active.approved_by = Set(request.approved_by);
        active.approval_notes = Set(request.approval_notes);
        active.approved_at = Set(request.approved_at);
        active.updated_at = Set(Utc::now());

        active.update(&self.db)
            .await
            .map(Into::into)
            .map_err(map_db_err)
    }

    async fn list_requests(
        &self,
        employee_id: Option<Uuid>,
        status: Option<&str>,
        year: Option<i32>,
        page: u64,
        page_size: u64,
    ) -> Result<(Vec<LeaveRequestWithDetails>, u64), RepositoryError> {
        let mut query = request_entity::Entity::find();

        if let Some(emp_id) = employee_id {
            query = query.filter(request_entity::Column::EmployeeId.eq(emp_id));
        }

        if let Some(st) = status {
            query = query.filter(request_entity::Column::Status.eq(st.to_lowercase()));
        }

        if let Some(y) = year {
            let start = NaiveDate::from_ymd_opt(y, 1, 1).unwrap();
            let end = NaiveDate::from_ymd_opt(y, 12, 31).unwrap();
            query = query.filter(request_entity::Column::StartDate.gte(start))
                .filter(request_entity::Column::StartDate.lte(end));
        }

        let paginator = query
            .order_by_desc(request_entity::Column::CreatedAt)
            .paginate(&self.db, page_size);

        let total = paginator.num_items().await.map_err(map_db_err)?;
        let items: Vec<request_entity::Model> = paginator
            .fetch_page(page.saturating_sub(1))
            .await
            .map_err(map_db_err)?;

        if items.is_empty() {
            return Ok((Vec::new(), total));
        }

        // Fetch employees and types
        let emp_ids: Vec<Uuid> = items.iter().map(|i| i.employee_id).collect();
        let employees = employee_entity::Entity::find()
            .filter(employee_entity::Column::Id.is_in(emp_ids))
            .all(&self.db)
            .await
            .map_err(map_db_err)?;
        let emp_map: HashMap<Uuid, employee_entity::Model> =
            employees.into_iter().map(|e| (e.id, e)).collect();

        let types = self.list_leave_types().await?;
        let type_map: HashMap<Uuid, LeaveType> = types.into_iter().map(|t| (t.id, t)).collect();

        let details = items
            .into_iter()
            .map(|r| {
                let emp = emp_map.get(&r.employee_id);
                let lt = type_map.get(&r.leave_type_id);
                LeaveRequestWithDetails {
                    id: r.id,
                    employee_id: r.employee_id,
                    employee_name: emp.map(|e| e.full_name.clone()).unwrap_or_else(|| "Unknown".into()),
                    employee_code: emp.map(|e| e.employee_code.clone()).unwrap_or_else(|| "-".into()),
                    department: emp.map(|e| e.department.clone()).unwrap_or_else(|| "-".into()),
                    leave_type_id: r.leave_type_id,
                    leave_type_code: lt.map(|t| t.code.clone()).unwrap_or_else(|| "UNKNOWN".into()),
                    leave_type_name: lt.map(|t| t.name.clone()).unwrap_or_else(|| "Unknown Type".into()),
                    start_date: r.start_date,
                    end_date: r.end_date,
                    total_days: r.total_days,
                    reason: r.reason,
                    attachment_url: r.attachment_url,
                    status: LeaveStatus::from_str(&r.status),
                    approved_by: r.approved_by,
                    approval_notes: r.approval_notes,
                    approved_at: r.approved_at,
                    created_at: r.created_at,
                }
            })
            .collect();

        Ok((details, total))
    }

    async fn get_leave_stats(
        &self,
        today: NaiveDate,
    ) -> Result<LeaveSummaryStats, RepositoryError> {
        let pending_count = request_entity::Entity::find()
            .filter(request_entity::Column::Status.eq("pending"))
            .count(&self.db)
            .await
            .map_err(map_db_err)?;

        let current_year = today.year();
        let current_month = today.month();
        let month_start = NaiveDate::from_ymd_opt(current_year, current_month, 1).unwrap();
        let month_end = if current_month == 12 {
            NaiveDate::from_ymd_opt(current_year + 1, 1, 1).unwrap()
        } else {
            NaiveDate::from_ymd_opt(current_year, current_month + 1, 1).unwrap()
        };

        let approved_this_month = request_entity::Entity::find()
            .filter(request_entity::Column::Status.eq("approved"))
            .filter(request_entity::Column::StartDate.gte(month_start))
            .filter(request_entity::Column::StartDate.lt(month_end))
            .count(&self.db)
            .await
            .map_err(map_db_err)?;

        let employees_on_leave_today = request_entity::Entity::find()
            .filter(request_entity::Column::Status.eq("approved"))
            .filter(request_entity::Column::StartDate.lte(today))
            .filter(request_entity::Column::EndDate.gte(today))
            .count(&self.db)
            .await
            .map_err(map_db_err)?;

        Ok(LeaveSummaryStats {
            pending_count,
            approved_this_month,
            employees_on_leave_today,
        })
    }
}
