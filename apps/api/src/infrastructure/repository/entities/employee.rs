use chrono::{DateTime, NaiveDate, Utc};
use rust_decimal::Decimal;
use sea_orm::entity::prelude::*;
use uuid::Uuid;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "employees")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub user_id: Option<Uuid>,
    #[sea_orm(unique)]
    pub employee_code: String,
    pub full_name: String,
    pub national_id: String,
    pub npwp: Option<String>,
    pub department: String,
    pub position: String,
    pub employment_status: String,
    pub join_date: NaiveDate,
    pub basic_salary: Decimal,
    pub allowance_fixed: Decimal,
    pub ptkp_status: String,
    pub bank_name: Option<String>,
    pub bank_account: Option<String>,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
