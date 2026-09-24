use chrono::{DateTime, NaiveDate, Utc};
use rust_decimal::Decimal;
use sea_orm::entity::prelude::*;
use uuid::Uuid;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "attendance_logs")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub employee_id: Uuid,
    pub date: NaiveDate,
    pub schedule_id: Option<Uuid>,
    pub check_in: Option<DateTime<Utc>>,
    pub check_out: Option<DateTime<Utc>>,
    pub status: String,
    pub late_duration_minutes: i32,
    pub overtime_minutes: i32,
    pub check_in_ip: Option<String>,
    pub check_in_latitude: Option<Decimal>,
    pub check_in_longitude: Option<Decimal>,
    pub check_out_ip: Option<String>,
    pub check_out_latitude: Option<Decimal>,
    pub check_out_longitude: Option<Decimal>,
    pub notes: Option<String>,
    pub auto_closed: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
