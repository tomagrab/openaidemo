'use client';

import { useTheme } from 'next-themes';
import React, { createContext, useContext, useState, ReactNode } from 'react';

type OpenAIDemoContextValue = {
  headerEmoji: string | null;
  setHeaderEmoji: (emoji: string | null) => void;

  theme: string | undefined;
  setTheme: React.Dispatch<React.SetStateAction<string>>;

  homePageContent: string;
  setHomePageContent: React.Dispatch<React.SetStateAction<string>>;
};

const OpenAIDemoContext = createContext<OpenAIDemoContextValue | undefined>(
  undefined,
);

type OpenAIDemoProviderProps = {
  children: ReactNode;
};

export function OpenAIDemoProvider({ children }: OpenAIDemoProviderProps) {
  const [headerEmoji, setHeaderEmoji] = useState<string | null>(null);
  const [homePageContent, setHomePageContent] = useState<string>(
    `
# Welcome to the OpenAI Demo

This is a demo of using OpenAI's API to create a chat widget and a home page with Markdown content.

## Features

- Chat widget with voice detection
- Light and dark themes
- Markdown-rendered home page

## Usage

1. Click on the chat widget to start a conversation.
2. Type your message and press Enter to send.
3. Click the microphone icon to enable voice detection.

Enjoy! 🚀
    `,
  );

  const { theme, setTheme } = useTheme();

  const value: OpenAIDemoContextValue = {
    headerEmoji,
    setHeaderEmoji,
    theme,
    setTheme,
    homePageContent,
    setHomePageContent,
  };

  // 6) Return the provider
  return (
    <OpenAIDemoContext.Provider value={value}>
      {children}
    </OpenAIDemoContext.Provider>
  );
}

// 7) A custom hook to use the context
export function useOpenAIDemoContext() {
  const ctx = useContext(OpenAIDemoContext);
  if (!ctx) {
    throw new Error(
      'useOpenAIDemoContext must be used inside an <OpenAIDemoProvider>.',
    );
  }
  return ctx;
}
