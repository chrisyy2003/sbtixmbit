import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { comments } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const { content, mbti, sbti, parentId } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "请输入评论内容" }, { status: 400 });
    }
    if (content.length > 500) {
      return NextResponse.json({ error: "评论不能超过500个字符" }, { status: 400 });
    }

    const result = await db
      .insert(comments)
      .values({
        content: content.trim(),
        mbti: mbti || null,
        sbti: sbti || null,
        parentId: parentId ?? null,
      })
      .returning({ id: comments.id });

    return NextResponse.json({ message: "评论成功", id: result[0].id });
  } catch (error) {
    console.error("Comment error:", error);
    return NextResponse.json({ error: "评论失败" }, { status: 500 });
  }
}
