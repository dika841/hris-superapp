use std::future::Future;

pub trait PasswordService: Send + Sync {
    fn hash(&self, password: &str)
        -> impl Future<Output = Result<String, String>> + Send;
    fn verify(&self, password: &str, hash: &str)
        -> impl Future<Output = Result<bool, String>> + Send;
}
