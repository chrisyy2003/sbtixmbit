import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { submissions } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const { mbti, sbti } = await req.json();

    if (!mbti || !sbti) {
      return NextResponse.json(
        { error: "mbti and sbti are required" },
        { status: 400 }
      );
    }

    const result = await db
      .insert(submissions)
      .values({ mbti, sbti })
      .returning({ id: submissions.id });

    return NextResponse.json({ message: "提交成功", id: result[0].id });
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json({ error: "提交失败" }, { status: 500 });
  }
}
