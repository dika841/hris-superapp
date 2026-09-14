use chrono::Utc;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, DbErr, EntityTrait, PaginatorTrait,
    QueryFilter, QueryOrder, Set,
};
use uuid::Uuid;
use super::entities::user as user_entity;
use crate::domain::errors::RepositoryError;
use crate::domain::user::{NewUser, User, UserPatch, UserRepository};

#[derive(Clone)]
pub struct SeaOrmUserRepository {
    db: DatabaseConnection,
}

impl SeaOrmUserRepository {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}

impl From<user_entity::Model> for User {
    fn from(m: user_entity::Model) -> Self {
        Self {
            id: m.id,
            email: m.email,
            name: m.name,
            password_hash: m.password_hash,
            role: m.role,
            is_active: m.is_active,
            created_at: m.created_at,
            updated_at: m.updated_at,
        }
    }
}

fn map_db_err(e: DbErr) -> RepositoryError {
    match e {
        DbErr::RecordNotFound(_) => RepositoryError::NotFound,
        other => {
            let msg = other.to_string();
            if msg.contains("unique") || msg.contains("duplicate") {
                RepositoryError::Conflict(msg)
            } else {
                RepositoryError::Database(msg)
            }
        }
    }
}

impl UserRepository for SeaOrmUserRepository {
    async fn find_by_id(&self, id: Uuid) -> Result<Option<User>, RepositoryError> {
        user_entity::Entity::find_by_id(id)
            .one(&self.db)
            .await
            .map(|opt| opt.map(User::from))
            .map_err(map_db_err)
    }

    async fn find_by_email(&self, email: &str) -> Result<Option<User>, RepositoryError> {
        user_entity::Entity::find()
            .filter(user_entity::Column::Email.eq(email))
            .one(&self.db)
            .await
            .map(|opt| opt.map(User::from))
            .map_err(map_db_err)
    }

    async fn create(&self, user: NewUser) -> Result<User, RepositoryError> {
        let now = Utc::now();
        let model = user_entity::ActiveModel {
            id: Set(user.id),
            email: Set(user.email),
            name: Set(user.name),
            password_hash: Set(user.password_hash),
            role: Set(user.role),
            is_active: Set(user.is_active),
            created_at: Set(now),
            updated_at: Set(now),
        };
        let inserted = model.insert(&self.db).await.map_err(map_db_err)?;
        Ok(User::from(inserted))
    }

    async fn update(&self, id: Uuid, patch: UserPatch) -> Result<User, RepositoryError> {
        let existing = user_entity::Entity::find_by_id(id)
            .one(&self.db)
            .await
            .map_err(map_db_err)?
            .ok_or(RepositoryError::NotFound)?;

        let mut active: user_entity::ActiveModel = existing.into();
        if let Some(email) = patch.email {
            active.email = Set(email);
        }
        if let Some(name) = patch.name {
            active.name = Set(name);
        }
        if let Some(pwd) = patch.password_hash {
            active.password_hash = Set(pwd);
        }
        if let Some(role) = patch.role {
            active.role = Set(role);
        }
        if let Some(active_flag) = patch.is_active {
            active.is_active = Set(active_flag);
        }
        active.updated_at = Set(Utc::now());

        let updated = active.update(&self.db).await.map_err(map_db_err)?;
        Ok(User::from(updated))
    }

    async fn delete(&self, id: Uuid) -> Result<(), RepositoryError> {
        let res = user_entity::Entity::delete_by_id(id)
            .exec(&self.db)
            .await
            .map_err(map_db_err)?;
        if res.rows_affected == 0 {
            return Err(RepositoryError::NotFound);
        }
        Ok(())
    }

    async fn list(
        &self,
        page: u64,
        page_size: u64,
        search: Option<&str>,
        role: Option<&str>,
    ) -> Result<(Vec<User>, u64), RepositoryError> {
        let mut query = user_entity::Entity::find();
        if let Some(s) = search {
            let s = s.trim();
            if !s.is_empty() {
                query = query.filter(
                    user_entity::Column::Name.contains(s)
                        .or(user_entity::Column::Email.contains(s))
                );
            }
        }
        if let Some(r) = role {
            let r = r.trim();
            if !r.is_empty() && r != "all" {
                query = query.filter(user_entity::Column::Role.eq(r));
            }
        }

        let paginator = query
            .order_by_desc(user_entity::Column::CreatedAt)
            .paginate(&self.db, page_size);

        let total = paginator.num_items().await.map_err(map_db_err)?;
        let items = paginator.fetch_page(page.saturating_sub(1)).await.map_err(map_db_err)?;
        Ok((items.into_iter().map(User::from).collect(), total))
    }
}
