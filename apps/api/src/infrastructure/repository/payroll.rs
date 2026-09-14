use chrono::Utc;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, DbErr, EntityTrait, QueryFilter,
    QueryOrder, Set,
};
use uuid::Uuid;
use super::entities::payroll as payroll_entity;
use crate::domain::errors::RepositoryError;
use crate::domain::payroll::{NewPayrollRecord, PayrollRecord, PayrollRepository};

#[derive(Clone)]
pub struct SeaOrmPayrollRepository {
    db: DatabaseConnection,
}

impl SeaOrmPayrollRepository {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}

impl From<payroll_entity::Model> for PayrollRecord {
    fn from(m: payroll_entity::Model) -> Self {
        Self {
            id: m.id,
            employee_id: m.employee_id,
            period_month: m.period_month,
            period_year: m.period_year,
            basic_salary: m.basic_salary,
            allowance_fixed: m.allowance_fixed,
            overtime_hours: m.overtime_hours,
            overtime_pay: m.overtime_pay,
            bonus: m.bonus,
            gross_salary: m.gross_salary,
            ter_category: m.ter_category,
            ter_rate: m.ter_rate,
            pph21_amount: m.pph21_amount,
            bpjs_jht_employee: m.bpjs_jht_employee,
            bpjs_jp_employee: m.bpjs_jp_employee,
            bpjs_kes_employee: m.bpjs_kes_employee,
            total_deductions: m.total_deductions,
            take_home_pay: m.take_home_pay,
            is_paid: m.is_paid,
            paid_at: m.paid_at,
            created_at: m.created_at,
            updated_at: m.updated_at,
        }
    }
}

fn map_db_err(e: DbErr) -> RepositoryError {
    match e {
        DbErr::RecordNotFound(_) => RepositoryError::NotFound,
        other => RepositoryError::Database(other.to_string()),
    }
}

impl PayrollRepository for SeaOrmPayrollRepository {
    async fn find_by_id(&self, id: Uuid) -> Result<Option<PayrollRecord>, RepositoryError> {
        payroll_entity::Entity::find_by_id(id)
            .one(&self.db)
            .await
            .map(|opt| opt.map(PayrollRecord::from))
            .map_err(map_db_err)
    }

    async fn find_by_employee_period(&self, employee_id: Uuid, month: i32, year: i32) -> Result<Option<PayrollRecord>, RepositoryError> {
        payroll_entity::Entity::find()
            .filter(payroll_entity::Column::EmployeeId.eq(employee_id))
            .filter(payroll_entity::Column::PeriodMonth.eq(month))
            .filter(payroll_entity::Column::PeriodYear.eq(year))
            .one(&self.db)
            .await
            .map(|opt| opt.map(PayrollRecord::from))
            .map_err(map_db_err)
    }

    async fn create(&self, record: NewPayrollRecord) -> Result<PayrollRecord, RepositoryError> {
        let now = Utc::now();
        let model = payroll_entity::ActiveModel {
            id: Set(record.id),
            employee_id: Set(record.employee_id),
            period_month: Set(record.period_month),
            period_year: Set(record.period_year),
            basic_salary: Set(record.basic_salary),
            allowance_fixed: Set(record.allowance_fixed),
            overtime_hours: Set(record.overtime_hours),
            overtime_pay: Set(record.overtime_pay),
            bonus: Set(record.bonus),
            gross_salary: Set(record.gross_salary),
            ter_category: Set(record.ter_category),
            ter_rate: Set(record.ter_rate),
            pph21_amount: Set(record.pph21_amount),
            bpjs_jht_employee: Set(record.bpjs_jht_employee),
            bpjs_jp_employee: Set(record.bpjs_jp_employee),
            bpjs_kes_employee: Set(record.bpjs_kes_employee),
            total_deductions: Set(record.total_deductions),
            take_home_pay: Set(record.take_home_pay),
            is_paid: Set(false),
            paid_at: Set(None),
            created_at: Set(now),
            updated_at: Set(now),
        };
        let inserted = model.insert(&self.db).await.map_err(map_db_err)?;
        Ok(PayrollRecord::from(inserted))
    }

    async fn mark_as_paid(&self, id: Uuid) -> Result<PayrollRecord, RepositoryError> {
        let existing = payroll_entity::Entity::find_by_id(id)
            .one(&self.db)
            .await
            .map_err(map_db_err)?
            .ok_or(RepositoryError::NotFound)?;

        let now = Utc::now();
        let mut active: payroll_entity::ActiveModel = existing.into();
        active.is_paid = Set(true);
        active.paid_at = Set(Some(now));
        active.updated_at = Set(now);

        let updated = active.update(&self.db).await.map_err(map_db_err)?;
        Ok(PayrollRecord::from(updated))
    }

    async fn list_by_period(&self, month: i32, year: i32, is_paid: Option<bool>) -> Result<Vec<PayrollRecord>, RepositoryError> {
        let mut query = payroll_entity::Entity::find()
            .filter(payroll_entity::Column::PeriodMonth.eq(month))
            .filter(payroll_entity::Column::PeriodYear.eq(year));

        if let Some(paid) = is_paid {
            query = query.filter(payroll_entity::Column::IsPaid.eq(paid));
        }

        let items = query
            .order_by_desc(payroll_entity::Column::CreatedAt)
            .all(&self.db)
            .await
            .map_err(map_db_err)?;
        Ok(items.into_iter().map(PayrollRecord::from).collect())
    }

    async fn list_by_employee(&self, employee_id: Uuid) -> Result<Vec<PayrollRecord>, RepositoryError> {
        let items = payroll_entity::Entity::find()
            .filter(payroll_entity::Column::EmployeeId.eq(employee_id))
            .order_by_desc(payroll_entity::Column::PeriodYear)
            .order_by_desc(payroll_entity::Column::PeriodMonth)
            .all(&self.db)
            .await
            .map_err(map_db_err)?;
        Ok(items.into_iter().map(PayrollRecord::from).collect())
    }
}
