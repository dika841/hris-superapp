import { Shield } from '@phosphor-icons/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@hris/ui'
import type { ComplianceItem } from '../_hooks/use-system-settings'

interface TaxComplianceCardProps {
  items: ComplianceItem[]
}

export function TaxComplianceCard({ items }: TaxComplianceCardProps) {
  return (
    <Card className="glass-panel">
      <CardHeader className="border-b border-border">
        <div className="flex items-center gap-2 text-primary text-sm font-semibold">
          <Shield className="h-4 w-4" />
          Tax & Statutory Compliance
        </div>
        <CardTitle>Indonesian Tax Configuration</CardTitle>
        <CardDescription>Regulatory standards applied across deterministic calculation engines</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4 text-xs text-foreground">
        {items.map((item, idx) => (
          <div
            key={item.label}
            className={`flex justify-between py-2 ${
              idx < items.length - 1 ? 'border-b border-border' : ''
            }`}
          >
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-semibold text-foreground">{item.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
