export const setHomePageContentDefinition = {
  type: 'function',
  name: 'setHomePageContent',
  description: 'Set the HTML content of the home page',
  parameters: {
    type: 'object',
    properties: {
      content: {
        type: 'string',
        description: 'The HTML content to set',
      },
    },
    required: ['content'],
  },
};
