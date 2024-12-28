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