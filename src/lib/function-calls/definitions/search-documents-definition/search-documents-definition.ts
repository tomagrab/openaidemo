export const searchDocumentsDefinition = {
  type: 'function',
  name: 'searchDocuments',
  description: `
      Perform a semantic search across user documents.
      1) The "query" is the search query or phrase.
      2) The "limit" is how many documents to return (optional).
      3) The function will retrieve matching documents and display them to the user.
    `,
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query, e.g. "How to add a user in V-Track"',
      },
      limit: {
        type: 'number',
        description:
          'How many documents to return (optional, default 10). Must be >= 1.',
      },
    },
    // We only require "query" (the user can omit "limit" if they like).
    required: ['query'],
  },
};
