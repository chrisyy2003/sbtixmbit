"use client";

import { useState, useEffect, useCallback } from "react";
import TypeSelector from "@/components/TypeSelector";
import StatsTable from "@/components/StatsTable";

const MBTI_TYPES = [
  "ISTJ", "ISFJ", "INFJ", "INTJ",
  "ISTP", "ISFP", "INFP", "INTP",
  "ESTP", "ESFP", "ENFP", "ENTP",
  "ESTJ", "ESFJ", "ENFJ", "ENTJ",
];

const SBTI_TYPES = [
  { value: "CTRL", label: "控制狂" },
  { value: "ATM-er", label: "提款机" },
  { value: "Dior-s", label: "迪奥粉" },
  { value: "BOSS", label: "霸总" },
  { value: "THAN-K", label: "谢学家" },
  { value: "OH-NO", label: "完蛋了" },
  { value: "GOGO", label: "冲冲冲" },
  { value: "SEXY", label: "性感" },
  { value: "LOVE-R", label: "情圣" },
  { value: "MUM", label: "老妈子" },
  { value: "FAKE", label: "假人" },
  { value: "OJBK", label: "没问题" },
  { value: "MALO", label: "马楼" },
  { value: "JOKE-R", label: "搞笑王" },
  { value: "WOC!", label: "卧槽" },
  { value: "THIN-K", label: "想太多" },
  { value: "SHIT", label: "屎" },
  { value: "ZZZZ", label: "睡神" },
  { value: "POOR", label: "穷鬼" },
  { value: "MONK", label: "和尚" },
  { value: "IMSB", label: "我傻逼" },
  { value: "SOLO", label: "单身狗" },
  { value: "FUCK", label: "暴躁" },
  { value: "DEAD", label: "摆烂" },
  { value: "IMFW", label: "我废物" },
  { value: "HHHH", label: "哈哈哈" },
  { value: "DRUNK", label: "酒鬼" },
];

const SBTI_VALUES = SBTI_TYPES.map((t) => t.value);

const SBTI_IMAGE_EXT: Record<string, string> = {
  "Dior-s": ".jpg",
  "JOKE-R": ".jpg",
};

function getMbtiImage(type: string): string {
  return `/mbit/${type.toLowerCase()}.png`;
}

function getSbtiImage(type: string): string {
  const name = type === "WOC!" ? "WOC" : type;
  const ext = SBTI_IMAGE_EXT[type] || ".png";
  return `/sbti/${name}${ext}`;
}

interface Stats {
  total: number;
  matrix: Record<string, Record<string, number>>;
  topMatches: Record<string, { mbti: string; count: number }[]>;
  topMbtiMatches: Record<string, { sbti: string; count: number }[]>;
}

export default function Home() {
  const [mbti, setMbti] = useState<string | null>(null);
  const [sbti, setSbti] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
    } catch {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Restore cached submission
    try {
      const cached = localStorage.getItem("sbti-submission");
      if (cached) {
        const { mbti: savedMbti, sbti: savedSbti } = JSON.parse(cached);
        setMbti(savedMbti);
        setSbti(savedSbti);
        setSubmitted(true);
      }
    } catch {
      // ignore
    }
  }, [fetchStats]);

  const handleSubmit = async () => {
    if (!mbti || !sbti) {
      setMessage("请先选择你的 MBTI 和 SBTI 类型");
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mbti, sbti }),
      });
      const data = await res.json();
      setMessage(data.message || data.error);
      if (res.ok) {
        localStorage.setItem("sbti-submission", JSON.stringify({ mbti, sbti }));
        setSubmitted(true);
        fetchStats();
      }
    } catch {
      setMessage("提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = mbti && sbti && !submitting;

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-[960px] mx-auto px-4 py-8">
        {/* Form Card */}
        <div className="bg-card border border-border rounded-[22px] shadow-[0_16px_40px_rgba(47,73,55,0.08)] p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-[28px] font-bold text-text">
              SBTI × MBTI 对照统计
            </h1>
            <p className="text-muted text-sm mt-2">
              选择你的 MBTI 和 SBTI 类型，查看大家的对照统计结果
            </p>
          </div>

          {/* Selectors - Two Column Layout */}
          <div className="flex gap-6 items-stretch">
            {/* Left: MBTI */}
            <div className="flex-1 flex flex-col items-center">
              <TypeSelector
                label="你的 MBTI 类型"
                types={MBTI_TYPES.map((t) => ({ value: t }))}
                selected={mbti}
                onSelect={setMbti}
              />
              <div className="mt-auto pt-4 h-48 flex items-center justify-center">
                {mbti ? (
                  <img
                    src={getMbtiImage(mbti)}
                    alt={mbti}
                    className="h-48 w-48 object-contain"
                  />
                ) : (
                  <div className="h-48 w-48 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-sm text-muted">
                    选择类型查看图片
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="w-px bg-border self-stretch" />

            {/* Right: SBTI */}
            <div className="flex-1 flex flex-col items-center">
              <TypeSelector
                label="你的 SBTI 类型"
                types={SBTI_TYPES}
                selected={sbti}
                onSelect={setSbti}
              />
              <div className="mt-auto pt-4 h-48 flex items-center justify-center">
                {sbti ? (
                  <img
                    src={getSbtiImage(sbti)}
                    alt={sbti}
                    className="h-48 w-48 object-contain"
                  />
                ) : (
                  <div className="h-48 w-48 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-sm text-muted">
                    选择类型查看图片
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit / Submitted */}
          {submitted ? (
            <div
              className="w-full mt-6 py-3 rounded-lg text-center text-sm border"
              style={{
                background: "#edf6ef",
                borderColor: "var(--color-border)",
                color: "var(--color-green)",
              }}
            >
              已提交：{mbti} × {sbti}
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full mt-6 py-3 rounded-lg text-white text-base font-medium transition-colors cursor-pointer"
              style={{
                background: canSubmit
                  ? "var(--color-btn)"
                  : "var(--color-border)",
                color: canSubmit ? "#fff" : "var(--color-muted)",
                cursor: canSubmit ? "pointer" : "not-allowed",
              }}
            >
              {submitting ? "提交中..." : "提交"}
            </button>
          )}

          {/* Message */}
          {message && (
            <div
              className="mt-4 text-center py-2.5 rounded-lg text-sm border"
              style={{
                background: "#edf6ef",
                borderColor: "var(--color-border)",
                color: "var(--color-green)",
              }}
            >
              {message}
            </div>
          )}
        </div>

        {/* Stats Card */}
        <div className="bg-card border border-border rounded-[22px] shadow-[0_16px_40px_rgba(47,73,55,0.08)] p-6 mt-6">
          <h2 className="text-xl font-semibold text-text mb-4">统计结果</h2>
          {stats ? (
            <StatsTable
              total={stats.total}
              matrix={stats.matrix}
              topMatches={stats.topMatches}
              topMbtiMatches={stats.topMbtiMatches}
              mbtiTypes={MBTI_TYPES}
              sbtiTypes={SBTI_VALUES}
            />
          ) : (
            <div className="text-center text-muted py-8 text-sm">加载中...</div>
          )}
        </div>

        {/* Footer / Credits */}
        <div className="bg-card border border-border rounded-[22px] shadow-[0_16px_40px_rgba(47,73,55,0.08)] p-5 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href="https://sbti.unun.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2 p-4 rounded-[16px] border border-border hover:border-green transition-all hover:shadow-[0_8px_24px_rgba(77,106,83,0.10)]"
              style={{ background: "linear-gradient(180deg, #ffffff, #f7fbf8)" }}
            >
              <span className="text-2xl">&#x1F3AF;</span>
              <span className="font-bold text-sm text-text">SBTI 人格测试</span>
              <span className="text-xs text-muted">sbti.unun.dev</span>
            </a>
            <a
              href="https://www.bilibili.com/video/BV1LpDHByET6/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2 p-4 rounded-[16px] border border-border hover:border-green transition-all hover:shadow-[0_8px_24px_rgba(77,106,83,0.10)]"
              style={{ background: "linear-gradient(180deg, #ffffff, #f7fbf8)" }}
            >
              <span className="text-2xl">&#x1F3AC;</span>
              <span className="font-bold text-sm text-text">原作者</span>
              <span className="text-xs text-muted">B站 @蛆肉儿串儿</span>
            </a>
            <a
              href="https://github.com/chrisyy2003/sbtixmbit"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2 p-4 rounded-[16px] border border-border hover:border-green transition-all hover:shadow-[0_8px_24px_rgba(77,106,83,0.10)]"
              style={{ background: "linear-gradient(180deg, #ffffff, #f7fbf8)" }}
            >
              <span className="text-2xl">&#x1F4BB;</span>
              <span className="font-bold text-sm text-text">GitHub 源码</span>
              <span className="text-xs text-muted">chrisyy2003/sbtixmbit</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
