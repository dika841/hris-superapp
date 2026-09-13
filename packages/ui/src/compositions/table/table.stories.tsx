import type { Meta, StoryObj } from '@storybook/react'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from './table'
import { Badge } from '../../primitives/badge'

const meta: Meta = {
  title: 'Compositions/Table',
  tags: ['autodocs'],
}

export default meta

export const BasicTable: StoryObj = {
  render: () => (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>NIK</TableHead>
            <TableHead>Nama Karyawan</TableHead>
            <TableHead>Departemen</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-mono text-xs">EMP-1001</TableCell>
            <TableCell className="font-medium text-white">Budi Santoso</TableCell>
            <TableCell>Engineering</TableCell>
            <TableCell><Badge variant="success">Aktif</Badge></TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-mono text-xs">EMP-1002</TableCell>
            <TableCell className="font-medium text-white">Siti Rahma</TableCell>
            <TableCell>Finance & Tax</TableCell>
            <TableCell><Badge variant="success">Aktif</Badge></TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-mono text-xs">EMP-1003</TableCell>
            <TableCell className="font-medium text-white">Agus Pratama</TableCell>
            <TableCell>Operations</TableCell>
            <TableCell><Badge variant="warning">Cuti</Badge></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
}
