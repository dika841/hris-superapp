use axum::{
    middleware,
    routing::{get, patch, post, put},
    Json, Router,
};
use serde_json::json;
use crate::presentation::handlers::{attendance, auth, employee, leave, payroll, user};
use crate::presentation::middleware::auth_middleware;
use crate::presentation::state::AppState;

pub fn build_router(state: AppState) -> Router {
    // Public routes (no Bearer auth required)
    let public_routes = Router::new()
        .route("/healthz", get(|| async { Json(json!({ "status": "ok", "service": "hris-api" })) }))
        .route("/api/auth/login", post(auth::login))
        .route("/api/auth/refresh", post(auth::refresh))
        .route("/api/auth/logout", post(auth::logout))
        .route("/api/payroll/preview-tax", post(payroll::preview_tax));

    // Protected routes (JWT authentication required)
    let protected_routes = Router::new()
        // Auth
        .route("/api/auth/me", get(auth::me))
        // Users
        .route("/api/users", get(user::list_users).post(user::create_user))
        .route("/api/users/{id}", put(user::update_user).delete(user::delete_user))
        // Employees
        .route("/api/employees", get(employee::list_employees).post(employee::create_employee))
        .route("/api/employees/{id}", get(employee::get_employee).put(employee::update_employee))
        // Payroll
        .route("/api/payroll", get(payroll::list_payroll))
        .route("/api/payroll/calculate", post(payroll::calculate_payroll))
        .route("/api/payroll/calculate-batch", post(payroll::calculate_batch_payroll))
        .route("/api/payroll/{id}/pay", patch(payroll::mark_payroll_paid))
        // Attendance
        .route("/api/attendance/today", get(attendance::get_today))
        .route("/api/attendance/clock-in", post(attendance::clock_in))
        .route("/api/attendance/clock-out", post(attendance::clock_out))
        .route("/api/attendance/logs", get(attendance::list_logs))
        .route("/api/attendance/stats", get(attendance::get_stats))
        .route("/api/attendance/nightly-sweep", post(attendance::trigger_nightly_sweep))
        // Leave
        .route("/api/leave/types", get(leave::list_types))
        .route("/api/leave/balances", get(leave::list_balances))
        .route("/api/leave/requests", get(leave::list_requests).post(leave::submit_request))
        .route("/api/leave/requests/{id}/review", patch(leave::review_request))
        .route("/api/leave/stats", get(leave::get_stats))
        // Apply auth middleware
        .route_layer(middleware::from_fn_with_state(state.clone(), auth_middleware));

    Router::new()
        .merge(public_routes)
        .merge(protected_routes)
        .with_state(state)
}
