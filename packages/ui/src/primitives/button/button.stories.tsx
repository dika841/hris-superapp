import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'
import { Plus, ArrowRight, Trash } from '@phosphor-icons/react'

const meta: Meta<typeof Button> = {
  title: 'Primitives/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'outline', 'ghost', 'destructive', 'link'],
      description: 'The visual style variant of the button',
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg', 'icon'],
      description: 'The size profile of the button',
    },
    isLoading: {
      control: 'boolean',
      description: 'Shows an animated loading spinner and disables clicks',
    },
    disabled: {
      control: 'boolean',
    },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    children: 'Save Changes',
    variant: 'primary',
    size: 'default',
  },
}

export const Secondary: Story = {
  args: {
    children: 'Cancel',
    variant: 'secondary',
    size: 'default',
  },
}

export const Outline: Story = {
  args: {
    children: 'Export CSV',
    variant: 'outline',
    size: 'default',
  },
}

export const Destructive: Story = {
  args: {
    children: (
      <>
        <Trash className="h-4 w-4" />
        Terminate Contract
      </>
    ),
    variant: 'destructive',
    size: 'default',
  },
}

export const WithIcon: Story = {
  args: {
    children: (
      <>
        Add Employee
        <ArrowRight className="h-4 w-4" />
      </>
    ),
    variant: 'primary',
  },
}

export const Loading: Story = {
  args: {
    children: 'Processing Payroll...',
    variant: 'primary',
    isLoading: true,
  },
}

export const IconButton: Story = {
  args: {
    children: <Plus className="h-4 w-4" />,
    size: 'icon',
    variant: 'outline',
  },
}
