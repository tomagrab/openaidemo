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
  return (
    <div className="flex flex-col border-t p-2">
      {isResponseInProgress && (
        <div className="mb-2 text-sm text-gray-700">
          <em>Generating response...</em>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Textarea
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
        />
        <button
          disabled={
            isResponseInProgress ||
            sessionLoading ||
            rtcLoading ||
            !!combinedError
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
