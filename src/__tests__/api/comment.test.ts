import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockInsert, mockValues, mockReturning } = vi.hoisted(() => ({
  mockInsert: vi.fn(),
  mockValues: vi.fn(),
  mockReturning: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: {
    insert: mockInsert,
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

import { POST } from "@/app/api/comment/route";
import { NextRequest } from "next/server";

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/comment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/comment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockReturnValue({ values: mockValues });
    mockValues.mockReturnValue({ returning: mockReturning });
  });

  it("should create a comment successfully", async () => {
    mockReturning.mockResolvedValue([{ id: 1 }]);

    const req = makeRequest({
      content: "Hello world",
      mbti: "INTJ",
      sbti: "猫猫",
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("评论成功");
    expect(data.id).toBe(1);
    expect(mockInsert).toHaveBeenCalledOnce();
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        content: "Hello world",
        mbti: "INTJ",
        sbti: "猫猫",
        parentId: null,
      })
    );
  });

  it("should create a reply (with parentId)", async () => {
    mockReturning.mockResolvedValue([{ id: 2 }]);

    const req = makeRequest({
      content: "A reply",
      mbti: null,
      sbti: null,
      parentId: 1,
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.id).toBe(2);
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        content: "A reply",
        parentId: 1,
      })
    );
  });

  it("should create a comment without mbti/sbti", async () => {
    mockReturning.mockResolvedValue([{ id: 3 }]);

    const req = makeRequest({ content: "Anonymous comment" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.id).toBe(3);
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        content: "Anonymous comment",
        mbti: null,
        sbti: null,
        parentId: null,
      })
    );
  });

  it("should return 400 when content is empty", async () => {
    const req = makeRequest({ content: "" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("请输入评论内容");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("should return 400 when content is only whitespace", async () => {
    const req = makeRequest({ content: "   " });
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("请输入评论内容");
  });

  it("should return 400 when content exceeds 500 characters", async () => {
    const req = makeRequest({ content: "a".repeat(501) });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("评论不能超过500个字符");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("should accept content at exactly 500 characters", async () => {
    mockReturning.mockResolvedValue([{ id: 4 }]);

    const req = makeRequest({ content: "a".repeat(500) });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mockInsert).toHaveBeenCalledOnce();
  });

  it("should return 500 on database error", async () => {
    mockReturning.mockRejectedValue(new Error("DB connection failed"));

    const req = makeRequest({ content: "Test" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("评论失败");
  });

  it("should trim content before inserting", async () => {
    mockReturning.mockResolvedValue([{ id: 5 }]);

    const req = makeRequest({ content: "  hello  " });
    await POST(req);

    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        content: "hello",
      })
    );
  });
});
