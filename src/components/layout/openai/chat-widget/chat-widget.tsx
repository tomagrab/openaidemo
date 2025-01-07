'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRealtimeAPI } from '@/hooks/openai/use-realtime-api/use-realtime-api';
import ChatWidgetHeader from '@/components/layout/openai/chat-widget/chat-widget-header/chat-widget-header';
import ChatWidgetBody from './chat-widget-body/chat-widget-body';
import ChatWidgetFooter from './chat-widget-footer/chat-widget-footer';
import { cn } from '@/lib/utils';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
} from '@/components/ui/context-menu';
import ChatWidgetContextMenuItems from '@/components/layout/openai/chat-widget/chat-widget-context-menu/chat-widget-context-menu-items/chat-widget-context-menu-items';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useOpenAIDemoContext } from '@/lib/context/openai-demo-context/openai-demo-context';
import Image from 'next/image';
import VBotLogo from 'pub/v-bot-logo.png';

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

  const { chatWidgetEnabled, setChatWidgetEnabled } = useOpenAIDemoContext();

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

  if (!chatWidgetEnabled) {
    return null;
  }

  return (
    <div
      id="chat-widget-root-div"
      className={cn(
        open
          ? 'animate-in fixed bottom-8 right-8 flex h-[600px] w-[400px] flex-col rounded border border-border bg-background shadow-lg transition-all duration-300 ease-in-out'
          : 'fixed bottom-8 right-8 flex h-12 w-12 flex-col items-center justify-center overflow-hidden rounded-full bg-velocitorBlue text-white shadow-lg transition-all duration-300 ease-in-out hover:bg-velocitorLightBlue',
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
        <ContextMenu>
          <ContextMenuTrigger>
            <div className="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 ease-in-out ">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger onClick={toggleVADMode}>
                  <Image className="flex-1 cursor-pointer" onClick={() => handleOpenWidget()} height={60} width={60} src={VBotLogo} alt="mic" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Right-click to disable the chat widget 🚫
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </ContextMenuTrigger>

          <ContextMenuContent>
            <ChatWidgetContextMenuItems
              setChatWidgetEnabled={setChatWidgetEnabled}
            />
          </ContextMenuContent>
        </ContextMenu>
      )}
    </div>
  );
}
