use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};
use std::sync::Arc;
use std::time::Duration;
use chrono_tz::Asia::Jakarta;
use tokio_cron_scheduler::{JobBuilder, JobScheduler};

#[tokio::test]
async fn test_scheduler_actually_executes_job() -> anyhow::Result<()> {
    let mut sched = JobScheduler::new().await?;

    let executed = Arc::new(AtomicBool::new(false));
    let execution_count = Arc::new(AtomicUsize::new(0));

    let executed_clone = executed.clone();
    let count_clone = execution_count.clone();

    // Create a cron job that runs every second (*/1 * * * * *) in Asia/Jakarta timezone
    let job = JobBuilder::new()
        .with_timezone(Jakarta)
        .with_cron_job_type()
        .with_schedule("*/1 * * * * *")?
        .with_run_async(Box::new(move |_uuid, _lock| {
            let executed = executed_clone.clone();
            let count = count_clone.clone();
            Box::pin(async move {
                executed.store(true, Ordering::SeqCst);
                count.fetch_add(1, Ordering::SeqCst);
            })
        }))
        .build()?;

    sched.add(job).await?;
    sched.start().await?;

    // Wait up to 3 seconds for the job to actually run
    let start = tokio::time::Instant::now();
    let mut job_ran = false;
    while start.elapsed() < Duration::from_secs(3) {
        if executed.load(Ordering::SeqCst) {
            job_ran = true;
            break;
        }
        tokio::time::sleep(Duration::from_millis(50)).await;
    }

    assert!(job_ran, "Job did not execute within the expected timeframe!");
    assert!(execution_count.load(Ordering::SeqCst) >= 1, "Execution count should be at least 1");

    // Clean shutdown
    sched.shutdown().await?;

    Ok(())
}
