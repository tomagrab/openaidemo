CREATE TABLE "document" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"title" text,
	"content" text,
	"embedding" vector(3)
);
