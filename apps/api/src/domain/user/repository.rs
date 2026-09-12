use std::future::Future;
use uuid::Uuid;
use super::entity::{NewUser, User, UserPatch};
use crate::domain::errors::RepositoryError;

pub trait UserRepository: Send + Sync {
    fn find_by_id(&self, id: Uuid)
        -> impl Future<Output = Result<Option<User>, RepositoryError>> + Send;
    fn find_by_email(&self, email: &str)
        -> impl Future<Output = Result<Option<User>, RepositoryError>> + Send;
    fn create(&self, user: NewUser)
        -> impl Future<Output = Result<User, RepositoryError>> + Send;
    fn update(&self, id: Uuid, patch: UserPatch)
        -> impl Future<Output = Result<User, RepositoryError>> + Send;
    fn delete(&self, id: Uuid)
        -> impl Future<Output = Result<(), RepositoryError>> + Send;
    fn list(&self, page: u64, page_size: u64)
        -> impl Future<Output = Result<(Vec<User>, u64), RepositoryError>> + Send;
}
