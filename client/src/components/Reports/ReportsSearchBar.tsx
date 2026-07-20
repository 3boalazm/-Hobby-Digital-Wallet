import React from 'react'
import { InputGroup, InputLeftElement, Input } from '@chakra-ui/react'
import { MdSearch } from 'react-icons/md'

interface ReportsSearchBarProps {
  value: string
  onChange: (value: string) => void
}

/** Free-text search over a transaction's note/category/type — client-side, same list the table and export use. */
export default function ReportsSearchBar({ value, onChange }: ReportsSearchBarProps): React.ReactElement {
  return (
    <InputGroup maxW="320px">
      <InputLeftElement pointerEvents="none">
        <MdSearch color="var(--chakra-colors-gray-400)" />
      </InputLeftElement>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search note, category, type…"
        bg="white"
      />
    </InputGroup>
  )
}
