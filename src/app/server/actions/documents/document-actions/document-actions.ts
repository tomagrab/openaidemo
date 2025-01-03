'use server';

import { getDocumentsByQueryVector } from '@/lib/db/tables/documents/documents';
import { createEmbedding } from '@/lib/openai/openai';
import { NextResponse } from 'next/server';

export const searchDocuments = async (
  query: string,
  limit: number = 10,
): Promise<
  | NextResponse<
      | {
          id: string;
          title: string | null;
          content: string | null;
          distance: unknown;
          createdAt: string;
          updatedAt: string;
        }[]
      | null
    >
  | NextResponse<{ error: string; status: number }>
> => {
  let queryVector;
  let documents;
  if (!query) {
    throw new Error('Missing query');
  }

  try {
    queryVector = await createEmbedding(query);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage, status: 500 });
  }

  try {
    if (!!limit && (isNaN(limit) || limit <= 1)) {
      documents = await getDocumentsByQueryVector(queryVector, limit);
    } else {
      documents = await getDocumentsByQueryVector(queryVector);
    }

    return NextResponse.json(documents, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage, status: 500 });
  }
};
