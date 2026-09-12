pub mod application;
pub mod domain;
pub mod infrastructure;
pub mod presentation;

pub use infrastructure::config::AppConfig;
pub use infrastructure::database::create_connection;
pub use presentation::{build_router, AppState};
