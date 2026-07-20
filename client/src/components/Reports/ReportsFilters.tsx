import React from 'react'
import { Flex, Select, Input } from '@chakra-ui/react'
import type { WalletCategory } from '@trek/shared'
import type { ReportsTypeFilter } from '../../pages/reports/useReports'

interface ReportsFiltersProps {
  typeFilter: ReportsTypeFilter
  onTypeChange: (value: ReportsTypeFilter) => void
  categoryFilter: string
  onCategoryChange: (value: string) => void
  categories: WalletCategory[]
  dateFrom: string
  onDateFromChange: (value: string) => void
  dateTo: string
  onDateToChange: (value: string) => void
}

export default function ReportsFilters({
  typeFilter,
  onTypeChange,
  categoryFilter,
  onCategoryChange,
  categories,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}: ReportsFiltersProps): React.ReactElement {
  return (
    <Flex gap="12px" flexWrap="wrap">
      <Select value={typeFilter} onChange={(e) => onTypeChange(e.target.value as ReportsTypeFilter)} maxW="160px" bg="white">
        <option value="all">All types</option>
        <option value="deposit">Deposits</option>
        <option value="withdraw">Withdrawals</option>
      </Select>
      <Select value={categoryFilter} onChange={(e) => onCategoryChange(e.target.value)} maxW="180px" bg="white">
        <option value="all">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.name}>
            {c.name}
          </option>
        ))}
      </Select>
      <Input type="date" value={dateFrom} onChange={(e) => onDateFromChange(e.target.value)} maxW="160px" bg="white" />
      <Input type="date" value={dateTo} onChange={(e) => onDateToChange(e.target.value)} maxW="160px" bg="white" />
    </Flex>
  )
}
