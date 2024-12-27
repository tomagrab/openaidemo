import { MarkdownRenderer } from '@/components/layout/markdown/markdown-renderer/markdown-renderer';
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/lib/types/openai/openai';

type ChatWidgetBodyProps = {
  combinedError: object | null;
  retryEphemeralKey: () => void;
  micAccessError: string | null;
  messages: ChatMessage[];
  bottomRef: React.RefObject<HTMLDivElement | null>;
};

export default function ChatWidgetBody({
  combinedError,
  retryEphemeralKey,
  micAccessError,
  messages,
  bottomRef,
}: ChatWidgetBodyProps) {
  return (
    <div className="flex-1 space-y-3 overflow-y-auto p-3">
      {combinedError ? (
        <div className="p-4 text-red-500">
          <p>Error: {combinedError?.toString()}</p>
          <Button onClick={retryEphemeralKey}>Retry connection</Button>
          {micAccessError && (
            <div className="mt-2">
              Please enable microphone access in your browser settings and try
              again.
            </div>
          )}
        </div>
      ) : null}

      {messages.map(msg => (
        <div key={msg.id} className="flex">
          {msg.role === 'user' ? (
            <div className="ml-auto max-w-[70%] rounded bg-blue-500 px-3 py-2">
              <MarkdownRenderer content={msg.content} />
            </div>
          ) : (
            <div className="mr-auto max-w-[70%] rounded bg-green-500 px-3 py-2">
              <MarkdownRenderer content={msg.content} />
            </div>
          )}
        </div>
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
