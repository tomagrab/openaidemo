import openai from '@/lib/openai/assistants/client/client';
import { Run } from 'openai/resources/beta/threads/runs/runs.mjs';

/**
 * Create a Run (non-streaming)
 * https://platform.openai.com/docs/api-reference/runs
 */
export async function createRun(
  threadId: string,
  assistantId: string,
): Promise<Run> {
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
  });
  return run;
}

/**
 * Stream a Run and handle tokens or other events in real-time.
 *
 * IMPORTANT:
 *  - The library's typed events do NOT include "done" or "requires_action".
 *  - Instead, watch for "end" (when SSE stream fully ends)
 *  - Or watch for "event" (to handle things like thread.run.requires_action).
 */
export async function streamRun(
  threadId: string,
  assistantId: string,
  onData: (token: string) => void,
  onComplete?: (finalRun: Run) => void,
): Promise<void> {
  // Create a streaming SSE run
  const runStream = openai.beta.threads.runs.stream(threadId, {
    assistant_id: assistantId,
    // e.g. model, instructions, or other overrides if needed
  });

  // Example 1: Listen to "textCreated" event => The assistant started sending text
  runStream.on('textCreated', () => {
    onData('\nAssistant: ');
  });

  // Example 2: Listen to "textDelta" => The assistant appends small text chunks
  runStream.on('textDelta', delta => {
    // delta.value typically is the newly streamed text
    onData(delta.value ?? '');
  });

  // Example 3: Catch all SSE events via "event"
  // Many "event.event" types exist (e.g. 'thread.run.requires_action', 'thread.run.completed', etc.)
  runStream.on('event', evt => {
    switch (evt.event) {
      case 'thread.run.requires_action':
        // The model invoked one or more function calls or code_interpreter steps that must be resolved
        onData('\n[requires action: handle function calls here]\n');
        break;

      case 'thread.run.completed':
        // The run is completed — but note the SSE may still have final steps to stream
        // We'll also rely on 'end' event below for the final `runStream.finalRun()`.
        onData('\n[assistant run completed]\n');
        break;

      default:
        // Potentially handle other event types like 'thread.run.step.delta', 'thread.message.delta', etc.
        break;
    }
  });

  // Example 4: Listen for SSE "end" => The entire stream is finished
  runStream.on('end', async () => {
    // The SSE connection ended. We can attempt to get final run from the stream:
    try {
      const finalRun = await runStream.finalRun();
      onComplete?.(finalRun);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      // If something prevented finalRun from being retrieved
      // (like a tool call that wasn't completed, or an SSE error),
      // handle that here.
      // console.error('Error retrieving final run:', error);
      onComplete?.({
        id: 'unknown',
        assistant_id: assistantId,
        cancelled_at: null,
        completed_at: null,
        created_at: Math.floor(Date.now() / 1000),
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        failed_at: Math.floor(Date.now() / 1000),
        incomplete_details: {},
        instructions: '',
        last_error: {
          code: 'server_error',
          message: errorMessage,
        },
        max_completion_tokens: 0,
        max_prompt_tokens: 0,
        metadata: {},
        model: '',
        object: 'thread.run',
        parallel_tool_calls: false,
        required_action: null,
        response_format: 'auto',
        started_at: Math.floor(Date.now() / 1000),
        status: 'failed',
        thread_id: threadId,
        tool_choice: 'none',
        tools: [],
        truncation_strategy: {
          type: 'auto',
        },
        usage: {
          completion_tokens: 0,
          prompt_tokens: 0,
          total_tokens: 0,
        },
      });
    }
  });

  // (Optional) Listen for SSE "error"
  runStream.on('error', error => {
    // The stream encountered an error
    // You can handle or surface to UI
    onData(`\n[stream error: ${error.message}]\n`);
  });
}
