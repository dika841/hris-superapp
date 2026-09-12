use uuid::Uuid;
use crate::application::auth::ports::PasswordService;
use crate::domain::auth::AuthError;
use crate::domain::user::{NewUser, User, UserRepository};

pub struct CreateUserCommand {
    pub email: String,
    pub name: String,
    pub password: String,
    pub role: String,
}

pub struct CreateUserUseCase<P, R> {
    password_service: P,
    user_repository: R,
}

impl<P: PasswordService, R: UserRepository> CreateUserUseCase<P, R> {
    pub fn new(password_service: P, user_repository: R) -> Self {
        Self { password_service, user_repository }
    }

    pub async fn execute(&self, cmd: CreateUserCommand) -> Result<User, AuthError> {
        if self.user_repository.find_by_email(&cmd.email).await?.is_some() {
            return Err(AuthError::EmailAlreadyExists);
        }

        let password_hash = self.password_service
            .hash(&cmd.password)
            .await
            .map_err(AuthError::PasswordHashFailed)?;

        let new_user = NewUser {
            id: Uuid::new_v4(),
            email: cmd.email,
            name: cmd.name,
            password_hash,
            role: cmd.role,
            is_active: true,
        };

        let user = self.user_repository.create(new_user).await?;
        tracing::info!(user_id = %user.id, email = %user.email, "User created successfully");
        Ok(user)
    }
}
