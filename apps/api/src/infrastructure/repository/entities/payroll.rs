use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use sea_orm::entity::prelude::*;
use uuid::Uuid;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "payroll_records")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub employee_id: Uuid,
    pub period_month: i32,
    pub period_year: i32,
    pub basic_salary: Decimal,
    pub allowance_fixed: Decimal,
    pub overtime_hours: Decimal,
    pub overtime_pay: Decimal,
    pub bonus: Decimal,
    pub gross_salary: Decimal,
    pub ter_category: String,
    pub ter_rate: Decimal,
    pub pph21_amount: Decimal,
    pub bpjs_jht_employee: Decimal,
    pub bpjs_jp_employee: Decimal,
    pub bpjs_kes_employee: Decimal,
    pub total_deductions: Decimal,
    pub take_home_pay: Decimal,
    pub is_paid: bool,
    pub paid_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
