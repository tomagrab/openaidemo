import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid, vector } from 'drizzle-orm/pg-core';

export const document = pgTable('document', {
  id: uuid('id')
    .primaryKey()
    .unique()
    .default(sql`gen_random_uuid()`),
  title: text('title').unique().notNull(),
  content: text('content').unique().notNull(),
  embedding: vector('embedding', { dimensions: 3 }).unique().notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$onUpdate(() => new Date()),
});

export type InsertDocument = typeof document.$inferInsert;
export type SelectDocument = typeof document.$inferSelect;
