'use client';

import { userLocation } from '@/lib/types/context/user-location/user-location';
import { WeatherResponse } from '@/lib/types/open-meteo/weather-api/weather-api';
import { ConversationItem } from '@/lib/types/openai/realtime/conversation/conversation-item/conversation-item';
import { ConversationState } from '@/lib/types/openai/realtime/conversation/conversation-state/conversation-state';
import { useTheme } from 'next-themes';
import React, { createContext, useContext, useState, ReactNode } from 'react';

type OpenAIDemoContextValue = {
  headerEmoji: string | null;
  setHeaderEmoji: (emoji: string | null) => void;

  theme: string | undefined;
  setTheme: React.Dispatch<React.SetStateAction<string>>;

  homePageContent: string | null;
  setHomePageContent: React.Dispatch<React.SetStateAction<string | null>>;

  userLocation: userLocation | null;
  setUserLocation: React.Dispatch<React.SetStateAction<userLocation | null>>;

  weatherData: WeatherResponse | null;
  setWeatherData: React.Dispatch<React.SetStateAction<WeatherResponse | null>>;

  conversation: ConversationState | null;
  setConversation: React.Dispatch<
    React.SetStateAction<ConversationState | null>
  >;

  addConversationItem: (item: ConversationItem) => void;

  chatWidgetEnabled: boolean;
  setChatWidgetEnabled: React.Dispatch<React.SetStateAction<boolean>>;
};

const OpenAIDemoContext = createContext<OpenAIDemoContextValue | undefined>(
  undefined,
);

type OpenAIDemoProviderProps = {
  children: ReactNode;
};

export function OpenAIDemoProvider({ children }: OpenAIDemoProviderProps) {
  const [headerEmoji, setHeaderEmoji] = useState<string | null>(null);
  const [homePageContent, setHomePageContent] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<userLocation | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [conversation, setConversation] = useState<ConversationState | null>(
    null,
  );
  const [chatWidgetEnabled, setChatWidgetEnabled] = useState(true);

  const addConversationItem = (item: ConversationItem) => {
    setConversation(prev => {
      if (!prev) {
        // If there's no conversation yet, you might create one or do nothing
        return null;
      }
      return {
        ...prev,
        items: [...prev.items, item],
      };
    });
  };

  const { theme, setTheme } = useTheme();

  const value: OpenAIDemoContextValue = {
    headerEmoji,
    setHeaderEmoji,
    theme,
    setTheme,
    homePageContent,
    setHomePageContent,
    userLocation,
    setUserLocation,
    weatherData,
    setWeatherData,
    conversation,
    setConversation,
    addConversationItem,
    chatWidgetEnabled,
    setChatWidgetEnabled,
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
