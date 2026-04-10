import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { comments } from "@/db/schema";
import { desc, count, asc, isNull, inArray } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
    const offset = (page - 1) * limit;

    // Only fetch top-level comments (parentId IS NULL)
    const rows = await db
      .select()
      .from(comments)
      .where(isNull(comments.parentId))
      .orderBy(desc(comments.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ total }] = await db
      .select({ total: count() })
      .from(comments)
      .where(isNull(comments.parentId));

    // Fetch replies for all top-level comments in one query
    const parentIds = rows.map((r) => r.id);
    let repliesMap: Record<number, typeof rows> = {};

    if (parentIds.length > 0) {
      const allReplies = await db
        .select()
        .from(comments)
        .where(inArray(comments.parentId, parentIds))
        .orderBy(asc(comments.createdAt));

      for (const reply of allReplies) {
        const pid = reply.parentId!;
        if (!repliesMap[pid]) repliesMap[pid] = [];
        repliesMap[pid].push(reply);
      }
    }

    const commentsWithReplies = rows.map((row) => ({
      ...row,
      replies: repliesMap[row.id] || [],
    }));

    return NextResponse.json({
      comments: commentsWithReplies,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Comments fetch error:", error);
    return NextResponse.json({ error: "获取评论失败" }, { status: 500 });
  }
}
