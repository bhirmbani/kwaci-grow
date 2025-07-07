import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Command } from "cmdk"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxOption {
  value: string
  label: string
  isNew?: boolean
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onValueChange?: (value: string) => void
  onCreateNew?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
  allowCreate?: boolean
}

export function Combobox({
  options,
  value,
  onValueChange,
  onCreateNew,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No option found.",
  className,
  disabled = false,
  allowCreate = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const selectedOption = options.find((option) => option.value === value)

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase())
  )

  const showCreateOption = allowCreate && 
    searchValue.trim() !== "" && 
    !filteredOptions.some(option => option.label.toLowerCase() === searchValue.toLowerCase())

  const handleSelect = (selectedValue: string) => {
    if (selectedValue === value) {
      onValueChange?.("")
    } else {
      onValueChange?.(selectedValue)
    }
    setOpen(false)
    setSearchValue("")
  }

  const handleCreateNew = () => {
    if (searchValue.trim() && onCreateNew) {
      onCreateNew(searchValue.trim())
      setOpen(false)
      setSearchValue("")
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-11 px-4 py-2 text-left font-normal",
            "border-2 border-border/50 hover:border-border transition-all duration-200",
            "focus:border-primary focus:ring-2 focus:ring-primary/20",
            "data-[state=open]:border-primary data-[state=open]:ring-2 data-[state=open]:ring-primary/20",
            !selectedOption && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          {selectedOption ? (
            <span className="flex items-center gap-2 truncate">
              {selectedOption.isNew && (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
                  New
                </span>
              )}
              <span className="truncate">{selectedOption.label}</span>
            </span>
          ) : (
            <span className="truncate">{placeholder}</span>
          )}
          <ChevronsUpDown className={cn(
            "ml-2 h-4 w-4 shrink-0 transition-transform duration-200",
            open ? "rotate-180" : "rotate-0",
            "opacity-50 group-hover:opacity-70"
          )} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 shadow-lg border-2" align="start">
        <Command className="rounded-lg">
          <div className="border-b border-border/50">
            <Command.Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onValueChange={setSearchValue}
              className="h-11 px-4 text-sm border-0 focus:ring-0 focus:outline-none placeholder:text-muted-foreground/70"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              {showCreateOption ? (
                <div className="px-2 py-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left h-auto py-2 px-3 hover:bg-accent/50 transition-colors"
                    onClick={handleCreateNew}
                  >
                    <span className="text-muted-foreground">Create "</span>
                    <span className="font-medium text-foreground">{searchValue}</span>
                    <span className="text-muted-foreground">"</span>
                  </Button>
                </div>
              ) : (
                emptyText
              )}
            </Command.Empty>
            <Command.Group>
              {filteredOptions.map((option) => (
                <Command.Item
                  key={option.value}
                  value={option.value}
                  onSelect={handleSelect}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
                    "hover:bg-accent/50 aria-selected:bg-accent",
                    "focus:bg-accent focus:outline-none",
                    value === option.value && "bg-accent/30"
                  )}
                >
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0 transition-opacity",
                      value === option.value ? "opacity-100 text-primary" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {option.isNew && (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
                        New
                      </span>
                    )}
                    <span className="truncate text-sm">{option.label}</span>
                  </div>
                </Command.Item>
              ))}
              {showCreateOption && (
                <Command.Item
                  value={`create-${searchValue}`}
                  onSelect={handleCreateNew}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-accent/50 aria-selected:bg-accent focus:bg-accent focus:outline-none text-primary"
                >
                  <span className="h-4 w-4 shrink-0" />
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-muted-foreground">Create "</span>
                    <span className="font-medium text-foreground">{searchValue}</span>
                    <span className="text-muted-foreground">"</span>
                  </div>
                </Command.Item>
              )}
            </Command.Group>
          </Command.List>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
