import { pgTable, unique, uuid, text, vector, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const document = pgTable("document", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: text().notNull(),
	content: text().notNull(),
	embedding: vector({ dimensions: 3 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	unique("document_id_unique").on(table.id),
	unique("document_title_unique").on(table.title),
	unique("document_content_unique").on(table.content),
	unique("document_embedding_unique").on(table.embedding),
]);

export const user = pgTable("user", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	fullName: text("full_name").notNull(),
	email: text().notNull(),
	username: text().notNull(),
	password: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	unique("user_email_unique").on(table.email),
	unique("user_username_unique").on(table.username),
]);
