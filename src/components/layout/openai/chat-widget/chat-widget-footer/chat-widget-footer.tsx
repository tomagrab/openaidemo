import React, { useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { SendIcon } from 'lucide-react';

type ChatWidgetFooterProps = {
  isResponseInProgress: boolean;
  sessionLoading: boolean;
  rtcLoading: boolean;
  combinedError: object | null;
  userInput: string;
  setUserInput: (value: string) => void;
  handleSend: () => void;
};

export default function ChatWidgetFooter({
  isResponseInProgress,
  sessionLoading,
  rtcLoading,
  combinedError,
  userInput,
  setUserInput,
  handleSend,
}: ChatWidgetFooterProps) {
  // 1) Keep a ref so we can programmatically focus the textarea
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // 2) Re-focus the textarea whenever it becomes enabled again
  useEffect(() => {
    // If the textarea is NOT disabled, let's focus it
    if (
      !isResponseInProgress &&
      !sessionLoading &&
      !rtcLoading &&
      !combinedError
    ) {
      textareaRef.current?.focus();
    }
  }, [isResponseInProgress, sessionLoading, rtcLoading, combinedError]);

  // 3) A small helper: handle Enter vs. Shift+Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Only send if there's input
      if (userInput.trim()) {
        handleSend();
      }
    }
    // If Shift+Enter, default behavior is to insert a newline
  };

  return (
    <div className="flex flex-col border-t p-2">
      {isResponseInProgress && (
        <div className="mb-2 text-sm text-gray-700">
          <em>🧠 Thinking...</em>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Textarea
          ref={textareaRef} // pass the ref here
          disabled={
            isResponseInProgress ||
            sessionLoading ||
            rtcLoading ||
            !!combinedError
          }
          className="flex-1 resize-none"
          placeholder="Type your message…"
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown} // handle Enter vs Shift+Enter
        />
        <button
          disabled={
            isResponseInProgress ||
            sessionLoading ||
            rtcLoading ||
            !!combinedError ||
            !userInput
          }
          onClick={handleSend}
          className="rounded-full bg-blue-500 p-2 text-white hover:bg-blue-400 disabled:cursor-not-allowed disabled:bg-blue-600 disabled:opacity-50"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}
