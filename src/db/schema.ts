import { serial, varchar, timestamp, index } from "drizzle-orm/pg-core";
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
