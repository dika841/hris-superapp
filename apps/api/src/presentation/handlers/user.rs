use axum::{
    extract::{Extension, Path, Query, State},
    http::StatusCode,
    Json,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use crate::application::user::use_cases::{
    CreateUserCommand, CreateUserUseCase, DeleteUserUseCase, ListUsersUseCase, UpdateUserUseCase,
};
use crate::domain::auth::entity::AuthenticatedUser;
use crate::domain::user::{User, UserPatch};
use crate::presentation::errors::AppError;
use crate::presentation::middleware::ensure_permission;
use crate::presentation::state::AppState;

#[derive(Debug, Deserialize)]
pub struct ListUsersQuery {
    pub page: Option<u64>,
    pub page_size: Option<u64>,
}

#[derive(Debug, Deserialize)]
pub struct CreateUserRequest {
    pub email: String,
    pub name: String,
    pub password: String,
    pub role: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateUserRequest {
    pub email: Option<String>,
    pub name: Option<String>,
    pub password: Option<String>,
    pub role: Option<String>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Serialize)]
pub struct PaginatedUsersResponse {
    pub data: Vec<User>,
    pub total: u64,
    pub page: u64,
    pub page_size: u64,
}

#[tracing::instrument(skip_all, fields(actor_id = %actor.id))]
pub async fn list_users(
    State(state): State<AppState>,
    Extension(actor): Extension<AuthenticatedUser>,
    Query(query): Query<ListUsersQuery>,
) -> Result<(StatusCode, Json<PaginatedUsersResponse>), AppError> {
    ensure_permission(&actor, "users:read")?;

    let page = query.page.unwrap_or(1);
    let page_size = query.page_size.unwrap_or(20);

    let use_case = ListUsersUseCase::new(state.user_repository.clone());
    let (data, total) = use_case.execute(page, page_size).await?;

    Ok((
        StatusCode::OK,
        Json(PaginatedUsersResponse {
            data,
            total,
            page,
            page_size,
        }),
    ))
}

#[tracing::instrument(skip_all, fields(actor_id = %actor.id, email = %req.email))]
pub async fn create_user(
    State(state): State<AppState>,
    Extension(actor): Extension<AuthenticatedUser>,
    Json(req): Json<CreateUserRequest>,
) -> Result<(StatusCode, Json<User>), AppError> {
    ensure_permission(&actor, "users:write")?;

    let use_case = CreateUserUseCase::new(
        state.password_service.clone(),
        state.user_repository.clone(),
    );

    let user = use_case
        .execute(CreateUserCommand {
            email: req.email,
            name: req.name,
            password: req.password,
            role: req.role,
        })
        .await?;

    Ok((StatusCode::CREATED, Json(user)))
}

#[tracing::instrument(skip_all, fields(actor_id = %actor.id, target_id = %id))]
pub async fn update_user(
    State(state): State<AppState>,
    Extension(actor): Extension<AuthenticatedUser>,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateUserRequest>,
) -> Result<(StatusCode, Json<User>), AppError> {
    ensure_permission(&actor, "users:write")?;

    let use_case = UpdateUserUseCase::new(state.user_repository.clone());
    let patch = UserPatch {
        email: req.email,
        name: req.name,
        password_hash: None, // password update can be done via separate command if needed
        role: req.role,
        is_active: req.is_active,
    };

    let user = use_case.execute(id, patch).await?;
    Ok((StatusCode::OK, Json(user)))
}

#[tracing::instrument(skip_all, fields(actor_id = %actor.id, target_id = %id))]
pub async fn delete_user(
    State(state): State<AppState>,
    Extension(actor): Extension<AuthenticatedUser>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, AppError> {
    ensure_permission(&actor, "users:write")?;

    let use_case = DeleteUserUseCase::new(state.user_repository.clone());
    use_case.execute(id).await?;
    Ok(StatusCode::NO_CONTENT)
}
