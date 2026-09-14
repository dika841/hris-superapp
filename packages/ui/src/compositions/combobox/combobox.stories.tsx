import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Combobox } from './combobox'

const frameworks = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'finance', label: 'Finance & Tax' },
  { value: 'product', label: 'Product & Design' },
  { value: 'people', label: 'People Operations' },
  { value: 'legal', label: 'Legal & Governance' },
]

const meta: Meta<typeof Combobox> = {
  title: 'Compositions/Combobox',
  component: Combobox,
  tags: ['autodocs'],
}

export default meta

export const Default: StoryObj<typeof Combobox> = {
  render: () => {
    const [val, setVal] = React.useState('')
    return (
      <div className="w-72">
        <Combobox
          options={frameworks}
          value={val}
          onChange={setVal}
          placeholder="Pilih Departemen..."
          searchPlaceholder="Cari departemen..."
        />
      </div>
    )
  },
}
