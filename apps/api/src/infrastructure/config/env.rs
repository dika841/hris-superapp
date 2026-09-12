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
            .unwrap_or_else(|_| "postgres://postgres:password@localhost:5432/hris_db".to_string());
        let redis_url = env::var("REDIS_URL")
            .unwrap_or_else(|_| "redis://127.0.0.1:6379".to_string());
        let jwt_secret = env::var("JWT_SECRET")
            .unwrap_or_else(|_| "super_secret_hris_jwt_key_32_bytes_long_min!!".to_string());
        let host = env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
        let port = env::var("PORT")
            .ok()
            .and_then(|p| p.parse().ok())
            .unwrap_or(8080);
        let web_origin = env::var("WEB_ORIGIN")
            .unwrap_or_else(|_| "http://localhost:3000".to_string());

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
