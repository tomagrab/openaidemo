import { bigserial, pgTable, text, vector } from 'drizzle-orm/pg-core';

export const document = pgTable('document', {
  id: bigserial({ mode: 'bigint' }).primaryKey(),
  title: text(),
  content: text(),
  embedding: vector({ dimensions: 3 }),
});

export type InsertDocument = typeof document.$inferInsert;
export type SelectDocument = typeof document.$inferSelect;
