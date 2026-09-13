import type { Preview } from '@storybook/react'
import * as React from 'react'
import '../src/styles/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'dark', value: '#141419' },
        { name: 'light', value: '#fcfcfc' },
      ],
    },
  },
  decorators: [
    (Story, context) => {
      const bgValue = context.globals.backgrounds?.value
      const isDark = bgValue ? bgValue !== '#fcfcfc' : true

      React.useEffect(() => {
        const root = document.documentElement
        if (isDark) {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      }, [isDark])

      return (
        <div className={`p-4 antialiased transition-colors ${isDark ? 'dark text-foreground' : 'text-foreground'}`}>
          <Story />
        </div>
      )
    },
  ],
}

export default preview
