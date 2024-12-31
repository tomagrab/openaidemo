ALTER TABLE "document" ALTER COLUMN "embedding" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_id_unique" UNIQUE("id");--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_title_unique" UNIQUE("title");--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_content_unique" UNIQUE("content");--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_embedding_unique" UNIQUE("embedding");