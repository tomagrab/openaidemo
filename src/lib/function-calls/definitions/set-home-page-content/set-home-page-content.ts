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
