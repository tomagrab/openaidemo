import { MarkdownRenderer } from '@/components/layout/markdown/markdown-renderer/markdown-renderer';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/lib/types/openai/openai';
import { cn } from '@/lib/utils';
import { LoaderIcon } from 'lucide-react';

type ChatWidgetBodyProps = {
  combinedError: object | null;
  handleReconnect: () => Promise<void>;
  retryEphemeralKey: () => void;
  refreshPage: () => void;
  micAccessError: string | null;
  loading: boolean;
  messages: ChatMessage[];
  bottomRef: React.RefObject<HTMLDivElement | null>;
};

export default function ChatWidgetBody({
  combinedError,
  handleReconnect,
  refreshPage,
  micAccessError,
  loading,
  messages,
  bottomRef,
}: ChatWidgetBodyProps) {
  const handleReconnectClick = async () => {
    handleReconnect();
  };

  return (
    <ScrollArea
      className={cn('flex-1 p-4', loading ? 'messages-screen-loading' : '')}
    >
      <div className='p-4" flex flex-1 flex-col'>
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
              Sometimes errors like these are triggered erroneously. Retrying
              the connection or refreshing the page may resolve the issue.
            </p>
            <div className="flex justify-between pt-2">
              <Button variant={'default'} onClick={handleReconnectClick}>
                Retry connection
              </Button>
              <Button variant={'destructive'} onClick={refreshPage}>
                Refresh page
              </Button>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="messages-screen-loader flex flex-1 flex-col items-center justify-center">
            <LoaderIcon className="h-8 w-8 animate-spin" />
          </div>
        ) : null}

        {messages.map(msg => (
          <div key={msg.id} className="flex flex-col p-4">
            {msg.role === 'user' ? (
              <div className="message-bubble flex max-w-min justify-end self-end rounded bg-blue-500 p-2">
                <MarkdownRenderer content={msg.content} />
              </div>
            ) : (
              <div className="message-bubble flex max-w-min justify-start self-start rounded bg-green-500 p-2">
                <MarkdownRenderer content={msg.content} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div ref={bottomRef} />
    </ScrollArea>
  );
}
