use crate::domain::auth::entity::AuthenticatedUser;
use crate::presentation::errors::AppError;

pub fn ensure_permission(actor: &AuthenticatedUser, required_permission: &str) -> Result<(), AppError> {
    // Admin role bypasses all permission checks
    if actor.role == "admin" || actor.role == "super-admin" {
        return Ok(());
    }

    if actor.permissions.iter().any(|p| p == required_permission) {
        Ok(())
    } else {
        Err(AppError::Forbidden(format!(
            "Access denied: missing permission '{}'",
            required_permission
        )))
    }
}
