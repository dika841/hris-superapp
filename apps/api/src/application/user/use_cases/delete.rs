use uuid::Uuid;
use crate::domain::errors::RepositoryError;
use crate::domain::user::UserRepository;

pub struct DeleteUserUseCase<R> {
    user_repository: R,
}

impl<R: UserRepository> DeleteUserUseCase<R> {
    pub fn new(user_repository: R) -> Self {
        Self { user_repository }
    }

    pub async fn execute(&self, id: Uuid) -> Result<(), RepositoryError> {
        self.user_repository.delete(id).await
    }
}
