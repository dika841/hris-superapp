use crate::application::auth::ports::{PasswordService, TokenService};
use crate::domain::auth::{AuthError, AuthTokens};
use crate::domain::user::UserRepository;

pub struct LoginCommand {
    pub email: String,
    pub password: String,
}

pub struct LoginUseCase<U, P, T> {
    user_repo: U,
    password_service: P,
    token_service: T,
}

impl<U: UserRepository, P: PasswordService, T: TokenService> LoginUseCase<U, P, T> {
    pub fn new(user_repo: U, password_service: P, token_service: T) -> Self {
        Self { user_repo, password_service, token_service }
    }

    pub async fn execute(&self, cmd: LoginCommand) -> Result<AuthTokens, AuthError> {
        let user = self.user_repo
            .find_by_email(&cmd.email)
            .await?
            .ok_or(AuthError::InvalidCredentials)?;

        if !user.is_active {
            return Err(AuthError::UserInactive);
        }

        let is_valid = self.password_service
            .verify(&cmd.password, &user.password_hash)
            .await
            .map_err(AuthError::PasswordVerificationFailed)?;

        if !is_valid {
            return Err(AuthError::InvalidCredentials);
        }

        let tokens = self.token_service
            .generate_tokens(user.id, &user.email, &user.role)
            .await
            .map_err(AuthError::TokenGenerationFailed)?;

        Ok(tokens)
    }
}
