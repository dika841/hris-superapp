mod scheduler;

use std::net::SocketAddr;
use api::{build_router, create_connection, AppConfig, AppState};
use scheduler::GatewayScheduler;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info,api=debug,gateway=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let config = AppConfig::load().map_err(|e| anyhow::anyhow!(e))?;
    tracing::info!("Starting HRIS Backend Gateway on {}:{}", config.host, config.port);

    let db = create_connection(&config.database_url).await?;
    tracing::info!("Database connection established successfully");

    let state = AppState::new(db, &config.jwt_secret);

    // Initialize In-Process Tokio Scheduler
    let mut scheduler = GatewayScheduler::start(state.clone()).await?;

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = build_router(state)
        .layer(cors)
        .layer(TraceLayer::new_for_http());

    let addr: SocketAddr = format!("{}:{}", config.host, config.port).parse()?;
    let listener = tokio::net::TcpListener::bind(addr).await?;
    tracing::info!("HRIS Gateway listening on http://{}", addr);

    // Serve HTTP with graceful shutdown handling for both SIGINT and SIGTERM
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    // Gracefully stop background scheduler
    scheduler.shutdown().await?;
    tracing::info!("HRIS Gateway shutdown complete");

    Ok(())
}

/// Listens for termination signals: SIGINT and Unix SIGTERM.
async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("failed to install SIGTERM handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {
            tracing::info!("Received SIGINT (Ctrl+C), starting graceful shutdown...");
        },
        _ = terminate => {
            tracing::info!("Received SIGTERM, starting graceful shutdown...");
        },
    }
}
