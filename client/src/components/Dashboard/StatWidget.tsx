import React from 'react'
import { Flex, Icon, Stat, StatLabel, StatNumber } from '@chakra-ui/react'
import type { IconType } from 'react-icons'

interface StatWidgetProps {
  label: string
  value: number
  icon: IconType
  accentColor: string
  prefix?: string
  /** 'currency' (default, unchanged) renders "$12.34"; 'count' renders a plain integer, for stats like a transaction count that aren't money. */
  format?: 'currency' | 'count'
}

/** Reusable stat card — Current Balance / Income / Expense / Reports' stat cards all render through this. */
export default function StatWidget({ label, value, icon: IconComp, accentColor, prefix = '', format = 'currency' }: StatWidgetProps): React.ReactElement {
  return (
    <Flex borderRadius="20px" border="1px solid" borderColor="gray.100" p="20px" align="center" gap="16px">
      <Flex w="56px" h="56px" borderRadius="16px" bg={accentColor} color="white" align="center" justify="center" flexShrink={0}>
        <Icon as={IconComp} boxSize={6} />
      </Flex>
      <Stat>
        <StatLabel color="gray.500">{label}</StatLabel>
        <StatNumber fontSize="2xl">
          {format === 'count' ? value.toLocaleString() : `${prefix}$${value.toFixed(2)}`}
        </StatNumber>
      </Stat>
    </Flex>
  )
}
