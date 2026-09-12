use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Users Table
        manager
            .create_table(
                Table::create()
                    .table(Users::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Users::Id).uuid().not_null().primary_key())
                    .col(ColumnDef::new(Users::Email).string_len(255).not_null().unique_key())
                    .col(ColumnDef::new(Users::Name).string_len(255).not_null())
                    .col(ColumnDef::new(Users::PasswordHash).string_len(255).not_null())
                    .col(ColumnDef::new(Users::Role).string_len(50).not_null())
                    .col(ColumnDef::new(Users::IsActive).boolean().not_null().default(true))
                    .col(ColumnDef::new(Users::CreatedAt).timestamp_with_time_zone().not_null())
                    .col(ColumnDef::new(Users::UpdatedAt).timestamp_with_time_zone().not_null())
                    .to_owned(),
            )
            .await?;

        // Roles Table
        manager
            .create_table(
                Table::create()
                    .table(Roles::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Roles::Id).uuid().not_null().primary_key())
                    .col(ColumnDef::new(Roles::Name).string_len(100).not_null().unique_key())
                    .col(ColumnDef::new(Roles::Description).string_len(255))
                    .col(ColumnDef::new(Roles::CreatedAt).timestamp_with_time_zone().not_null())
                    .to_owned(),
            )
            .await?;

        // Permissions Table
        manager
            .create_table(
                Table::create()
                    .table(Permissions::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Permissions::Id).uuid().not_null().primary_key())
                    .col(ColumnDef::new(Permissions::Name).string_len(100).not_null().unique_key())
                    .col(ColumnDef::new(Permissions::Description).string_len(255))
                    .col(ColumnDef::new(Permissions::CreatedAt).timestamp_with_time_zone().not_null())
                    .to_owned(),
            )
            .await?;

        // User Roles Table
        manager
            .create_table(
                Table::create()
                    .table(UserRoles::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(UserRoles::UserId).uuid().not_null())
                    .col(ColumnDef::new(UserRoles::RoleId).uuid().not_null())
                    .primary_key(Index::create().col(UserRoles::UserId).col(UserRoles::RoleId))
                    .to_owned(),
            )
            .await?;

        // Role Permissions Table
        manager
            .create_table(
                Table::create()
                    .table(RolePermissions::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(RolePermissions::RoleId).uuid().not_null())
                    .col(ColumnDef::new(RolePermissions::PermissionId).uuid().not_null())
                    .primary_key(Index::create().col(RolePermissions::RoleId).col(RolePermissions::PermissionId))
                    .to_owned(),
            )
            .await?;

        // Employees Table
        manager
            .create_table(
                Table::create()
                    .table(Employees::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Employees::Id).uuid().not_null().primary_key())
                    .col(ColumnDef::new(Employees::UserId).uuid())
                    .col(ColumnDef::new(Employees::EmployeeCode).string_len(50).not_null().unique_key())
                    .col(ColumnDef::new(Employees::FullName).string_len(255).not_null())
                    .col(ColumnDef::new(Employees::NationalId).string_len(32).not_null())
                    .col(ColumnDef::new(Employees::Npwp).string_len(32))
                    .col(ColumnDef::new(Employees::Department).string_len(100).not_null())
                    .col(ColumnDef::new(Employees::Position).string_len(100).not_null())
                    .col(ColumnDef::new(Employees::EmploymentStatus).string_len(50).not_null())
                    .col(ColumnDef::new(Employees::JoinDate).date().not_null())
                    .col(ColumnDef::new(Employees::BasicSalary).decimal_len(16, 2).not_null())
                    .col(ColumnDef::new(Employees::AllowanceFixed).decimal_len(16, 2).not_null())
                    .col(ColumnDef::new(Employees::PtkpStatus).string_len(10).not_null())
                    .col(ColumnDef::new(Employees::BankName).string_len(50))
                    .col(ColumnDef::new(Employees::BankAccount).string_len(50))
                    .col(ColumnDef::new(Employees::IsActive).boolean().not_null().default(true))
                    .col(ColumnDef::new(Employees::CreatedAt).timestamp_with_time_zone().not_null())
                    .col(ColumnDef::new(Employees::UpdatedAt).timestamp_with_time_zone().not_null())
                    .to_owned(),
            )
            .await?;

        // Payroll Records Table
        manager
            .create_table(
                Table::create()
                    .table(PayrollRecords::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(PayrollRecords::Id).uuid().not_null().primary_key())
                    .col(ColumnDef::new(PayrollRecords::EmployeeId).uuid().not_null())
                    .col(ColumnDef::new(PayrollRecords::PeriodMonth).integer().not_null())
                    .col(ColumnDef::new(PayrollRecords::PeriodYear).integer().not_null())
                    .col(ColumnDef::new(PayrollRecords::BasicSalary).decimal_len(16, 2).not_null())
                    .col(ColumnDef::new(PayrollRecords::AllowanceFixed).decimal_len(16, 2).not_null())
                    .col(ColumnDef::new(PayrollRecords::OvertimeHours).decimal_len(8, 2).not_null())
                    .col(ColumnDef::new(PayrollRecords::OvertimePay).decimal_len(16, 2).not_null())
                    .col(ColumnDef::new(PayrollRecords::Bonus).decimal_len(16, 2).not_null())
                    .col(ColumnDef::new(PayrollRecords::GrossSalary).decimal_len(16, 2).not_null())
                    .col(ColumnDef::new(PayrollRecords::TerCategory).string_len(20).not_null())
                    .col(ColumnDef::new(PayrollRecords::TerRate).decimal_len(6, 4).not_null())
                    .col(ColumnDef::new(PayrollRecords::Pph21Amount).decimal_len(16, 2).not_null())
                    .col(ColumnDef::new(PayrollRecords::BpjsJhtEmployee).decimal_len(16, 2).not_null())
                    .col(ColumnDef::new(PayrollRecords::BpjsJpEmployee).decimal_len(16, 2).not_null())
                    .col(ColumnDef::new(PayrollRecords::BpjsKesEmployee).decimal_len(16, 2).not_null())
                    .col(ColumnDef::new(PayrollRecords::TotalDeductions).decimal_len(16, 2).not_null())
                    .col(ColumnDef::new(PayrollRecords::TakeHomePay).decimal_len(16, 2).not_null())
                    .col(ColumnDef::new(PayrollRecords::IsPaid).boolean().not_null().default(false))
                    .col(ColumnDef::new(PayrollRecords::PaidAt).timestamp_with_time_zone())
                    .col(ColumnDef::new(PayrollRecords::CreatedAt).timestamp_with_time_zone().not_null())
                    .col(ColumnDef::new(PayrollRecords::UpdatedAt).timestamp_with_time_zone().not_null())
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager.drop_table(Table::drop().table(PayrollRecords::Table).to_owned()).await?;
        manager.drop_table(Table::drop().table(Employees::Table).to_owned()).await?;
        manager.drop_table(Table::drop().table(RolePermissions::Table).to_owned()).await?;
        manager.drop_table(Table::drop().table(UserRoles::Table).to_owned()).await?;
        manager.drop_table(Table::drop().table(Permissions::Table).to_owned()).await?;
        manager.drop_table(Table::drop().table(Roles::Table).to_owned()).await?;
        manager.drop_table(Table::drop().table(Users::Table).to_owned()).await?;
        Ok(())
    }
}

#[derive(DeriveIden)]
enum Users {
    Table,
    Id,
    Email,
    Name,
    PasswordHash,
    Role,
    IsActive,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum Roles {
    Table,
    Id,
    Name,
    Description,
    CreatedAt,
}

#[derive(DeriveIden)]
enum Permissions {
    Table,
    Id,
    Name,
    Description,
    CreatedAt,
}

#[derive(DeriveIden)]
enum UserRoles {
    Table,
    UserId,
    RoleId,
}

#[derive(DeriveIden)]
enum RolePermissions {
    Table,
    RoleId,
    PermissionId,
}

#[derive(DeriveIden)]
enum Employees {
    Table,
    Id,
    UserId,
    EmployeeCode,
    FullName,
    NationalId,
    Npwp,
    Department,
    Position,
    EmploymentStatus,
    JoinDate,
    BasicSalary,
    AllowanceFixed,
    PtkpStatus,
    BankName,
    BankAccount,
    IsActive,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum PayrollRecords {
    Table,
    Id,
    EmployeeId,
    PeriodMonth,
    PeriodYear,
    BasicSalary,
    AllowanceFixed,
    OvertimeHours,
    OvertimePay,
    Bonus,
    GrossSalary,
    TerCategory,
    TerRate,
    Pph21Amount,
    BpjsJhtEmployee,
    BpjsJpEmployee,
    BpjsKesEmployee,
    TotalDeductions,
    TakeHomePay,
    IsPaid,
    PaidAt,
    CreatedAt,
    UpdatedAt,
}
