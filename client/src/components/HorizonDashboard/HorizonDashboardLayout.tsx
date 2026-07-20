import React from 'react'
import { ChakraProvider, Box, useDisclosure } from '@chakra-ui/react'
import HorizonSidebar from './HorizonSidebar'
import HorizonNavbar from './HorizonNavbar'
import horizonChakraTheme from '../../theme/horizonChakraTheme'
import type { DashboardLayoutProps } from '../../models/dashboardLayout'

/**
 * Root shell for the Horizon dashboard foundation.
 * ChakraProvider is scoped HERE, not in main.tsx/App.tsx, so the rest of
 * TREK's Tailwind-styled app is completely unaffected. Business logic
 * (auth, sync, real trip/budget data) is untouched — `children` is
 * whatever the consuming page passes in.
 *
 * Responsive: the 280px sidebar is fixed on desktop (lg+) as before; below
 * that it collapses into a drawer (useDisclosure here owns the open/closed
 * state) opened via HorizonNavbar's hamburger button, and the content
 * column's left margin drops to 0 so nothing is pushed off-screen on a
 * phone-width viewport.
 */
export default function HorizonDashboardLayout({
  navItems,
  activePath,
  children,
  title,
}: DashboardLayoutProps): React.ReactElement {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <ChakraProvider theme={horizonChakraTheme}>
      <HorizonSidebar navItems={navItems} activePath={activePath} isMobileOpen={isOpen} onMobileClose={onClose} />
      <Box ml={{ base: 0, lg: '280px' }}>
        <HorizonNavbar title={title} onOpenMobileNav={onOpen} />
        <Box as="main" p={{ base: '16px', lg: '32px' }}>
          {children}
        </Box>
      </Box>
    </ChakraProvider>
  )
}
