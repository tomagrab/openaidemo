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