import { Combobox } from '@/components/ui/combobox'
import { UNIT_OPTIONS } from '@/utils/cogsCalculations'
import { cn } from '@/lib/utils'

interface ComboboxOption {
  value: string
  label: string
  isNew?: boolean
}

interface UnitComboboxProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function UnitCombobox({
  value,
  onValueChange,
  placeholder = "Select or enter unit...",
  className,
  disabled = false,
}: UnitComboboxProps) {
  // Convert UNIT_OPTIONS to combobox options
  const options: ComboboxOption[] = UNIT_OPTIONS.map(unit => ({
    value: unit.value,
    label: unit.label,
  }))

  const handleCreateUnit = (unitValue: string) => {
    // For units, we just use the entered value directly
    onValueChange?.(unitValue.trim())
  }

  return (
    <div className={cn("w-full", className)}>
      <Combobox
        options={options}
        value={value}
        onValueChange={onValueChange}
        onCreateNew={handleCreateUnit}
        placeholder={placeholder}
        searchPlaceholder="Search units..."
        emptyText="No unit found."
        disabled={disabled}
        allowCreate={true}
      />
    </div>
  )
}