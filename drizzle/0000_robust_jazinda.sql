CREATE TABLE "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"mbti" varchar(4),
	"sbti" varchar(10),
	"likes" integer DEFAULT 0,
	"createdAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"mbti" varchar(4) NOT NULL,
	"sbti" varchar(10) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "idx_comments_created_at" ON "comments" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "idx_submissions_mbti" ON "submissions" USING btree ("mbti");--> statement-breakpoint
CREATE INDEX "idx_submissions_sbti" ON "submissions" USING btree ("sbti");