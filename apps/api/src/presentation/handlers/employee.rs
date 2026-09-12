use axum::{
    extract::{Extension, Path, Query, State},
    http::StatusCode,
    Json,
};
use chrono::NaiveDate;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use crate::application::employee::use_cases::{
    CreateEmployeeCommand, CreateEmployeeUseCase, EmployeeDetailUseCase, ListEmployeesUseCase,
    UpdateEmployeeUseCase,
};
use crate::domain::auth::entity::AuthenticatedUser;
use crate::domain::employee::{Employee, EmployeePatch, EmploymentStatus, PTKPStatus};
use crate::presentation::errors::AppError;
use crate::presentation::middleware::ensure_permission;
use crate::presentation::state::AppState;

#[derive(Debug, Deserialize)]
pub struct ListEmployeesQuery {
    pub page: Option<u64>,
    pub page_size: Option<u64>,
    pub department: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateEmployeeRequest {
    pub user_id: Option<Uuid>,
    pub employee_code: String,
    pub full_name: String,
    pub national_id: String,
    pub npwp: Option<String>,
    pub department: String,
    pub position: String,
    pub employment_status: String,
    pub join_date: String,
    pub basic_salary: Decimal,
    pub allowance_fixed: Decimal,
    pub ptkp_status: String,
    pub bank_name: Option<String>,
    pub bank_account: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateEmployeeRequest {
    pub full_name: Option<String>,
    pub npwp: Option<String>,
    pub department: Option<String>,
    pub position: Option<String>,
    pub employment_status: Option<String>,
    pub basic_salary: Option<Decimal>,
    pub allowance_fixed: Option<Decimal>,
    pub ptkp_status: Option<String>,
    pub bank_name: Option<String>,
    pub bank_account: Option<String>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Serialize)]
pub struct PaginatedEmployeesResponse {
    pub data: Vec<Employee>,
    pub total: u64,
    pub page: u64,
    pub page_size: u64,
}

#[tracing::instrument(skip_all, fields(actor_id = %actor.id))]
pub async fn list_employees(
    State(state): State<AppState>,
    Extension(actor): Extension<AuthenticatedUser>,
    Query(query): Query<ListEmployeesQuery>,
) -> Result<(StatusCode, Json<PaginatedEmployeesResponse>), AppError> {
    ensure_permission(&actor, "employees:read")?;

    let page = query.page.unwrap_or(1);
    let page_size = query.page_size.unwrap_or(20);

    let use_case = ListEmployeesUseCase::new(state.employee_repository.clone());
    let (data, total) = use_case
        .execute(page, page_size, query.department.as_deref())
        .await?;

    Ok((
        StatusCode::OK,
        Json(PaginatedEmployeesResponse {
            data,
            total,
            page,
            page_size,
        }),
    ))
}

#[tracing::instrument(skip_all, fields(actor_id = %actor.id, employee_id = %id))]
pub async fn get_employee(
    State(state): State<AppState>,
    Extension(actor): Extension<AuthenticatedUser>,
    Path(id): Path<Uuid>,
) -> Result<(StatusCode, Json<Employee>), AppError> {
    ensure_permission(&actor, "employees:read")?;

    let use_case = EmployeeDetailUseCase::new(state.employee_repository.clone());
    let employee = use_case
        .execute(id)
        .await?
        .ok_or_else(|| AppError::NotFound("Employee not found".into()))?;

    Ok((StatusCode::OK, Json(employee)))
}

#[tracing::instrument(skip_all, fields(actor_id = %actor.id, code = %req.employee_code))]
pub async fn create_employee(
    State(state): State<AppState>,
    Extension(actor): Extension<AuthenticatedUser>,
    Json(req): Json<CreateEmployeeRequest>,
) -> Result<(StatusCode, Json<Employee>), AppError> {
    ensure_permission(&actor, "employees:write")?;

    let join_date = NaiveDate::parse_from_str(&req.join_date, "%Y-%m-%d")
        .map_err(|e| AppError::BadRequest(format!("Invalid join_date format (YYYY-MM-DD): {}", e)))?;

    let ptkp_status = PTKPStatus::from_str(&req.ptkp_status)
        .ok_or_else(|| AppError::BadRequest("Invalid ptkp_status (e.g. TK/0, K/1)".into()))?;

    let employment_status = EmploymentStatus::from_str(&req.employment_status)
        .ok_or_else(|| AppError::BadRequest("Invalid employment_status (permanent, contract, probation, intern)".into()))?;

    let use_case = CreateEmployeeUseCase::new(state.employee_repository.clone());
    let employee = use_case
        .execute(CreateEmployeeCommand {
            user_id: req.user_id,
            employee_code: req.employee_code,
            full_name: req.full_name,
            national_id: req.national_id,
            npwp: req.npwp,
            department: req.department,
            position: req.position,
            employment_status,
            join_date,
            basic_salary: req.basic_salary,
            allowance_fixed: req.allowance_fixed,
            ptkp_status,
            bank_name: req.bank_name,
            bank_account: req.bank_account,
        })
        .await?;

    Ok((StatusCode::CREATED, Json(employee)))
}

#[tracing::instrument(skip_all, fields(actor_id = %actor.id, employee_id = %id))]
pub async fn update_employee(
    State(state): State<AppState>,
    Extension(actor): Extension<AuthenticatedUser>,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateEmployeeRequest>,
) -> Result<(StatusCode, Json<Employee>), AppError> {
    ensure_permission(&actor, "employees:write")?;

    let ptkp_status = match req.ptkp_status.as_deref() {
        Some(s) => Some(
            PTKPStatus::from_str(s)
                .ok_or_else(|| AppError::BadRequest("Invalid ptkp_status".into()))?,
        ),
        None => None,
    };

    let employment_status = match req.employment_status.as_deref() {
        Some(s) => Some(
            EmploymentStatus::from_str(s)
                .ok_or_else(|| AppError::BadRequest("Invalid employment_status".into()))?,
        ),
        None => None,
    };

    let patch = EmployeePatch {
        full_name: req.full_name,
        npwp: req.npwp,
        department: req.department,
        position: req.position,
        employment_status,
        basic_salary: req.basic_salary,
        allowance_fixed: req.allowance_fixed,
        ptkp_status,
        bank_name: req.bank_name,
        bank_account: req.bank_account,
        is_active: req.is_active,
    };

    let use_case = UpdateEmployeeUseCase::new(state.employee_repository.clone());
    let employee = use_case.execute(id, patch).await?;

    Ok((StatusCode::OK, Json(employee)))
}
