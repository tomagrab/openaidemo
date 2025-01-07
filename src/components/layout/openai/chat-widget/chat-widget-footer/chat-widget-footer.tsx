import React, { useEffect, useRef, useState } from 'react'
import { SendIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type ChatWidgetFooterProps = {
  isResponseInProgress: boolean
  loading: boolean
  combinedError: object | null
  userInput: string
  setUserInput: (value: string) => void
  handleSend: () => void
}

export default function ChatWidgetFooter({
  isResponseInProgress,
  loading,
  combinedError,
  userInput,
  setUserInput,
  handleSend,
}: ChatWidgetFooterProps) {
  const MAX_LENGTH = 250

  // We'll track the current character count in local state
  const [charCount, setCharCount] = useState(userInput.length)

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  // Focus the textarea whenever it's enabled
  useEffect(() => {
    if (!isResponseInProgress && !loading && !combinedError) {
      textareaRef.current?.focus()
    }
  }, [isResponseInProgress, loading, combinedError])

  // Autosize logic
  useEffect(() => {
    if (!textareaRef.current) return
    const el = textareaRef.current

    // 1) Temporarily reset height so scrollHeight is accurate
    el.style.height = '0px'
    // 2) Set to the exact scroll height
    el.style.height = `${el.scrollHeight}px`
  }, [userInput])

  // We'll handle user input changes here so we can
  // enforce the length limit and update charCount
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let val = e.target.value
    if (val.length > MAX_LENGTH) {
      val = val.slice(0, MAX_LENGTH)
    }
    setUserInput(val)
    setCharCount(val.length)
  }

  // Intercept Enter vs. Shift+Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (userInput.trim()) {
        handleSend()
      }
    }
  }

  // Show the character counter only after 99 chars
  const showCounter = charCount >= 99

  // Counter classes: turn red after 200 chars
  const counterClasses = cn(
    'absolute bottom-2 right-2 rounded px-1 text-xs',
    charCount >= 200 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
  )

  return (
    <div className="relative flex flex-col border-t p-2">
      {/* Optional "Thinking..." message */}
      {isResponseInProgress && (
        <div className="mb-2 text-sm text-gray-700">
          <em>Thinking...</em>
        </div>
      )}

      <div className="flex flex-col">
        {/* We'll wrap the textarea & button in a relative container */}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            placeholder="Type a question here..."
            className={cn(
-              'w-full resize-none overflow-hidden border border-gray-300 rounded-xl',
              'px-4 py-2 pr-14 leading-normal', // pr-14 => space for the button
              'focus:outline-none focus:ring-1 focus:ring-velocitorBlue'
            )}
            rows={1} // Start at single-line height
            maxLength={MAX_LENGTH} // Hard limit
            disabled={isResponseInProgress || loading || !!combinedError}
            value={userInput}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />

          {/* The send button is absolutely positioned inside the textarea */}
          <button
            type="button"
            disabled={
              isResponseInProgress ||
              loading ||
              !!combinedError ||
              !userInput.trim()
            }
            onClick={handleSend}
            className={cn(
              'absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center',
              'rounded-full bg-velocitorBlue text-white',
              'hover:bg-velocitorLightBlue disabled:cursor-not-allowed',
              'disabled:bg-velocitorDarkBlue disabled:opacity-50'
            )}
          >
            <SendIcon className="h-4 w-4" />
          </button>

          {/* Character counter, displayed only if >= 99 chars */}
          {showCounter && (
            <div className={counterClasses}>
              {charCount}/{MAX_LENGTH}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
