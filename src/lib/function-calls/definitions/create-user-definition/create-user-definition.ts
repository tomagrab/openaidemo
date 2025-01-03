export const createUserDefinition = {
  type: 'function',
  name: 'createUser',
  description: `
      Creates a new user in the V-Track application database.
      The Realtime API should ensure that the user has provided
      firstName, lastName, email, username, and password
      before calling this function.
    `,
  parameters: {
    type: 'object',
    properties: {
      firstName: {
        type: 'string',
        description: 'The user’s first name. Example: "Alice"',
      },
      lastName: {
        type: 'string',
        description: 'The user’s last name. Example: "Doe"',
      },
      email: {
        type: 'string',
        description:
          'The user’s email address, e.g. "alice@example.com". Must be valid.',
      },
      username: {
        type: 'string',
        description:
          'A unique username, e.g. "alicedoe". Must be >= 3 chars, no spaces.',
      },
      password: {
        type: 'string',
        description: 'A password >= 6 chars. Example: "p@ssw0rd123".',
      },
    },
    required: ['firstName', 'lastName', 'email', 'username', 'password'],
  },
};
