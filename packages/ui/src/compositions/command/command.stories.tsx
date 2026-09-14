import type { Meta, StoryObj } from '@storybook/react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './command'

const meta: Meta = {
  title: 'Compositions/Command',
  tags: ['autodocs'],
}

export default meta

export const Default: StoryObj = {
  render: () => (
    <div className="w-80 rounded-xl border border-border shadow-md">
      <Command>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>Calendar</CommandItem>
            <CommandItem>Search Employees</CommandItem>
            <CommandItem>Calculate Payroll</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>Profile</CommandItem>
            <CommandItem>Tax Configuration</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  ),
}
