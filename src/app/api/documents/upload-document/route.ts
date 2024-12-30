import { createDocument } from '@/lib/db/tables/documents/documents';
import { createEmbedding } from '@/lib/openai/openai';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse | Response> {
  const { searchParams } = new URL(request.url);

  const title = searchParams.get('title');
  const content = searchParams.get('content');

  if (!title || !content) {
    return NextResponse.json(
      { error: 'Missing title or content' },
      { status: 400 },
    );
  }

  try {
    const embedding = await createEmbedding(content);

    const newDocument = await createDocument({
      title,
      content,
      embedding,
    });

    return NextResponse.json(newDocument, { status: 201 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
