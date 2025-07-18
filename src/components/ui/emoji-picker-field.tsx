import * as React from "react"
import EmojiPicker from "emoji-picker-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

// Define the emoji click data interface based on emoji-picker-react documentation
interface EmojiClickData {
  emoji: string
  unified: string
  names: string[]
  isCustom: boolean
}

interface EmojiPickerFieldProps {
  value?: string
  onChange: (emoji: string | undefined) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function EmojiPickerField({
  value,
  onChange,
  label,
  placeholder = "Select emoji",
  disabled = false,
  className = "",
}: EmojiPickerFieldProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onChange(emojiData.emoji)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(undefined)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </Label>
      )}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className="w-full h-20 flex flex-col items-center justify-center gap-2 relative"
          >
            {value ? (
              <>
                <span className="text-3xl">{value}</span>
                <span className="text-xs text-muted-foreground">Click to change</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={handleClear}
                >
                  <X className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-lg border-2 border-dashed border-muted-foreground/50 flex items-center justify-center">
                  <span className="text-lg">🏢</span>
                </div>
                <span className="text-xs text-muted-foreground">{placeholder}</span>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 border-0 shadow-lg" 
          align="start"
          style={{ zIndex: 9999 }}
        >
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width={350}
            height={400}
            searchDisabled={false}
            skinTonesDisabled={true}
            previewConfig={{
              showPreview: false
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
