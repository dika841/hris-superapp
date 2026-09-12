# HRIS SuperApp

> **Modern, High-Performance Human Resource Information System & Deterministic Payroll Engine**  
> Built with Rust (Axum, SeaORM, Tokio), React 19 (Vite, TanStack Router/Query, Tailwind CSS v4), and orchestrated via Moonrepo.

---

## 📌 Overview

**HRIS SuperApp** is an enterprise-grade Human Resource Management platform designed for speed, security, and computational accuracy. It features a deterministic, zero-floating-point payroll engine compliant with Indonesian tax regulations (**PPh 21 TER PMK 168/2023**), fine-grained Role-Based Access Control (RBAC), and a reactive, dark-themed frontend dashboard.

```
hris-superapp/
├── apps/
│   ├── api/            # Rust Clean Architecture core (Domain, Use-Cases, Repositories, Handlers)
│   ├── gateway/        # Axum HTTP API gateway, graceful shutdown & Tokio in-process scheduler
│   ├── bootstrap/      # Database seeder (Roles, Permissions, Superadmin)
│   └── web/            # Modern React 19 SPA (Vite, TanStack Router, Tailwind CSS v4)
├── .migrations/        # SeaORM migration manager for PostgreSQL
├── .moon/              # Moonrepo monorepo task runner & cache config
└── docker-compose.dev.yml
```

---

## ⚡ Key Features

- **🦀 High-Performance Rust Backend**:
  - Modular Clean Architecture / Ports & Adapters (`domain`, `application`, `infrastructure`, `presentation`).
  - Async execution with **Tokio** and **Axum 0.8**.
  - Object-relational mapping using **SeaORM** with PostgreSQL 16.
  - Strong password hashing with **Argon2id** and stateless authentication with **JWT**.
  - In-process cron scheduler running on `Asia/Jakarta` timezone with graceful `SIGINT`/`SIGTERM` handling.

- **💰 Deterministic Payroll Engine**:
  - Implemented with `rust_decimal` for 100% exact currency arithmetic without IEEE-754 floating-point inaccuracies.
  - Full **Indonesian PPh 21 TER** calculation following **PMK 168/2023**:
    - **Category A**: TK/0, TK/1, K/0
    - **Category B**: TK/2, K/1, TK/3, K/2
    - **Category C**: K/3
  - BPJS Ketenagakerjaan (JKK, JKM, JHT, JP) and BPJS Kesehatan contribution splits.

- **🛡️ Granular RBAC (Role-Based Access Control)**:
  - Strict middleware-level permission enforcement (`rbac:manage`, `users:read`, `users:write`, `employees:read`, `employees:write`, `payroll:read`, `payroll:calculate`).
  - Many-to-many user-role and role-permission mappings.

- **🎨 Modern Reactive Web Dashboard**:
  - React 19 + TypeScript + Vite 6.
  - Styling powered by Tailwind CSS v4 and custom glassmorphism design system.
  - Type-safe file-based routing with **TanStack Router**.
  - Server state caching & mutation sync via **TanStack Query v5**.

---

## 🛠️ Tech Stack

| Layer                | Technologies                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------------- |
| **Frontend**         | React 19, TypeScript, Vite 6, TanStack Router, TanStack Query, Tailwind CSS v4, Lucide Icons |
| **Backend API**      | Rust 2024 Edition, Axum 0.8, Tokio 1.43, Tower, Serde, Validator                             |
| **Database & ORM**   | PostgreSQL 16, SeaORM 1.1, SeaORM Migration                                                  |
| **Security & Auth**  | Argon2id, JSON Web Tokens (jsonwebtoken), CORS                                               |
| **Monorepo & Tasks** | Moonrepo, Cargo Workspace, pnpm Workspaces                                                   |
| **Infrastructure**   | Docker & Docker Compose (PostgreSQL 16, Redis 7)                                             |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- **Rust toolchain** (1.80+): `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- **Node.js** (v20+ LTS) & **pnpm** (v9+): `corepack enable && corepack prepare pnpm@latest --activate`
- **Docker & Docker Compose**: For local PostgreSQL and Redis instances.
- _(Optional)_ **Moon CLI**: `npm install -g @moonrepo/cli`

---

### 1. Clone & Configure Environment

Clone the repository and prepare the environment configuration:

```bash
git clone <repository-url>
cd hris-management

# Copy template environment variables
cp .env.example .env
```

Populate `.env` with your secure configuration:

```env
DATABASE_URL=postgres://<user>:<password>@<host>:<port>/<db_name>
REDIS_URL=redis://<host>:<port>
JWT_SECRET=<your-strong-random-jwt-secret-key>
PORT=8080
HOST=127.0.0.1
WEB_ORIGIN=http://localhost:3000
RUST_LOG=info,api=debug,gateway=debug
```

---

### 2. Start Databases (Docker)

Start the PostgreSQL and Redis containers in the background:

```bash
docker compose -f docker-compose.dev.yml up -d
```

---

### 3. Install Frontend Dependencies

```bash
pnpm install
```

---

### 4. Run Migrations & Seed Initial Data

Execute database schema migrations, then run the bootstrap seeder to initialize base roles and permissions:

```bash
# Run database migrations
pnpm db:migrate
# or: cargo run --bin migration up

# Seed initial permissions, roles, and administrative user
pnpm db:seed
# or: cargo run --bin bootstrap
```

> **Security Note:** Default administrative credentials set during bootstrap must be rotated immediately upon initial deployment or customized prior to running in production.

---

### 5. Run the Application

#### Start Backend Gateway

```bash
pnpm dev:backend
# or: cargo run --bin gateway
```

The Axum API Gateway will listen on `http://127.0.0.1:8080`.

#### Start Frontend Web App (in another terminal)

```bash
pnpm dev
# or: cd apps/web && pnpm dev
```

The React dashboard will be accessible at `http://localhost:3000` (or `http://localhost:5173`).

---

## 📋 Available Scripts

You can run workspace commands using `pnpm` or `moon`:

| Command            | Description                                          |
| ------------------ | ---------------------------------------------------- |
| `pnpm dev`         | Start the Vite frontend dev server                   |
| `pnpm dev:backend` | Start the Rust Axum API Gateway                      |
| `pnpm build`       | Build all projects (`moon run :build`)               |
| `pnpm check`       | Type-check and lint all projects (`moon run :check`) |
| `pnpm test`        | Run unit & integration tests (`moon run :test`)      |
| `pnpm db:migrate`  | Execute pending SeaORM migrations (`up`)             |
| `pnpm db:seed`     | Seed default roles, permissions, and admin user      |

---

## 🏛️ Architecture & Project Structure

```
.
├── .migrations/                 # Database schema migrations
│   └── src/
│       ├── lib.rs
│       └── m20260413_000001_create_initial_tables.rs
│
├── apps/
│   ├── api/                     # Core Business Logic & Domain Library
│   │   └── src/
│   │       ├── domain/          # Entities & repository traits (user, rbac, employee, payroll)
│   │       ├── application/     # Use-cases & service interfaces
│   │       ├── infrastructure/  # SeaORM implementations, Argon2, JWT, DB pool
│   │       └── presentation/    # Axum router, controllers/handlers, middlewares
│   │
│   ├── gateway/                 # HTTP Entrypoint & Runtime
│   │   └── src/
│   │       ├── main.rs          # Server initialization & graceful signal listener
│   │       └── scheduler.rs     # In-process Tokio scheduler (Jakarta timezone)
│   │
│   ├── bootstrap/               # DB Seeder & Initialization binary
│   │   └── src/
│   │       └── main.rs          # Idempotent seeder script
│   │
│   └── web/                     # Frontend Application
│       └── src/
│           ├── components/      # UI components (cards, tables, buttons, layout)
│           ├── libs/api/        # Axios API clients (auth, employees, payroll)
│           └── routes/          # TanStack file-based routes (_public, _authenticated)
│
├── .moon/                       # Moonrepo workspace orchestration
├── Cargo.toml                   # Root Cargo workspace manifest
├── pnpm-workspace.yaml          # Root pnpm workspace manifest
└── docker-compose.dev.yml       # Local dev service definitions
```

---
