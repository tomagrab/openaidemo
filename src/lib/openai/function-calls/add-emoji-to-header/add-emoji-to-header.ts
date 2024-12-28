/**
 * This file exports a definition that describes a "function" the model can call,
 * plus an actual local function that implements "adding an emoji to the header".
 *
 * We'll define:
 *  1) A "FunctionCallDefinition" object that we can send in "session.tools" or "response.tools".
 *  2) A local "addEmojiToHeader" function we’ll call when the model requests it.
 */
export const addEmojiToHeaderDefinition = {
  // "type" is always "function"
  type: 'function',

  // "name" is how the model calls it
  name: 'add_emoji_to_header',

  // A short docstring
  description: 'Adds a user-specified emoji to the chat widget header.',

  // JSON schema describing arguments the model can pass:
  parameters: {
    type: 'object',
    properties: {
      emoji: {
        type: 'string',
        description: 'The desired emoji to place in the header.',
      },
    },
    required: ['emoji'],
  },
};

/**
 * The actual local function you’ll call once the model asks to add an emoji.
 *
 * We'll accept the "emoji" argument and do something like:
 *   setChatHeaderEmoji(emoji);
 * or store it in local state that the header reads from.
 */
export function addEmojiToHeader(args: { emoji: string }) {
  // For example, store it in a global or a React state that the header uses:
  // If using React, you might do setHeaderEmoji(args.emoji).
  // Or if you have a global store, you dispatch an action, etc.
  console.log('Adding emoji to header:', args.emoji);
}
