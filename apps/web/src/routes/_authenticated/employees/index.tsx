import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Users, UserPlus } from '@phosphor-icons/react'
import { Button } from '@hris/ui'
import { useEmployeeQueries } from './_hooks/use-employee-queries'
import { EmployeeTable } from './_components/employee-table'
import { EmployeeModal } from './_components/employee-modal'

export const Route = createFileRoute('/_authenticated/employees/')({
  component: EmployeesPage,
})

function EmployeesPage() {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const { employees, isLoading, createMutation } = useEmployeeQueries()

  const handleCreateEmployee = async (payload: Parameters<typeof createMutation.mutateAsync>[0]) => {
    await createMutation.mutateAsync(payload)
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Users className="h-6 w-6 text-primary" />
            Workforce Directory
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage employee master records, statutory tax status (PTKP), and compensation structures.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {/* Workforce Directory Table */}
      <EmployeeTable employees={employees} isLoading={isLoading} />

      {/* Add Employee Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateEmployee}
        isPending={createMutation.isPending}
      />
    </div>
  )
}
