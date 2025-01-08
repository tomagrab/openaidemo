import openai from '@/lib/openai/assistants/client/client';
import { Thread } from 'openai/resources/beta/threads/threads.mjs';

/**
 * Create a new conversation Thread
 * https://platform.openai.com/docs/api-reference/threads
 */
export async function createThread(): Promise<Thread> {
  const thread = await openai.beta.threads.create();

  return {
    id: thread.id,
    created_at: thread.created_at,
    metadata: thread.metadata,
    object: thread.object,
    tool_resources: thread.tool_resources,
  };
}

/**
 * Create a Thread with initial user message(s).
 */
export async function createThreadWithInitialMessage(
  initialMessage: string,
): Promise<Thread> {
  const thread = await openai.beta.threads.create({
    messages: [
      {
        role: 'user',
        content: initialMessage,
      },
    ],
  });

  return {
    id: thread.id,
    created_at: thread.created_at,
    metadata: thread.metadata,
    object: thread.object,
    tool_resources: thread.tool_resources,
  };
}
