'use client';

import React, { useEffect, useRef } from 'react';
import { useRealtimeAPI } from '@/hooks/openai/use-realtime-api/use-realtime-api';
import ChatWidgetHeader from '@/components/layout/openai/chat-widget/chat-widget-header/chat-widget-header';
import ChatWidgetBody from './chat-widget-body/chat-widget-body';
import ChatWidgetFooter from './chat-widget-footer/chat-widget-footer';

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
    <div className="fixed bottom-4 right-4 flex h-[600px] w-[400px] flex-col rounded border border-border shadow-lg">
      {/* HEADER */}
      <ChatWidgetHeader
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
    </div>
  );
}
