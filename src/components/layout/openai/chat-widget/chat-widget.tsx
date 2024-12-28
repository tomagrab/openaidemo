'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRealtimeAPI } from '@/hooks/openai/use-realtime-api/use-realtime-api';
import ChatWidgetHeader from '@/components/layout/openai/chat-widget/chat-widget-header/chat-widget-header';
import ChatWidgetBody from './chat-widget-body/chat-widget-body';
import ChatWidgetFooter from './chat-widget-footer/chat-widget-footer';
import { MessageSquareIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
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
    refreshPage,

    sessionLoading,
    rtcLoading,
    isResponseInProgress,
  } = useRealtimeAPI();

  // Combine ephemeral key creation error + RTC errors
  const combinedError = sessionError || micAccessError || connectionError;

  // Ref for auto-scroll
  const bottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div
      className={cn(
        open
          ? 'fixed bottom-8 right-8 flex h-[600px] w-[400px] flex-col rounded border border-border bg-background shadow-lg transition-all duration-300 ease-in-out animate-in'
          : 'fixed bottom-8 right-8 flex h-12 w-12 flex-col items-center justify-center overflow-hidden rounded-full bg-blue-500 text-white shadow-lg transition-all duration-300 ease-in-out hover:bg-blue-400',
      )}
    >
      {open ? (
        <>
          {/* Header */}
          <ChatWidgetHeader
            setOpen={setOpen}
            turnDetection={turnDetection}
            toggleVADMode={toggleVADMode}
            sessionLoading={sessionLoading}
            rtcLoading={rtcLoading}
            combinedError={combinedError}
          />

          {/* MESSAGES SCREEN (scrollable) */}
          <ChatWidgetBody
            combinedError={combinedError}
            retryEphemeralKey={retryEphemeralKey}
            refreshPage={refreshPage}
            micAccessError={micAccessError}
            messages={messages}
            bottomRef={bottomRef}
          />

          {/* FOOTER with Input + "Generating..." UI */}
          <ChatWidgetFooter
            isResponseInProgress={isResponseInProgress}
            sessionLoading={sessionLoading}
            rtcLoading={rtcLoading}
            combinedError={combinedError}
            userInput={userInput}
            setUserInput={setUserInput}
            handleSend={handleSend}
          />
        </>
      ) : (
        <MessageSquareIcon
          className="flex-1 cursor-pointer"
          onClick={() => setOpen(true)}
        />
      )}
    </div>
  );
}
