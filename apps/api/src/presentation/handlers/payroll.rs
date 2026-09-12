use axum::{
    extract::{Extension, Path, Query, State},
    http::StatusCode,
    Json,
};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use crate::application::payroll::use_cases::{
    CalculatePayrollCommand, CalculatePayrollUseCase, ListPayrollUseCase, MarkPayrollPaidUseCase,
};
use crate::domain::auth::entity::AuthenticatedUser;
use crate::domain::employee::PTKPStatus;
use crate::domain::payroll::{
    calculate_bpjs, get_ter_rate, PayrollRecord, TERCategory,
};
use crate::presentation::errors::AppError;
use crate::presentation::middleware::ensure_permission;
use crate::presentation::state::AppState;

#[derive(Debug, Deserialize)]
pub struct ListPayrollQuery {
    pub month: i32,
    pub year: i32,
}

#[derive(Debug, Deserialize)]
pub struct CalculatePayrollRequest {
    pub employee_id: Uuid,
    pub period_month: i32,
    pub period_year: i32,
    pub overtime_hours: Option<Decimal>,
    pub bonus: Option<Decimal>,
}

#[derive(Debug, Deserialize)]
pub struct PreviewTaxRequest {
    pub gross_salary: Decimal,
    pub ptkp_status: String,
}

#[derive(Debug, Serialize)]
pub struct PreviewTaxResponse {
    pub gross_salary: Decimal,
    pub ptkp_status: String,
    pub ter_category: String,
    pub ter_rate: Decimal,
    pub pph21_monthly: Decimal,
    pub bpjs_jht_employee: Decimal,
    pub bpjs_jp_employee: Decimal,
    pub bpjs_kes_employee: Decimal,
    pub total_deductions: Decimal,
    pub estimated_take_home_pay: Decimal,
}

#[tracing::instrument(skip_all, fields(actor_id = %actor.id))]
pub async fn list_payroll(
    State(state): State<AppState>,
    Extension(actor): Extension<AuthenticatedUser>,
    Query(query): Query<ListPayrollQuery>,
) -> Result<(StatusCode, Json<Vec<PayrollRecord>>), AppError> {
    ensure_permission(&actor, "payroll:read")?;

    let use_case = ListPayrollUseCase::new(state.payroll_repository.clone());
    let records = use_case.execute(query.month, query.year).await?;

    Ok((StatusCode::OK, Json(records)))
}

#[tracing::instrument(skip_all, fields(actor_id = %actor.id, employee_id = %req.employee_id))]
pub async fn calculate_payroll(
    State(state): State<AppState>,
    Extension(actor): Extension<AuthenticatedUser>,
    Json(req): Json<CalculatePayrollRequest>,
) -> Result<(StatusCode, Json<PayrollRecord>), AppError> {
    ensure_permission(&actor, "payroll:calculate")?;

    let use_case = CalculatePayrollUseCase::new(
        state.employee_repository.clone(),
        state.payroll_repository.clone(),
    );

    let record = use_case
        .execute(CalculatePayrollCommand {
            employee_id: req.employee_id,
            period_month: req.period_month,
            period_year: req.period_year,
            overtime_hours: req.overtime_hours.unwrap_or(Decimal::ZERO),
            bonus: req.bonus.unwrap_or(Decimal::ZERO),
        })
        .await?;

    Ok((StatusCode::CREATED, Json(record)))
}

#[tracing::instrument(skip_all, fields(actor_id = %actor.id, payroll_id = %id))]
pub async fn mark_payroll_paid(
    State(state): State<AppState>,
    Extension(actor): Extension<AuthenticatedUser>,
    Path(id): Path<Uuid>,
) -> Result<(StatusCode, Json<PayrollRecord>), AppError> {
    ensure_permission(&actor, "payroll:calculate")?;

    let use_case = MarkPayrollPaidUseCase::new(state.payroll_repository.clone());
    let record = use_case.execute(id).await?;

    Ok((StatusCode::OK, Json(record)))
}

// Public or Authenticated simulator endpoint for PMK 168/2023 TER Tax Simulation
pub async fn preview_tax(
    Json(req): Json<PreviewTaxRequest>,
) -> Result<(StatusCode, Json<PreviewTaxResponse>), AppError> {
    let ptkp = PTKPStatus::from_str(&req.ptkp_status)
        .ok_or_else(|| AppError::BadRequest("Invalid PTKP status".into()))?;

    let ter_cat = TERCategory::from_ptkp(&ptkp);
    let ter_rate = get_ter_rate(ter_cat, req.gross_salary);
    let pph21_monthly = (req.gross_salary * ter_rate).round_dp(0);

    let bpjs = calculate_bpjs(req.gross_salary);
    let total_deductions = pph21_monthly + bpjs.total_employee_deduction;
    let estimated_take_home_pay = req.gross_salary - total_deductions;

    let ter_name = match ter_cat {
        TERCategory::A => "TER A",
        TERCategory::B => "TER B",
        TERCategory::C => "TER C",
    };

    Ok((
        StatusCode::OK,
        Json(PreviewTaxResponse {
            gross_salary: req.gross_salary,
            ptkp_status: ptkp.as_str().to_string(),
            ter_category: ter_name.to_string(),
            ter_rate,
            pph21_monthly,
            bpjs_jht_employee: bpjs.jht_employee,
            bpjs_jp_employee: bpjs.jp_employee,
            bpjs_kes_employee: bpjs.kes_employee,
            total_deductions,
            estimated_take_home_pay,
        }),
    ))
}
