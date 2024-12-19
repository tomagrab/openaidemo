'use client';

import { useState, FormEvent, useCallback, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SendIcon, VolumeOff, Volume2 } from 'lucide-react';
import { MarkdownRenderer } from '@/components/layout/markdown/markdown-renderer/markdown-renderer';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

import { useRealtimeSession } from '@/hooks/openai/use-realtime-session/use-realtime-session';
import { useRealtimeConnection } from '@/hooks/openai/use-realtime-connection/use-realtime-connection';
import { useTextMessaging } from '@/hooks/openai/use-text-messaging/use-text-messaging';
import { useAudioPlayback } from '@/hooks/openai/use-audio-playback/use-audio-playback';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [voiceMode, setVoiceMode] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('verse');

  // Session keys
  const { ephemeralKey, sessionError, initSession } =
    useRealtimeSession(selectedVoice);

  // Track events and error handlers
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);
  const handleTrack = useCallback((stream: MediaStream | null) => {
    setCurrentStream(stream);
  }, []);

  const [connError, setConnError] = useState<string | null>(null);
  const handleError = useCallback((err: string) => {
    setConnError(err);
  }, []);

  const handleOpen = useCallback(() => {
    setConnError(null);
  }, []);

  const handleClose = useCallback(() => {
    // connection closed
  }, []);

  // Only establish connection if we have an ephemeral key
  const canConnect = ephemeralKey !== null && !sessionError;

  // Text messaging logic
  const handleFinalText = useCallback((finalText: string) => {
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last && last.role === 'assistant') {
        return [...prev.slice(0, -1), { ...last, content: finalText }];
      } else {
        return [...prev, { role: 'assistant', content: finalText }];
      }
    });
  }, []);

  const { sendMessage, handleMessageEvent, responseText } = useTextMessaging({
    send: () => {},
    onTextResponse: handleFinalText,
  });

  const handleConnectionMessage = useCallback(
    (event: Record<string, unknown>) => {
      handleMessageEvent(
        event as {
          type: 'response.text.delta' | 'response.done';
          text?: string;
        },
      );
    },
    [handleMessageEvent],
  );

  const connectionInterface = useRealtimeConnection(
    canConnect
      ? {
          ephemeralKey: ephemeralKey!,
          voiceMode,
          onTrack: handleTrack,
          onMessage: handleConnectionMessage,
          onError: handleError,
          onOpen: handleOpen,
          onClose: handleClose,
        }
      : {
          ephemeralKey: null,
          voiceMode: false,
          onTrack: () => {},
          onMessage: () => {},
          onError: () => {},
          onOpen: () => {},
          onClose: () => {},
        },
  );

  const { connected, send } = connectionInterface;

  useEffect(() => {
    sendMessage('', voiceMode);
  }, [send, sendMessage, voiceMode]);

  useEffect(() => {
    if (responseText) {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'assistant') {
          return [...prev.slice(0, -1), { ...last, content: responseText }];
        } else {
          return [...prev, { role: 'assistant', content: responseText }];
        }
      });
    }
  }, [responseText]);

  useAudioPlayback(voiceMode, currentStream);

  const error = connError || sessionError;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    setMessages(prev => [...prev, { role: 'user', content: trimmed }]);
    sendMessage(trimmed, voiceMode);
    setInputValue('');
  }

  const attemptReconnect = () => {
    initSession();
  };

  return (
    <div className="fixed bottom-8 right-8 flex h-[400px] w-[300px] flex-col rounded-lg border border-border shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-2">
        <div className="text-sm font-semibold">Realtime Chat</div>
        <div className="flex items-center gap-2">
          {/* Voice mode toggle */}
          <button
            onClick={() => setVoiceMode(prev => !prev)}
            className="flex items-center justify-center rounded p-1"
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
            onValueChange={value => setSelectedVoice(value)}
          >
            <SelectTrigger className="w-24 text-sm">
              <SelectValue placeholder="Voice" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alloy">Alloy</SelectItem>
              <SelectItem value="ash">Ash</SelectItem>
              <SelectItem value="ballad">Ballad</SelectItem>
              <SelectItem value="coral">Coral</SelectItem>
              <SelectItem value="echo sage">Echo Sage</SelectItem>
              <SelectItem value="shimmer">Shimmer</SelectItem>
              <SelectItem value="verse">Verse</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Body */}
      {!connected && !error && (
        <div className="flex flex-1 items-center justify-center p-4 text-sm text-gray-700">
          {ephemeralKey === null
            ? 'Fetching session...'
            : 'Connecting to Realtime API... Please wait.'}
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
                  className={`max-w-[80%] rounded p-2 text-sm text-white ${
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
              disabled={!connected}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              <SendIcon size={16} />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
