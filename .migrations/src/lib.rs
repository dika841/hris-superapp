pub use sea_orm_migration::prelude::*;

mod m20260413_000001_create_initial_tables;
mod m20260413_000002_create_attendance_tables;
mod m20260413_000003_create_leave_tables;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20260413_000001_create_initial_tables::Migration),
            Box::new(m20260413_000002_create_attendance_tables::Migration),
            Box::new(m20260413_000003_create_leave_tables::Migration),
        ]
    }
}
