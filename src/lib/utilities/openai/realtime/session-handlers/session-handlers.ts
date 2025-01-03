import { setHeaderEmojiDefinition } from '@/lib/function-calls/definitions/set-header-emoji/set-header-emoji';
import { setThemeDefinition } from '@/lib/function-calls/definitions/set-theme/set-theme';
import { setHomePageContentDefinition } from '@/lib/function-calls/definitions/set-home-page-content/set-home-page-content';
import { getWeatherDefinition } from '@/lib/function-calls/definitions/get-weather-definition/get-weather-definition';
import { RealtimeServerEvent } from '@/lib/types/openai/openai';
import { toast } from 'sonner';
import { searchDocumentsDefinition } from '@/lib/function-calls/definitions/search-documents-definition/search-documents-definition';

function handleSessionCreated(
  // we can define a 'SessionCreatedEvent' if you want more detail, or just cast
  event: RealtimeServerEvent & {
    type: 'session.created';
    session: Record<string, unknown>;
  },
  opts: {
    sendSessionUpdate?: (partialSession: Record<string, unknown>) => void;
  },
) {
  // Possibly store session or do initial session.update
  if (opts.sendSessionUpdate) {
    opts.sendSessionUpdate({
      turn_detection: null,
      modalities: ['text'],
      tools: [
        setHeaderEmojiDefinition,
        setThemeDefinition,
        setHomePageContentDefinition,
        getWeatherDefinition,
        searchDocumentsDefinition,
      ],
      tool_choice: 'auto',
    });
  }
}

function handleSessionUpdated(
  event: RealtimeServerEvent & {
    type: 'session.updated';
    session: Record<string, unknown>;
  },
) {
  console.log('Session updated:', event);
  toast.success('Session updated');
}

export { handleSessionCreated, handleSessionUpdated };
