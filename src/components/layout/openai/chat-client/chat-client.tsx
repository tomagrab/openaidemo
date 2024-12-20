'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SendIcon, VolumeOff, Volume2 } from 'lucide-react';
import { useRealtimeConnection } from '@/hooks/openai/use-realtime-connection/use-realtime-connection';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MarkdownRenderer } from '../../markdown/markdown-renderer/markdown-renderer';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [voiceMode, setVoiceMode] = useState<boolean>(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('verse');

  const { connected, error, responseText, sendMessage, attemptReconnect } =
    useRealtimeConnection({ voiceMode, selectedVoice });

  // Handle form submission: add a user message and send to the Realtime API
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    setMessages(prev => [...prev, { role: 'user', content: trimmed }]);
    sendMessage(trimmed);
    setInputValue('');
  }

  // Update assistant messages when responseText changes
  useEffect(() => {
    if (responseText && responseText.length > 0) {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'assistant') {
          return [
            ...prev.slice(0, prev.length - 1),
            { ...last, content: responseText },
          ];
        } else {
          return [...prev, { role: 'assistant', content: responseText }];
        }
      });
    }
    // If responseText is empty, do nothing
  }, [responseText]);

  return (
    <div className="fixed bottom-8 right-8 flex h-[600px] w-[400px] flex-col rounded-lg border border-border shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-2">
        <div className="text-sm font-semibold">Realtime Chat</div>
        <div className="flex items-center gap-2">
          {/* Voice mode toggle */}
          <button
            onClick={() => setVoiceMode(prev => !prev)}
            className="flex items-center justify-center rounded p-2"
          >
            {voiceMode ? (
              <Volume2 className="h-4 w-4 text-gray-700" />
            ) : (
              <VolumeOff className="h-4 w-4 text-gray-700" />
            )}
          </button>

          {/* Voice selection */}
          <Select
            value={selectedVoice}
            onValueChange={value => {
              setSelectedVoice(value);
              // After changing voice, user can click reconnect if needed
            }}
          >
            <SelectTrigger className="w-24 text-sm">
              <SelectValue placeholder="Voice" />
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
        </div>
      </div>

      {/* Body */}
      {!connected && !error && (
        <div className="flex flex-1 items-center justify-center p-4 text-sm text-gray-700">
          Connecting to Realtime API... Please wait.
        </div>
      )}

      {error && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-4">
          <p className="text-sm text-red-500">Unable to connect: {error}</p>
          <Button variant="secondary" onClick={attemptReconnect}>
            Attempt to Reconnect
          </Button>
        </div>
      )}

      {connected && !error && (
        <>
          <ScrollArea className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col gap-2 p-2">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[80%] whitespace-pre-wrap rounded p-2 text-sm ${
                    m.role === 'user'
                      ? 'ml-auto self-end bg-blue-500 text-right'
                      : 'mr-auto self-start bg-green-500 text-left'
                  }`}
                >
                  <MarkdownRenderer content={m.content} />
                </div>
              ))}
            </div>
          </ScrollArea>
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-border p-2"
          >
            <Textarea
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 resize-none text-sm"
            />
            <button
              type="submit"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              <SendIcon />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
