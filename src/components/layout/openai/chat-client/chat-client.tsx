'use client';

import { LoaderIcon, SendIcon, Volume2Icon, VolumeOffIcon } from 'lucide-react';
import { useState, useEffect, FormEvent, JSX } from 'react';
import { useRealtimeConnection } from '@/hooks/openai/use-realtime-connection/use-realtime-connection';
import { MarkdownRenderer } from '@/components/layout/markdown/markdown-renderer/markdown-renderer';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import capitalize from '@/lib/utilties/text/capitalize/capitalize';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatClient() {
  const [inputValue, setInputValue] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [voiceMode, setVoiceMode] = useState<boolean>(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('verse');

  const {
    loading,
    connected,
    error,
    responseText,
    sendMessage,
    attemptReconnect,
  } = useRealtimeConnection({ voiceMode, selectedVoice });

  const toggleVoiceMode = (voiceMode: boolean) => {
    setVoiceMode(voiceMode);
    attemptReconnect();
  };

  const changeVoice = (voice: string) => {
    setSelectedVoice(voice);
    attemptReconnect();
  };

  // Handle sending a user message
  function handleSendMessage(e: FormEvent) {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    setMessages(prev => [...prev, { role: 'user', content: trimmed }]);
    sendMessage(trimmed);
    setInputValue('');
  }

  // Sync streaming text from the Realtime API with messages array
  useEffect(() => {
    if (responseText && responseText.length > 0) {
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        // If the last message is from the assistant, just update it
        if (lastMessage?.role === 'assistant') {
          const updatedLast = { ...lastMessage, content: responseText };
          return [...prev.slice(0, -1), updatedLast];
        }
        // Otherwise, add a new assistant message
        return [...prev, { role: 'assistant', content: responseText }];
      });
    }
    // If responseText is cleared (''), we do nothing—it’ll be updated again soon by streaming
  }, [responseText]);

  // Helper to render messages
  const renderMessages = () => {
    return messages.map((m, i) => {
      const isUser = m.role === 'user';
      const messageClass = isUser
        ? 'ml-auto self-end bg-blue-500 text-right'
        : 'mr-auto self-start bg-green-500 text-left';

      return (
        <div
          key={i}
          className={`max-w-[80%] whitespace-pre-wrap rounded p-2 text-sm ${messageClass}`}
        >
          <MarkdownRenderer content={m.content} />
        </div>
      );
    });
  };

  // Render states for “connecting…”, “error…”, or “connected”
  let content: JSX.Element | null = null;

  if (!connected && !error && loading) {
    content = (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-4 text-sm text-gray-700">
        <LoaderIcon className="h-14 w-14 animate-spin" />
        Connecting to Realtime API... Please wait.
      </div>
    );
  } else if (error) {
    content = (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-4">
        <p className="text-sm text-red-500">Unable to connect: {error}</p>
        <Button variant="secondary" onClick={attemptReconnect}>
          Attempt to Reconnect
        </Button>
      </div>
    );
  } else {
    // connected and no error
    content = (
      <>
        <ScrollArea className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-2 p-2">
            {renderMessages()}
          </div>
        </ScrollArea>
        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-2 border-t border-border p-2"
        >
          <Textarea
            disabled={!connected || loading}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 resize-none text-sm"
          />
          <button
            disabled={!connected || loading}
            type="submit"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? <LoaderIcon className="animate-spin" /> : <SendIcon />}
          </button>
        </form>
      </>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 flex h-[600px] w-[400px] flex-col rounded-lg border border-border shadow-lg">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-border px-2">
        <div className="text-sm font-semibold">
          <h3>Realtime Chat</h3>
        </div>
        <div
          className={cn(
            'flex items-center',
            voiceMode ? 'gap-2' : 'opacity-50',
          )}
        >
          {voiceMode ? (
            <Select
              disabled={!connected || loading}
              defaultValue={selectedVoice}
              onValueChange={changeVoice}
            >
              <SelectTrigger>
                <SelectValue placeholder={capitalize(selectedVoice)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alloy">Alloy</SelectItem>
                <SelectItem value="ash">Ash</SelectItem>
                <SelectItem value="ballad">Ballad</SelectItem>
                <SelectItem value="coral">Coral</SelectItem>
                <SelectItem value="echo">Echo</SelectItem>
                <SelectItem value="sage">Sage</SelectItem>
                <SelectItem value="shimmer">Shimmer</SelectItem>
                <SelectItem value="verse">Verse</SelectItem>
              </SelectContent>
            </Select>
          ) : null}

          {voiceMode ? (
            <button
              disabled={!connected || loading}
              onClick={() => {
                toggleVoiceMode(false);
              }}
            >
              <Volume2Icon />
            </button>
          ) : (
            <button
              disabled={!connected || loading}
              onClick={() => toggleVoiceMode(true)}
            >
              <VolumeOffIcon />
            </button>
          )}
        </div>
      </div>
      {/* Body */}
      {content}
    </div>
  );
}
