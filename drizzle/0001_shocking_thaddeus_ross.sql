ALTER TABLE "comments" ADD COLUMN "parentId" integer;--> statement-breakpoint
CREATE INDEX "idx_comments_parent_id" ON "comments" USING btree ("parentId");