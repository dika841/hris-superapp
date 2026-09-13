import type { Meta, StoryObj } from '@storybook/react'
import { FormItem, FormLabel, FormControl, FormDescription, FormMessage } from './form-field'
import { Input } from '../../primitives/input'

const meta: Meta = {
  title: 'Compositions/FormField',
  tags: ['autodocs'],
}

export default meta

export const DefaultField: StoryObj = {
  render: () => (
    <div className="w-80">
      <FormItem>
        <FormLabel isRequired>Tax ID (NPWP)</FormLabel>
        <FormControl>
          <Input placeholder="01.234.567.8-901.000" />
        </FormControl>
        <FormDescription>Format 15 digit sesuai kartu NPWP perusahaan.</FormDescription>
      </FormItem>
    </div>
  ),
}

export const WithError: StoryObj = {
  render: () => (
    <div className="w-80">
      <FormItem>
        <FormLabel isRequired>Email Address</FormLabel>
        <FormControl>
          <Input isError defaultValue="invalid-email" />
        </FormControl>
        <FormMessage>Format email tidak valid (contoh: user@company.com)</FormMessage>
      </FormItem>
    </div>
  ),
}
