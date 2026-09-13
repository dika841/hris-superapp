import { createFileRoute } from '@tanstack/react-router'
import { Gear } from '@phosphor-icons/react'
import { useSystemSettings } from './_hooks/use-system-settings'
import { TaxComplianceCard } from './_components/tax-compliance-card'
import { SystemMetadataCard } from './_components/system-metadata-card'

export const Route = createFileRoute('/_authenticated/settings/')({
  component: SettingsPage,
})

function SettingsPage() {
  const { taxCompliance, systemMetadata } = useSystemSettings()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <Gear className="h-6 w-6 text-primary" />
          Workspace Configuration
        </h1>
        <p className="text-sm text-muted-foreground">
          Single-tenant system parameters, security policies, and tax regulation metadata.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TaxComplianceCard items={taxCompliance} />
        <SystemMetadataCard items={systemMetadata} />
      </div>
    </div>
  )
}
