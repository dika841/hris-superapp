use uuid::Uuid;
use crate::domain::errors::RepositoryError;
use crate::domain::user::{User, UserPatch, UserRepository};

pub struct UpdateUserUseCase<R> {
    user_repository: R,
}

impl<R: UserRepository> UpdateUserUseCase<R> {
    pub fn new(user_repository: R) -> Self {
        Self { user_repository }
    }

    pub async fn execute(&self, id: Uuid, patch: UserPatch) -> Result<User, RepositoryError> {
        self.user_repository.update(id, patch).await
    }
}
