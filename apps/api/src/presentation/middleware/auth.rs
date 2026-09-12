use axum::{
    extract::{Request, State},
    http::header::AUTHORIZATION,
    middleware::Next,
    response::Response,
};
use crate::application::auth::ports::TokenService;
use crate::domain::auth::entity::AuthenticatedUser;
use crate::domain::rbac::RbacRepository;
use crate::presentation::errors::AppError;
use crate::presentation::state::AppState;

pub async fn auth_middleware(
    State(state): State<AppState>,
    mut req: Request,
    next: Next,
) -> Result<Response, AppError> {
    let auth_header = req
        .headers()
        .get(AUTHORIZATION)
        .and_then(|h| h.to_str().ok())
        .ok_or_else(|| AppError::Unauthorized("Missing Authorization header".into()))?;

    if !auth_header.starts_with("Bearer ") {
        return Err(AppError::Unauthorized("Invalid Authorization header format".into()));
    }

    let token = &auth_header[7..];
    let (user_id, email, role) = state
        .token_service
        .verify_access_token(token)
        .map_err(|e| AppError::Unauthorized(format!("Invalid token: {}", e)))?;

    // Load user permissions from RBAC repo
    let permissions = state.rbac_repository.get_user_permissions(user_id).await.unwrap_or_default();

    let authenticated_user = AuthenticatedUser {
        id: user_id,
        email,
        name: "".to_string(), // can be supplemented or fetched if needed
        role,
        permissions,
    };

    req.extensions_mut().insert(authenticated_user);
    Ok(next.run(req).await)
}
