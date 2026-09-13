import type { Meta, StoryObj } from '@storybook/react'
import { DataTable, DataTableColumnHeader } from './data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '../../primitives/badge'
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
]

const columns: ColumnDef<EmployeeRow>[] = [
  {
    accessorKey: 'code',
    header: ({ column }) => <DataTableColumnHeader column={column} title="NIK" />,
    cell: ({ row }) => <span className="font-mono text-xs text-indigo-400">{row.getValue('code')}</span>,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nama" />,
    cell: ({ row }) => <span className="font-medium text-white">{row.getValue('name')}</span>,
  },
  {
    accessorKey: 'department',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Departemen" />,
  },
  {
    accessorKey: 'ptkp',
    header: 'PTKP',
    cell: ({ row }) => <Badge variant="outline">{row.getValue('ptkp')}</Badge>,
  },
  {
    accessorKey: 'salary',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Gaji Pokok" />,
    cell: ({ row }) => formatRupiah(row.getValue('salary')),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.getValue('status') === 'active' ? 'success' : 'secondary'}>
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
      searchKey="name"
      searchPlaceholder="Cari nama karyawan..."
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
