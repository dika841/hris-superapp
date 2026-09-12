---
name: monorepo-fullstack-rust-ts
description: Best-practices guide for building a full-stack monorepo with a Rust (Axum, SeaORM, Clean Architecture, JWT, Argon2) backend and a React 19 / TanStack Router TypeScript SPA frontend. Use when scaffolding a new full-stack project, adding features (domain + use-case + repo + Axum handler + TanStack route + UI), or reviewing code.
---

# Monorepo Full-Stack (Rust Backend + TypeScript Frontend) Skill

Reference stack:

| Layer        | Tech                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------- |
| Monorepo     | Cargo workspace (Backend) + pnpm / moon (Frontend & Workspace orchestration)             |
| Backend      | Rust (Axum 0.8, SeaORM 1.1, sea-orm-migration, Argon2, JWT, zod-rs, paginator-rs, Tokio) |
| Architecture | Hexagonal / Clean Architecture (Domain → Application → Infrastructure → Presentation)    |
| Frontend     | React 19 + TanStack Router SPA (file-based) + Vite + Tailwind v4 + shadcn/ui             |
| Data / API   | REST API / JSON, TanStack Query + typed API client & Query Key Factories                 |
| Lint/format  | `cargo fmt` & `cargo clippy` (Backend), Biome (Frontend)                                 |
| Test         | `cargo test` (Backend), Vitest (Frontend)                                                |

---

## 0. Before you scaffold — ASK

Before generating any code from this skill, stop and ask the user one question:

> **Will this app be multi-tenant (organization-scoped), or single-tenant?**

The answer changes the scaffold materially. Do not guess. Default to asking even if the prompt looks obvious — a wrong assumption here costs a full refactor later.

### If **multi-tenant** (default for this skill)

Keep multi-tenancy constructs:

- `organization`, `member`, `role` aggregates in domain
- `$orgSlug.tsx` + `$orgSlug/` layout in `apps/web/src/routes/_authenticated/`
- Org-role middleware & permission checking
- `organization_id` FK on org-scoped tables and entities
- Two-layer role system (platform `super-admin` + org `owner | admin | member`)

### If **single-tenant**

Strip the following before scaffolding — do not leave dead code:

- Delete `organization` and `member` domain aggregates and repos.
- Delete `routes/_authenticated/org/` and collapse `$orgSlug.tsx` + `$orgSlug/` — promote children directly under `_authenticated/`.
- Role checks simplified to single `user.role` / direct permissions (`admin | user`).
- Drop `organization_id` columns from SeaORM entities and migrations.

---

## 1. Workspace layout

```
├── Cargo.toml                    # Root Cargo workspace (resolver = "3")
├── package.json                  # Root pnpm workspace scripts
├── pnpm-workspace.yaml           # packages: ['apps/web']
├── .moon/                        # moonrepo orchestration (optional)
│   ├── workspace.yml
│   └── tasks.yml
├── apps/
│   ├── api/                      # Rust Backend (library crate: domain/app/infra/presentation)
│   │   ├── Cargo.toml
│   │   ├── src/
│   │   │   ├── domain/           # Pure entities, repository traits, domain errors (ZERO ORM/framework deps)
│   │   │   │   ├── user/
│   │   │   │   ├── auth/
│   │   │   │   └── mod.rs
│   │   │   ├── application/      # Use cases + Port traits
│   │   │   │   ├── user/         # use_cases/{create, update, delete, detail, list}.rs
│   │   │   │   ├── auth/         # ports/{password.rs, token.rs}, use_cases/
│   │   │   │   └── mod.rs
│   │   │   ├── infrastructure/   # Concrete adapters (SeaORM, Argon2, JWT, Redis)
│   │   │   │   ├── repository/   # SeaOrmUserRepository, entities/ (ORM Models)
│   │   │   │   ├── auth/         # Argon2PasswordService, JwtTokenService
│   │   │   │   └── config/       # Env, database connection
│   │   │   └── presentation/     # Axum web layer
│   │   │       ├── state.rs      # AppState (concrete Arc-backed repos & services)
│   │   │       ├── errors.rs     # AppError (maps to HTTP status + JSON)
│   │   │       ├── middleware/   # auth.rs (JWT extractor), permission.rs, cors.rs
│   │   │       ├── user/         # dto.rs, handlers.rs, mod.rs
│   │   │       ├── auth/         # dto.rs, handlers.rs, mod.rs
│   │   │       └── router.rs     # build_router(state)
│   │   └── tests/                # Integration tests
│   ├── gateway/                  # Binary crate: runs Axum HTTP server & binds ports
│   ├── bootstrap/                # Binary crate: idempotent database seeder (roles/admin)
│   ├── .migrations/              # sea-orm-migration crate
│   └── web/                      # React 19 + TanStack Router SPA
│       ├── vite.config.ts        # Proxies /api to :8080 in dev
│       ├── tsconfig.json         # paths: "#/*": ["./src/*"]
│       ├── src/
│       │   ├── main.tsx
│       │   ├── router.tsx
│       │   ├── routeTree.gen.ts  # Generated — NEVER edit
│       │   ├── styles.css
│       │   ├── components/       # ui/ (shadcn), features/, layout/
│       │   ├── hooks/            # Global app-wide hooks
│       │   ├── libs/             # api-client, auth, tanstack-query
│       │   └── routes/           # File-based routes (_public, _authenticated, etc.)
├── docker-compose.dev.yml        # Dev: Postgres, Redis
└── docker-compose.yml            # Prod multi-stage build
```

---

## 2. Backend — Rust Clean Architecture

### 2.1 Dependency rules (strictly enforced)

```
presentation → application → domain
infrastructure → domain        (implements domain traits)
presentation → infrastructure  (only to wire AppState)
```

- **Domain** has **zero** external crate dependencies beyond `uuid`, `chrono`.
- **Application (Use Cases)** depends only on port traits and repository traits — never on concrete SeaORM or Axum types.
- **Presentation** instantiates use cases inside Axum handlers using concrete services from `AppState`.

---

### 2.2 Domain layer

#### Entities

Plain Rust structs — no derives beyond domain logic needs. No ORM annotations.

```rust
// domain/user/entity.rs
use chrono::{DateTime, Utc};
use uuid::Uuid;

pub struct User {
    pub id: Uuid,
    pub email: String,
    pub password_hash: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

pub struct NewUser {
    pub id: Uuid,
    pub email: String,
    pub password_hash: String,
}

#[derive(Default)]
pub struct UserPatch {
    pub email: Option<String>,
    pub password_hash: Option<String>,
}
```

#### Repository traits

Use `impl Future` in trait methods (Rust 2024 edition). Always `Send + Sync`.

```rust
// domain/user/repository.rs
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
}
```

#### Domain & Repository errors

```rust
// domain/errors.rs
pub enum RepositoryError {
    NotFound,
    Conflict(String),
    Database(String),
}

// domain/auth/errors.rs
pub enum AuthError {
    InvalidCredentials,
    EmailAlreadyExists,
    UserNotFound,
    PasswordHashFailed(String),
    PasswordVerificationFailed(String),
    TokenGenerationFailed(String),
    InvalidToken(String),
    RepositoryError(String),
}
```

---

### 2.3 Application layer

#### Port traits (interfaces for external services)

```rust
// application/auth/ports/password.rs
pub trait PasswordService: Send + Sync {
    fn hash(&self, password: &str)
        -> impl Future<Output = Result<String, PasswordError>> + Send;
    fn verify(&self, password: &str, hash: &str)
        -> impl Future<Output = Result<bool, PasswordError>> + Send;
}

// application/auth/ports/token.rs
pub trait TokenService: Send + Sync {
    fn generate_auth_tokens(&self, sub: &str)
        -> impl Future<Output = Result<(String, String), TokenError>> + Send;
    fn verify_access_token(&self, token: &str)
        -> Result<String, TokenError>;
}
```

#### Use case pattern

Constructed in the handler, generic over port and repo traits.

```rust
// application/user/use_cases/create.rs
pub struct CreateUserCommand {
    pub email: String,
    pub password: String,
}

pub struct CreateUserUseCase<P, R> {
    password_service: P,
    user_repository: R,
}

impl<P: PasswordService, R: UserRepository> CreateUserUseCase<P, R> {
    pub fn new(password_service: P, user_repository: R) -> Self {
        Self { password_service, user_repository }
    }

    pub async fn execute(&self, cmd: CreateUserCommand) -> Result<User, AuthError> {
        // 1. Guard check uniqueness
        if self.user_repository.find_by_email(&cmd.email).await?.is_some() {
            return Err(AuthError::EmailAlreadyExists);
        }
        // 2. Hash password via port
        let password_hash = self.password_service.hash(&cmd.password).await?;
        // 3. Construct domain entity with Uuid::new_v4()
        let new_user = NewUser {
            id: Uuid::new_v4(),
            email: cmd.email,
            password_hash,
        };
        // 4. Persist via repository
        let user = self.user_repository.create(new_user).await?;
        tracing::info!(user_id = %user.id, "user created");
        Ok(user)
    }
}
```

---

### 2.4 Infrastructure layer

#### SeaORM repository implementation

- Live in `infrastructure/repository/`.
- Converts SeaORM Models to Domain Entities (`impl From<Model> for User`).
- Maps `DbErr` to `RepositoryError`.

```rust
// infrastructure/repository/user.rs
#[derive(Clone)]
pub struct SeaOrmUserRepository {
    db: DatabaseConnection,
}

impl UserRepository for SeaOrmUserRepository {
    async fn create(&self, user: NewUser) -> Result<User, RepositoryError> {
        let now = Utc::now();
        let model = user_entity::ActiveModel {
            id: Set(user.id),
            email: Set(user.email),
            password_hash: Set(user.password_hash),
            created_at: Set(now.into()),
            updated_at: Set(now.into()),
        };
        let inserted = model.insert(&self.db).await.map_err(|e| match e {
            DbErr::Exec(ref msg) | DbErr::Query(ref msg) if msg.contains("unique") => {
                RepositoryError::Conflict("email already exists".into())
            }
            other => RepositoryError::Database(other.to_string()),
        })?;
        Ok(User::from(inserted))
    }
}
```

---

### 2.5 Presentation layer (Axum)

#### AppState

Concrete types only (no trait objects). Cheap to clone because `DatabaseConnection` is `Arc`-backed.

```rust
#[derive(Clone)]
pub struct AppState {
    pub password_service: Argon2PasswordService,
    pub token_service: JwtTokenService,
    pub user_repository: SeaOrmUserRepository,
    pub role_repository: SeaOrmRoleRepository,
    pub permission_repository: SeaOrmPermissionRepository,
}
```

#### AppError & HTTP response mapping

```rust
pub enum AppError {
    BadRequest(String),
    Unauthorized,
    Forbidden,
    NotFound,
    Conflict(String),
    Internal(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            Self::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg),
            Self::Unauthorized => (StatusCode::UNAUTHORIZED, "Unauthorized".into()),
            Self::Forbidden => (StatusCode::FORBIDDEN, "Forbidden".into()),
            Self::NotFound => (StatusCode::NOT_FOUND, "Not Found".into()),
            Self::Conflict(msg) => (StatusCode::CONFLICT, msg),
            Self::Internal(err) => {
                tracing::error!(error = %err, "internal server error");
                (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error".into())
            }
        };
        (status, Json(serde_json::json!({ "error": error_message }))).into_response()
    }
}
```

#### Axum Handlers & DTOs

- Validate incoming requests with `zod-rs` or `validator`.
- Use `#[instrument(skip_all, fields(...))]` on every handler.
- Return `201 CREATED` for `POST`, `204 NO_CONTENT` for `DELETE`, `200 OK` for others.

```rust
#[derive(Debug, Deserialize, ZodSchema)]
pub struct CreateUserRequest {
    #[zod(email)]
    pub email: String,
    #[zod(min_length(8), max_length(128))]
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub id: Uuid,
    pub email: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[instrument(skip_all, fields(email = %req.email))]
pub async fn create_user(
    Extension(state): Extension<AppState>,
    Json(req): Json<CreateUserRequest>,
) -> Result<(StatusCode, Json<UserResponse>), AppError> {
    let use_case = CreateUserUseCase::new(
        state.password_service.clone(),
        state.user_repository.clone(),
    );
    let user = use_case.execute(req.into()).await?;
    Ok((StatusCode::CREATED, Json(user.into())))
}
```

---

### 2.6 Migrations & Bootstrap

- **Migrations**: `sea-orm-migration` crate under `.migrations/` or `apps/api/migrations/`.
- Naming convention: `m{YYYYMMDD}_{6-digit-seq}_{description}.rs` (e.g. `m20260413_000001_create_users.rs`).
- **Bootstrap binary**: `apps/bootstrap/` seeds idempotent initial roles, permissions, and super-admin.

---

## 3. Frontend (React 19 + TanStack)

### 3.1 Routing & Layouts

- TanStack Router, file-based, `autoCodeSplitting: true`.
- **Layout = file + sibling folder pair**:
  - `_public.tsx` / `_public/` (Login, Register, Landing)
  - `_authenticated.tsx` / `_authenticated/` (Dashboard, settings, app shell)
  - `$orgSlug.tsx` / `$orgSlug/` (Organization scoped features)
- Features start as single files under `$orgSlug/` (e.g. `users.tsx`). Promote to folder `users/index.tsx` + `_components/` when complex.
- Underscore folders (`_components/`, `_hooks/`, `_data/`) are ignored by the router and colocate UI logic cleanly.

### 3.2 API Client & TanStack Query

- Centralized Axios/fetch client with `Authorization: Bearer <token>` interceptor.
- Centralized Query Key Factories for all queries and mutations:

```typescript
// apps/web/src/libs/api/users.ts
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params?: TListParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};
```

### 3.3 State Management & Forms

- **Server State**: TanStack Query (`useQuery`, `useMutation`, `useSuspenseQuery`).
- **Client State**: TanStack Store or Zustand.
- **Forms**: TanStack Form + Zod validation.

### 3.4 Frontend Conventions

- Prefix `T` for types (e.g. `TUserResponse`), `I` for interfaces, `E` for enums.
- Use **kebab-case** for file and directory names (e.g. `user-table.tsx`, `auth-guard.tsx`).
- Invalidate relevant query keys in `onSuccess` handlers of mutations.

---

## 4. Development & Tooling

- **Backend development**:
  - `cargo check` / `cargo clippy`
  - `cargo test`
  - `cargo run --bin gateway` (starts backend at `http://localhost:8080`)
  - `cargo run --bin migration up`
- **Frontend development**:
  - `pnpm dev` (Vite dev server on `http://localhost:3000` with proxy `/api` → `http://localhost:8080`)
- **Linting & Formatting**:
  - Rust: `cargo fmt --check` & `cargo clippy`
  - Frontend: Biome (`pnpm lint`, `pnpm format`)

---

## 5. Adding a New Feature (End-to-End Workflow)

To add e.g. "employees" or "projects":

1. **Domain (Rust)**:
   - `domain/project/entity.rs` (`Project`, `NewProject`, `ProjectPatch`).
   - `domain/project/repository.rs` (`pub trait ProjectRepository: Send + Sync`).
   - `domain/project/errors.rs` (if domain-specific errors exist).
2. **Application (Rust)**:
   - `application/project/use_cases/{create, update, delete, detail, list}.rs` as `CreateProjectUseCase`, etc.
3. **Infrastructure (Rust)**:
   - SeaORM model in `infrastructure/repository/entities/project.rs`.
   - Implement `ProjectRepository` for `SeaOrmProjectRepository` in `infrastructure/repository/project.rs`.
   - Add `project_repository: SeaOrmProjectRepository` to `AppState`.
4. **Presentation (Rust)**:
   - `presentation/project/dto.rs` (`CreateProjectRequest` with `ZodSchema`, `ProjectResponse`).
   - `presentation/project/handlers.rs` (`#[instrument]`, construct use case, execute, return JSON).
   - `presentation/project/mod.rs` (Axum router).
   - Nest router in `presentation/router.rs`.
5. **Database Migration**:
   - Create migration in `apps/api/migrations/` or `.migrations/src/`.
   - Run `cargo run --bin migration up`.
6. **Frontend API & Route (TypeScript)**:
   - Define DTO types and query key factory in `apps/web/src/libs/api/projects.ts`.
   - Add route in `apps/web/src/routes/_authenticated/$orgSlug/projects.tsx`.
   - Colocate UI in `_components/project-table.tsx` or `_components/project-dialog.tsx`.

---

## 6. Non-Negotiable Rules

1. **Clean Architecture Boundaries**: Domain must NEVER depend on Axum, SeaORM, or any external framework.
2. **Use cases take port/repo traits**: No direct database calls or external I/O inside use cases.
3. **Rust 2024 Edition**: Use `impl Future` in repository traits, avoid `#[async_trait]`.
4. **All timestamps in UTC**: `DateTime<Utc>` in domain; `DateTimeWithTimeZone` in SeaORM models.
5. **UUID generation in Use Cases**: Use `Uuid::new_v4()` in use-case execution, not in database default or repo.
6. **Structured logging**: Use `tracing::instrument` on all Axum handlers and log structured parameters (`user_id`, `org_id`).
7. **Never expose sensitive fields**: Password hashes and internal junction fields must never exist in presentation DTOs.
8. **Frontend file-based layouts**: Always maintain file + folder pairs (`_authenticated.tsx` + `_authenticated/`).
9. **Single Responsibility**: One use case per file, one handler/DTO mapping per action.
10. **Query Key Factories**: Always use query key factories in TanStack Query — never inline string arrays.
