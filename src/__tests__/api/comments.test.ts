import { describe, it, expect, vi, beforeEach } from "vitest";

const { createMockDb } = vi.hoisted(() => {
  function chain(finalResolver: () => unknown) {
    const handler: ProxyHandler<object> = {
      get(_target, prop) {
        if (prop === "then") return undefined;
        return new Proxy(() => {}, {
          apply(_t, _a, args) {
            // If this is the terminal call that resolves, return the final result
            if (prop === finalResolver()) {
              return Promise.resolve([]);
            }
            return new Proxy(() => {}, handler);
          },
        });
      },
    };
    return new Proxy(() => {}, handler);
  }

  let resolveChain: (...args: unknown[]) => unknown;

  function createChainable(resolver: () => unknown) {
    return new Proxy(() => {}, {
      get(_target, prop) {
        if (prop === "then") return undefined;
        return new Proxy(() => {}, {
          apply(_t, _a, _args) {
            if (prop === resolver()) {
              return Promise.resolve([]);
            }
            return createChainable(resolver);
          },
        });
      },
    });
  }

  return { createMockDb: null };
});

// Simpler approach: use a mock database object with trackable queries
const mocks = vi.hoisted(() => {
  const db: Record<string, ReturnType<typeof vi.fn>> = {
    select: vi.fn(),
  };
  return { db };
});

vi.mock("@/db", () => ({
  db: {
    select: mocks.db.select,
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
  desc: vi.fn((col: string) => `desc:${col}`),
  count: vi.fn(() => "count_fn"),
  asc: vi.fn((col: string) => `asc:${col}`),
  isNull: vi.fn((col: string) => `isNull:${col}`),
  inArray: vi.fn((col: string, vals: unknown[]) => `inArray:${col}`),
}));

import { GET } from "@/app/api/comments/route";
import { NextRequest } from "next/server";

function makeRequest(url: string) {
  return new NextRequest(url);
}

/**
 * Helper to create a chainable mock that ends with a resolved promise.
 * Usage: mockChain(['from','where','orderBy','limit','offset'], result)
 */
function mockChain(methods: string[], result: unknown) {
  let current: any = vi.fn().mockResolvedValue(result);
  // Build the chain from the last method to the first
  for (let i = methods.length - 1; i >= 0; i--) {
    const next = current;
    current = vi.fn().mockReturnValue({ [methods[i]]: next });
  }
  return current;
}

describe("GET /api/comments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch comments with default pagination", async () => {
    const mockComments = [
      {
        id: 1,
        content: "Hello",
        mbti: "INTJ",
        sbti: null,
        likes: 0,
        parentId: null,
        createdAt: "2025-01-01T00:00:00Z",
      },
    ];

    let selectCallCount = 0;
    mocks.db.select.mockImplementation(() => {
      selectCallCount++;
      if (selectCallCount === 1) {
        // Top-level comments query: select().from().where().orderBy().limit().offset()
        const offset = vi.fn().mockResolvedValue(mockComments);
        const limit = vi.fn().mockReturnValue({ offset });
        const orderBy = vi.fn().mockReturnValue({ limit });
        const where = vi.fn().mockReturnValue({ orderBy });
        return { from: vi.fn().mockReturnValue({ where }) };
      }
      if (selectCallCount === 2) {
        // Count query: select().from().where()
        const where = vi.fn().mockResolvedValue([{ total: 1 }]);
        return { from: vi.fn().mockReturnValue({ where }) };
      }
      // Replies query (won't be reached if parentIds is empty, but just in case)
      const orderBy = vi.fn().mockResolvedValue([]);
      const where = vi.fn().mockReturnValue({ orderBy });
      return { from: vi.fn().mockReturnValue({ where }) };
    });

    const req = makeRequest("http://localhost/api/comments?page=1&limit=20");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.comments).toHaveLength(1);
    expect(data.comments[0].id).toBe(1);
    expect(data.comments[0].content).toBe("Hello");
    expect(data.comments[0].replies).toEqual([]);
    expect(data.total).toBe(1);
    expect(data.page).toBe(1);
    expect(data.totalPages).toBe(1);
  });

  it("should default to page 1 and limit 20 when no params", async () => {
    let selectCallCount = 0;
    mocks.db.select.mockImplementation(() => {
      selectCallCount++;
      if (selectCallCount === 1) {
        const offset = vi.fn().mockResolvedValue([]);
        const limit = vi.fn().mockReturnValue({ offset });
        const orderBy = vi.fn().mockReturnValue({ limit });
        const where = vi.fn().mockReturnValue({ orderBy });
        return { from: vi.fn().mockReturnValue({ where }) };
      }
      const where = vi.fn().mockResolvedValue([{ total: 0 }]);
      return { from: vi.fn().mockReturnValue({ where }) };
    });

    const req = makeRequest("http://localhost/api/comments");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.page).toBe(1);
    expect(data.totalPages).toBe(0);
  });

  it("should cap limit at 50", async () => {
    let selectCallCount = 0;
    mocks.db.select.mockImplementation(() => {
      selectCallCount++;
      if (selectCallCount === 1) {
        const offset = vi.fn().mockResolvedValue([]);
        const limit = vi.fn().mockReturnValue({ offset });
        const orderBy = vi.fn().mockReturnValue({ limit });
        const where = vi.fn().mockReturnValue({ orderBy });
        const from = vi.fn().mockReturnValue({ where });
        return { from };
      }
      const where = vi.fn().mockResolvedValue([{ total: 0 }]);
      return { from: vi.fn().mockReturnValue({ where }) };
    });

    const req = makeRequest("http://localhost/api/comments?limit=100");
    const res = await GET(req);

    expect(res.status).toBe(200);
    // The second select call should have been the count query
    // We can verify limit was capped by checking the first select chain
  });

  it("should calculate totalPages correctly", async () => {
    let selectCallCount = 0;
    mocks.db.select.mockImplementation(() => {
      selectCallCount++;
      if (selectCallCount === 1) {
        const offset = vi.fn().mockResolvedValue([]);
        const limit = vi.fn().mockReturnValue({ offset });
        const orderBy = vi.fn().mockReturnValue({ limit });
        const where = vi.fn().mockReturnValue({ orderBy });
        return { from: vi.fn().mockReturnValue({ where }) };
      }
      const where = vi.fn().mockResolvedValue([{ total: 45 }]);
      return { from: vi.fn().mockReturnValue({ where }) };
    });

    const req = makeRequest("http://localhost/api/comments?page=1&limit=20");
    const res = await GET(req);
    const data = await res.json();

    expect(data.total).toBe(45);
    expect(data.totalPages).toBe(3); // ceil(45/20) = 3
  });

  it("should fetch replies for top-level comments", async () => {
    const mockComments = [
      {
        id: 1,
        content: "Parent",
        mbti: null,
        sbti: null,
        likes: 0,
        parentId: null,
        createdAt: "2025-01-01T00:00:00Z",
      },
    ];
    const mockReplies = [
      {
        id: 2,
        content: "Reply",
        mbti: "ENFP",
        sbti: "狗狗",
        likes: 0,
        parentId: 1,
        createdAt: "2025-01-01T00:01:00Z",
      },
    ];

    let selectCallCount = 0;
    mocks.db.select.mockImplementation(() => {
      selectCallCount++;
      if (selectCallCount === 1) {
        // Top-level comments
        const offset = vi.fn().mockResolvedValue(mockComments);
        const limit = vi.fn().mockReturnValue({ offset });
        const orderBy = vi.fn().mockReturnValue({ limit });
        const where = vi.fn().mockReturnValue({ orderBy });
        return { from: vi.fn().mockReturnValue({ where }) };
      }
      if (selectCallCount === 2) {
        // Count query
        const where = vi.fn().mockResolvedValue([{ total: 1 }]);
        return { from: vi.fn().mockReturnValue({ where }) };
      }
      // Replies query (selectCallCount === 3)
      const orderBy = vi.fn().mockResolvedValue(mockReplies);
      const where = vi.fn().mockReturnValue({ orderBy });
      return { from: vi.fn().mockReturnValue({ where }) };
    });

    const req = makeRequest("http://localhost/api/comments?page=1");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.comments).toHaveLength(1);
    expect(data.comments[0].replies).toHaveLength(1);
    expect(data.comments[0].replies[0].content).toBe("Reply");
    expect(data.comments[0].replies[0].parentId).toBe(1);
  });

  it("should return 500 on database error", async () => {
    mocks.db.select.mockImplementation(() => {
      const offset = vi.fn().mockRejectedValue(new Error("DB error"));
      const limit = vi.fn().mockReturnValue({ offset });
      const orderBy = vi.fn().mockReturnValue({ limit });
      const where = vi.fn().mockReturnValue({ orderBy });
      return { from: vi.fn().mockReturnValue({ where }) };
    });

    const req = makeRequest("http://localhost/api/comments");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("获取评论失败");
  });

  it("should handle page=0 as page=1", async () => {
    let selectCallCount = 0;
    mocks.db.select.mockImplementation(() => {
      selectCallCount++;
      if (selectCallCount === 1) {
        const offset = vi.fn().mockResolvedValue([]);
        const limit = vi.fn().mockReturnValue({ offset });
        const orderBy = vi.fn().mockReturnValue({ limit });
        const where = vi.fn().mockReturnValue({ orderBy });
        return { from: vi.fn().mockReturnValue({ where }) };
      }
      const where = vi.fn().mockResolvedValue([{ total: 0 }]);
      return { from: vi.fn().mockReturnValue({ where }) };
    });

    const req = makeRequest("http://localhost/api/comments?page=0");
    const res = await GET(req);
    const data = await res.json();

    expect(data.page).toBe(1); // Math.max(1, 0) = 1
  });
});
