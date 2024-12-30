import {
  bigserial,
  pgTable,
  text,
  timestamp,
  vector,
} from 'drizzle-orm/pg-core';

export const document = pgTable('document', {
  id: bigserial({ mode: 'bigint' }).primaryKey(),
  title: text(),
  content: text(),
  embedding: vector({ dimensions: 3 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$onUpdate(() => new Date()),
});

export type InsertDocument = typeof document.$inferInsert;
export type SelectDocument = typeof document.$inferSelect;
