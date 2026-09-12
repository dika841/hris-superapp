use api::{
    create_connection,
    domain::{
        rbac::RbacRepository,
        user::{NewUser, UserRepository},
    },
    infrastructure::{
        auth::Argon2PasswordService,
        config::AppConfig,
        repository::{SeaOrmRbacRepository, SeaOrmUserRepository},
    },
    application::auth::ports::PasswordService,
};
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

    let _emp_role = if let Some(r) = rbac_repo.find_role_by_name("employee").await? {
        r
    } else {
        let r = rbac_repo.create_role(Uuid::new_v4(), "employee", Some("Standard employee")).await?;
        tracing::info!("Created role: employee");
        r
    };

    // 3. Assign all permissions to admin role
    let all_perms = rbac_repo.list_permissions().await?;
    for p in all_perms {
        let _ = rbac_repo.assign_permission_to_role(admin_role.id, p.id).await;
    }

    // 4. Seed default super-admin user
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
