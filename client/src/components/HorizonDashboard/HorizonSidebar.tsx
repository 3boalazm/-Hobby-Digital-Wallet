import React from 'react'
import { Box, Flex, Text, VStack, Link as ChakraLink, Drawer, DrawerOverlay, DrawerContent } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import type { NavItem } from '../../models/dashboardLayout'

interface HorizonSidebarProps {
  navItems: NavItem[]
  activePath: string
  /** Mobile drawer state (below the `lg` breakpoint). Desktop always shows the fixed rail regardless of these. */
  isMobileOpen: boolean
  onMobileClose: () => void
}

interface NavListProps {
  navItems: NavItem[]
  activePath: string
  /** Closes the mobile drawer after a tap, so navigating doesn't leave it open over the new page. */
  onNavigate?: () => void
}

function NavList({ navItems, activePath, onNavigate }: NavListProps) {
  return (
    <VStack align="stretch" spacing="4px">
      {navItems.map((item) => {
        const isActive = activePath === item.path
        const Icon = item.icon
        return (
          <ChakraLink key={item.id} as={Link} to={item.path} onClick={onNavigate} _hover={{ textDecoration: 'none' }}>
            <Flex
              align="center"
              gap="12px"
              px="16px"
              py="12px"
              borderRadius="12px"
              bg={isActive ? 'brand.50' : 'transparent'}
              color={isActive ? 'brand.600' : 'gray.600'}
              fontWeight={isActive ? '600' : '500'}
            >
              <Icon size={20} />
              <Text fontSize="sm">{item.label}</Text>
            </Flex>
          </ChakraLink>
        )
      })}
    </VStack>
  )
}

/**
 * Horizon-style left sidebar. Fixed on desktop (lg and up, unchanged from
 * before); below that it renders inside a Chakra Drawer toggled from
 * HorizonNavbar's hamburger button, instead of squeezing a 280px rail into a
 * phone-width viewport. TREK's own mobile nav
 * (components/Layout/BottomNav.tsx) is untouched — this is scoped to pages
 * using HorizonDashboardLayout only.
 */
export default function HorizonSidebar({ navItems, activePath, isMobileOpen, onMobileClose }: HorizonSidebarProps): React.ReactElement {
  return (
    <>
      <Box
        as="nav"
        display={{ base: 'none', lg: 'block' }}
        w="280px"
        h="100vh"
        position="fixed"
        left="0"
        top="0"
        bg="white"
        _dark={{ bg: 'gray.900' }}
        borderRight="1px solid"
        borderColor="gray.100"
        px="24px"
        py="32px"
        overflowY="auto"
      >
        <Text fontSize="lg" fontWeight="bold" mb="40px" lineHeight="1.3">
          Hobby Digital Wallet
        </Text>
        <NavList navItems={navItems} activePath={activePath} />
      </Box>

      <Drawer isOpen={isMobileOpen} placement="left" onClose={onMobileClose}>
        <DrawerOverlay />
        <DrawerContent bg="white" _dark={{ bg: 'gray.900' }} maxW="280px" px="24px" py="32px">
          <Text fontSize="lg" fontWeight="bold" mb="40px" lineHeight="1.3">
            Hobby Digital Wallet
          </Text>
          <NavList navItems={navItems} activePath={activePath} onNavigate={onMobileClose} />
        </DrawerContent>
      </Drawer>
    </>
  )
}
