import type { Meta, StoryObj } from '@storybook/react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs'

const meta: Meta = {
  title: 'Compositions/Tabs',
  tags: ['autodocs'],
}

export default meta

export const InteractiveTabs: StoryObj = {
  render: () => (
    <Tabs defaultValue="payroll" className="w-96">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="payroll">Payroll Master</TabsTrigger>
        <TabsTrigger value="tax">PPh 21 TER</TabsTrigger>
      </TabsList>
      <TabsContent value="payroll" className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-sm text-slate-300">
        Perhitungan komponen gaji pokok, tunjangan jabatan, dan BPJS Kesehatan/Ketenagakerjaan.
      </TabsContent>
      <TabsContent value="tax" className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-sm text-slate-300">
        Pemotongan pajak PPh 21 menggunakan tarif efektif rata-rata (Kategori A, B, C) sesuai PMK 168/2023.
      </TabsContent>
    </Tabs>
  ),
}
