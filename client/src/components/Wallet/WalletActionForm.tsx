import React, { useState } from 'react'
import { Box, Button, HStack, NumberInput, NumberInputField, Select } from '@chakra-ui/react'
import type { WalletCategory } from '@trek/shared'

interface WalletActionFormProps {
  balance: number
  isSubmitting: boolean
  categories: WalletCategory[]
  onDeposit: (amount: number, note?: string) => void
  onWithdraw: (amount: number, note?: string, category?: string) => void
}

/**
 * Deposit/withdraw form. These client-side checks mirror the server's rules
 * (amount > 0; withdraw amount <= balance) purely for instant feedback — the
 * server re-validates independently in services/walletService.ts and is the
 * source of truth, so this is a convenience, not the real gate.
 *
 * The category selector only applies to withdrawals (it feeds the Expense
 * Categories chart) — deposits ignore it, since income isn't categorized.
 * `categories` now comes from the real, editable /wallet/categories
 * collection (see pages/wallet/useWallet.ts) instead of a fixed enum.
 */
export default function WalletActionForm({ balance, isSubmitting, categories, onDeposit, onWithdraw }: WalletActionFormProps): React.ReactElement {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<string>('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const effectiveCategory = category || categories[0]?.name

  function parseAmount(): number | null {
    const value = Number(amount)
    if (!amount || Number.isNaN(value) || value <= 0) {
      setValidationError('Enter an amount greater than 0.')
      return null
    }
    return value
  }

  function handleDeposit() {
    const value = parseAmount()
    if (value === null) return
    setValidationError(null)
    onDeposit(value)
    setAmount('')
  }

  function handleWithdraw() {
    const value = parseAmount()
    if (value === null) return
    if (value > balance) {
      setValidationError('Withdrawal cannot exceed the current balance.')
      return
    }
    setValidationError(null)
    onWithdraw(value, undefined, effectiveCategory)
    setAmount('')
  }

  return (
    <Box borderRadius="16px" border="1px solid" borderColor="gray.100" p="20px">
      <NumberInput value={amount} onChange={(value) => setAmount(value)} min={0} mb="12px">
        <NumberInputField placeholder="Amount" />
      </NumberInput>
      {categories.length > 0 && (
        <Select value={effectiveCategory} onChange={(e) => setCategory(e.target.value)} mb="12px" size="sm">
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name} {c.name === 'Other' ? '' : '(for withdrawals)'}
            </option>
          ))}
        </Select>
      )}
      {validationError && (
        <Box color="red.500" fontSize="sm" mb="12px">
          {validationError}
        </Box>
      )}
      <HStack spacing="12px">
        <Button colorScheme="green" onClick={handleDeposit} isLoading={isSubmitting}>
          Deposit
        </Button>
        <Button colorScheme="red" variant="outline" onClick={handleWithdraw} isLoading={isSubmitting}>
          Withdraw
        </Button>
      </HStack>
    </Box>
  )
}
