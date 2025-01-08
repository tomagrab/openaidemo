import openai from '@/lib/openai/assistants/client/client';
import { Message } from 'openai/resources/beta/threads/messages.mjs';

/**
 * Add a Message to an existing Thread
 * https://platform.openai.com/docs/api-reference/messages/createMessage
 */
export async function addMessageToThread(
  threadId: string,
  role: 'user' | 'assistant', // removed "system"
  content: string,
): Promise<Message> {
  const message = await openai.beta.threads.messages.create(threadId, {
    role,
    content,
  });

  return {
    id: message.id,
    assistant_id: message.assistant_id,
    attachments: message.attachments,
    completed_at: message.completed_at,
    content: message.content,
    created_at: message.created_at,
    incomplete_at: message.incomplete_at,
    incomplete_details: message.incomplete_details,
    metadata: message.metadata,
    object: message.object,
    role: message.role,
    run_id: message.run_id,
    status: message.status,
    thread_id: message.thread_id,
  };
}

/**
 * Attach a file to the message (for code_interpreter, etc.)
 */
export async function addMessageWithAttachmentToThread(
  threadId: string,
  content: string,
  fileId: string,
  toolType: 'code_interpreter' | 'file_search',
): Promise<Message> {
  const message = await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content,
    attachments: [
      {
        file_id: fileId,
        tools: [
          {
            type: toolType,
          },
        ],
      },
    ],
  });

  return {
    id: message.id,
    assistant_id: message.assistant_id,
    attachments: message.attachments,
    completed_at: message.completed_at,
    content: message.content,
    created_at: message.created_at,
    incomplete_at: message.incomplete_at,
    incomplete_details: message.incomplete_details,
    metadata: message.metadata,
    object: message.object,
    role: message.role,
    run_id: message.run_id,
    status: message.status,
    thread_id: message.thread_id,
  };
}
