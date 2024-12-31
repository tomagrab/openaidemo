ALTER TABLE "document" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "document" ALTER COLUMN "id" SET DEFAULT 'uuid_generate_v4()';--> statement-breakpoint
ALTER TABLE "document" ALTER COLUMN "title" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "document" ALTER COLUMN "content" SET NOT NULL;