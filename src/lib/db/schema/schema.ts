import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid, vector } from 'drizzle-orm/pg-core';

export const document = pgTable('document', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text('title').notNull(),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 3 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$onUpdate(() => new Date()),
});

export type InsertDocument = typeof document.$inferInsert;
export type SelectDocument = typeof document.$inferSelect;
