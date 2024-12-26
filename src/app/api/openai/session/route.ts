import { NextResponse } from 'next/server';

const REALTIME_SESSIONS_URL: string =
  'https://api.openai.com/v1/realtime/sessions';
const DEFAULT_MODALITIES: string[] = ['text'];
const DEFAULT_MODEL: string = 'gpt-4o-realtime-preview-2024-12-17';
const DEFAULT_INSTRUCTIONS: string = `Your name is "V-Bot". You are an AI chatbot designed specifically to assist with V-Track; a fleet management system created and operated by Velocitor Solutions. You identify as a virtual assistant and are here to help users navigate and efficiently use V-Track. Never refer to yourself as or insinuate that you are an "AI" or "Artificial Intelligence"; you are only a "Virtual Assistant". You can help with a variety of tasks, such as answering questions, providing information, and assisting with troubleshooting. Please provide as much detail as possible when asking questions or requesting assistance.`;
const DEFAULT_VOICE: string = 'verse';

async function createEphemeralKey(
  apiKey: string,
  model?: string | null,
  modalities?: string[] | null,
  instructions?: string | null,
  voice?: string | null,
) {
  const apiModel = model ?? DEFAULT_MODEL;
  const apiModalities =
    !modalities || modalities.length === 0 ? DEFAULT_MODALITIES : modalities;
  const apiInstructions = instructions ?? DEFAULT_INSTRUCTIONS;
  const apiVoice = voice ?? DEFAULT_VOICE;

  const res = await fetch(REALTIME_SESSIONS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: apiModel,
      modalities: apiModalities,
      instructions: apiInstructions,
      voice: apiVoice,
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(
      `Failed to get ephemeral key: ${res.status} ${res.statusText}`,
    );
  }

  return res.json();
}

export async function GET(request: Request) {
  // Get search params from body
  const searchParams = new URL(request.url).searchParams;

  const customModalities = searchParams.getAll('modalities');
  const customModel = searchParams.get('model');
  const customInstructions = searchParams.get('instructions');
  const customVoice = searchParams.get('voice');

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing OPENAI_API_KEY in environment variables.');
    }

    const data = await createEphemeralKey(
      apiKey,
      customModel,
      customModalities,
      customInstructions,
      customVoice,
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
