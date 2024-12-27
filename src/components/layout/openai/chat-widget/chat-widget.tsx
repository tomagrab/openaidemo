'use client';

import React from 'react';
import { Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useRealtimeAPI } from '@/hooks/openai/use-realtime-api/use-realtime-api';
import { MarkdownRenderer } from '../../markdown/markdown-renderer/markdown-renderer';

export default function ChatWidget() {
  const {
    messages,
    userInput,
    setUserInput,
    handleSend,
    sessionError,
    sessionLoading,
  } = useRealtimeAPI();

  // If ephemeral key creation failed:
  if (sessionError) {
    return <div className="text-red-500">Error: {String(sessionError)}</div>;
  }

  // If ephemeral key is still being created:
  if (sessionLoading) {
    return <div>Minting ephemeral key…</div>;
  }

  return (
    <div className="fixed bottom-4 right-4 flex h-[600px] w-[400px] flex-col rounded border border-border shadow-lg">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b px-3 py-2">
        <h2 className="font-semibold">Chat Widget</h2>
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
