import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockUpdate, mockSet, mockWhere, mockReturning } = vi.hoisted(() => ({
  mockUpdate: vi.fn(),
  mockSet: vi.fn(),
  mockWhere: vi.fn(),
  mockReturning: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: {
    update: mockUpdate,
  },
}));

vi.mock("@/db/schema", () => ({
  comments: {
    id: "id",
    content: "content",
    mbti: "mbti",
    sbti: "sbti",
    likes: "likes",
    parentId: "parentId",
    createdAt: "createdAt",
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((col: unknown, val: unknown) => ({ col, val })),
  sql: vi.fn((strings: TemplateStringsArray, ...values: unknown[]) => ({
    sql: strings.join("?"),
    values,
  })),
}));

import { POST } from "@/app/api/comments/[id]/like/route";
import { NextRequest } from "next/server";

function makeRequest(id: string) {
  return new NextRequest(`http://localhost/api/comments/${id}/like`, {
    method: "POST",
  });
}

describe("POST /api/comments/[id]/like", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdate.mockReturnValue({ set: mockSet });
    mockSet.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ returning: mockReturning });
  });

  it("should like a comment successfully", async () => {
    mockReturning.mockResolvedValue([{ likes: 5 }]);

    const req = makeRequest("1");
    const res = await POST(req, { params: Promise.resolve({ id: "1" }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.likes).toBe(5);
    expect(mockUpdate).toHaveBeenCalledOnce();
  });

  it("should return 400 for invalid comment ID", async () => {
    const req = makeRequest("abc");
    const res = await POST(req, { params: Promise.resolve({ id: "abc" }) });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("无效的评论ID");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("should return 404 when comment does not exist", async () => {
    mockReturning.mockResolvedValue([]);

    const req = makeRequest("999");
    const res = await POST(req, { params: Promise.resolve({ id: "999" }) });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe("评论不存在");
  });

  it("should return 500 on database error", async () => {
    mockReturning.mockRejectedValue(new Error("DB error"));

    const req = makeRequest("1");
    const res = await POST(req, { params: Promise.resolve({ id: "1" }) });
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("点赞失败");
  });
});
