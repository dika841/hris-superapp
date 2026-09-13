use std::future::Future;
use uuid::Uuid;
use crate::domain::auth::entity::AuthTokens;

pub trait TokenService: Send + Sync {
    fn generate_tokens(&self, user_id: Uuid, email: &str, role: &str)
        -> impl Future<Output = Result<AuthTokens, String>> + Send;
    fn verify_access_token(&self, token: &str)
        -> Result<(Uuid, String, String), String>; // (id, email, role)
    fn verify_refresh_token(&self, token: &str)
        -> Result<(Uuid, String, String), String>; // (id, email, role)
}
