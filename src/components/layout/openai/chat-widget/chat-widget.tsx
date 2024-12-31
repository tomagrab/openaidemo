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
  const [ephemeralKeyLoading, setEphemeralKeyLoading] = useState(false);
  const {
    createEphemeralKey,
    init,
    closeSessionAndConnection,

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

    handleReconnect,

    sessionLoading,
    rtcLoading,
    isResponseInProgress,
  } = useRealtimeAPI();

  const handleOpenWidget = () => {
    setOpen(true);
    setEphemeralKeyLoading(true);

    // 1) Create ephemeral key
    createEphemeralKey({
      onSuccess: keyValue => {
        setEphemeralKeyLoading(false);
        // 2) Now that we have ephemeral key, call init
        init(keyValue);
      },
      onError: err => {
        setEphemeralKeyLoading(false);
        console.error('Ephemeral key creation failed:', err);
      },
    });
  };

  const handleCloseWidget = () => {
    setOpen(false);
    closeSessionAndConnection();
  };

  // Combine ephemeral key creation error + RTC errors
  const combinedError = sessionError || micAccessError || connectionError;

  // Ref for auto-scroll
  const bottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, [messages]);

  const loading = ephemeralKeyLoading || sessionLoading || rtcLoading;

  return (
    <div
      className={cn(
        open
          ? 'animate-in fixed bottom-8 right-8 flex h-[600px] w-[400px] flex-col rounded border border-border bg-background shadow-lg transition-all duration-300 ease-in-out'
          : 'fixed bottom-8 right-8 flex h-12 w-12 flex-col items-center justify-center overflow-hidden rounded-full bg-blue-500 text-white shadow-lg transition-all duration-300 ease-in-out hover:bg-blue-400',
      )}
    >
      {open ? (
        <>
          {/* Header */}
          <ChatWidgetHeader
            handleCloseWidget={handleCloseWidget}
            turnDetection={turnDetection}
            toggleVADMode={toggleVADMode}
            loading={loading}
            combinedError={combinedError}
          />

          {/* MESSAGES SCREEN (scrollable) */}
          <ChatWidgetBody
            combinedError={combinedError}
            handleReconnect={handleReconnect}
            retryEphemeralKey={retryEphemeralKey}
            refreshPage={refreshPage}
            micAccessError={micAccessError}
            loading={loading}
            messages={messages}
            bottomRef={bottomRef}
          />

          {/* FOOTER with Input + "Generating..." UI */}
          <ChatWidgetFooter
            isResponseInProgress={isResponseInProgress}
            loading={loading}
            combinedError={combinedError}
            userInput={userInput}
            setUserInput={setUserInput}
            handleSend={handleSend}
          />
        </>
      ) : (
        <MessageSquareIcon
          className="flex-1 cursor-pointer"
          onClick={() => handleOpenWidget()}
        />
      )}
    </div>
  );
}
