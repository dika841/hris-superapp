pub mod list;
pub mod review;
pub mod submit;

pub use list::ListLeaveUseCase;
pub use review::{ReviewLeaveRequestCommand, ReviewLeaveRequestUseCase};
pub use submit::{calculate_working_days, SubmitLeaveRequestCommand, SubmitLeaveRequestUseCase};

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::NaiveDate;
    use crate::domain::leave::LeaveStatus;

    #[test]
    fn test_leave_status_serialization() {
        assert_eq!(LeaveStatus::from_str("pending"), LeaveStatus::Pending);
        assert_eq!(LeaveStatus::from_str("approved"), LeaveStatus::Approved);
        assert_eq!(LeaveStatus::from_str("rejected"), LeaveStatus::Rejected);
        assert_eq!(LeaveStatus::from_str("cancelled"), LeaveStatus::Cancelled);
    }

    #[test]
    fn test_working_days_calculation_skips_weekends() {
        // Friday (2026-09-25) to Monday (2026-09-28)
        // Fri (1), Sat (0), Sun (0), Mon (1) -> 2 working days
        let fri = NaiveDate::from_ymd_opt(2026, 9, 25).unwrap();
        let mon = NaiveDate::from_ymd_opt(2026, 9, 28).unwrap();
        let days = calculate_working_days(fri, mon);
        assert_eq!(days, 2);
    }

    #[test]
    fn test_working_days_single_day() {
        // Wednesday (2026-09-23) -> 1 working day
        let wed = NaiveDate::from_ymd_opt(2026, 9, 23).unwrap();
        assert_eq!(calculate_working_days(wed, wed), 1);

        // Saturday (2026-09-26) -> 0 working days
        let sat = NaiveDate::from_ymd_opt(2026, 9, 26).unwrap();
        assert_eq!(calculate_working_days(sat, sat), 0);
    }
}
