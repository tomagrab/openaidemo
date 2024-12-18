import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function createAssistant() {
  return await openai.beta.assistants.create({
    name: 'Next.js Assistant',
    instructions:
      'You are a Next.js helper that streams responses and searches files.',
    model: 'gpt-4o',
    tools: [
      { type: 'file_search' },
      {
        type: 'function',
        function: {
          name: 'exampleFunction',
          description: 'An example function for demo purposes',
          parameters: {
            type: 'object',
            properties: {
              exampleParam: {
                type: 'string',
                description: 'An example parameter',
              },
            },
            required: ['exampleParam'],
          },
        },
      },
    ],
  });
}
