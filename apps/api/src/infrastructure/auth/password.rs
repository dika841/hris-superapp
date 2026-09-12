use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use crate::application::auth::ports::PasswordService;

#[derive(Clone, Default)]
pub struct Argon2PasswordService;

impl Argon2PasswordService {
    pub fn new() -> Self {
        Self
    }
}

impl PasswordService for Argon2PasswordService {
    async fn hash(&self, password: &str) -> Result<String, String> {
        let password = password.to_string();
        tokio::task::spawn_blocking(move || {
            let salt = SaltString::generate(&mut OsRng);
            let argon2 = Argon2::default();
            argon2
                .hash_password(password.as_bytes(), &salt)
                .map(|h| h.to_string())
                .map_err(|e| e.to_string())
        })
        .await
        .map_err(|e| e.to_string())?
    }

    async fn verify(&self, password: &str, hash: &str) -> Result<bool, String> {
        let password = password.to_string();
        let hash = hash.to_string();
        tokio::task::spawn_blocking(move || {
            let parsed_hash = PasswordHash::new(&hash).map_err(|e| e.to_string())?;
            Ok(Argon2::default()
                .verify_password(password.as_bytes(), &parsed_hash)
                .is_ok())
        })
        .await
        .map_err(|e| e.to_string())?
    }
}
