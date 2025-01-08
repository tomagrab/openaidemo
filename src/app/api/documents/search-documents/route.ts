import { getDocumentsByQueryVector } from '@/lib/db/tables/documents/documents';
import { createEmbedding } from '@/lib/openai/assistants/client/client';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  let documents;
  const { searchParams } = new URL(request.url);

  const query = searchParams.get('query');
  const limit: number | null | undefined = searchParams.get('limit')
    ? parseInt(searchParams.get('limit')!)
    : undefined;

  if (!query) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  try {
    const queryVector = await createEmbedding(query);

    if (!!limit && (isNaN(limit) || limit <= 1)) {
      documents = await getDocumentsByQueryVector(queryVector, limit);
    } else {
      documents = await getDocumentsByQueryVector(queryVector);
    }

    return NextResponse.json(documents, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
