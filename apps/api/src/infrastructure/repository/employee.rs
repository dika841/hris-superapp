use chrono::Utc;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, DbErr, EntityTrait, PaginatorTrait,
    QueryFilter, QueryOrder, Set,
};
use uuid::Uuid;
use super::entities::employee as employee_entity;
use crate::domain::employee::{
    Employee, EmployeePatch, EmployeeRepository, EmploymentStatus, NewEmployee, PTKPStatus,
};
use crate::domain::errors::RepositoryError;

#[derive(Clone)]
pub struct SeaOrmEmployeeRepository {
    db: DatabaseConnection,
}

impl SeaOrmEmployeeRepository {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}

impl From<employee_entity::Model> for Employee {
    fn from(m: employee_entity::Model) -> Self {
        Self {
            id: m.id,
            user_id: m.user_id,
            employee_code: m.employee_code,
            full_name: m.full_name,
            national_id: m.national_id,
            npwp: m.npwp,
            department: m.department,
            position: m.position,
            employment_status: EmploymentStatus::from_str(&m.employment_status).unwrap_or(EmploymentStatus::Permanent),
            join_date: m.join_date,
            basic_salary: m.basic_salary,
            allowance_fixed: m.allowance_fixed,
            ptkp_status: PTKPStatus::from_str(&m.ptkp_status).unwrap_or(PTKPStatus::TK0),
            bank_name: m.bank_name,
            bank_account: m.bank_account,
            is_active: m.is_active,
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

impl EmployeeRepository for SeaOrmEmployeeRepository {
    async fn find_by_id(&self, id: Uuid) -> Result<Option<Employee>, RepositoryError> {
        employee_entity::Entity::find_by_id(id)
            .one(&self.db)
            .await
            .map(|opt| opt.map(Employee::from))
            .map_err(map_db_err)
    }

    async fn find_by_code(&self, code: &str) -> Result<Option<Employee>, RepositoryError> {
        employee_entity::Entity::find()
            .filter(employee_entity::Column::EmployeeCode.eq(code))
            .one(&self.db)
            .await
            .map(|opt| opt.map(Employee::from))
            .map_err(map_db_err)
    }

    async fn create(&self, employee: NewEmployee) -> Result<Employee, RepositoryError> {
        let now = Utc::now();
        let model = employee_entity::ActiveModel {
            id: Set(employee.id),
            user_id: Set(employee.user_id),
            employee_code: Set(employee.employee_code),
            full_name: Set(employee.full_name),
            national_id: Set(employee.national_id),
            npwp: Set(employee.npwp),
            department: Set(employee.department),
            position: Set(employee.position),
            employment_status: Set(employee.employment_status.as_str().to_string()),
            join_date: Set(employee.join_date),
            basic_salary: Set(employee.basic_salary),
            allowance_fixed: Set(employee.allowance_fixed),
            ptkp_status: Set(employee.ptkp_status.as_str().to_string()),
            bank_name: Set(employee.bank_name),
            bank_account: Set(employee.bank_account),
            is_active: Set(true),
            created_at: Set(now),
            updated_at: Set(now),
        };
        let inserted = model.insert(&self.db).await.map_err(map_db_err)?;
        Ok(Employee::from(inserted))
    }

    async fn update(&self, id: Uuid, patch: EmployeePatch) -> Result<Employee, RepositoryError> {
        let existing = employee_entity::Entity::find_by_id(id)
            .one(&self.db)
            .await
            .map_err(map_db_err)?
            .ok_or(RepositoryError::NotFound)?;

        let mut active: employee_entity::ActiveModel = existing.into();
        if let Some(name) = patch.full_name {
            active.full_name = Set(name);
        }
        if let Some(npwp) = patch.npwp {
            active.npwp = Set(Some(npwp));
        }
        if let Some(dept) = patch.department {
            active.department = Set(dept);
        }
        if let Some(pos) = patch.position {
            active.position = Set(pos);
        }
        if let Some(status) = patch.employment_status {
            active.employment_status = Set(status.as_str().to_string());
        }
        if let Some(sal) = patch.basic_salary {
            active.basic_salary = Set(sal);
        }
        if let Some(all) = patch.allowance_fixed {
            active.allowance_fixed = Set(all);
        }
        if let Some(ptkp) = patch.ptkp_status {
            active.ptkp_status = Set(ptkp.as_str().to_string());
        }
        if let Some(bank) = patch.bank_name {
            active.bank_name = Set(Some(bank));
        }
        if let Some(acc) = patch.bank_account {
            active.bank_account = Set(Some(acc));
        }
        if let Some(flag) = patch.is_active {
            active.is_active = Set(flag);
        }
        active.updated_at = Set(Utc::now());

        let updated = active.update(&self.db).await.map_err(map_db_err)?;
        Ok(Employee::from(updated))
    }

    async fn delete(&self, id: Uuid) -> Result<(), RepositoryError> {
        let res = employee_entity::Entity::delete_by_id(id)
            .exec(&self.db)
            .await
            .map_err(map_db_err)?;
        if res.rows_affected == 0 {
            return Err(RepositoryError::NotFound);
        }
        Ok(())
    }

    async fn list(
        &self,
        page: u64,
        page_size: u64,
        department: Option<&str>,
        search: Option<&str>,
        is_active: Option<bool>,
    ) -> Result<(Vec<Employee>, u64), RepositoryError> {
        let mut query = employee_entity::Entity::find();
        if let Some(dept) = department {
            let dept = dept.trim();
            if !dept.is_empty() && dept != "all" {
                query = query.filter(employee_entity::Column::Department.eq(dept));
            }
        }
        if let Some(s) = search {
            let s = s.trim();
            if !s.is_empty() {
                query = query.filter(
                    employee_entity::Column::FullName.contains(s)
                        .or(employee_entity::Column::EmployeeCode.contains(s))
                        .or(employee_entity::Column::NationalId.contains(s))
                        .or(employee_entity::Column::Position.contains(s))
                );
            }
        }
        if let Some(active) = is_active {
            query = query.filter(employee_entity::Column::IsActive.eq(active));
        }

        let paginator = query
            .order_by_desc(employee_entity::Column::CreatedAt)
            .paginate(&self.db, page_size);

        let total = paginator.num_items().await.map_err(map_db_err)?;
        let items = paginator.fetch_page(page.saturating_sub(1)).await.map_err(map_db_err)?;
        Ok((items.into_iter().map(Employee::from).collect(), total))
    }
}
