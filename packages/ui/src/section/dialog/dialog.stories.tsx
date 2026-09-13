import type { Meta, StoryObj } from '@storybook/react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from './dialog'
import { Button } from '../../primitives/button'

const meta: Meta = {
  title: 'Section/Dialog',
  tags: ['autodocs'],
}

export default meta

export const InteractiveModal: StoryObj = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="primary">Open Confirmation Modal</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Tax Period Closing</DialogTitle>
          <DialogDescription>
            Are you sure you want to close September 2026 payroll? This action will generate tax report slips (1721-A1) and cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive">Confirm & Lock Period</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}
