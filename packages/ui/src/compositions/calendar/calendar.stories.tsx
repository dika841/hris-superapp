import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Calendar } from './calendar'

const meta: Meta<typeof Calendar> = {
  title: 'Compositions/Calendar',
  component: Calendar,
  tags: ['autodocs'],
}

export default meta

export const Default: StoryObj<typeof Calendar> = {
  render: () => {
    const [date, setDate] = React.useState<Date | undefined>(new Date())
    return (
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border shadow-sm"
      />
    )
  },
}
