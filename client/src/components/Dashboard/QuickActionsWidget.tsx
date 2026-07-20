import React from 'react'
import { Box, Button, Heading, VStack } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { MdAdd, MdRemove, MdHistory } from 'react-icons/md'

interface QuickActionsWidgetProps {
  tripId?: string
}

/**
 * Fast-access shortcuts. These route to the wallet page's real deposit/
 * withdraw form (pages/WalletPage.tsx + components/Wallet/WalletActionForm.tsx)
 * instead of duplicating that form here, so there's one place that owns the
 * actual mutation UI.
 */
export default function QuickActionsWidget({ tripId }: QuickActionsWidgetProps): React.ReactElement {
  const navigate = useNavigate()
  const goToWallet = () => tripId && navigate(`/trips/${tripId}/wallet`)

  return (
    <Box borderRadius="20px" border="1px solid" borderColor="gray.100" p="20px">
      <Heading size="sm" mb="16px">
        Quick Actions
      </Heading>
      <VStack align="stretch" spacing="10px">
        <Button leftIcon={<MdAdd />} colorScheme="green" variant="outline" onClick={goToWallet} isDisabled={!tripId}>
          Deposit
        </Button>
        <Button leftIcon={<MdRemove />} colorScheme="red" variant="outline" onClick={goToWallet} isDisabled={!tripId}>
          Withdraw
        </Button>
        <Button leftIcon={<MdHistory />} variant="ghost" onClick={goToWallet} isDisabled={!tripId}>
          View full history
        </Button>
      </VStack>
    </Box>
  )
}
