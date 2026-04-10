import { serial, varchar, timestamp, index, integer, text } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

export const submissions = pgTable(
  "submissions",
  {
    id: serial().primaryKey(),
    mbti: varchar({ length: 4 }).notNull(),
    sbti: varchar({ length: 10 }).notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_submissions_mbti").on(table.mbti),
    index("idx_submissions_sbti").on(table.sbti),
  ]
);

export const comments = pgTable(
  "comments",
  {
    id: serial().primaryKey(),
    content: text().notNull(),
    mbti: varchar({ length: 4 }),
    sbti: varchar({ length: 10 }),
    likes: integer().default(0),
    parentId: integer(),
    createdAt: timestamp({ withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_comments_created_at").on(table.createdAt),
    index("idx_comments_parent_id").on(table.parentId),
  ]
);
