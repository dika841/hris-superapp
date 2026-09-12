use std::future::Future;
use uuid::Uuid;
use super::entity::{Permission, Role};
use crate::domain::errors::RepositoryError;

pub trait RbacRepository: Send + Sync {
    fn find_role_by_name(&self, name: &str)
        -> impl Future<Output = Result<Option<Role>, RepositoryError>> + Send;
    fn create_role(&self, id: Uuid, name: &str, description: Option<&str>)
        -> impl Future<Output = Result<Role, RepositoryError>> + Send;
    fn find_permission_by_name(&self, name: &str)
        -> impl Future<Output = Result<Option<Permission>, RepositoryError>> + Send;
    fn create_permission(&self, id: Uuid, name: &str, description: Option<&str>)
        -> impl Future<Output = Result<Permission, RepositoryError>> + Send;
    fn assign_role_to_user(&self, user_id: Uuid, role_id: Uuid)
        -> impl Future<Output = Result<(), RepositoryError>> + Send;
    fn assign_permission_to_role(&self, role_id: Uuid, permission_id: Uuid)
        -> impl Future<Output = Result<(), RepositoryError>> + Send;
    fn get_user_permissions(&self, user_id: Uuid)
        -> impl Future<Output = Result<Vec<String>, RepositoryError>> + Send;
    fn list_roles(&self)
        -> impl Future<Output = Result<Vec<Role>, RepositoryError>> + Send;
    fn list_permissions(&self)
        -> impl Future<Output = Result<Vec<Permission>, RepositoryError>> + Send;
}
