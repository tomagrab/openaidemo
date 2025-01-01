import { db } from '@/lib/db/db';
import {
  document,
  InsertDocument,
  SelectDocument,
} from '@/lib/db/schema/schema';
import { bigintReplacer } from '@/lib/utilities/numbers/big-int-replacer/big-int-replacer';
import { eq, sql } from 'drizzle-orm';

export const createDocument = async (
  data: InsertDocument,
): Promise<InsertDocument[]> => {
  try {
    const newDocument = await db.insert(document).values(data).returning();
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

export const createOrRetrieveDocument = async (
  data: InsertDocument,
): Promise<SelectDocument[] | InsertDocument[]> => {
  try {
    // Attempt to insert
    const newDocument = await db.insert(document).values(data).returning();
    // If successful, the insertion returns data about the row we inserted:
    return newDocument; // e.g. [ { id: '...', title: '...', content: '...' } ]
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    // If we detect "duplicate key value violates unique constraint"
    if (errorMessage.includes('duplicate key value')) {
      // We have to figure out which field is causing the conflict, or it could be multiple.
      // Simplest approach: do a "where" that tries to find matching rows on any of the unique fields

      // 1) Attempt to find by same `title`
      let existingRows: SelectDocument[] = [];

      // Title check
      const byTitle = await db
        .select()
        .from(document)
        .where(eq(document.title, data.title));
      if (byTitle.length > 0) {
        existingRows = byTitle; // we found a doc with the same title
      }

      // Content check (only if we didn't find by title)
      if (existingRows.length === 0) {
        const byContent = await db
          .select()
          .from(document)
          .where(eq(document.content, data.content));
        if (byContent.length > 0) {
          existingRows = byContent;
        }
      }

      // Embedding check (only if we haven't found anything yet)
      if (existingRows.length === 0) {
        // This is trickier because embedding is a vector type. We'll look for exact match:
        // e.g. "where embedding = data.embedding"
        // Note that your Postgres version needs to support this equality check,
        // or you can store the vector as text in another column for exact comparison.
        const [x, y, z] = data.embedding as [number, number, number];
        const vectorMatches = await db
          .select()
          .from(document)
          // Using "document.embedding = to_vector(...)"
          .where(
            sql`${document.embedding} = CAST('[${x},${y},${z}]' AS vector(3))`,
          );
        if (vectorMatches.length > 0) {
          existingRows = vectorMatches;
        }
      }

      // If we found something, return it
      if (existingRows.length > 0) {
        // Return them in an easily used format
        return existingRows;
      }

      // If we can't find anything, re-throw
      throw new Error(`UNKNOWN_DUPLICATE: ${errorMessage}`);
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
): Promise<{
  id: string;
  title: string | null;
  content: string | null;
  createdAt: string;
  updatedAt: string;
} | null> => {
  try {
    const documentData = await db
      .select({
        id: document.id,
        title: document.title,
        content: document.content,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      })
      .from(document)
      .where(eq(document.id, id));
    return documentData.length > 0
      ? {
          ...documentData[0],
          createdAt: documentData[0].createdAt.toISOString(),
          updatedAt: documentData[0].updatedAt.toISOString(),
        }
      : null;
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
  id: string;
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
