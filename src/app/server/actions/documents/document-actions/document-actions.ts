'use server';

import { getDocumentsByQueryVector } from '@/lib/db/tables/documents/documents';
import { createEmbedding } from '@/lib/openai/openai';

type DocumentResult = {
  id: string;
  title: string | null;
  content: string | null;
  distance: unknown;
  createdAt: string;
  updatedAt: string;
};

type SuccessResponse = {
  documents: DocumentResult[] | null;
  status: 200;
};

type ErrorResponse = {
  error: string;
  status: 500;
};

export const searchDocuments = async (
  query: string,
  limit: number = 10,
): Promise<SuccessResponse | ErrorResponse> => {
  let queryVector;
  let documents: DocumentResult[] | null;

  if (!query) {
    throw new Error('Missing query');
  }

  try {
    queryVector = await createEmbedding(query);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return { error: errorMessage, status: 500 };
  }

  try {
    if (!!limit && (isNaN(limit) || limit <= 1)) {
      documents = await getDocumentsByQueryVector(queryVector, limit);
    } else {
      documents = await getDocumentsByQueryVector(queryVector);
    }

    return { documents, status: 200 };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return { error: errorMessage, status: 500 };
  }
};
