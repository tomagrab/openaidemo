import openai from '@/lib/openai/assistants/client/client';
import {
  Assistant,
  AssistantTool,
  AssistantUpdateParams,
} from 'openai/resources/beta/assistants.mjs';

/**
 * Create an Assistant
 * https://platform.openai.com/docs/api-reference/assistants/createAssistant
 */
export async function createAssistant(
  name: string,
  instructions: string,
  model: string,
  tools: AssistantTool[] = [],
): Promise<Assistant> {
  const assistant = await openai.beta.assistants.create({
    name,
    instructions,
    model,
    // Must match the shape for code_interpreter/file_search/function
    tools,
  });

  // Convert null fields to empty string if you like, or preserve them as null
  return {
    id: assistant.id,
    created_at: assistant.created_at,
    description: assistant.description,
    instructions: assistant.instructions,
    metadata: assistant.metadata,
    model: assistant.model,
    name: assistant.name,
    object: assistant.object,
    tools: assistant.tools,
    tool_resources: assistant.tool_resources,
  };
}

/**
 * Update an Assistant to attach new tool resources
 * e.g., adding vector_store_ids for file_search or file_ids for code_interpreter
 */
export async function updateAssistant(
  assistantId: string,
  toolResources: AssistantUpdateParams.ToolResources,
): Promise<Assistant> {
  // The official type for .update expects a well-formed `tool_resources`.
  // If you just have an unknown shape, you'd do:
  //   tool_resources: toolResources as AssistantUpdateParams.ToolResources
  // But better to define it precisely in your code.
  const updated = await openai.beta.assistants.update(assistantId, {
    tool_resources: toolResources,
  });

  return {
    id: updated.id,
    created_at: updated.created_at,
    description: updated.description,
    instructions: updated.instructions,
    metadata: updated.metadata,
    model: updated.model,
    name: updated.name,
    object: updated.object,
    tools: updated.tools,
    tool_resources: updated.tool_resources,
  };
}
