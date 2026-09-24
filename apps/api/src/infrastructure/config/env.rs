use std::env;

#[derive(Debug, Clone)]
pub struct AppConfig {
    pub database_url: String,
    pub redis_url: String,
    pub jwt_secret: String,
    pub host: String,
    pub port: u16,
    pub web_origin: String,
}

impl AppConfig {
    pub fn load() -> Result<Self, String> {
        dotenvy::dotenv().ok();

        let database_url = env::var("DATABASE_URL")
            .map_err(|_| "DATABASE_URL environment variable is required".to_string())?;
        let redis_url = env::var("REDIS_URL")
            .map_err(|_| "REDIS_URL environment variable is required".to_string())?;
        let jwt_secret = env::var("JWT_SECRET")
            .map_err(|_| "JWT_SECRET environment variable is required".to_string())?;
        let host = env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
        let port = env::var("PORT")
            .ok()
            .and_then(|p| p.parse().ok())
            .unwrap_or(10000);
        let web_origin = env::var("WEB_ORIGIN")
            .map_err(|_| "WEB_ORIGIN environment variable is required".to_string())?;

        Ok(Self {
            database_url,
            redis_url,
            jwt_secret,
            host,
            port,
            web_origin,
        })
    }
}
