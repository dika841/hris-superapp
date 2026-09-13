use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use crate::application::auth::ports::TokenService;
use crate::domain::auth::entity::AuthTokens;

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    email: String,
    role: String,
    token_type: String,
    exp: usize,
    iat: usize,
}

#[derive(Clone)]
pub struct JwtTokenService {
    secret: Vec<u8>,
}

impl JwtTokenService {
    pub fn new(secret: &str) -> Self {
        Self {
            secret: secret.as_bytes().to_vec(),
        }
    }
}

impl TokenService for JwtTokenService {
    async fn generate_tokens(&self, user_id: Uuid, email: &str, role: &str) -> Result<AuthTokens, String> {
        let now = Utc::now();
        let expires_in_seconds = 900; // 15 minutes for access token
        let access_exp = (now + Duration::seconds(expires_in_seconds as i64)).timestamp() as usize;
        let refresh_exp = (now + Duration::days(7)).timestamp() as usize;

        let access_claims = Claims {
            sub: user_id.to_string(),
            email: email.to_string(),
            role: role.to_string(),
            token_type: "access".to_string(),
            exp: access_exp,
            iat: now.timestamp() as usize,
        };

        let refresh_claims = Claims {
            sub: user_id.to_string(),
            email: email.to_string(),
            role: role.to_string(),
            token_type: "refresh".to_string(),
            exp: refresh_exp,
            iat: now.timestamp() as usize,
        };

        let access_token = encode(
            &Header::default(),
            &access_claims,
            &EncodingKey::from_secret(&self.secret),
        )
        .map_err(|e| e.to_string())?;

        let refresh_token = encode(
            &Header::default(),
            &refresh_claims,
            &EncodingKey::from_secret(&self.secret),
        )
        .map_err(|e| e.to_string())?;

        Ok(AuthTokens {
            access_token,
            refresh_token,
            token_type: "Bearer".to_string(),
            expires_in: expires_in_seconds,
        })
    }

    fn verify_access_token(&self, token: &str) -> Result<(Uuid, String, String), String> {
        let token_data = decode::<Claims>(
            token,
            &DecodingKey::from_secret(&self.secret),
            &Validation::default(),
        )
        .map_err(|e| e.to_string())?;

        if token_data.claims.token_type != "access" {
            return Err("Invalid token type: expected access token".to_string());
        }

        let user_id = Uuid::parse_str(&token_data.claims.sub).map_err(|e| e.to_string())?;
        Ok((user_id, token_data.claims.email, token_data.claims.role))
    }

    fn verify_refresh_token(&self, token: &str) -> Result<(Uuid, String, String), String> {
        let token_data = decode::<Claims>(
            token,
            &DecodingKey::from_secret(&self.secret),
            &Validation::default(),
        )
        .map_err(|e| e.to_string())?;

        if token_data.claims.token_type != "refresh" {
            return Err("Invalid token type: expected refresh token".to_string());
        }

        let user_id = Uuid::parse_str(&token_data.claims.sub).map_err(|e| e.to_string())?;
        Ok((user_id, token_data.claims.email, token_data.claims.role))
    }
}
