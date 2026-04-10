import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { comments } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const commentId = Number(id);

    if (isNaN(commentId)) {
      return NextResponse.json({ error: "无效的评论ID" }, { status: 400 });
    }

    const result = await db
      .update(comments)
      .set({ likes: sql`${comments.likes} + 1` })
      .where(eq(comments.id, commentId))
      .returning({ likes: comments.likes });

    if (result.length === 0) {
      return NextResponse.json({ error: "评论不存在" }, { status: 404 });
    }

    return NextResponse.json({ likes: result[0].likes });
  } catch (error) {
    console.error("Like error:", error);
    return NextResponse.json({ error: "点赞失败" }, { status: 500 });
  }
}
