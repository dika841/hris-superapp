use chrono::Utc;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, DbErr, EntityTrait, QueryFilter, Set,
};
use uuid::Uuid;
use super::entities::{
    permission as permission_entity, role as role_entity, role_permission as rp_entity,
    user_role as ur_entity,
};
use crate::domain::errors::RepositoryError;
use crate::domain::rbac::{Permission, RbacRepository, Role};

#[derive(Clone)]
pub struct SeaOrmRbacRepository {
    db: DatabaseConnection,
}

impl SeaOrmRbacRepository {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}

fn map_db_err(e: DbErr) -> RepositoryError {
    match e {
        DbErr::RecordNotFound(_) => RepositoryError::NotFound,
        other => RepositoryError::Database(other.to_string()),
    }
}

impl RbacRepository for SeaOrmRbacRepository {
    async fn find_role_by_name(&self, name: &str) -> Result<Option<Role>, RepositoryError> {
        let m = role_entity::Entity::find()
            .filter(role_entity::Column::Name.eq(name))
            .one(&self.db)
            .await
            .map_err(map_db_err)?;
        Ok(m.map(|r| Role {
            id: r.id,
            name: r.name,
            description: r.description,
            created_at: r.created_at,
        }))
    }

    async fn create_role(&self, id: Uuid, name: &str, description: Option<&str>) -> Result<Role, RepositoryError> {
        let now = Utc::now();
        let active = role_entity::ActiveModel {
            id: Set(id),
            name: Set(name.to_string()),
            description: Set(description.map(str::to_string)),
            created_at: Set(now),
        };
        let inserted = active.insert(&self.db).await.map_err(map_db_err)?;
        Ok(Role {
            id: inserted.id,
            name: inserted.name,
            description: inserted.description,
            created_at: inserted.created_at,
        })
    }

    async fn find_permission_by_name(&self, name: &str) -> Result<Option<Permission>, RepositoryError> {
        let m = permission_entity::Entity::find()
            .filter(permission_entity::Column::Name.eq(name))
            .one(&self.db)
            .await
            .map_err(map_db_err)?;
        Ok(m.map(|p| Permission {
            id: p.id,
            name: p.name,
            description: p.description,
            created_at: p.created_at,
        }))
    }

    async fn create_permission(&self, id: Uuid, name: &str, description: Option<&str>) -> Result<Permission, RepositoryError> {
        let now = Utc::now();
        let active = permission_entity::ActiveModel {
            id: Set(id),
            name: Set(name.to_string()),
            description: Set(description.map(str::to_string)),
            created_at: Set(now),
        };
        let inserted = active.insert(&self.db).await.map_err(map_db_err)?;
        Ok(Permission {
            id: inserted.id,
            name: inserted.name,
            description: inserted.description,
            created_at: inserted.created_at,
        })
    }

    async fn assign_role_to_user(&self, user_id: Uuid, role_id: Uuid) -> Result<(), RepositoryError> {
        let active = ur_entity::ActiveModel {
            user_id: Set(user_id),
            role_id: Set(role_id),
        };
        active.insert(&self.db).await.map_err(map_db_err)?;
        Ok(())
    }

    async fn assign_permission_to_role(&self, role_id: Uuid, permission_id: Uuid) -> Result<(), RepositoryError> {
        let active = rp_entity::ActiveModel {
            role_id: Set(role_id),
            permission_id: Set(permission_id),
        };
        active.insert(&self.db).await.map_err(map_db_err)?;
        Ok(())
    }

    async fn get_user_permissions(&self, user_id: Uuid) -> Result<Vec<String>, RepositoryError> {
        let user_roles = ur_entity::Entity::find()
            .filter(ur_entity::Column::UserId.eq(user_id))
            .all(&self.db)
            .await
            .map_err(map_db_err)?;

        let mut perms = Vec::new();
        for ur in user_roles {
            let role_perms = rp_entity::Entity::find()
                .filter(rp_entity::Column::RoleId.eq(ur.role_id))
                .all(&self.db)
                .await
                .map_err(map_db_err)?;

            for rp in role_perms {
                if let Some(p) = permission_entity::Entity::find_by_id(rp.permission_id).one(&self.db).await.map_err(map_db_err)? {
                    if !perms.contains(&p.name) {
                        perms.push(p.name);
                    }
                }
            }
        }

        Ok(perms)
    }

    async fn list_roles(&self) -> Result<Vec<Role>, RepositoryError> {
        let items = role_entity::Entity::find().all(&self.db).await.map_err(map_db_err)?;
        Ok(items.into_iter().map(|r| Role {
            id: r.id,
            name: r.name,
            description: r.description,
            created_at: r.created_at,
        }).collect())
    }

    async fn list_permissions(&self) -> Result<Vec<Permission>, RepositoryError> {
        let items = permission_entity::Entity::find().all(&self.db).await.map_err(map_db_err)?;
        Ok(items.into_iter().map(|p| Permission {
            id: p.id,
            name: p.name,
            description: p.description,
            created_at: p.created_at,
        }).collect())
    }
}
