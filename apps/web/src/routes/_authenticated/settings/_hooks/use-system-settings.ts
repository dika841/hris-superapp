export interface ComplianceItem {
  label: string
  value: string
}

export function useSystemSettings() {
  const taxCompliance: ComplianceItem[] = [
    { label: 'PPh 21 Mechanism:', value: 'TER (PMK 168/2023)' },
    { label: 'Overtime Calculation:', value: 'PP 35/2021 (Factor 1/173)' },
    { label: 'BPJS Ketenagakerjaan:', value: 'JHT (2%), JP (1% Capped 10.04m)' },
    { label: 'BPJS Kesehatan:', value: '1% Employee (Capped 12m)' },
  ]

  const systemMetadata: ComplianceItem[] = [
    { label: 'Backend Framework:', value: 'Rust 2024 / Axum 0.8 / Tokio' },
    { label: 'ORM & Migrations:', value: 'SeaORM 1.1 / sea-orm-migration' },
    { label: 'Privacy & Data Protection:', value: 'UU PDP No. 27/2022 Compliant' },
    { label: 'Password Hashing:', value: 'Argon2id (m_cost=19456, t_cost=2)' },
  ]

  return { taxCompliance, systemMetadata }
}
