import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const voiceParam = searchParams.get('voice');

  const body: Record<string, string> = {
    model: 'gpt-4o-realtime-preview-2024-12-17',
  };
  if (voiceParam) {
    body.voice = voiceParam;
  }

  console.log('searchParams', searchParams);
  console.log('voiceParam', voiceParam);
  console.log('body', body);

  const res = await fetch('https://api.openai.com/v1/realtime/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: 'Failed to get ephemeral key' },
      { status: 500 },
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
