import React from 'react'
import { Box, Heading, Text } from '@chakra-ui/react'
import HorizonDashboardLayout from '../components/HorizonDashboard/HorizonDashboardLayout'
import { useHorizonFoundation } from './horizonFoundation/useHorizonFoundation'

/**
 * Foundation/smoke-test page for the new Horizon dashboard shell.
 * Not linked from any nav yet — reachable at /horizon-foundation while the
 * shell is being built out. Existing pages (DashboardPage, SettingsPage,
 * AdminPage, etc.) are untouched.
 */
export default function HorizonFoundationPage(): React.ReactElement {
  const { navItems, activePath } = useHorizonFoundation()

  return (
    <HorizonDashboardLayout navItems={navItems} activePath={activePath} title="Overview">
      <Box>
        <Heading size="lg" mb="8px">Horizon dashboard foundation</Heading>
        <Text color="gray.500">
          Layout, sidebar and theme are wired up. Real widgets/content land here next.
        </Text>
      </Box>
    </HorizonDashboardLayout>
  )
}
