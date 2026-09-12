use sea_orm::{Database, DatabaseConnection, DbErr};

pub async fn create_connection(url: &str) -> Result<DatabaseConnection, DbErr> {
    Database::connect(url).await
}
