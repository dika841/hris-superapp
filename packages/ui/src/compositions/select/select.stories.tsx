import type { Meta, StoryObj } from '@storybook/react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './select'

const meta: Meta = {
  title: 'Compositions/Select',
  tags: ['autodocs'],
}

export default meta

export const Default: StoryObj = {
  render: () => (
    <div className="w-64">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Pilih Kategori PTKP..." />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Tidak Kawin</SelectLabel>
            <SelectItem value="TK/0">TK/0 (Rp 54.000.000)</SelectItem>
            <SelectItem value="TK/1">TK/1 (Rp 58.500.000)</SelectItem>
            <SelectItem value="TK/2">TK/2 (Rp 63.000.000)</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Kawin</SelectLabel>
            <SelectItem value="K/0">K/0 (Rp 58.500.000)</SelectItem>
            <SelectItem value="K/1">K/1 (Rp 63.000.000)</SelectItem>
            <SelectItem value="K/2">K/2 (Rp 67.500.000)</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
}
