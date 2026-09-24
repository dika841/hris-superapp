pub mod clock_in;
pub mod clock_out;
pub mod list;
pub mod today;

pub use clock_in::{ClockInCommand, ClockInUseCase};
pub use clock_out::{ClockOutCommand, ClockOutUseCase};
pub use list::ListAttendanceUseCase;
pub use today::{TodayAttendanceResponse, TodayAttendanceUseCase};

#[cfg(test)]
mod tests {
    use chrono::{NaiveTime, Timelike};
    use crate::domain::attendance::entity::AttendanceStatus;

    #[test]
    fn test_attendance_status_parsing() {
        assert_eq!(AttendanceStatus::from_str("present"), AttendanceStatus::Present);
        assert_eq!(AttendanceStatus::from_str("late"), AttendanceStatus::Late);
        assert_eq!(AttendanceStatus::from_str("early_departure"), AttendanceStatus::EarlyDeparture);
        assert_eq!(AttendanceStatus::from_str("absent"), AttendanceStatus::Absent);
        assert_eq!(AttendanceStatus::from_str("leave"), AttendanceStatus::Leave);
    }

    #[test]
    fn test_schedule_late_calculation() {
        let schedule_start = NaiveTime::from_hms_opt(9, 0, 0).unwrap();
        let late_tolerance = 15; // 15 minutes

        // 09:10 -> On time (within tolerance)
        let checkin_on_time = NaiveTime::from_hms_opt(9, 10, 0).unwrap();
        let diff_mins_on_time = (checkin_on_time.hour() * 60 + checkin_on_time.minute())
            .saturating_sub(schedule_start.hour() * 60 + schedule_start.minute());
        assert!(diff_mins_on_time <= late_tolerance);

        // 09:25 -> Late by 25 mins
        let checkin_late = NaiveTime::from_hms_opt(9, 25, 0).unwrap();
        let diff_mins_late = (checkin_late.hour() * 60 + checkin_late.minute())
            .saturating_sub(schedule_start.hour() * 60 + schedule_start.minute());
        assert!(diff_mins_late > late_tolerance);
        assert_eq!(diff_mins_late, 25);
    }

    #[test]
    fn test_overtime_calculation() {
        let schedule_end = NaiveTime::from_hms_opt(18, 0, 0).unwrap();
        let schedule_end_mins = schedule_end.hour() * 60 + schedule_end.minute();

        // Check out at 19:45 -> 1 hour 45 minutes (105 mins) overtime
        let checkout_ot = NaiveTime::from_hms_opt(19, 45, 0).unwrap();
        let checkout_mins = checkout_ot.hour() * 60 + checkout_ot.minute();
        let ot_mins = checkout_mins.saturating_sub(schedule_end_mins);
        assert_eq!(ot_mins, 105);
    }
}
