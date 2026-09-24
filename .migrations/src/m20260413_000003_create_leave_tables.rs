use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // 1. Leave Types Table
        manager
            .create_table(
                Table::create()
                    .table(LeaveTypes::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(LeaveTypes::Id).uuid().not_null().primary_key())
                    .col(ColumnDef::new(LeaveTypes::Code).string_len(50).not_null().unique_key())
                    .col(ColumnDef::new(LeaveTypes::Name).string_len(150).not_null())
                    .col(ColumnDef::new(LeaveTypes::DefaultDaysPerYear).integer().not_null().default(12))
                    .col(ColumnDef::new(LeaveTypes::IsPaid).boolean().not_null().default(true))
                    .col(ColumnDef::new(LeaveTypes::RequiresAttachment).boolean().not_null().default(false))
                    .col(ColumnDef::new(LeaveTypes::CreatedAt).timestamp_with_time_zone().not_null())
                    .col(ColumnDef::new(LeaveTypes::UpdatedAt).timestamp_with_time_zone().not_null())
                    .to_owned(),
            )
            .await?;

        // 2. Leave Balances Table
        manager
            .create_table(
                Table::create()
                    .table(LeaveBalances::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(LeaveBalances::Id).uuid().not_null().primary_key())
                    .col(ColumnDef::new(LeaveBalances::EmployeeId).uuid().not_null())
                    .col(ColumnDef::new(LeaveBalances::LeaveTypeId).uuid().not_null())
                    .col(ColumnDef::new(LeaveBalances::Year).integer().not_null())
                    .col(ColumnDef::new(LeaveBalances::AllocatedDays).integer().not_null().default(12))
                    .col(ColumnDef::new(LeaveBalances::UsedDays).integer().not_null().default(0))
                    .col(ColumnDef::new(LeaveBalances::PendingDays).integer().not_null().default(0))
                    .col(ColumnDef::new(LeaveBalances::RemainingDays).integer().not_null().default(12))
                    .col(ColumnDef::new(LeaveBalances::CreatedAt).timestamp_with_time_zone().not_null())
                    .col(ColumnDef::new(LeaveBalances::UpdatedAt).timestamp_with_time_zone().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_leave_balances_employee")
                            .from(LeaveBalances::Table, LeaveBalances::EmployeeId)
                            .to(Employees::Table, Employees::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_leave_balances_type")
                            .from(LeaveBalances::Table, LeaveBalances::LeaveTypeId)
                            .to(LeaveTypes::Table, LeaveTypes::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("idx_leave_balance_emp_type_year")
                    .table(LeaveBalances::Table)
                    .col(LeaveBalances::EmployeeId)
                    .col(LeaveBalances::LeaveTypeId)
                    .col(LeaveBalances::Year)
                    .unique()
                    .to_owned(),
            )
            .await?;

        // 3. Leave Requests Table
        manager
            .create_table(
                Table::create()
                    .table(LeaveRequests::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(LeaveRequests::Id).uuid().not_null().primary_key())
                    .col(ColumnDef::new(LeaveRequests::EmployeeId).uuid().not_null())
                    .col(ColumnDef::new(LeaveRequests::LeaveTypeId).uuid().not_null())
                    .col(ColumnDef::new(LeaveRequests::StartDate).date().not_null())
                    .col(ColumnDef::new(LeaveRequests::EndDate).date().not_null())
                    .col(ColumnDef::new(LeaveRequests::TotalDays).integer().not_null())
                    .col(ColumnDef::new(LeaveRequests::Reason).text().not_null())
                    .col(ColumnDef::new(LeaveRequests::AttachmentUrl).string_len(255))
                    .col(ColumnDef::new(LeaveRequests::Status).string_len(30).not_null().default("pending"))
                    .col(ColumnDef::new(LeaveRequests::ApprovedBy).uuid())
                    .col(ColumnDef::new(LeaveRequests::ApprovalNotes).text())
                    .col(ColumnDef::new(LeaveRequests::ApprovedAt).timestamp_with_time_zone())
                    .col(ColumnDef::new(LeaveRequests::CreatedAt).timestamp_with_time_zone().not_null())
                    .col(ColumnDef::new(LeaveRequests::UpdatedAt).timestamp_with_time_zone().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_leave_requests_employee")
                            .from(LeaveRequests::Table, LeaveRequests::EmployeeId)
                            .to(Employees::Table, Employees::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_leave_requests_type")
                            .from(LeaveRequests::Table, LeaveRequests::LeaveTypeId)
                            .to(LeaveTypes::Table, LeaveTypes::Id)
                            .on_delete(ForeignKeyAction::Restrict),
                    )
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager.drop_table(Table::drop().table(LeaveRequests::Table).to_owned()).await?;
        manager.drop_table(Table::drop().table(LeaveBalances::Table).to_owned()).await?;
        manager.drop_table(Table::drop().table(LeaveTypes::Table).to_owned()).await?;
        Ok(())
    }
}

#[derive(DeriveIden)]
enum LeaveTypes {
    Table,
    Id,
    Code,
    Name,
    DefaultDaysPerYear,
    IsPaid,
    RequiresAttachment,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum LeaveBalances {
    Table,
    Id,
    EmployeeId,
    LeaveTypeId,
    Year,
    AllocatedDays,
    UsedDays,
    PendingDays,
    RemainingDays,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum LeaveRequests {
    Table,
    Id,
    EmployeeId,
    LeaveTypeId,
    StartDate,
    EndDate,
    TotalDays,
    Reason,
    AttachmentUrl,
    Status,
    ApprovedBy,
    ApprovalNotes,
    ApprovedAt,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum Employees {
    Table,
    Id,
}
