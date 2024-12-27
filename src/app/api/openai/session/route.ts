import { NextResponse } from 'next/server';

type RealtimeAPISession = {
  id: string;
  object: string;
  model: string;
  modalities: string[];
  instructions: string;
  voice: string;
  input_audio_format: string;
  output_audio_format: string;
  input_audio_transcription: {
    model: string;
  };
  turn_detection?: string;
  tools?: string[];
  tool_choice: string;
  temperature: number;
  max_response_output_tokens: number;
  client_secret: {
    value: string;
    expires_at: number;
  };
};

export async function POST() {
  const openAiApiKey = process.env.OPENAI_API_KEY;
  if (!openAiApiKey) {
    return NextResponse.json(
      { error: 'Missing OPENAI_API_KEY in environment' },
      { status: 500 },
    );
  }

  try {
    const resp = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2024-12-17',
        voice: 'verse',
      }),
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      return NextResponse.json({ error: errorText }, { status: 500 });
    }

    const data: RealtimeAPISession = await resp.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error }, { status: 500 });
  }
}
