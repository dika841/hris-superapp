use axum::{
    extract::{Extension, Path, Query, State},
    http::StatusCode,
    Json,
};
use chrono::NaiveDate;
use chrono_tz::Asia::Jakarta;
use serde::Deserialize;
use serde_json::json;
use uuid::Uuid;

use crate::application::leave::use_cases::{
    ListLeaveUseCase, ReviewLeaveRequestCommand, ReviewLeaveRequestUseCase,
    SubmitLeaveRequestCommand, SubmitLeaveRequestUseCase,
};
use crate::domain::auth::entity::AuthenticatedUser;
use crate::domain::employee::EmployeeRepository;
use crate::domain::leave::LeaveStatus;
use crate::presentation::errors::AppError;
use crate::presentation::middleware::ensure_permission;
use crate::presentation::state::AppState;

#[derive(Debug, Deserialize)]
pub struct SubmitLeaveRequest {
    pub employee_id: Option<Uuid>,
    pub leave_type_id: Uuid,
    pub start_date: String,
    pub end_date: String,
    pub reason: String,
    pub attachment_url: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ReviewLeaveRequest {
    pub status: String,
    pub approval_notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ListLeaveRequestsQuery {
    pub employee_id: Option<Uuid>,
    pub status: Option<String>,
    pub year: Option<i32>,
    pub page: Option<u64>,
    pub page_size: Option<u64>,
}

#[derive(Debug, Deserialize)]
pub struct ListLeaveBalancesQuery {
    pub employee_id: Option<Uuid>,
    pub year: Option<i32>,
}

async fn resolve_employee_id(
    state: &AppState,
    auth_user: &AuthenticatedUser,
    explicit_id: Option<Uuid>,
) -> Result<Uuid, AppError> {
    if let Some(id) = explicit_id {
        return Ok(id);
    }

    if let Some(emp) = state.employee_repository.find_by_user_id(auth_user.id).await.map_err(AppError::from)? {
        return Ok(emp.id);
    }

    let (employees, _) = state.employee_repository.list(1, 1, None, None, Some(true)).await.map_err(AppError::from)?;
    if let Some(emp) = employees.first() {
        return Ok(emp.id);
    }

    Err(AppError::BadRequest("No active employee profile linked to current user.".into()))
}

pub async fn list_types(
    State(state): State<AppState>,
) -> Result<Json<serde_json::Value>, AppError> {
    let use_case = ListLeaveUseCase::new(state.leave_repository.clone());
    let types = use_case.list_types().await.map_err(AppError::from)?;

    Ok(Json(json!({
        "success": true,
        "data": types
    })))
}

pub async fn list_balances(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthenticatedUser>,
    Query(query): Query<ListLeaveBalancesQuery>,
) -> Result<Json<serde_json::Value>, AppError> {
    let employee_id = resolve_employee_id(&state, &auth_user, query.employee_id).await?;
    let use_case = ListLeaveUseCase::new(state.leave_repository.clone());
    let balances = use_case.list_balances(employee_id, query.year).await.map_err(AppError::from)?;

    Ok(Json(json!({
        "success": true,
        "data": balances
    })))
}

pub async fn submit_request(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthenticatedUser>,
    Json(payload): Json<SubmitLeaveRequest>,
) -> Result<(StatusCode, Json<serde_json::Value>), AppError> {
    let employee_id = resolve_employee_id(&state, &auth_user, payload.employee_id).await?;

    let start_date = NaiveDate::parse_from_str(&payload.start_date, "%Y-%m-%d")
        .map_err(|_| AppError::BadRequest("Invalid start_date format, must be YYYY-MM-DD".into()))?;
    let end_date = NaiveDate::parse_from_str(&payload.end_date, "%Y-%m-%d")
        .map_err(|_| AppError::BadRequest("Invalid end_date format, must be YYYY-MM-DD".into()))?;

    let use_case = SubmitLeaveRequestUseCase::new(
        state.leave_repository.clone(),
        state.employee_repository.clone(),
    );

    let req = use_case.execute(SubmitLeaveRequestCommand {
        employee_id,
        leave_type_id: payload.leave_type_id,
        start_date,
        end_date,
        reason: payload.reason,
        attachment_url: payload.attachment_url,
    }).await.map_err(AppError::from)?;

    Ok((StatusCode::CREATED, Json(json!({
        "success": true,
        "message": "Leave application submitted successfully",
        "data": req
    }))))
}

pub async fn list_requests(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthenticatedUser>,
    Query(query): Query<ListLeaveRequestsQuery>,
) -> Result<Json<serde_json::Value>, AppError> {
    // If user has leave:read/approve, they can view all, otherwise restrict to own employee
    let can_view_all = auth_user.permissions.iter().any(|p| p == "leave:read" || p == "leave:approve" || p == "rbac:manage");
    let employee_id = if can_view_all {
        query.employee_id
    } else {
        Some(resolve_employee_id(&state, &auth_user, None).await?)
    };

    let page = query.page.unwrap_or(1);
    let page_size = query.page_size.unwrap_or(50);

    let use_case = ListLeaveUseCase::new(state.leave_repository.clone());
    let (requests, total) = use_case
        .list_requests(employee_id, query.status.as_deref(), query.year, page, page_size)
        .await
        .map_err(AppError::from)?;

    Ok(Json(json!({
        "success": true,
        "data": requests,
        "total": total,
        "page": page,
        "page_size": page_size
    })))
}

pub async fn review_request(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthenticatedUser>,
    Path(id): Path<Uuid>,
    Json(payload): Json<ReviewLeaveRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    ensure_permission(&auth_user, "leave:approve")?;

    let status = match payload.status.to_lowercase().as_str() {
        "approved" => LeaveStatus::Approved,
        "rejected" => LeaveStatus::Rejected,
        _ => return Err(AppError::BadRequest("Status must be 'approved' or 'rejected'".into())),
    };

    let use_case = ReviewLeaveRequestUseCase::new(
        state.leave_repository.clone(),
        state.attendance_repository.clone(),
    );

    let updated = use_case.execute(ReviewLeaveRequestCommand {
        request_id: id,
        reviewer_id: auth_user.id,
        status,
        approval_notes: payload.approval_notes,
    }).await.map_err(AppError::from)?;

    Ok(Json(json!({
        "success": true,
        "message": format!("Leave request has been {}", updated.status.as_str()),
        "data": updated
    })))
}

pub async fn get_stats(
    State(state): State<AppState>,
) -> Result<Json<serde_json::Value>, AppError> {
    let now_wib = chrono::Utc::now().with_timezone(&Jakarta);
    let today = now_wib.date_naive();

    let use_case = ListLeaveUseCase::new(state.leave_repository.clone());
    let stats = use_case.get_stats(today).await.map_err(AppError::from)?;

    Ok(Json(json!({
        "success": true,
        "data": stats
    })))
}
