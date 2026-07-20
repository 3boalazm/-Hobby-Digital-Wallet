import { extendTheme } from '@chakra-ui/react'

/**
 * Chakra theme scope for the Horizon dashboard foundation only.
 * TREK's existing appearance system (theme/schemes.ts + theme/applyAppearance.ts,
 * backed by the real `appearance` setting in settingsStore) is untouched by this
 * file — this theme is applied locally inside <HorizonDashboardLayout>, not
 * globally in main.tsx/App.tsx, so the rest of the Tailwind-styled app is
 * unaffected.
 */
const horizonChakraTheme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: '#e9f2ff',
      100: '#c2d9ff',
      500: '#4318ff',
      600: '#3311db',
      700: '#2111a5',
    },
  },
  styles: {
    global: {
      body: {
        bg: 'inherit',
      },
    },
  },
})

export default horizonChakraTheme
