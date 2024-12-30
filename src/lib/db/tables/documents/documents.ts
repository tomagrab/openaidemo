import { db } from '@/lib/db/db';
import {
  document,
  InsertDocument,
  SelectDocument,
} from '@/lib/db/schema/schema';
import { bigintReplacer } from '@/lib/utilities/numbers/big-int-replacer/big-int-replacer';
import { eq, sql } from 'drizzle-orm';

/*
 * Insert Data in the Documents table
 */

export const createDocument = async (data: InsertDocument) => {
  try {
    const newDocument = await db.insert(document).values(data);
    return newDocument;
  } catch (error) {
    throw new Error(String(error));
  }
};

/*
 * Get Data from the Documents table
 */

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
  created_at: string;
  updated_at: string;
}> | null> => {
  try {
    const vectorString = `[${(queryVector as number[]).join(',')}]`;

    const documents = await db
      .select({
        id: document.id,
        title: document.title,
        content: document.content,
        distance: sql`embedding <=> CAST(${vectorString} AS vector(3))`,
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
