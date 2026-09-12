use sea_orm::DatabaseConnection;
use crate::infrastructure::auth::{Argon2PasswordService, JwtTokenService};
use crate::infrastructure::repository::{
    SeaOrmEmployeeRepository, SeaOrmPayrollRepository, SeaOrmRbacRepository, SeaOrmUserRepository,
};

#[derive(Clone)]
pub struct AppState {
    pub db: DatabaseConnection,
    pub password_service: Argon2PasswordService,
    pub token_service: JwtTokenService,
    pub user_repository: SeaOrmUserRepository,
    pub employee_repository: SeaOrmEmployeeRepository,
    pub payroll_repository: SeaOrmPayrollRepository,
    pub rbac_repository: SeaOrmRbacRepository,
}

impl AppState {
    pub fn new(
        db: DatabaseConnection,
        jwt_secret: &str,
    ) -> Self {
        let password_service = Argon2PasswordService::new();
        let token_service = JwtTokenService::new(jwt_secret);
        let user_repository = SeaOrmUserRepository::new(db.clone());
        let employee_repository = SeaOrmEmployeeRepository::new(db.clone());
        let payroll_repository = SeaOrmPayrollRepository::new(db.clone());
        let rbac_repository = SeaOrmRbacRepository::new(db.clone());

        Self {
            db,
            password_service,
            token_service,
            user_repository,
            employee_repository,
            payroll_repository,
            rbac_repository,
        }
    }
}
