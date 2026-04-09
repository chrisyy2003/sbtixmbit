import { NextResponse } from "next/server";
import { db } from "@/db";
import { submissions } from "@/db/schema";
import { count } from "drizzle-orm";

export async function GET() {
  try {
    // Total count
    const [totalRow] = await db
      .select({ total: count() })
      .from(submissions);

    // Matrix: group by mbti × sbti
    const matrixRows = await db
      .select({
        mbti: submissions.mbti,
        sbti: submissions.sbti,
        count: count(),
      })
      .from(submissions)
      .groupBy(submissions.mbti, submissions.sbti)
      .orderBy(submissions.mbti, submissions.sbti);

    const total = totalRow.total;

    const matrix: Record<string, Record<string, number>> = {};
    for (const row of matrixRows) {
      if (!matrix[row.mbti]) matrix[row.mbti] = {};
      matrix[row.mbti][row.sbti] = row.count;
    }

    // Top matches: group by sbti × mbti, then pick top 3 per sbti
    const grouped = await db
      .select({
        sbti: submissions.sbti,
        mbti: submissions.mbti,
        count: count(),
      })
      .from(submissions)
      .groupBy(submissions.sbti, submissions.mbti);

    const topMatches: Record<string, { mbti: string; count: number }[]> = {};
    for (const row of grouped) {
      if (!topMatches[row.sbti]) topMatches[row.sbti] = [];
      topMatches[row.sbti].push({ mbti: row.mbti, count: row.count });
    }
    // Sort each sbti's matches and keep top 3
    for (const key of Object.keys(topMatches)) {
      topMatches[key].sort((a, b) => b.count - a.count);
      topMatches[key] = topMatches[key].slice(0, 3);
    }

    // Reverse top matches: group by mbti × sbti, top 3 sbti per mbti
    const topMbtiMatches: Record<string, { sbti: string; count: number }[]> = {};
    for (const row of grouped) {
      if (!topMbtiMatches[row.mbti]) topMbtiMatches[row.mbti] = [];
      topMbtiMatches[row.mbti].push({ sbti: row.sbti, count: row.count });
    }
    for (const key of Object.keys(topMbtiMatches)) {
      topMbtiMatches[key].sort((a, b) => b.count - a.count);
      topMbtiMatches[key] = topMbtiMatches[key].slice(0, 3);
    }

    return NextResponse.json({ total, matrix, topMatches, topMbtiMatches });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "获取统计失败" }, { status: 500 });
  }
}
