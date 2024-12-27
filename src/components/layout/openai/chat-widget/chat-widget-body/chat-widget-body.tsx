import { MarkdownRenderer } from '@/components/layout/markdown/markdown-renderer/markdown-renderer';
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/lib/types/openai/openai';

type ChatWidgetBodyProps = {
  combinedError: object | null;
  retryEphemeralKey: () => void;
  refreshPage: () => void;
  micAccessError: string | null;
  messages: ChatMessage[];
  bottomRef: React.RefObject<HTMLDivElement | null>;
};

export default function ChatWidgetBody({
  combinedError,
  retryEphemeralKey,
  refreshPage,
  micAccessError,
  messages,
  bottomRef,
}: ChatWidgetBodyProps) {
  return (
    <div className="flex-1 space-y-3 overflow-y-auto p-3">
      {combinedError ? (
        <div className="rounded bg-red-500 p-3 text-white">
          <p>
            You are receiving the following error: {combinedError?.toString()}
          </p>
          {micAccessError ? (
            <p>
              You are also receiving the following microphone access error:{' '}
              {micAccessError}
            </p>
          ) : null}
          <p>
            Sometimes errors like these are triggered erroneously. Retrying the
            connection or refreshing the page may resolve the issue.
          </p>
          <div className="flex justify-between pt-2">
            <Button variant={'default'} onClick={retryEphemeralKey}>
              Retry connection
            </Button>
            <Button variant={'destructive'} onClick={refreshPage}>
              Refresh page
            </Button>
          </div>
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
