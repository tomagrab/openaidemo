ALTER TABLE "document" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "document" ADD COLUMN "updated_at" timestamp NOT NULL;