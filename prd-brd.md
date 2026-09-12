## 1. Business Requirements Document (BRD)

### 1.1 Visi & Tujuan Bisnis

Mentransformasi HRIS enterprise dari *system of record* statis menjadi *system of intelligence* otonom. Target capaian sistem meliputi efisiensi operasional HR sebesar 32%, pengurangan *turnover* (attrition) karyawan sebesar 20–30%, dan pemangkasan biaya komputasi/token hingga 90% via Small Language Models (SLM) di edge dan Semantic Caching.

### 1.2 Masalah Bisnis & Solusi Teknis

| **Masalah Bisnis**                        | **Risiko / Dampak Finansial**                                               | **Solusi Arsitektur Sistem**                                                                                     |
| ----------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Kepatuhan Pajak Dinamis**               | Denda audit perpajakan, deviasi nominal gaji, komplain audit internal.      | Rust Deterministic Engine: Otomasi PPh 21 TER (PMK 168/2023), Lembur PP 35/2021, rekonsiliasi Pasal 17 Desember. |
| **Regulasi Privasi (UU PDP No. 27/2022)** | Denda sanksi administratif yudisial hingga 2% pendapatan korporasi tahunan. | Explicit Consent Engine, NeMo PII In-Memory Masking, mekanisme SLA Insiden Kebocoran 3x24 jam.                   |
| **EU AI Act (High-Risk AI)**              | Denda hingga €35M / 7% turnover tahunan untuk bias seleksi pekerja.         | Human-In-The-Loop (HITL), Four-Fifths Rule Bias Detection, immutable audit log.                                  |
| **Biaya Token & Latensi Tinggi**          | Latensi multi-detik (>3s) dan biaya pemanggilan model komersial linier.     | Triase SLM Lokal (Llama 3.1 8B / GLM-4) + Redis Semantic Cache (Hit latency <10ms).                              |
| **Attrition Karyawan Pasif**              | Kehilangan talenta kunci dan pembengkakan biaya rekrutmen ulang.            | Early Warning System (Random Forest/ANN) + Playbook Intervensi Otomatis.                                         |

## 2. Product Requirements Document (PRD)

### 2.1 Scope & Feature Matrix

1. **Core HR & Payroll Engine (PPh 21 TER & BPJS)**
   - Perhitungan otomatis skema TER A, B, dan C harian/bulanan.
   - Metode pemotongan kompensasi: *Gross*, *Nett*, dan *Gross-Up*.
   - Kalkulasi lembur presisi berbasis PP 35/2021 (faktor 1/173 jam upah sebulan).
   - Rekonsiliasi masa pajak Desember dengan tarif progresif Pasal 17 UU PPh.
   - Komponen BPJS Ketenagakerjaan (JKK, JKM, JHT 2%, JP 1%) & BPJS Kesehatan beserta *capping* batas upah.
2. **Adaptive RAG & Enterprise Knowledge Base**
   - Repositori Vektor Qdrant mandiri dengan pemfilteran berbasis *payload metadata* (Department & Clearance Level).
   - Hybrid Search: Dense retrieval (Cosine Vector) + Sparse retrieval (BM25) / GraphRAG untuk navigasi struktur organisasi.
   - Redis Semantic Cache (Ambang kemiripan kosinus $\ge 0.85$).
3. **Agentic Workflows (Recruitment & Evaluation)**
   - Multi-agent collaboration: *Profile Researcher* $\rightarrow$ *Skill Matcher* $\rightarrow$ *Compliance Agent*.
   - Human-In-The-Loop: Model tidak diberikan otoritas mutlak untuk menolak kandidat (*Automation Bias Guard*).
4. **Natural Language to SQL (NL2SQL)**
   - Konversi teks bahasa alami menjadi PostgreSQL query yang aman (*read-only role*) untuk analitik *people management*.
5. **Data Privacy & AI Guardrails**
   - In-memory data masking sebelum prompt/kueri diekspos ke model eksternal.
   - Hak Subjek Data: Pipeline otomatisasi pembaruan dan *Right to Erasure* (Pasal 6 & 8 UU PDP).

### 2.2 Acceptance Criteria Utama

- **AC-PAY-01:** Engine payroll wajib memproses 10.000 kalkulasi slip gaji dalam waktu $<2$ detik dengan toleransi selisih sen/rupiah = 0.
- **AC-RAG-01:** Kueri semantik berulang disajikan oleh Redis Semantic Cache dengan latensi $P95 < 50\text{ ms}$.
- **AC-BIAS-01:** Jika rasio kelulusan seleksi kelompok minoritas $< 80\\%$ dari kelompok dominan, pipeline wajib *pause* dan memberikan alert ke compliance dashboard.
- **AC-HAL-01:** Seluruh jawaban RAG terkait kebijakan HR wajib menyertakan metadata rujukan (Bab, Halaman, Nomor Dokumen SOP).

## 3. Arsitektur Teknis & Techstack

```
                        +---------------------------------------------+
                        |           Next.js 15 App Router            |
                        |      (Shadcn/UI, Tailwind CSS, TanStack)    |
                        +----------------------+----------------------+
                                               | (HTTPS / WSS / gRPC-Web)
                                               v
                        +---------------------------------------------+
                        |      API Gateway / BFF (TypeScript / Node)  |
                        |       Auth (Session/JWT), Rate Limiter      |
                        +--------+--------------------------+---------+
                                 |                          |
               (gRPC / Internal) |                          | (Internal HTTP / gRPC)
                                 v                          v
+------------------------------------+    +------------------------------------+
|         RUST PAYROLL CORE          |    |     AI ORCHESTRATION ENGINE        |
|  - PPh 21 TER PMK 168/2023 Engine  |    |  - TypeScript (LangGraph.js)       |
|  - BPJS & OT PP 35/2021            |    |  - Local SLM Gateway (Ollama/vLLM) |
|  - Strict Memory & Exact Decimals  |    |  - NeMo Guardrails & PII Masking   |
+-----------------+------------------+    +-----------------+------------------+
                  |                                         |
                  |                +------------------------+
                  |                |
                  v                v
+------------------------------------------------------------------------------+
|                            DATA & VECTOR LAYER                               |
|  - Primary DB: PostgreSQL 16 (Relational Data & Immutable Audit Logs)        |
|  - Vector DB: Qdrant (Rust-native, Payload RBAC filter)                      |
|  - Caching: Redis Stack (Semantic Caching + Vector Search HNSW)              |
|  - ERP Sync: SAP S/4HANA Connector (Rust OData v2/v4 client)                 |
+------------------------------------------------------------------------------+

```

### Rekomendasi Techstack Lengkap

| **Komponen**               | **Pilihan Rekomendasi**                            | **Alasan & Rasional Teknis**                                                                                       |
| -------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Frontend**               | Next.js 15 (TypeScript) + Tailwind CSS + Shadcn/UI | Server Components, hybrid rendering, integrasi state table tangguh (TanStack).                                     |
| **BFF & Orchestration**    | Node.js / Bun (TypeScript) + LangGraph.js          | Mengoptimalkan keahlian TypeScript; LangGraph.js sangat fleksibel untuk state-machine & cyclic graph.              |
| **Core Compute & Payroll** | Rust (Axum / Actix-web + Tokio)                    | Aman dari race condition, zero-cost abstraction, presisi desimal mutlak (`rust_decimal`), eksekusi paralel instan. |
| **Vector Database**        | Qdrant                                             | Berbasis Rust murni; isolasi memory HNSW terpisah dari DB transaksional; *payload filtering on-the-fly*.           |
| **Semantic Caching**       | Redis Stack                                        | Indeks HNSW bawaan untuk pencarian kesamaan semantik prompt sebelum menyentuh LLM.                                 |
| **Relational Database**    | PostgreSQL 16                                      | ACID-compliant, Single Source of Truth, mendukung Row-Level Security dan partisi tabel.                            |
| **Local SLM Runtime**      | vLLM / Ollama                                      | Host model Llama 3.1 8B atau GLM-4 secara on-premise dengan kuantisasi 4-bit / 8-bit.                              |

## 4. Strategi Token & FinOps (Pengendalian Biaya)

```
[User Query Masuk]
       │
       ▼
[Layer 1: Exact Hash Cache (Redis String)] ──Hit (<1ms)──► Return ($0.00)
       │ Miss
       ▼
[Layer 2: Semantic Cache (Redis HNSW Vector)] ──Hit (<10ms)─► Return ($0.00)
       │ Miss
       ▼
[Layer 3: Dynamic Model Routing & Triage]
       ├─ Kueri Rutin/FAQ/Ekstraksi ────────► Local SLM (Llama 3.1 8B) (Biaya Server Tetap, Token: $0)
       └─ Kueri Penalaran Tingkat Tinggi ──► External LLM (Claude / GPT-4o)
               ▲
               │ (LLMLingua Compression: Pangkas konteks 30-50%)
               ▼
[Layer 4: Quota & Token Metering Gateway (Rust Axum Token Bucket)]

```

1. **Departmental Hard Quotas:** Setiap divisi dijatah kuota token bulanan. Gateway memverifikasi limit sebelum request diproses.
2. **Pre-flight Estimation:** Evaluasi jumlah token input menggunakan tokenizers (`tiktoken`) di BFF; jika sisa kuota departemen tidak mencukupi, sistem langsung mengembalikan respon `429 Quota Exceeded`.
3. **Strict Parameter Constraints:** Selalu set batasan `max_tokens` eksplisit pada setiap panggilan API untuk mencegah output model berputar tanpa batas (*runaway generation*).

## 5. Mitigasi Server Crash & Eliminasi Halusinasi

### 5.1 Stabilitas Server & Pencegahan Crash

- **Isolasi Database Vektor:** Beban komputasi indeks memori HNSW diisolasi penuh di Qdrant, mencegah terjadinya *resource contention* dan OOM crash pada PostgreSQL transaksional.
- **Kuantisasi Memori SLM (4/8-bit):** Model lokal dikompresi ke format kuantisasi AWQ/GGUF, membatasi konsumsi VRAM pada 6–8 GB per instance GPU.
- **Backpressure via Asynchronous Worker (Redis Streams):** Pemrosesan massal (seperti parsing ratusan PDF CV) dialihkan ke antrean latar belakang dengan batasan konkurensi (maksimal 5 worker aktif simultan) untuk mencegah lonjakan CPU 100%.
- **Rust Non-Panic Guarantee:** Seluruh logika komputasi menggunakan pola `Result` tanpa operasi `.unwrap()`, memastikan tidak ada panic yang mematikan thread HTTP worker.

### 5.2 Framework Eliminasi Halusinasi (Zero-Hallucination Guard)

```
[Kueri Masuk]
      │
      ▼
[1. Adaptive RAG & Strict Chunking]
      │  * Ambil dokumen SOP resmi (Top-K reranking)
      │  * Context Precision filtering
      ▼
[2. Constrained Generation]
      │  * Temperature = 0.0 (Deterministik)
      │  * System Prompt: "Jawab HANYA berdasar blok referensi terlampir"
      │  * Jika fakta tidak ada -> Wajib jawab "Data tidak ditemukan"
      ▼
[3. Real-Time Hallucination Guardrail]
      │  * TruLens / NeMo: Cek Factuality & Groundedness Score
      │
      ├─ Skor Groundedness < 0.85 ──► Tahan Output -> Beri Flag ke Human Verifier
      │
      └─ Skor Groundedness >= 0.85 ──► Validasi Format JSON (Zod) ──► Return ke User

```

- **Pemisahan Logika Angka:** LLM dilarang menghitung angka atau nominal rupiah secara mandiri. Seluruh kalkulasi finansial (pajak, lembur, bonus, BPJS) dieksekusi 100% oleh kode deterministik di engine Rust; LLM hanya menyajikan narasi hasil.
- **Automated CI Regression Gating:** Integrasi DeepEval pada pipeline CI/CD untuk menggagalkan *Pull Request* baru secara otomatis jika metrik *Faithfulness* turun di bawah ambang batas toleransi $\ge 0.85$.

## 6. Error Management & Fault Tolerance

TypeScript

```
// Pseudocode: Zod Schema Auto-Healing Loop (TypeScript BFF)
import { z } from "zod";

const CandidateExtractSchema = z.object({
  candidateName: z.string(),
  yearsOfExperience: z.number(),
  coreSkills: z.array(z.string()),
  complianceFlag: z.boolean(),
});

async function extractWithHealing(rawPrompt: string, retries = 2) {
  let response = await callLLM(rawPrompt);
  for (let i = 0; i < retries; i++) {
    try {
      const parsedJSON = JSON.parse(response);
      return CandidateExtractSchema.parse(parsedJSON);
    } catch (err: any) {
      if (i === retries - 1) throw new Error("LLM Schema Auto-Heal Exhausted: " + err.message);
      // Auto-Healing Prompt Loop
      response = await callLLM(`Perbaiki JSON berikut agar sesuai skema Zod. Error: \({err.message}\nData:\){response}`);
    }
  }
}

```

Rust

```
// Rust Core: Explicit Error Typing dengan Crate thiserror
#[derive(thiserror::Error, Debug)]
pub enum PayrollEngineError {
    #[error("Kategori TER tidak terdaftar untuk status PTKP: {0}")]
    InvalidTERCategory(String),
    #[error("Kalkulasi matematis overflow pada komponen gaji")]
    ArithmeticOverflow,
    #[error("Gagal melakukan sinkronisasi OData SAP S/4HANA: {0}")]
    SapIntegrationFailure(String),
}

```

## 7. Keamanan & Kepatuhan Privasi Data (UU PDP & EU AI Act)

1. **Dual-Way In-Memory Redaction:**
   - Inbound: NIK (16 digit), email pribadi, nomor rekening, dan alamat dimasking menjadi pseudonim `[REDACTED_NIK]` sebelum teks dikirim ke model AI.
   - Outbound: Filter keluaran teks untuk mencegah kebocoran informasi karyawan lain yang tidak relevan.
2. **Qdrant Vector RBAC Filter:**

   Pencarian vektor mewajibkan injeksi parameter identitas pengguna (Department & Clearance Level) pada tingkat filter payload database:

   JSON
   ```
   {
     "filter": {
       "must": [
         { "key": "department_id", "match": { "value": "Finance" } },
         { "key": "clearance_level", "range": { "lte": 3 } }
       ]
     }
   }

   ```
3. **Emergency Incident Notification Automation:**

   Sistem pelacakan log memonitor anomali eksfiltrasi data. Jika terdeteksi indikasi insiden kebocoran data, alur kerja otomatis langsung menyiapkan draf notifikasi insiden $3 \times 24$ jam sesuai mandat Pasal 46 UU PDP No. 27/2022.

## 8. CI/CD Pipeline (GitHub Actions)

YAML

```
name: Production Enterprise HRIS CI/CD

on:
  pull_request:
    branches: [main, staging]

jobs:
  rust-deterministic-core:
    name: Rust Payroll & Calculation Engine Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - name: Run Strict Cargo Tests
        run: cargo test --manifest-path services/payroll-core/Cargo.toml -- --nocapture

  typescript-quality:
    name: TypeScript BFF, Contracts & UI Validation
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm typecheck
      - run: pnpm test

  ai-quality-gate:
    name: DeepEval RAG Quality & Bias Gate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install Evaluation Suite
        run: pip install deepeval ragas pytest
      - name: Execute LLM-as-a-Judge Evaluation Gate
        run: |
          python -m pytest tests/eval_rag_pipeline.py \
            --assert-faithfulness=0.85 \
            --assert-context-precision=0.80 \
            --assert-bias-ratio=0.80

```

## 9. Task Management & Roadmap (Sprint Planning)

### Sprint 1: Setup Fondasi, Database Vektor & Rust Core

- [ ] **RUST-01**: Setup Cargo Workspace & implementasi formula PPh 21 TER (PMK 168/2023) menggunakan crate `rust_decimal`.
- [ ] **RUST-02**: Unit testing formula lembur PP 35/2021 dan rekonsiliasi masa pajak Desember Pasal 17.
- [ ] **DATA-01**: Setup Qdrant Vector DB dengan collection metadata RBAC (*Department* & *Clearance*).
- [ ] **DATA-02**: Konfigurasi Redis Stack untuk Semantic Caching HNSW index.

### Sprint 2: AI Agent Orchestration & Privacy Guardrails

- [ ] **AI-01**: Setup LangGraph.js StateGraph untuk Multi-Agent rekrutmen (*Researcher*, *Matcher*, *Compliance*).
- [ ] **AI-02**: Implementasi PII Redaction Engine (penyensoran NIK/Nama) pada middleware TypeScript BFF.
- [ ] **AI-03**: Setup Local SLM Gateway (vLLM / Ollama - Llama 3.1 8B kuantisasi 8-bit).

### Sprint 3: UI Dashboard, NL2SQL & Model Attrition

- [ ] **FE-01**: Bangun UI Dashboard Analitik & komponen `AIRationaleCard` menggunakan Next.js 15 & Shadcn/UI.
- [ ] **FE-02**: Implementasi antarmuka percakapan NL2SQL dengan visualisasi diagram dinamis.
- [ ] **ML-01**: Pipeline inferensi prediksi Attrisi Karyawan (Random Forest/ANN) & Playbook generator.
- [ ] **FE-03**: Alur kerja persetujuan manual (*Human-in-the-Loop*) untuk seleksi kandidat dan mutasi karyawan.

### Sprint 4: CI/CD Quality Gates, SAP Connector & Audit Kepatuhan

- [ ] **CI-01**: Konfigurasi GitHub Actions dengan evaluasi otomatis DeepEval & RAGAS.
- [ ] **ERP-01**: Rust OData Client module untuk transmisi pencatatan penggajian ke SAP S/4HANA.
- [ ] **SEC-01**: Implementasi endpoint *Right to Erasure* (UU PDP) & template notifikasi darurat insiden kebocoran data.