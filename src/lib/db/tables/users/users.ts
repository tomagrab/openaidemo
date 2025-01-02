import { db } from '@/lib/db/db';
import { user, InsertUser, SelectUser } from '@/lib/db/schema/schema';
import { eq, sql } from 'drizzle-orm';

export const createUser = async (data: InsertUser): Promise<InsertUser[]> => {
  try {
    const newUser = await db.insert(user).values(data).returning();
    return newUser;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    // For instance, "duplicate key value violates unique constraint"
    if (errorMessage.includes('duplicate key value')) {
      // We'll throw a new error that your client can parse for a known code
      throw new Error(`DUPLICATE_USER: ${errorMessage}`);
    }

    // Otherwise, re-throw
    throw new Error(errorMessage);
  }
};

export const createOrRetrieveUser = async (
  data: InsertUser,
): Promise<SelectUser[] | InsertUser[]> => {
  try {
    const newUser = await db.insert(user).values(data).returning();
    return newUser;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('duplicate key value')) {
      let existingRows: SelectUser[] = [];

      const byEmail = await db
        .select()
        .from(user)
        .where(eq(user.email, data.email));
      if (byEmail.length > 0) {
        existingRows = byEmail;
      }

      const byUsername = await db
        .select()
        .from(user)
        .where(eq(user.username, data.username));
      if (byUsername.length > 0) {
        existingRows = byUsername;
      }

      return existingRows;
    }

    throw new Error(errorMessage);
  }
};

export const getUsers = async (): Promise<SelectUser[]> => {
  try {
    const users = await db.select().from(user);
    return users;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(errorMessage);
  }
};

export const getUserById = async (
  id: SelectUser['id'],
): Promise<SelectUser[]> => {
  try {
    const userById = await db.select().from(user).where(eq(user.id, id));
    return userById;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(errorMessage);
  }
};

export const getUserByEmail = async (
  email: SelectUser['email'],
): Promise<SelectUser[]> => {
  try {
    const userByEmail = await db
      .select()
      .from(user)
      .where(eq(user.email, email));
    return userByEmail;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(errorMessage);
  }
};

export const getUserByUsername = async (
  username: SelectUser['username'],
): Promise<SelectUser[]> => {
  try {
    const userByUsername = await db
      .select()
      .from(user)
      .where(eq(user.username, username));
    return userByUsername;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(errorMessage);
  }
};

export const getUserByParameters = async (
  params: Partial<Pick<SelectUser, 'id' | 'email' | 'username'>>,
): Promise<SelectUser[]> => {
  try {
    const conditions = [];
    if (params.id) conditions.push(eq(user.id, params.id));
    if (params.email) conditions.push(eq(user.email, params.email));
    if (params.username) conditions.push(eq(user.username, params.username));

    const userByParams = await db
      .select()
      .from(user)
      .where(
        conditions.length > 0 ? sql.join(conditions, sql` OR `) : undefined,
      );
    return userByParams;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(errorMessage);
  }
};
