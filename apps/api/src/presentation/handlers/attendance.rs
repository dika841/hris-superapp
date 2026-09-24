use axum::{
    extract::{Extension, Query, State},
    http::{HeaderMap, StatusCode},
    Json,
};
use chrono::NaiveDate;
use chrono_tz::Asia::Jakarta;
use rust_decimal::Decimal;
use serde::Deserialize;
use serde_json::json;
use uuid::Uuid;

use crate::application::attendance::use_cases::{
    ClockInCommand, ClockInUseCase, ClockOutCommand, ClockOutUseCase, ListAttendanceUseCase,
    TodayAttendanceUseCase,
};
use crate::domain::auth::entity::AuthenticatedUser;
use crate::domain::employee::EmployeeRepository;
use crate::presentation::errors::AppError;
use crate::presentation::middleware::ensure_permission;
use crate::presentation::state::AppState;

#[derive(Debug, Deserialize)]
pub struct ClockInRequest {
    pub employee_id: Option<Uuid>,
    pub latitude: Option<Decimal>,
    pub longitude: Option<Decimal>,
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ClockOutRequest {
    pub employee_id: Option<Uuid>,
    pub latitude: Option<Decimal>,
    pub longitude: Option<Decimal>,
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ListAttendanceQuery {
    pub date: Option<String>,
    pub employee_id: Option<Uuid>,
    pub status: Option<String>,
    pub page: Option<u64>,
    pub page_size: Option<u64>,
}

#[derive(Debug, Deserialize)]
pub struct TodayAttendanceQuery {
    pub employee_id: Option<Uuid>,
}

#[derive(Debug, Deserialize)]
pub struct AttendanceStatsQuery {
    pub date: Option<String>,
}

fn extract_client_ip(headers: &HeaderMap) -> Option<String> {
    headers
        .get("x-forwarded-for")
        .or_else(|| headers.get("x-real-ip"))
        .and_then(|h| h.to_str().ok())
        .map(|s| s.split(',').next().unwrap_or(s).trim().to_string())
}

async fn resolve_employee_id(
    state: &AppState,
    auth_user: &AuthenticatedUser,
    explicit_id: Option<Uuid>,
) -> Result<Uuid, AppError> {
    if let Some(id) = explicit_id {
        return Ok(id);
    }

    // Try finding employee matching authenticated user ID
    if let Some(emp) = state.employee_repository.find_by_user_id(auth_user.id).await.map_err(AppError::from)? {
        return Ok(emp.id);
    }

    // Fallback: pick first active employee in system for demo/admin ease
    let (employees, _) = state.employee_repository.list(1, 1, None, None, Some(true)).await.map_err(AppError::from)?;
    if let Some(emp) = employees.first() {
        return Ok(emp.id);
    }

    Err(AppError::BadRequest("No active employee found for current user. Please create an employee profile first.".into()))
}

pub async fn clock_in(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthenticatedUser>,
    headers: HeaderMap,
    Json(payload): Json<ClockInRequest>,
) -> Result<(StatusCode, Json<serde_json::Value>), AppError> {
    let employee_id = resolve_employee_id(&state, &auth_user, payload.employee_id).await?;
    let ip = extract_client_ip(&headers);

    let use_case = ClockInUseCase::new(
        state.attendance_repository.clone(),
        state.employee_repository.clone(),
    );

    let log = use_case.execute(ClockInCommand {
        employee_id,
        ip,
        latitude: payload.latitude,
        longitude: payload.longitude,
        notes: payload.notes,
    }).await.map_err(AppError::from)?;

    Ok((StatusCode::CREATED, Json(json!({
        "success": true,
        "message": "Clock-in recorded successfully",
        "data": log
    }))))
}

pub async fn clock_out(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthenticatedUser>,
    headers: HeaderMap,
    Json(payload): Json<ClockOutRequest>,
) -> Result<(StatusCode, Json<serde_json::Value>), AppError> {
    let employee_id = resolve_employee_id(&state, &auth_user, payload.employee_id).await?;
    let ip = extract_client_ip(&headers);

    let use_case = ClockOutUseCase::new(state.attendance_repository.clone());

    let log = use_case.execute(ClockOutCommand {
        employee_id,
        ip,
        latitude: payload.latitude,
        longitude: payload.longitude,
        notes: payload.notes,
    }).await.map_err(AppError::from)?;

    Ok((StatusCode::OK, Json(json!({
        "success": true,
        "message": "Clock-out recorded successfully",
        "data": log
    }))))
}

pub async fn get_today(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthenticatedUser>,
    Query(query): Query<TodayAttendanceQuery>,
) -> Result<Json<serde_json::Value>, AppError> {
    let employee_id = resolve_employee_id(&state, &auth_user, query.employee_id).await?;
    let use_case = TodayAttendanceUseCase::new(state.attendance_repository.clone());
    let res = use_case.execute(employee_id).await.map_err(AppError::from)?;

    Ok(Json(json!({
        "success": true,
        "data": res
    })))
}

pub async fn list_logs(
    State(state): State<AppState>,
    Query(query): Query<ListAttendanceQuery>,
) -> Result<Json<serde_json::Value>, AppError> {
    let date = query.date.and_then(|d| NaiveDate::parse_from_str(&d, "%Y-%m-%d").ok());
    let page = query.page.unwrap_or(1);
    let page_size = query.page_size.unwrap_or(50);

    let use_case = ListAttendanceUseCase::new(state.attendance_repository.clone());
    let (logs, total) = use_case
        .execute(date, query.employee_id, query.status.as_deref(), page, page_size)
        .await
        .map_err(AppError::from)?;

    Ok(Json(json!({
        "success": true,
        "data": logs,
        "total": total,
        "page": page,
        "page_size": page_size
    })))
}

pub async fn get_stats(
    State(state): State<AppState>,
    Query(query): Query<AttendanceStatsQuery>,
) -> Result<Json<serde_json::Value>, AppError> {
    let now_wib = chrono::Utc::now().with_timezone(&Jakarta);
    let date = query
        .date
        .and_then(|d| NaiveDate::parse_from_str(&d, "%Y-%m-%d").ok())
        .unwrap_or_else(|| now_wib.date_naive());

    let use_case = ListAttendanceUseCase::new(state.attendance_repository.clone());
    let stats = use_case.get_stats(date).await.map_err(AppError::from)?;

    Ok(Json(json!({
        "success": true,
        "data": stats
    })))
}

pub async fn trigger_nightly_sweep(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthenticatedUser>,
) -> Result<Json<serde_json::Value>, AppError> {
    ensure_permission(&auth_user, "attendance:manage")?;
    let res = state.scheduler_tasks.execute_nightly_attendance().await.map_err(AppError::from)?;

    Ok(Json(json!({
        "success": true,
        "data": res
    })))
}
