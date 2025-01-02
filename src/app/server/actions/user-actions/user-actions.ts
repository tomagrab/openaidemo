// app/users/actions.ts
'use server';

import { z } from 'zod';
import { createOrRetrieveUser } from '@/lib/db/tables/users/users'; // your createUser

/**
 * 1) A Zod schema for form validation on the server side as well.
 *    We can keep it minimal or extended.
 */
const createUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Must be a valid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function createUserAction(data: z.infer<typeof createUserSchema>) {
  // Validate again on the server
  const validated = createUserSchema.safeParse(data);
  if (!validated.success) {
    // Return shape you can parse in the client
    return { error: 'VALIDATION_ERROR', details: validated.error.flatten() };
  }

  // Now insert into DB
  try {
    const tryNewUser = await createOrRetrieveUser(data);

    return tryNewUser;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.startsWith('DUPLICATE_USER')) {
      // 409 = Conflict
      return { error: 'User already exists', details: errorMessage };
    }

    return { error: errorMessage };
  }
}
