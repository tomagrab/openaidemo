import { db } from '@/lib/db/db';
import {
  document,
  InsertDocument,
  SelectDocument,
} from '@/lib/db/schema/schema';
import { bigintReplacer } from '@/lib/utilities/numbers/big-int-replacer/big-int-replacer';
import { eq, sql } from 'drizzle-orm';

export const createDocument = async (data: InsertDocument) => {
  try {
    const newDocument = await db.insert(document).values(data);
    return newDocument;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    // For instance, "duplicate key value violates unique constraint"
    if (errorMessage.includes('duplicate key value')) {
      // We'll throw a new error that your client can parse for a known code
      throw new Error(`DUPLICATE_DOCUMENT: ${errorMessage}`);
    }

    // Otherwise, re-throw
    throw new Error(errorMessage);
  }
};

export const getDocuments = async (): Promise<SelectDocument[] | null> => {
  try {
    const documents = await db.select().from(document);
    return documents;
  } catch (error) {
    throw new Error(String(error));
  }
};

export const getDocumentById = async (
  id: NonNullable<SelectDocument['id']>,
): Promise<SelectDocument[] | null> => {
  try {
    const documentData = await db
      .select()
      .from(document)
      .where(eq(document.id, id));
    return documentData;
  } catch (error) {
    throw new Error(String(error));
  }
};

export const getDocumentByTitle = async (
  title: NonNullable<SelectDocument['title']>,
): Promise<SelectDocument[] | null> => {
  try {
    const documentData = await db
      .select()
      .from(document)
      .where(eq(document.title, title));
    return documentData;
  } catch (error) {
    throw new Error(String(error));
  }
};

export const getDocumentsByQueryVector = async (
  queryVector: NonNullable<SelectDocument['embedding']>,
  limit = 10,
): Promise<Array<{
  id: bigint;
  title: string | null;
  content: string | null;
  distance: unknown;
  createdAt: string;
  updatedAt: string;
}> | null> => {
  try {
    const vectorString = `[${(queryVector as number[]).join(',')}]`;

    const documents = await db
      .select({
        id: document.id,
        title: document.title,
        content: document.content,
        distance: sql`embedding <=> CAST(${vectorString} AS vector(3))`,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      })
      .from(document)
      .orderBy(sql`embedding <=> CAST(${vectorString} AS vector(3))`)
      .limit(limit);

    const convertedDocuments = JSON.parse(
      JSON.stringify(documents, bigintReplacer),
    );

    return convertedDocuments;
  } catch (error) {
    throw new Error(String(error));
  }
};
