import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY in .env');
}

/**
 * Create a single OpenAI client instance
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // This header is required by the new Assistants Beta endpoints
  // The official Node/OpenAI library automatically sets the right headers
  // if you call `openai.beta...`, but if needed manually:
  // baseURL: 'https://api.openai.com/v1',
  // headers: {
  //   'OpenAI-Beta': 'assistants=v2',
  // },
});

export default openai;
