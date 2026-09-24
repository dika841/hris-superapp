use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Work Schedules Table
        manager
            .create_table(
                Table::create()
                    .table(WorkSchedules::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(WorkSchedules::Id).uuid().not_null().primary_key())
                    .col(ColumnDef::new(WorkSchedules::Name).string_len(100).not_null())
                    .col(ColumnDef::new(WorkSchedules::StartTime).string_len(10).not_null().default("09:00:00"))
                    .col(ColumnDef::new(WorkSchedules::EndTime).string_len(10).not_null().default("18:00:00"))
                    .col(ColumnDef::new(WorkSchedules::LateToleranceMinutes).integer().not_null().default(15))
                    .col(ColumnDef::new(WorkSchedules::IsDefault).boolean().not_null().default(true))
                    .col(ColumnDef::new(WorkSchedules::CreatedAt).timestamp_with_time_zone().not_null())
                    .col(ColumnDef::new(WorkSchedules::UpdatedAt).timestamp_with_time_zone().not_null())
                    .to_owned(),
            )
            .await?;

        // Attendance Logs Table
        manager
            .create_table(
                Table::create()
                    .table(AttendanceLogs::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(AttendanceLogs::Id).uuid().not_null().primary_key())
                    .col(ColumnDef::new(AttendanceLogs::EmployeeId).uuid().not_null())
                    .col(ColumnDef::new(AttendanceLogs::Date).date().not_null())
                    .col(ColumnDef::new(AttendanceLogs::ScheduleId).uuid())
                    .col(ColumnDef::new(AttendanceLogs::CheckIn).timestamp_with_time_zone())
                    .col(ColumnDef::new(AttendanceLogs::CheckOut).timestamp_with_time_zone())
                    .col(ColumnDef::new(AttendanceLogs::Status).string_len(30).not_null().default("present"))
                    .col(ColumnDef::new(AttendanceLogs::LateDurationMinutes).integer().not_null().default(0))
                    .col(ColumnDef::new(AttendanceLogs::OvertimeMinutes).integer().not_null().default(0))
                    .col(ColumnDef::new(AttendanceLogs::CheckInIp).string_len(50))
                    .col(ColumnDef::new(AttendanceLogs::CheckInLatitude).decimal_len(10, 6))
                    .col(ColumnDef::new(AttendanceLogs::CheckInLongitude).decimal_len(10, 6))
                    .col(ColumnDef::new(AttendanceLogs::CheckOutIp).string_len(50))
                    .col(ColumnDef::new(AttendanceLogs::CheckOutLatitude).decimal_len(10, 6))
                    .col(ColumnDef::new(AttendanceLogs::CheckOutLongitude).decimal_len(10, 6))
                    .col(ColumnDef::new(AttendanceLogs::Notes).text())
                    .col(ColumnDef::new(AttendanceLogs::AutoClosed).boolean().not_null().default(false))
                    .col(ColumnDef::new(AttendanceLogs::CreatedAt).timestamp_with_time_zone().not_null())
                    .col(ColumnDef::new(AttendanceLogs::UpdatedAt).timestamp_with_time_zone().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_attendance_employee")
                            .from(AttendanceLogs::Table, AttendanceLogs::EmployeeId)
                            .to(Employees::Table, Employees::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_attendance_schedule")
                            .from(AttendanceLogs::Table, AttendanceLogs::ScheduleId)
                            .to(WorkSchedules::Table, WorkSchedules::Id)
                            .on_delete(ForeignKeyAction::SetNull),
                    )
                    .to_owned(),
            )
            .await?;

        // Composite unique index: one attendance log per employee per date
        manager
            .create_index(
                Index::create()
                    .name("idx_attendance_employee_date")
                    .table(AttendanceLogs::Table)
                    .col(AttendanceLogs::EmployeeId)
                    .col(AttendanceLogs::Date)
                    .unique()
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager.drop_table(Table::drop().table(AttendanceLogs::Table).to_owned()).await?;
        manager.drop_table(Table::drop().table(WorkSchedules::Table).to_owned()).await?;
        Ok(())
    }
}

#[derive(DeriveIden)]
enum WorkSchedules {
    Table,
    Id,
    Name,
    StartTime,
    EndTime,
    LateToleranceMinutes,
    IsDefault,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum AttendanceLogs {
    Table,
    Id,
    EmployeeId,
    Date,
    ScheduleId,
    CheckIn,
    CheckOut,
    Status,
    LateDurationMinutes,
    OvertimeMinutes,
    CheckInIp,
    CheckInLatitude,
    CheckInLongitude,
    CheckOutIp,
    CheckOutLatitude,
    CheckOutLongitude,
    Notes,
    AutoClosed,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum Employees {
    Table,
    Id,
}
