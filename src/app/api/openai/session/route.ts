import { CUSTOM_INSTRUCTIONS } from '@/lib/openai/custom-instructions/custom-instructions';
import { RealtimeAPISession } from '@/lib/types/openai/openai';
import { NextResponse } from 'next/server';

export async function POST() {
  const openAiApiKey = process.env.OPENAI_API_KEY;
  if (!openAiApiKey) {
    return NextResponse.json(
      { error: 'Missing OPENAI_API_KEY in environment' },
      { status: 500 },
    );
  }

  try {
    // Create a Realtime session with text-only by default (no 'voice' param)
    const resp = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.NEXT_PUBLIC_REALTIME_DEFAULT_MODEL,
        modalities: ['text'],
        instructions: CUSTOM_INSTRUCTIONS,
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
