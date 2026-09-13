import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './input'

const meta: Meta<typeof Input> = {
  title: 'Primitives/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    isError: { control: 'boolean' },
    type: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: {
    placeholder: 'Enter full name...',
  },
}

export const WithValue: Story = {
  args: {
    defaultValue: 'Budi Santoso',
  },
}

export const ErrorState: Story = {
  args: {
    defaultValue: 'invalid-email',
    isError: true,
  },
}

export const Disabled: Story = {
  args: {
    value: 'EMP-10029 (Auto-generated)',
    disabled: true,
  },
}
