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

export async function createEmbedding(text: string) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    dimensions: 3,
    // optionally: encoding_format: 'float',
    // optionally: dimensions: 512 (if you want to shorten embeddings)
  });
  const [{ embedding }] = response.data;
  return embedding; // an array of floats
}
