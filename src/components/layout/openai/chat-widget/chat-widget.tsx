'use client';

import React, { useEffect, useRef } from 'react';
import { Send, Volume2Icon, VolumeOffIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { MarkdownRenderer } from '@/components/layout/markdown/markdown-renderer/markdown-renderer';
import { useRealtimeAPI } from '@/hooks/openai/use-realtime-api/use-realtime-api';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function ChatWidget() {
  const {
    messages,
    userInput,
    setUserInput,
    handleSend,
    turnDetection,
    toggleVADMode,

    sessionError,
    micAccessError,
    connectionError,
    retryEphemeralKey,

    sessionLoading,
    rtcLoading,
  } = useRealtimeAPI();

  // 4. Scroll-to-bottom logic
  const bottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 1. Combine ephemeral key creation error + RTC errors
  const combinedError = sessionError || micAccessError || connectionError;

  // 2. If ephemeral key or connection is loading, show granular states
  if (sessionLoading) {
    return <div className="p-4">Minting ephemeral key…</div>;
  }
  if (rtcLoading) {
    return <div className="p-4">Connecting to Realtime…</div>;
  }

  // 3. If we have an error, show "Retry" or fallback instructions
  if (combinedError) {
    return (
      <div className="p-4 text-red-500">
        <p>Error: {combinedError?.toString()}</p>
        <button
          onClick={retryEphemeralKey}
          className="mt-2 rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
        >
          Retry
        </button>
        {/* Optionally show mic instructions if mic access was denied */}
        {micAccessError && (
          <div className="mt-2">
            Please enable microphone access in your browser settings and try
            again.
          </div>
        )}
      </div>
    );
  }

  // 6. Example usage of function calls
  //    Suppose the model wants to call "generate_horoscope" with sign: "Aquarius"
  //    Once we see the final function call in handleResponseDone, we parse
  //    functionCallBuffer -> do some logic -> provideFunctionOutput().
  //    For brevity, we won't show the entire flow here.

  return (
    <div className="fixed bottom-4 right-4 flex h-[600px] w-[400px] flex-col rounded border border-border shadow-lg">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b px-3 py-2">
        <h2 className="font-semibold">Chat Widget</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger onClick={() => toggleVADMode()}>
              {turnDetection ? <Volume2Icon /> : <VolumeOffIcon />}
            </TooltipTrigger>
            <TooltipContent>
              {turnDetection
                ? 'Voice is enabled. Click to disable.'
                : 'Voice is disabled. Click to enable.'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* MESSAGES SCREEN (scrollable) */}
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
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

      {/* INPUT AREA */}
      <div className="flex items-center gap-2 border-t p-2">
        <Textarea
          className="flex-1 resize-none"
          placeholder="Type your message…"
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
        />
        <button
          onClick={handleSend}
          className="rounded-full bg-blue-600 p-2 hover:bg-blue-700"
        >
          <Send size="16" />
        </button>
      </div>
    </div>
  );
}
