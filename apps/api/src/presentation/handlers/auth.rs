use axum::{
    extract::{Extension, State},
    http::StatusCode,
    Json,
};
use serde::{Deserialize, Serialize};
use crate::application::auth::use_cases::{LoginCommand, LoginUseCase};
use crate::domain::auth::entity::{AuthTokens, AuthenticatedUser};
use crate::domain::user::UserRepository;
use crate::presentation::errors::AppError;
use crate::presentation::state::AppState;

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct MeResponse {
    pub id: String,
    pub email: String,
    pub name: String,
    pub role: String,
    pub permissions: Vec<String>,
}

#[tracing::instrument(skip_all, fields(email = %req.email))]
pub async fn login(
    State(state): State<AppState>,
    Json(req): Json<LoginRequest>,
) -> Result<(StatusCode, Json<AuthTokens>), AppError> {
    let use_case = LoginUseCase::new(
        state.user_repository.clone(),
        state.password_service.clone(),
        state.token_service.clone(),
    );

    let tokens = use_case
        .execute(LoginCommand {
            email: req.email,
            password: req.password,
        })
        .await?;

    Ok((StatusCode::OK, Json(tokens)))
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
