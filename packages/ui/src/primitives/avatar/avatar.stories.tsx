import type { Meta, StoryObj } from '@storybook/react'
import { Avatar, AvatarImage, AvatarFallback } from './avatar'

const meta: Meta<typeof Avatar> = {
  title: 'Primitives/Avatar',
  component: Avatar,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Avatar>

export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=faces" alt="Avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
}

export const WithFallback: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback className="bg-indigo-600/30 text-indigo-300 font-semibold">BS</AvatarFallback>
    </Avatar>
  ),
}
