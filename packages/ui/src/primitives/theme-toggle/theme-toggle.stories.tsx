import type { Meta, StoryObj } from '@storybook/react'
import { ThemeToggle } from './theme-toggle'

const meta: Meta<typeof ThemeToggle> = {
  title: 'Primitives/ThemeToggle',
  component: ThemeToggle,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ThemeToggle>

export const IconOnly: Story = {
  args: {
    showLabel: false,
  },
}

export const WithLabel: Story = {
  args: {
    showLabel: true,
  },
}
