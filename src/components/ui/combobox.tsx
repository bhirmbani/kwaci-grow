"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
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
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
  allowCreate?: boolean
  onCreateNew?: (value: string) => void
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No option found.",
  className,
  disabled = false,
  allowCreate = false,
  onCreateNew,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return options
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [options, searchValue])

  const selectedOption = options.find((option) => option.value === value)
  const showCreateOption = allowCreate && searchValue && !filteredOptions.length && onCreateNew

  const handleSelect = React.useCallback(
    (selectedValue: string) => {
      if (selectedValue === value) {
        onValueChange?.("")
      } else {
        onValueChange?.(selectedValue)
      }
      setOpen(false)
      setSearchValue("")
    },
    [value, onValueChange]
  )

  const handleCreateNew = React.useCallback(() => {
    if (searchValue && onCreateNew) {
      onCreateNew(searchValue)
      setOpen(false)
      setSearchValue("")
    }
  }, [searchValue, onCreateNew])

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {selectedOption?.isNew && (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
                New
              </span>
            )}
            <span className="truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] p-0 z-[9999]" 
        align="start"
        side="bottom"
        sideOffset={4}
        avoidCollisions={true}
        collisionPadding={8}
      >
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
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
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {option.isNew && (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
                        New
                      </span>
                    )}
                    <span className="truncate">{option.label}</span>
                  </div>
                </CommandItem>
              ))}
              {showCreateOption && (
                <CommandItem
                  value={`create-${searchValue}`}
                  onSelect={handleCreateNew}
                  className="text-primary"
                >
                  <span className="mr-2 h-4 w-4" />
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Create "</span>
                    <span className="font-medium text-foreground">{searchValue}</span>
                    <span className="text-muted-foreground">"</span>
                  </div>
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
