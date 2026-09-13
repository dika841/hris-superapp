import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card'
import { Button } from '../../primitives/button'
import { Users } from '@phosphor-icons/react'

const meta: Meta = {
  title: 'Section/Card',
  tags: ['autodocs'],
}

export default meta

export const MetricCard: StoryObj = {
  render: () => (
    <Card className="w-80 glass-panel glass-panel-hover">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-medium text-slate-400">Total Active Workforce</CardTitle>
        <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
          <Users className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white">1,248</div>
        <p className="text-xs text-emerald-400 mt-1 font-medium">+12% from last fiscal quarter</p>
      </CardContent>
    </Card>
  ),
}

export const ActionCard: StoryObj = {
  render: () => (
    <Card className="w-96 glass-panel">
      <CardHeader>
        <CardTitle>Payroll Batch Processing</CardTitle>
        <CardDescription>Generate salary slips and execute bulk disbursement.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-slate-300">
        Ready to process 124 records for Period 09/2026.
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="secondary" size="sm">Cancel</Button>
        <Button variant="primary" size="sm">Start Batch</Button>
      </CardFooter>
    </Card>
  ),
}
