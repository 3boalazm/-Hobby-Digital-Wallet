import React from 'react'
import { Button } from '@chakra-ui/react'
import { MdFileDownload } from 'react-icons/md'

interface ExportCsvButtonProps {
  onExport: () => void
  disabled?: boolean
}

export default function ExportCsvButton({ onExport, disabled }: ExportCsvButtonProps): React.ReactElement {
  return (
    <Button leftIcon={<MdFileDownload />} onClick={onExport} isDisabled={disabled} variant="outline">
      Export CSV
    </Button>
  )
}
