use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use crate::domain::auth::AuthError;
use crate::domain::errors::RepositoryError;

#[derive(Debug)]
pub enum AppError {
    BadRequest(String),
    Unauthorized(String),
    Forbidden(String),
    NotFound(String),
    Conflict(String),
    Internal(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            Self::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg),
            Self::Unauthorized(msg) => (StatusCode::UNAUTHORIZED, msg),
            Self::Forbidden(msg) => (StatusCode::FORBIDDEN, msg),
            Self::NotFound(msg) => (StatusCode::NOT_FOUND, msg),
            Self::Conflict(msg) => (StatusCode::CONFLICT, msg),
            Self::Internal(msg) => {
                tracing::error!(error = %msg, "Internal server error encountered");
                (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error occurred".to_string())
            }
        };

        let body = Json(json!({
            "success": false,
            "error": message
        }));

        (status, body).into_response()
    }
}

impl From<AuthError> for AppError {
    fn from(e: AuthError) -> Self {
        match e {
            AuthError::InvalidCredentials => Self::Unauthorized("Invalid email or password".into()),
            AuthError::EmailAlreadyExists => Self::Conflict("Email is already registered".into()),
            AuthError::UserNotFound => Self::NotFound("User not found".into()),
            AuthError::UserInactive => Self::Forbidden("User account is inactive".into()),
            AuthError::PermissionDenied(p) => Self::Forbidden(format!("Permission denied: {}", p)),
            AuthError::InvalidToken(t) => Self::Unauthorized(format!("Invalid token: {}", t)),
            other => Self::Internal(other.to_string()),
        }
    }
}

impl From<RepositoryError> for AppError {
    fn from(e: RepositoryError) -> Self {
        match e {
            RepositoryError::NotFound => Self::NotFound("Resource not found".into()),
            RepositoryError::Conflict(msg) => Self::Conflict(msg),
            RepositoryError::Database(msg) => Self::Internal(msg),
        }
    }
}
