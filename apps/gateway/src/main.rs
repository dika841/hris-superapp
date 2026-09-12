use std::net::SocketAddr;
use api::{build_router, create_connection, AppConfig, AppState};
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
    tracing::info!("Starting Kana HRIS Backend Gateway on {}:{}", config.host, config.port);

    let db = create_connection(&config.database_url).await?;
    tracing::info!("Database connection established successfully");

    let state = AppState::new(db, &config.jwt_secret);

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

    axum::serve(listener, app).await?;
    Ok(())
}
