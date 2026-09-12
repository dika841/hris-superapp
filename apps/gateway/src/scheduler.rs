use anyhow::Context;
use api::AppState;
use chrono_tz::Asia::Jakarta;
use tokio_cron_scheduler::{JobBuilder, JobScheduler};

pub struct GatewayScheduler {
    pub scheduler: JobScheduler,
}

impl GatewayScheduler {
    pub async fn start(state: AppState) -> anyhow::Result<Self> {
        let sched = JobScheduler::new().await.context("Failed to initialize JobScheduler")?;

        // 1. Heartbeat & DB Pool Health: Every 10 minutes in Asia/Jakarta (0 */10 * * * *)
        let state_hb = state.clone();
        let heartbeat_job = JobBuilder::new()
            .with_timezone(Jakarta)
            .with_cron_job_type()
            .with_schedule("0 */10 * * * *")
            .context("Invalid schedule for heartbeat job")?
            .with_run_async(Box::new(move |_uuid, _lock| {
                let state = state_hb.clone();
                Box::pin(async move {
                    if let Err(e) = state.scheduler_tasks.execute_heartbeat().await {
                        tracing::error!(error = %e, "Scheduler heartbeat job error");
                    }
                })
            }))
            .build()
            .context("Failed to build heartbeat job")?;
        sched.add(heartbeat_job).await.context("Failed to add heartbeat job")?;

        // 2. Nightly Attendance Sweep: 00:00 WIB daily (0 0 0 * * *)
        let state_att = state.clone();
        let attendance_job = JobBuilder::new()
            .with_timezone(Jakarta)
            .with_cron_job_type()
            .with_schedule("0 0 0 * * *")
            .context("Invalid schedule for attendance sweep job")?
            .with_run_async(Box::new(move |_uuid, _lock| {
                let state = state_att.clone();
                Box::pin(async move {
                    if let Err(e) = state.scheduler_tasks.execute_nightly_attendance().await {
                        tracing::error!(error = %e, "Scheduler nightly attendance job error");
                    }
                })
            }))
            .build()
            .context("Failed to build attendance sweep job")?;
        sched.add(attendance_job).await.context("Failed to add attendance sweep job")?;

        // 3. Monthly Payroll Cutoff Monitor: 06:00 WIB daily (0 0 6 * * *)
        let state_pay = state.clone();
        let cutoff_job = JobBuilder::new()
            .with_timezone(Jakarta)
            .with_cron_job_type()
            .with_schedule("0 0 6 * * *")
            .context("Invalid schedule for payroll cutoff monitor job")?
            .with_run_async(Box::new(move |_uuid, _lock| {
                let state = state_pay.clone();
                Box::pin(async move {
                    if let Err(e) = state.scheduler_tasks.execute_payroll_cutoff_check().await {
                        tracing::error!(error = %e, "Scheduler payroll cutoff monitor job error");
                    }
                })
            }))
            .build()
            .context("Failed to build payroll cutoff monitor job")?;
        sched.add(cutoff_job).await.context("Failed to add payroll cutoff job")?;

        sched.start().await.context("Failed to start JobScheduler")?;
        tracing::info!("In-process Tokio Scheduler started successfully with 3 cron jobs in Asia/Jakarta timezone");

        Ok(Self { scheduler: sched })
    }

    pub async fn shutdown(&mut self) -> anyhow::Result<()> {
        tracing::info!("Shutting down In-process Tokio Scheduler...");
        self.scheduler.shutdown().await.context("Failed to shutdown JobScheduler")?;
        tracing::info!("In-process Tokio Scheduler stopped cleanly");
        Ok(())
    }
}
