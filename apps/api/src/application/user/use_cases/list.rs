use crate::domain::errors::RepositoryError;
use crate::domain::user::{User, UserRepository};

pub struct ListUsersUseCase<R> {
    user_repository: R,
}

impl<R: UserRepository> ListUsersUseCase<R> {
    pub fn new(user_repository: R) -> Self {
        Self { user_repository }
    }

    pub async fn execute(&self, page: u64, page_size: u64) -> Result<(Vec<User>, u64), RepositoryError> {
        self.user_repository.list(page, page_size).await
    }
}
