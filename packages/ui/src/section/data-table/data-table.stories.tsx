import type { Meta, StoryObj } from '@storybook/react'
import { DataTable, DataTableColumnHeader } from './data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '../../primitives/badge'
import { Button } from '../../primitives/button'
import { Checkbox } from '../../primitives/checkbox'
import { Plus } from '@phosphor-icons/react'
import { formatRupiah } from '@hris/utils'

interface EmployeeRow {
  id: string
  code: string
  name: string
  department: string
  ptkp: string
  salary: number
  status: 'active' | 'inactive'
}

const sampleData: EmployeeRow[] = [
  { id: '1', code: 'EMP-101', name: 'Budi Santoso', department: 'Engineering', ptkp: 'K/1', salary: 18500000, status: 'active' },
  { id: '2', code: 'EMP-102', name: 'Siti Rahma', department: 'Tax & Compliance', ptkp: 'TK/0', salary: 14000000, status: 'active' },
  { id: '3', code: 'EMP-103', name: 'Andi Wijaya', department: 'Product', ptkp: 'K/2', salary: 22000000, status: 'active' },
  { id: '4', code: 'EMP-104', name: 'Dewi Lestari', department: 'People Operations', ptkp: 'TK/0', salary: 12500000, status: 'inactive' },
  { id: '5', code: 'EMP-105', name: 'Rian Hidayat', department: 'Engineering', ptkp: 'K/0', salary: 16000000, status: 'active' },
  { id: '6', code: 'EMP-106', name: 'Maya Indah', department: 'Finance', ptkp: 'TK/1', salary: 15000000, status: 'active' },
  { id: '7', code: 'EMP-107', name: 'Dimas Pratama', department: 'Engineering', ptkp: 'K/3', salary: 25000000, status: 'active' },
]

const columns: ColumnDef<EmployeeRow>[] = [
  {
    accessorKey: 'code',
    header: ({ column }) => <DataTableColumnHeader column={column} title="NIK" />,
    cell: ({ row }) => <span className="font-mono text-xs text-primary">{row.getValue('code')}</span>,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nama" />,
    cell: ({ row }) => <span className="font-medium text-foreground">{row.getValue('name')}</span>,
  },
  {
    accessorKey: 'department',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Departemen" />,
  },
  {
    accessorKey: 'ptkp',
    header: 'PTKP',
    cell: ({ row }) => <Badge variant="info">{row.getValue('ptkp')}</Badge>,
  },
  {
    accessorKey: 'salary',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Gaji Pokok" />,
    cell: ({ row }) => <span className="font-mono">{formatRupiah(row.getValue('salary'))}</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.getValue('status') === 'active' ? 'success' : 'default'}>
        {row.getValue('status') === 'active' ? 'Aktif' : 'Nonaktif'}
      </Badge>
    ),
  },
]

const meta: Meta = {
  title: 'Section/DataTable',
  tags: ['autodocs'],
}

export default meta

export const InteractiveEmployeeTable: StoryObj = {
  render: () => (
    <DataTable
      columns={columns}
      data={sampleData}
      searchPlaceholder="Cari data karyawan..."
      pageSize={5}
      pageSizeOptions={[5, 10, 20]}
      toolbarActions={
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Tambah Karyawan
        </Button>
      }
    />
  ),
}

export const LoadingState: StoryObj = {
  render: () => (
    <DataTable
      columns={columns}
      data={[]}
      isLoading={true}
    />
  ),
}

export const EmptyState: StoryObj = {
  render: () => (
    <DataTable
      columns={columns}
      data={[]}
      emptyMessage="Belum ada data karyawan terdaftar."
    />
  ),
}


export const WithRowSelection: StoryObj = {
  render: () => {
    const selectableColumns: ColumnDef<EmployeeRow>[] = [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      ...columns,
    ]

    return (
      <DataTable
        columns={selectableColumns}
        data={sampleData}
        pageSize={5}
        showRowSelectionInfo={true}
      />
    )
  },
}
