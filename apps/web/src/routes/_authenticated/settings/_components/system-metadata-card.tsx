import { Database } from '@phosphor-icons/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@hris/ui'
import type { ComplianceItem } from '../_hooks/use-system-settings'

interface SystemMetadataCardProps {
  items: ComplianceItem[]
}

export function SystemMetadataCard({ items }: SystemMetadataCardProps) {
  return (
    <Card className="glass-panel">
      <CardHeader className="border-b border-border">
        <div className="flex items-center gap-2 text-primary text-sm font-semibold">
          <Database className="h-4 w-4" />
          Architecture & Data Sovereignty
        </div>
        <CardTitle>System Metadata</CardTitle>
        <CardDescription>Engine runtime and compliance standards</CardDescription>
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
            <span className="font-semibold text-foreground font-mono">{item.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
