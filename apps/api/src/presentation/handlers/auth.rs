use axum::{
    extract::{Extension, State},
    http::{header, HeaderMap, HeaderValue, StatusCode},
    Json,
};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use crate::application::auth::ports::TokenService;
use crate::application::auth::use_cases::{LoginCommand, LoginUseCase};
use crate::domain::auth::entity::AuthenticatedUser;
use crate::domain::rbac::RbacRepository;
use crate::domain::user::UserRepository;
use crate::presentation::errors::AppError;
use crate::presentation::state::AppState;

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize, Clone)]
pub struct MeResponse {
    pub id: String,
    pub email: String,
    pub name: String,
    pub role: String,
    pub permissions: Vec<String>,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub access_token: String,
    pub token_type: String,
    pub expires_in: i64,
    pub user: MeResponse,
}

fn create_refresh_cookie(token: &str) -> String {
    format!(
        "hris_refresh_token={}; HttpOnly; Path=/api/auth; SameSite=Lax; Max-Age=604800",
        token
    )
}

fn clear_refresh_cookie() -> String {
    "hris_refresh_token=; HttpOnly; Path=/api/auth; SameSite=Lax; Max-Age=0".to_string()
}

fn extract_refresh_token(headers: &HeaderMap) -> Option<String> {
    headers.get(header::COOKIE)?.to_str().ok().and_then(|cookies| {
        cookies.split(';').find_map(|c| {
            let mut parts = c.trim().splitn(2, '=');
            let name = parts.next()?.trim();
            let value = parts.next()?.trim();
            if name == "hris_refresh_token" {
                Some(value.to_string())
            } else {
                None
            }
        })
    })
}

#[tracing::instrument(skip_all, fields(email = %req.email))]
pub async fn login(
    State(state): State<AppState>,
    Json(req): Json<LoginRequest>,
) -> Result<(StatusCode, HeaderMap, Json<AuthResponse>), AppError> {
    let use_case = LoginUseCase::new(
        state.user_repository.clone(),
        state.password_service.clone(),
        state.token_service.clone(),
    );

    let tokens = use_case
        .execute(LoginCommand {
            email: req.email.clone(),
            password: req.password,
        })
        .await?;

    let user = state
        .user_repository
        .find_by_email(&req.email)
        .await?
        .ok_or_else(|| AppError::NotFound("User not found".into()))?;

    let permissions = state
        .rbac_repository
        .get_user_permissions(user.id)
        .await
        .unwrap_or_default();

    let mut response_headers = HeaderMap::new();
    response_headers.insert(
        header::SET_COOKIE,
        HeaderValue::from_str(&create_refresh_cookie(&tokens.refresh_token))
            .map_err(|e| AppError::Internal(e.to_string()))?,
    );

    Ok((
        StatusCode::OK,
        response_headers,
        Json(AuthResponse {
            access_token: tokens.access_token,
            token_type: tokens.token_type,
            expires_in: tokens.expires_in,
            user: MeResponse {
                id: user.id.to_string(),
                email: user.email,
                name: user.name,
                role: user.role,
                permissions,
            },
        }),
    ))
}

#[tracing::instrument(skip_all)]
pub async fn refresh(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<(StatusCode, HeaderMap, Json<AuthResponse>), AppError> {
    let refresh_token = extract_refresh_token(&headers)
        .ok_or_else(|| AppError::Unauthorized("No active session found (missing refresh token cookie)".into()))?;

    let (user_id, email, role) = state
        .token_service
        .verify_refresh_token(&refresh_token)
        .map_err(|e| AppError::Unauthorized(format!("Session expired or invalid: {}", e)))?;

    let user = state
        .user_repository
        .find_by_id(user_id)
        .await?
        .ok_or_else(|| AppError::Unauthorized("User account not found".into()))?;

    if !user.is_active {
        return Err(AppError::Unauthorized("User account is deactivated".into()));
    }

    // Refresh token rotation: issue a fresh pair
    let new_tokens = state
        .token_service
        .generate_tokens(user.id, &email, &role)
        .await
        .map_err(|e| AppError::Internal(format!("Failed to generate refreshed tokens: {}", e)))?;

    let permissions = state
        .rbac_repository
        .get_user_permissions(user.id)
        .await
        .unwrap_or_default();

    let mut response_headers = HeaderMap::new();
    response_headers.insert(
        header::SET_COOKIE,
        HeaderValue::from_str(&create_refresh_cookie(&new_tokens.refresh_token))
            .map_err(|e| AppError::Internal(e.to_string()))?,
    );

    Ok((
        StatusCode::OK,
        response_headers,
        Json(AuthResponse {
            access_token: new_tokens.access_token,
            token_type: new_tokens.token_type,
            expires_in: new_tokens.expires_in,
            user: MeResponse {
                id: user.id.to_string(),
                email: user.email,
                name: user.name,
                role: user.role,
                permissions,
            },
        }),
    ))
}

#[tracing::instrument(skip_all)]
pub async fn logout() -> Result<(StatusCode, HeaderMap, Json<Value>), AppError> {
    let mut response_headers = HeaderMap::new();
    response_headers.insert(
        header::SET_COOKIE,
        HeaderValue::from_str(&clear_refresh_cookie())
            .map_err(|e| AppError::Internal(e.to_string()))?,
    );

    Ok((
        StatusCode::OK,
        response_headers,
        Json(serde_json::json!({
            "message": "Logged out successfully"
        })),
    ))
}

#[tracing::instrument(skip_all, fields(actor_id = %actor.id))]
pub async fn me(
    State(state): State<AppState>,
    Extension(actor): Extension<AuthenticatedUser>,
) -> Result<(StatusCode, Json<MeResponse>), AppError> {
    let user = state
        .user_repository
        .find_by_id(actor.id)
        .await?
        .ok_or_else(|| AppError::NotFound("User not found".into()))?;

    Ok((
        StatusCode::OK,
        Json(MeResponse {
            id: user.id.to_string(),
            email: user.email,
            name: user.name,
            role: user.role,
            permissions: actor.permissions,
        }),
    ))
}
