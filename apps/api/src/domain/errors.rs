use std::fmt;

#[derive(Debug, Clone)]
pub enum RepositoryError {
    NotFound,
    Conflict(String),
    Database(String),
}

impl fmt::Display for RepositoryError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::NotFound => write!(f, "Record not found"),
            Self::Conflict(msg) => write!(f, "Conflict error: {}", msg),
            Self::Database(msg) => write!(f, "Database error: {}", msg),
        }
    }
}

impl std::error::Error for RepositoryError {}
