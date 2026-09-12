# HRIS Management System — Implementation Task Tracker

Dokumen ini mencatat status implementasi seluruh modul dan komponen core pada sistem HRIS (**Clean Architecture Rust Backend + React 19 TanStack Frontend**), diorkestrasi menggunakan **Moon (`moonrepo`)**.

---

## Legenda Status

| Simbol | Keterangan |
| :---: | :--- |
| `[x]` | **Implemented & Verified** — Telah selesai diimplementasikan dan diverifikasi via build/test. |
| `[/]` | **In Progress / Partial** — Telah memiliki implementasi dasar, membutuhkan penyempurnaan atau endpoint lanjutan. |
| `[ ]` | **Planned / Backlog** — Direncanakan pada fase pengembangan berikutnya. |

---

## 1. Arsitektur & Monorepo Tooling

- [x] **Moon Monorepo Orchestration (`.moon/`)**:
  - [x] Workspace project map (`api`, `gateway`, `bootstrap`, `migration`, `web`).
  - [x] VCS configuration dengan default branch `main`.
  - [x] Per-project task pipelines (`moon.yml`) dengan caching (`check`, `test`, `build`, `dev`).
  - [x] Integrasi task pipeline di root `package.json` (`pnpm check`, `pnpm test`, `pnpm build`).
- [x] **Cargo Workspace (`Cargo.toml`)**:
  - [x] Resolver version 3 dengan 4 member crate (`api`, `gateway`, `bootstrap`, `.migrations`).
  - [x] Shared workspace dependencies (Tokio 1.43, Axum 0.8, SeaORM 1.1, Chrono, Rust Decimal).
- [x] **Database & Local Dev Services (`docker-compose.dev.yml`)**:
  - [x] PostgreSQL 16 Alpine container configuration.
  - [x] Redis 7 Alpine container configuration (dipersiapkan untuk worker masa depan).

---

## 2. Authentication & Unified Single-Tenant RBAC

- [x] **Domain Layer**:
  - [x] `User`, `Role`, `Permission` entity models.
  - [x] `UserRepository`, `RbacRepository` traits dengan Rust 2024 `impl Future`.
  - [x] Domain error types (`AuthError`, `RepositoryError`).
- [x] **Application Layer**:
  - [x] `PasswordService` port (Argon2id) & `TokenService` port (JWT).
  - [x] `LoginUseCase`, `CreateUserUseCase`, `ListUsersUseCase`.
- [x] **Infrastructure Layer**:
  - [x] `Argon2PasswordService` dengan `spawn_blocking` untuk keamanan CPU-bound hashing.
  - [x] `JwtTokenService` dengan access token & refresh token signing.
  - [x] SeaORM repositories untuk `users`, `roles`, `permissions`, `user_roles`, `role_permissions`.
- [x] **Presentation Layer (Axum 0.8)**:
  - [x] `POST /api/auth/login` endpoint.
  - [x] JWT Bearer authentication middleware (`require_auth`).
  - [x] Granular RBAC permission check middleware (`require_permission`).
  - [x] REST endpoints user: `GET /api/users`, `POST /api/users`.
- [x] **Database Seeding (`apps/bootstrap`)**:
  - [x] Idempotent seed untuk 4 role standar (`admin`, `hr_manager`, `payroll_officer`, `employee`).
  - [x] Idempotent seed untuk initial admin: `admin@hris.local` / `Admin123!`.
- [/] **Lanjutan Auth**:
  - [/] Refresh token rotation endpoint (`POST /api/auth/refresh`).
  - [ ] Password reset token & email dispatch.
  - [ ] Multi-factor Authentication (MFA / TOTP).

---

## 3. Master Data & Workforce Management (Employee)

- [x] **Domain Layer**:
  - [x] `Employee` entity dengan atribut kepatuhan Indonesia: PTKP status, NPWP, NIK, Bank accounts, basic salary, allowance fixed.
  - [x] `EmployeeRepository` trait.
- [x] **Application Layer**:
  - [x] `CreateEmployeeUseCase` (dengan validasi duplikasi NIK/kode pegawai).
  - [x] `ListEmployeesUseCase` (dengan paginasi & filter departemen).
- [x] **Infrastructure Layer**:
  - [x] SeaORM migration `m20260312_000004_create_employees`.
  - [x] `SeaOrmEmployeeRepository` implementation.
- [x] **Presentation Layer**:
  - [x] `POST /api/employees` (registrasi karyawan baru).
  - [x] `GET /api/employees` (list karyawan dengan paginasi).
- [/] **Lanjutan Employee**:
  - [/] `GET /api/employees/:id` (detail karyawan lengkap).
  - [/] `PUT /api/employees/:id` (update data karyawan & status aktif).
  - [ ] Soft-delete & offboarding flow (pencatatan termination date).
  - [ ] Upload dokumen karyawan (KTP, NPWP, Surat Perjanjian Kerja / PKWT / PKWTT).
  - [ ] Hierarki organisasi (Direct Manager & Department Head).

---

## 4. Payroll & Indonesian Tax Engine (PMK 168/2023, BPJS, PP 35/2021)

- [x] **Kalkulator Deterministik (`domain::payroll::calculator`)**:
  - [x] **PPh 21 TER (PMK 168/2023)**:
    - [x] Klasifikasi kategori TER A (TK/0, TK/1, K/0), TER B (TK/2, TK/3, K/1, K/2), TER C (K/3).
    - [x] Bracket tarif efektif bulanan dari 0% s/d 34% dengan presisi desimal pasti (`rust_decimal`).
  - [x] **BPJS Ketenagakerjaan**:
    - [x] Jaminan Hari Tua (JHT): 2% karyawan.
    - [x] Jaminan Pensiun (JP): 1% karyawan (dengan batas upah maksimum 2024: Rp 10.042.300).
  - [x] **BPJS Kesehatan**:
    - [x] Iuran 1% karyawan (dengan batas upah maksimum: Rp 12.000.000).
  - [x] **Overtime Pay (PP 35/2021)**:
    - [x] Upah lembur per jam dengan faktor `1/173 x Basic Salary`.
- [x] **Application Layer**:
  - [x] `CalculatePayrollUseCase` (perhitungan total gaji bruto, potongan PPh 21, BPJS, overtime, dan gaji bersih / take-home pay).
  - [x] `ListPayrollUseCase` (riwayat penggajian berdasarkan periode `YYYY-MM`).
  - [x] `MarkPayrollPaidUseCase` (approval & penyelesaian status pembayaran gaji).
- [x] **Infrastructure Layer**:
  - [x] SeaORM migration `m20260312_000005_create_payroll_records`.
  - [x] `SeaOrmPayrollRepository` implementation.
- [x] **Presentation Layer**:
  - [x] `POST /api/payroll/calculate` (generate payroll per karyawan).
  - [x] `POST /api/payroll/preview-tax` (simulator interaktif PPh 21 tanpa simpan ke DB).
  - [x] `GET /api/payroll` (query riwayat payroll per periode).
  - [x] `PATCH /api/payroll/:id/paid` (konfirmasi pembayaran).
- [/] **Lanjutan Payroll**:
  - [/] Batch run generator: Menghitung slip gaji seluruh karyawan aktif dalam 1 klik.
  - [ ] Rekonsiliasi PPh 21 Masa Pajak Terakhir (Bulan Desember) menggunakan Tarif Progresif Pasal 17 ayat (1) huruf a UU HPP.
  - [ ] Render PDF Slip Gaji (e-Payslip) siap cetak/unduh.
  - [ ] Export Formulir Bukti Potong Pajak 1721-A1 & 1721-VIII.

---

## 5. Background Processing & Schedulers

- [x] **In-Process Tokio Scheduler (`apps/gateway/src/scheduler.rs`)**:
  - [x] Library: `tokio-cron-scheduler` (v0.15) berjalan di background thread Tokio runtime.
  - [x] **Pemisahan Tanggung Jawab (Clean Architecture)**: Gateway hanya mengatur pemicu cron dan routing; semua aturan bisnis reside di `api::application::scheduler::SchedulerTasks`.
  - [x] **Zona Waktu Terstandar**: Terkunci pada **`Asia/Jakarta` (WIB, UTC+7)** menggunakan `chrono-tz`.
  - [x] **Prinsip Idempoten**:
    - [x] *Heartbeat & DB Health Job*: Pengecekan liveness database pool setiap 10 menit (`0 */10 * * * *`).
    - [x] *Nightly Attendance Sweep Job*: Pukul 00:00 WIB setiap hari (`0 0 0 * * *`) untuk auto-closing shift terbuka.
    - [x] *Monthly Payroll Cut-off Monitor*: Pukul 06:00 WIB setiap hari (`0 0 6 * * *`) untuk mendeteksi tanggal cut-off (tgl 25) dan kesiapan draft payroll.
  - [x] **Tanpa Beban Berat di Gateway**: Scheduler gateway tidak menjalankan batch payroll ribuan karyawan atau inferensi AI; hanya memeriksa status dan memicu notifikasi ringan.
  - [x] **Graceful Shutdown**: Mendukung penanganan sinyal `SIGINT` (Ctrl+C) dan `SIGTERM` (Unix/Docker/K8s).
  - [x] **Verifikasi Otomatis**: Unit/integration test `apps/gateway/tests/scheduler_execution_test.rs` memverifikasi bahwa task benar-benar dijadwalkan, dipicu, dan dieksekusi secara asinkron.
- [ ] **Rencana Transisi Masa Depan (Dedicated Worker & Queue)**:
  - [ ] Membuat crate baru `apps/worker` saat batch payroll massal atau AI automation memerlukan queue terpisah.
  - [ ] Integrasi Redis Queue (`apalis` / Redis Streams) dengan consumer pool independen.

---

## 6. Attendance & Time Tracking

- [x] **Frontend View**: UI overview absensi di `apps/web/src/routes/_authenticated/attendance.tsx`.
- [x] **Scheduler Hook**: Nightly auto-close check di `SchedulerTasks::execute_nightly_attendance`.
- [ ] **Database Migration**: Tabel `attendance_logs` dan `work_schedules`.
- [ ] **Clock-in / Clock-out Use Cases**: Validasi jam kerja, toleransi keterlambatan, dan validasi koordinat geolokasi / IP.
- [ ] **Approval Pengajuan Lembur**: Form pengajuan lembur & approval atasan sebelum masuk perhitungan payroll.
- [ ] **Integrasi Mesin Fingerprint / Biometrik**: Endpoint webhook atau import file CSV absensi.

---

## 7. Leave & Permohonan Cuti

- [ ] **Database Migration**: Tabel `leave_types` (Tahunan, Sakit, Melahirkan, Penting), `leave_balances`, dan `leave_requests`.
- [ ] **Use Cases**:
  - [ ] Pengajuan cuti oleh karyawan.
  - [ ] Verifikasi sisa kuota cuti.
  - [ ] Approval bertingkat (Manager -> HR).
- [ ] **Scheduler Auto-Accrual**: Akumulasi kuota cuti tahunan otomatis di awal tahun.
- [ ] **Frontend Cuti**: Kalender cuti bersama dan form pengajuan izin.

---

## 8. Frontend Application (React 19 + TanStack Router)

- [x] **Router & Layout**:
  - [x] Single-tenant routing tanpa prefix `$orgSlug`.
  - [x] Public layout (`_public.tsx`) dengan Login Page (`_public/login.tsx`).
  - [x] Authenticated layout (`_authenticated.tsx`) dengan sidebar navigasi, user avatar, dan badge status role.
- [x] **Pages & Views**:
  - [x] Dashboard (`/`): Ringkasan metrik karyawan aktif, total pengeluaran payroll, dan status absensi.
  - [x] Workforce Directory (`/employees`): Tabel daftar karyawan, filter, dan modal registrasi karyawan.
  - [x] Payroll Center (`/payroll`): Simulator pajak PPh 21 TER interaktif dengan slider upah & kalkulasi instan, serta tabel riwayat payroll.
  - [x] Attendance (`/attendance`): Kartu status absensi dan riwayat log.
  - [x] Users & RBAC Matrix (`/users`): Manajemen akun user dan penugasan peran.
  - [x] Settings (`/settings`): Metadata sistem dan konfigurasi umum.
- [x] **State Management & Networking**:
  - [x] TanStack Query (`@tanstack/react-query`) dengan query key factory (`employeeKeys`, `payrollKeys`).
  - [x] Centralized Axios client dengan auto-attach token Authorization Bearer.
- [x] **Desain & Estetika**:
  - [x] Modern Glassmorphism Tailwind CSS v4 design system.
  - [x] Typography Plus Jakarta Sans.
- [/] **Lanjutan Frontend**:
  - [/] Validasi form terperinci dengan TanStack Form / Zod resolver.
  - [ ] Widget Live Clock-in / Clock-out di dashboard karyawan.
  - [ ] Download PDF slip gaji langsung dari tabel payroll.
