import React from 'react'
import { IconButton, useColorMode } from '@chakra-ui/react'
import { MdDarkMode, MdLightMode } from 'react-icons/md'

/**
 * Light/dark switch for the Horizon shell only.
 * Uses Chakra's local color-mode state — deliberately NOT wired to TREK's
 * real appearance/settings store yet (see theme/applyAppearance.ts).
 * Connecting this to the user's actual saved preference is a follow-up,
 * not part of this foundation pass.
 */
export default function HorizonThemeToggle(): React.ReactElement {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <IconButton
      aria-label="Toggle color mode"
      icon={colorMode === 'light' ? <MdDarkMode /> : <MdLightMode />}
      onClick={toggleColorMode}
      variant="ghost"
      borderRadius="full"
    />
  )
}
