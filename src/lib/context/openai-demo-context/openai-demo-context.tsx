'use client';

import { useTheme } from 'next-themes';
import React, { createContext, useContext, useState, ReactNode } from 'react';

// 1) Define the shape of your global state
type OpenAIDemoContextValue = {
  headerEmoji: string | null;
  setHeaderEmoji: (emoji: string | null) => void;

  // e.g. theme-related states:
  theme: string | undefined;
  setTheme: React.Dispatch<React.SetStateAction<string>>;

  // e.g. other states:
  homePageContent: string;
  setHomePageContent: React.Dispatch<React.SetStateAction<string>>;
};

// 2) Create a context with a default (some fallback)
const OpenAIDemoContext = createContext<OpenAIDemoContextValue | undefined>(
  undefined,
);

// 3) The Provider component
type OpenAIDemoProviderProps = {
  children: ReactNode;
  // If you want to pass initial states via props, you can
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

export const setHeaderEmojiDefinition = {
  type: 'function',
  name: 'setHeaderEmoji',
  description: 'Set the chat widget header emoji',
  parameters: {
    type: 'object',
    properties: {
      emoji: {
        type: 'string',
        description: 'The emoji to update the header with',
      },
    },
    required: ['emoji'],
  },
};

export const setThemeDefinition = {
  type: 'function',
  name: 'setTheme',
  description: 'Set the theme of the chat widget',
  parameters: {
    type: 'object',
    properties: {
      theme: {
        type: 'string',
        description: 'The theme to set',
        enum: ['light', 'dark', 'system'],
      },
    },
    required: ['theme'],
  },
};

export const setHomePageContentDefinition = {
  type: 'function',
  name: 'setHomePageContent',
  description: 'Set the Markdown content of the home page',
  parameters: {
    type: 'object',
    properties: {
      content: {
        type: 'string',
        description: 'The Markdown content to set',
      },
    },
    required: ['content'],
  },
};
