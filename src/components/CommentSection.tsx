"use client";

import { useState, useEffect, useCallback } from "react";

interface Comment {
  id: number;
  content: string;
  mbti: string | null;
  sbti: string | null;
  likes: number;
  parentId: number | null;
  createdAt: string;
  replies?: Comment[];
}

interface CommentSectionProps {
  userMbti: string | null;
  userSbti: string | null;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;
  return new Date(dateStr).toLocaleDateString("zh-CN");
}

function CommentItem({
  comment,
  userMbti,
  userSbti,
  likingIds,
  likedIds,
  onLike,
  onReplySubmit,
}: {
  comment: Comment;
  userMbti: string | null;
  userSbti: string | null;
  likingIds: Set<number>;
  likedIds: Set<number>;
  onLike: (id: number) => void;
  onReplySubmit: (parentId: number, reply: Comment) => void;
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replying, setReplying] = useState(false);

  const handleReply = async () => {
    if (!replyContent.trim() || replying) return;
    setReplying(true);
    try {
      const res = await fetch("/api/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: replyContent.trim(),
          mbti: userMbti || null,
          sbti: userSbti || null,
          parentId: comment.id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const reply: Comment = {
          id: data.id,
          content: replyContent.trim(),
          mbti: userMbti,
          sbti: userSbti,
          likes: 0,
          parentId: comment.id,
          createdAt: new Date().toISOString(),
          replies: [],
        };
        onReplySubmit(comment.id, reply);
        setReplyContent("");
        setShowReplyInput(false);
      }
    } catch {
      // ignore
    } finally {
      setReplying(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        {(comment.mbti || comment.sbti) && (
          <div className="flex items-center gap-1 text-xs">
            {comment.mbti && (
              <span className="px-1.5 py-0.5 rounded-full bg-green-light text-green font-medium">
                {comment.mbti}
              </span>
            )}
            {comment.mbti && comment.sbti && (
              <span className="text-muted">x</span>
            )}
            {comment.sbti && (
              <span className="px-1.5 py-0.5 rounded-full bg-green-light text-green font-medium">
                {comment.sbti}
              </span>
            )}
          </div>
        )}
        <span className="text-xs text-muted">
          {timeAgo(comment.createdAt)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-sm text-text whitespace-pre-wrap break-words flex-1">
          {comment.content}
        </p>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="text-xs px-1.5 py-0.5 rounded-full transition-colors hover:bg-green-light"
            style={{ color: "var(--color-muted)" }}
          >
            回复
          </button>
          <button
            onClick={() => onLike(comment.id)}
            className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full transition-colors hover:bg-green-light"
            style={{ color: likedIds.has(comment.id) ? "var(--color-green)" : "var(--color-muted)" }}
          >
            <span>{likedIds.has(comment.id) ? "\u2665" : "\u2661"}</span>
            <span>{comment.likes > 0 ? comment.likes : "赞"}</span>
          </button>
        </div>
      </div>

      {/* Reply Input */}
      {showReplyInput && (
        <div className="mt-2 flex gap-2">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value.slice(0, 500))}
            placeholder="回复..."
            rows={2}
            className="flex-1 px-3 py-2 rounded-lg border text-sm resize-none focus:outline-none focus:ring-1"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-bg)",
              color: "var(--color-text)",
            }}
          />
          <button
            onClick={handleReply}
            disabled={!replyContent.trim() || replying}
            className="self-end px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: replyContent.trim() && !replying ? "var(--color-btn)" : "var(--color-border)",
              color: replyContent.trim() && !replying ? "#fff" : "var(--color-muted)",
              cursor: replyContent.trim() && !replying ? "pointer" : "not-allowed",
            }}
          >
            {replying ? "..." : "发送"}
          </button>
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 ml-4 pl-3 border-l-2 space-y-2" style={{ borderColor: "var(--color-border)" }}>
          {comment.replies.map((reply) => (
            <div key={reply.id}>
              <div className="flex items-center gap-2 mb-1">
                {(reply.mbti || reply.sbti) && (
                  <div className="flex items-center gap-1 text-xs">
                    {reply.mbti && (
                      <span className="px-1.5 py-0.5 rounded-full bg-green-light text-green font-medium">
                        {reply.mbti}
                      </span>
                    )}
                    {reply.mbti && reply.sbti && (
                      <span className="text-muted">x</span>
                    )}
                    {reply.sbti && (
                      <span className="px-1.5 py-0.5 rounded-full bg-green-light text-green font-medium">
                        {reply.sbti}
                      </span>
                    )}
                  </div>
                )}
                <span className="text-xs text-muted">
                  {timeAgo(reply.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-text whitespace-pre-wrap break-words flex-1">
                  {reply.content}
                </p>
                <button
                  onClick={() => onLike(reply.id)}
                  className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full transition-colors hover:bg-green-light shrink-0"
                  style={{ color: likedIds.has(reply.id) ? "var(--color-green)" : "var(--color-muted)" }}
                >
                  <span>{likedIds.has(reply.id) ? "\u2665" : "\u2661"}</span>
                  <span>{reply.likes > 0 ? reply.likes : "赞"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentSection({ userMbti, userSbti }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [likingIds, setLikingIds] = useState<Set<number>>(new Set());
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());

  // Load liked IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sbti-liked-comments");
      if (stored) {
        setLikedIds(new Set(JSON.parse(stored)));
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchComments = useCallback(async (pageNum: number, append: boolean) => {
    try {
      const res = await fetch(`/api/comments?page=${pageNum}&limit=20`);
      const data = await res.json();
      if (append) {
        setComments((prev) => [...prev, ...(data.comments || [])]);
      } else {
        setComments(data.comments || []);
      }
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchComments(1, false);
  }, [fetchComments]);

  const handleSubmit = async () => {
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          mbti: userMbti || null,
          sbti: userSbti || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: "评论成功", ok: true });
        const trimmed = content.trim();
        setContent("");
        setComments((prev) => [
          {
            id: data.id,
            content: trimmed,
            mbti: userMbti,
            sbti: userSbti,
            likes: 0,
            parentId: null,
            createdAt: new Date().toISOString(),
            replies: [],
          },
          ...prev,
        ]);
        setTotal((t) => t + 1);
      } else {
        setMessage({ text: data.error || "评论失败", ok: false });
      }
    } catch {
      setMessage({ text: "评论失败，请重试", ok: false });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleLike = async (id: number) => {
    if (likingIds.has(id) || likedIds.has(id)) return;
    setLikingIds((prev) => new Set(prev).add(id));

    // Optimistic update
    setComments((prev) => updateLikes(prev, id, 1));
    try {
      const res = await fetch(`/api/comments/${id}/like`, { method: "POST" });
      if (res.ok) {
        const nextLiked = new Set(likedIds);
        nextLiked.add(id);
        setLikedIds(nextLiked);
        try {
          localStorage.setItem("sbti-liked-comments", JSON.stringify([...nextLiked]));
        } catch {
          // ignore
        }
      } else {
        setComments((prev) => updateLikes(prev, id, -1));
      }
    } catch {
      setComments((prev) => updateLikes(prev, id, -1));
    } finally {
      setLikingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Helper: update likes in comments (including inside replies)
  const updateLikes = (prev: Comment[], targetId: number, delta: number): Comment[] => {
    return prev.map((c) => {
      if (c.id === targetId) {
        return { ...c, likes: c.likes + delta };
      }
      if (c.replies) {
        return { ...c, replies: c.replies.map((r) =>
          r.id === targetId ? { ...r, likes: r.likes + delta } : r
        )};
      }
      return c;
    });
  };

  const handleReplySubmit = (parentId: number, reply: Comment) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === parentId) {
          return { ...c, replies: [...(c.replies || []), reply] };
        }
        return c;
      })
    );
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setLoadingMore(true);
    fetchComments(nextPage, true);
  };

  return (
    <div>
      <div className="text-[16px] font-bold text-text mb-4">评论区</div>

      {/* Comment Form */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2 text-xs text-muted">
          {userMbti && userSbti ? (
            <>
              <span className="px-2 py-0.5 rounded-full bg-green-light text-green font-medium">
                {userMbti}
              </span>
              <span>x</span>
              <span className="px-2 py-0.5 rounded-full bg-green-light text-green font-medium">
                {userSbti}
              </span>
              <span className="ml-1">将以该身份评论</span>
            </>
          ) : (
            <span>提交 MBTI x SBTI 后可以带标签评论</span>
          )}
        </div>
        <div className="flex gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 500))}
            placeholder="说点什么..."
            rows={2}
            className="flex-1 px-3 py-2 rounded-lg border text-sm resize-none focus:outline-none focus:ring-1"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-bg)",
              color: "var(--color-text)",
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || submitting}
            className="self-end px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: content.trim() && !submitting ? "var(--color-btn)" : "var(--color-border)",
              color: content.trim() && !submitting ? "#fff" : "var(--color-muted)",
              cursor: content.trim() && !submitting ? "pointer" : "not-allowed",
            }}
          >
            {submitting ? "..." : "发送"}
          </button>
        </div>
        <div className="text-right text-xs text-muted mt-1">
          {content.length}/500
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className="mb-4 text-center py-2 rounded-lg text-sm border"
          style={{
            background: message.ok ? "#edf6ef" : "#fef2f2",
            borderColor: message.ok ? "var(--color-border)" : "#fecaca",
            color: message.ok ? "var(--color-green)" : "#dc2626",
          }}
        >
          {message.text}
        </div>
      )}

      {/* Total count */}
      <div className="text-xs text-muted mb-3">
        共 {total} 条评论
      </div>

      {/* Comment List */}
      {loading ? (
        <div className="text-center text-muted py-8 text-sm">加载中...</div>
      ) : comments.length === 0 ? (
        <div className="text-center text-muted py-8 text-sm">
          还没有评论，来说点什么吧
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-[16px] px-3 py-2.5 border"
              style={{
                background: "var(--color-bg)",
                borderColor: "var(--color-border)",
              }}
            >
              <CommentItem
                comment={comment}
                userMbti={userMbti}
                userSbti={userSbti}
                likingIds={likingIds}
                likedIds={likedIds}
                onLike={handleLike}
                onReplySubmit={handleReplySubmit}
              />
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {page < totalPages && (
        <div className="text-center mt-4">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="text-sm text-muted hover:text-green transition-colors px-4 py-2"
          >
            {loadingMore ? "加载中..." : "加载更多"}
          </button>
        </div>
      )}
      {page >= totalPages && totalPages > 1 && (
        <div className="text-center text-xs text-muted mt-4">
          没有更多评论了
        </div>
      )}
    </div>
  );
}
