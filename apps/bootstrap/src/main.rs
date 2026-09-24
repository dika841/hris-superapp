use api::{
    create_connection,
    domain::{
        attendance::{AttendanceRepository, WorkSchedule},
        employee::EmployeeRepository,
        leave::{LeaveBalance, LeaveRepository, LeaveType},
        rbac::RbacRepository,
        user::{NewUser, UserRepository},
    },
    infrastructure::{
        auth::Argon2PasswordService,
        config::AppConfig,
        repository::{
            SeaOrmAttendanceRepository, SeaOrmEmployeeRepository, SeaOrmLeaveRepository,
            SeaOrmRbacRepository, SeaOrmUserRepository,
        },
    },
    application::auth::ports::PasswordService,
};
use chrono::{Datelike, Utc};
use uuid::Uuid;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();
    tracing_subscriber::fmt::init();

    let config = AppConfig::load().map_err(|e| anyhow::anyhow!(e))?;
    tracing::info!("Connecting to database for idempotent bootstrap seeding...");

    let db = create_connection(&config.database_url).await?;
    let rbac_repo = SeaOrmRbacRepository::new(db.clone());
    let user_repo = SeaOrmUserRepository::new(db.clone());
    let employee_repo = SeaOrmEmployeeRepository::new(db.clone());
    let attendance_repo = SeaOrmAttendanceRepository::new(db.clone());
    let leave_repo = SeaOrmLeaveRepository::new(db.clone());
    let password_service = Argon2PasswordService::new();

    // 1. Seed standard permissions
    let permissions = [
        ("rbac:manage", "Manage system roles and permissions"),
        ("users:read", "View user accounts"),
        ("users:write", "Create, modify, and deactivate users"),
        ("employees:read", "View employee profiles and records"),
        ("employees:write", "Create and modify employee profiles"),
        ("payroll:read", "View payroll records and history"),
        ("payroll:calculate", "Calculate payroll with PPh 21 TER and mark paid"),
        ("attendance:read", "View attendance records and daily statistics"),
        ("attendance:record", "Clock in and clock out daily attendance"),
        ("attendance:manage", "Manage work schedules and trigger sweeps"),
        ("leave:read", "View leave requests and quotas"),
        ("leave:apply", "Submit leave requests"),
        ("leave:approve", "Approve or reject employee leave requests"),
        ("leave:manage", "Configure leave policies and balances"),
    ];

    for (name, desc) in permissions {
        if rbac_repo.find_permission_by_name(name).await?.is_none() {
            rbac_repo.create_permission(Uuid::new_v4(), name, Some(desc)).await?;
            tracing::info!("Created permission: {}", name);
        }
    }

    // 2. Seed standard roles
    let admin_role = if let Some(r) = rbac_repo.find_role_by_name("admin").await? {
        r
    } else {
        let r = rbac_repo.create_role(Uuid::new_v4(), "admin", Some("Administrator with full access")).await?;
        tracing::info!("Created role: admin");
        r
    };

    let hr_role = if let Some(r) = rbac_repo.find_role_by_name("hr_manager").await? {
        r
    } else {
        let r = rbac_repo.create_role(Uuid::new_v4(), "hr_manager", Some("HR Manager")).await?;
        tracing::info!("Created role: hr_manager");
        r
    };

    let emp_role = if let Some(r) = rbac_repo.find_role_by_name("employee").await? {
        r
    } else {
        let r = rbac_repo.create_role(Uuid::new_v4(), "employee", Some("Standard employee")).await?;
        tracing::info!("Created role: employee");
        r
    };

    // 3. Assign permissions to roles
    let all_perms = rbac_repo.list_permissions().await?;
    for p in all_perms {
        let _ = rbac_repo.assign_permission_to_role(admin_role.id, p.id).await;
        if p.name.starts_with("employees:") || p.name.starts_with("attendance:") || p.name.starts_with("leave:") {
            let _ = rbac_repo.assign_permission_to_role(hr_role.id, p.id).await;
        }
        if p.name == "attendance:record" || p.name == "attendance:read" || p.name == "leave:read" || p.name == "leave:apply" {
            let _ = rbac_repo.assign_permission_to_role(emp_role.id, p.id).await;
        }
    }

    // 4. Seed default work schedule
    if attendance_repo.get_default_schedule().await?.is_none() {
        let schedule = WorkSchedule {
            id: Uuid::new_v4(),
            name: "Standard Office Hours (09:00 - 18:00 WIB)".to_string(),
            start_time: "09:00:00".to_string(),
            end_time: "18:00:00".to_string(),
            late_tolerance_minutes: 15,
            is_default: true,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };
        attendance_repo.create_schedule(schedule).await?;
        tracing::info!("Seeded default work schedule (09:00 - 18:00 WIB, 15m tolerance)");
    }

    // 5. Seed Indonesian standard leave types
    let standard_leave_types = [
        ("ANNUAL", "Cuti Tahunan", 12, true, false),
        ("SICK", "Cuti Sakit / Rawat Medis", 0, true, true),
        ("MATERNITY", "Cuti Melahirkan", 90, true, true),
        ("MARRIAGE", "Izin Menikah", 3, true, false),
        ("BEREAVEMENT", "Cuti Duka Cita", 2, true, false),
        ("UNPAID", "Cuti di Luar Tanggungan", 0, false, false),
    ];

    let mut annual_type_id = None;
    for (code, name, days, is_paid, req_attach) in standard_leave_types {
        let lt = if let Some(existing) = leave_repo.find_leave_type_by_code(code).await? {
            existing
        } else {
            let now = Utc::now();
            let new_t = leave_repo.create_leave_type(LeaveType {
                id: Uuid::new_v4(),
                code: code.to_string(),
                name: name.to_string(),
                default_days_per_year: days,
                is_paid,
                requires_attachment: req_attach,
                created_at: now,
                updated_at: now,
            }).await?;
            tracing::info!("Seeded leave type: {} ({})", name, code);
            new_t
        };

        if code == "ANNUAL" {
            annual_type_id = Some(lt.id);
        }
    }

    // 6. Seed annual leave balances for all active employees for current year
    let current_year = Utc::now().year();
    if let Some(ann_id) = annual_type_id {
        let (employees, _) = employee_repo.list(1, 1000, None, None, Some(true)).await?;
        for emp in employees {
            if leave_repo.find_balance(emp.id, ann_id, current_year).await?.is_none() {
                let now = Utc::now();
                leave_repo.create_balance(LeaveBalance {
                    id: Uuid::new_v4(),
                    employee_id: emp.id,
                    leave_type_id: ann_id,
                    year: current_year,
                    allocated_days: 12,
                    used_days: 0,
                    pending_days: 0,
                    remaining_days: 12,
                    created_at: now,
                    updated_at: now,
                }).await?;
                tracing::info!("Seeded 12-day annual leave balance for employee: {}", emp.full_name);
            }
        }
    }

    // 7. Seed default super-admin user
    let default_email = "admin@hris.local";
    if user_repo.find_by_email(default_email).await?.is_none() {
        let password_hash = password_service.hash("Admin123!").await.map_err(|e| anyhow::anyhow!(e))?;
        let user = user_repo.create(NewUser {
            id: Uuid::new_v4(),
            email: default_email.to_string(),
            name: "HR Administrator".to_string(),
            password_hash,
            role: "admin".to_string(),
            is_active: true,
        }).await?;

        let _ = rbac_repo.assign_role_to_user(user.id, admin_role.id).await;
        tracing::info!("Successfully bootstrapped admin user: {} (Password: Admin123!)", default_email);
    } else {
        tracing::info!("Admin user {} already exists", default_email);
    }

    tracing::info!("Bootstrap completed successfully.");
    Ok(())
}
