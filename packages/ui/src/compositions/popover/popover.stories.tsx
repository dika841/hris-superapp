import type { Meta, StoryObj } from '@storybook/react'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Button } from '../../primitives/button'

const meta: Meta = {
  title: 'Compositions/Popover',
  tags: ['autodocs'],
}

export default meta

export const Default: StoryObj = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open Popover</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Dimensions</h4>
            <p className="text-sm text-muted-foreground">
              Set the dimensions for the layer.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
}
