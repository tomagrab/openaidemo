import { createOrRetrieveDocument } from '@/lib/db/tables/documents/documents';
import { createEmbedding } from '@/lib/openai/assistants/client/client';
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

    const newDocument = await createOrRetrieveDocument({
      title,
      content,
      embedding,
    });

    return NextResponse.json(newDocument, { status: 201 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.startsWith('DUPLICATE_DOCUMENT')) {
      // 409 = Conflict
      return NextResponse.json(
        { error: 'Document already exists', details: errorMessage },
        { status: 409 },
      );
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
