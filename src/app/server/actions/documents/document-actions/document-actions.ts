'use server';

import { z } from 'zod';
import { createEmbedding } from '@/lib/openai/openai';
import { getDocumentsByQueryVector } from '@/lib/db/tables/documents/documents';
import { createOrRetrieveDocument } from '@/lib/db/tables/documents/documents';
import { revalidatePath } from 'next/cache';

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

// 1) Zod schema for server validation
const documentSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

export async function uploadDocumentAction(
  data: z.infer<typeof documentSchema>,
) {
  // Validate again
  const validated = documentSchema.safeParse(data);
  if (!validated.success) {
    return { error: 'VALIDATION_ERROR', details: validated.error.flatten() };
  }

  // 2) create embedding
  const embedding = await createEmbedding(data.content);

  // 3) insert or retrieve
  try {
    const docs = await createOrRetrieveDocument({
      title: data.title,
      content: data.content,
      embedding,
    });

    // Docs without embedding
    const documents = docs.map(doc => ({
      id: doc.id,
      title: doc.title,
      content: doc.content,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    return documents;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    // Possibly detect duplicates or other errors
    if (errorMessage.startsWith('DUPLICATE_DOCUMENT')) {
      return { error: 'Document already exists' };
    }
    return { error: errorMessage };
  } finally {
    revalidatePath('/documents');
  }
}
