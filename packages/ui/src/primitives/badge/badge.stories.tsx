import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './badge'

const meta: Meta<typeof Badge> = {
  title: 'Primitives/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'success', 'destructive', 'warning', 'info', 'outline'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Badge>

export const Success: Story = {
  args: {
    children: 'Active Employee',
    variant: 'success',
  },
}

export const Warning: Story = {
  args: {
    children: 'Pending Review',
    variant: 'warning',
  },
}

export const Destructive: Story = {
  args: {
    children: 'Contract Terminated',
    variant: 'destructive',
  },
}

export const Info: Story = {
  args: {
    children: 'PMK 168/2023 Verified',
    variant: 'info',
  },
}

export const Outline: Story = {
  args: {
    children: 'PTKP: TK/0',
    variant: 'outline',
  },
}
