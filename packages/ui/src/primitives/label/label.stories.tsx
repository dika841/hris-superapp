import type { Meta, StoryObj } from '@storybook/react'
import { Label } from './label'

const meta: Meta<typeof Label> = {
  title: 'Primitives/Label',
  component: Label,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Label>

export const Standard: Story = {
  args: {
    children: 'Tax Identification Number (NPWP)',
  },
}

export const Required: Story = {
  args: {
    children: 'Employee Full Name',
    isRequired: true,
  },
}
