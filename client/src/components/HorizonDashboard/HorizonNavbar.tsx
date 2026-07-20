import React from 'react'
import { Flex, Heading, Spacer, IconButton } from '@chakra-ui/react'
import { MdMenu } from 'react-icons/md'
import HorizonThemeToggle from './HorizonThemeToggle'

interface HorizonNavbarProps {
  title?: string
  /** Opens the mobile sidebar drawer — only rendered below the `lg` breakpoint. */
  onOpenMobileNav: () => void
}

/**
 * Horizon-style top bar: page title + theme toggle, plus a hamburger button
 * (mobile only) that opens HorizonSidebar's drawer.
 * Search / notifications / user menu are left as follow-ups once this
 * shell carries real pages and real user data.
 */
export default function HorizonNavbar({ title = 'Dashboard', onOpenMobileNav }: HorizonNavbarProps): React.ReactElement {
  return (
    <Flex as="header" align="center" h="80px" px={{ base: '16px', lg: '32px' }} borderBottom="1px solid" borderColor="gray.100">
      <IconButton
        aria-label="Open menu"
        icon={<MdMenu />}
        display={{ base: 'inline-flex', lg: 'none' }}
        variant="ghost"
        mr="12px"
        onClick={onOpenMobileNav}
      />
      <Heading size="md">{title}</Heading>
      <Spacer />
      <HorizonThemeToggle />
    </Flex>
  )
}
