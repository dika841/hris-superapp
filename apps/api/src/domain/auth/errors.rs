use std::fmt;
use crate::domain::errors::RepositoryError;

#[derive(Debug, Clone)]
pub enum AuthError {
    InvalidCredentials,
    EmailAlreadyExists,
    UserNotFound,
    UserInactive,
    PasswordHashFailed(String),
    PasswordVerificationFailed(String),
    TokenGenerationFailed(String),
    InvalidToken(String),
    PermissionDenied(String),
    RepositoryError(String),
}

impl fmt::Display for AuthError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::InvalidCredentials => write!(f, "Invalid email or password"),
            Self::EmailAlreadyExists => write!(f, "Email is already registered"),
            Self::UserNotFound => write!(f, "User not found"),
            Self::UserInactive => write!(f, "Account is inactive, please contact administrator"),
            Self::PasswordHashFailed(e) => write!(f, "Password hashing failed: {}", e),
            Self::PasswordVerificationFailed(e) => write!(f, "Password verification failed: {}", e),
            Self::TokenGenerationFailed(e) => write!(f, "Token generation failed: {}", e),
            Self::InvalidToken(e) => write!(f, "Invalid or expired token: {}", e),
            Self::PermissionDenied(p) => write!(f, "Permission denied: required '{}'", p),
            Self::RepositoryError(e) => write!(f, "Repository error: {}", e),
        }
    }
}

impl std::error::Error for AuthError {}

impl From<RepositoryError> for AuthError {
    fn from(e: RepositoryError) -> Self {
        Self::RepositoryError(e.to_string())
    }
}
