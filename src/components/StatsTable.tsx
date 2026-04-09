"use client";

const SBTI_LABELS: Record<string, string> = {
  CTRL: "控制狂",
  "ATM-er": "提款机",
  "Dior-s": "迪奥粉",
  BOSS: "霸总",
  "THAN-K": "谢学家",
  "OH-NO": "完蛋了",
  GOGO: "冲冲冲",
  SEXY: "性感",
  "LOVE-R": "情圣",
  MUM: "老妈子",
  FAKE: "假人",
  OJBK: "没问题",
  MALO: "马楼",
  "JOKE-R": "搞笑王",
  "WOC!": "卧槽",
  "THIN-K": "想太多",
  SHIT: "屎",
  ZZZZ: "睡神",
  POOR: "穷鬼",
  MONK: "和尚",
  IMSB: "我傻逼",
  SOLO: "单身狗",
  FUCK: "暴躁",
  DEAD: "摆烂",
  IMFW: "我废物",
  HHHH: "哈哈哈",
  DRUNK: "酒鬼",
};

interface StatsTableProps {
  total: number;
  matrix: Record<string, Record<string, number>>;
  topMatches: Record<string, { mbti: string; count: number }[]>;
  topMbtiMatches: Record<string, { sbti: string; count: number }[]>;
  mbtiTypes: string[];
  sbtiTypes: string[];
}

function getCellBg(count: number, max: number): string {
  if (count === 0) return "#fff";
  const ratio = count / max;
  if (ratio > 0.75) return "#b6dcc5";
  if (ratio > 0.5) return "#c8e6d1";
  if (ratio > 0.25) return "#daf0e2";
  return "#e6f7ef";
}

function getCellColor(count: number, max: number): string {
  if (count === 0) return "#ccc";
  const ratio = count / max;
  if (ratio > 0.75) return "#fff";
  return "#1e2a22";
}

export default function StatsTable({
  total,
  matrix,
  topMatches,
  topMbtiMatches,
  mbtiTypes,
  sbtiTypes,
}: StatsTableProps) {
  if (total === 0) {
    return (
      <div className="text-center text-muted py-16 text-sm">
        暂无数据，提交你的类型来参与统计吧！
      </div>
    );
  }

  let maxCount = 0;
  for (const row of Object.values(matrix)) {
    for (const v of Object.values(row)) {
      if (v > maxCount) maxCount = v;
    }
  }

  // Compute row sums and column sums for sorting (data first)
  const rowSums: Record<string, number> = {};
  const colSums: Record<string, number> = {};
  for (const mbti of mbtiTypes) {
    let sum = 0;
    for (const sbti of sbtiTypes) {
      const v = matrix[mbti]?.[sbti] || 0;
      sum += v;
      colSums[sbti] = (colSums[sbti] || 0) + v;
    }
    rowSums[mbti] = sum;
  }

  // Sort: rows/columns with data come first, sorted by total descending
  const sortedMbti = [...mbtiTypes].sort((a, b) => (rowSums[b] || 0) - (rowSums[a] || 0));
  const sortedSbti = [...sbtiTypes].sort((a, b) => (colSums[b] || 0) - (colSums[a] || 0));

  return (
    <div className="space-y-6">
      {/* Total */}
      <div className="text-right text-sm text-muted">
        共 <span className="font-bold text-green">{total}</span> 人参与
      </div>

      {/* Top Matches: SBTI → MBTI */}
      {Object.keys(topMatches).length > 0 && (
        <div>
          <div className="text-[16px] font-bold text-text mb-3">
            每个 SBTI 对应最多的 MBTI TOP 3
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {sbtiTypes
              .filter((s) => topMatches[s])
              .sort((a, b) => {
                const sumA = topMatches[a].reduce((s, m) => s + m.count, 0);
                const sumB = topMatches[b].reduce((s, m) => s + m.count, 0);
                return sumB - sumA;
              })
              .map((sbti) => (
                <div
                  key={sbti}
                  className="bg-card rounded-[18px] p-4 border border-border shadow-[0_16px_40px_rgba(47,73,55,0.08)]"
                >
                  <div className="font-bold text-green mb-2">
                    {sbti}
                    {SBTI_LABELS[sbti] && (
                      <span className="text-muted font-normal text-xs ml-1.5">
                        {SBTI_LABELS[sbti]}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {topMatches[sbti].map((match, i) => (
                      <div key={match.mbti} className="flex items-center gap-2">
                        <span className="text-muted text-xs w-4">
                          {i + 1}.
                        </span>
                        <span className="text-text font-semibold text-sm">
                          {match.mbti}
                        </span>
                        <div className="flex-1 bg-bg rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(match.count / topMatches[sbti][0].count) * 100}%`,
                              background: "linear-gradient(90deg, #97b59c, #5b7a62)",
                            }}
                          />
                        </div>
                        <span className="text-muted text-xs w-6 text-right">
                          {match.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Top Matches: MBTI → SBTI (Reverse) */}
      {Object.keys(topMbtiMatches).length > 0 && (
        <div>
          <div className="text-[16px] font-bold text-text mb-3">
            每个 MBTI 对应最多的 SBTI TOP 3
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {mbtiTypes
              .filter((m) => topMbtiMatches[m])
              .sort((a, b) => {
                const sumA = topMbtiMatches[a].reduce((s, m) => s + m.count, 0);
                const sumB = topMbtiMatches[b].reduce((s, m) => s + m.count, 0);
                return sumB - sumA;
              })
              .map((mbti) => (
                <div
                  key={mbti}
                  className="bg-card rounded-[18px] p-4 border border-border shadow-[0_16px_40px_rgba(47,73,55,0.08)]"
                >
                  <div className="font-bold text-green mb-2">{mbti}</div>
                  <div className="space-y-2">
                    {topMbtiMatches[mbti].map((match, i) => (
                      <div key={match.sbti} className="flex items-center gap-2">
                        <span className="text-muted text-xs w-4">
                          {i + 1}.
                        </span>
                        <span className="text-text font-semibold text-sm">
                          {match.sbti}
                        </span>
                        <div className="flex-1 bg-bg rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(match.count / topMbtiMatches[mbti][0].count) * 100}%`,
                              background: "linear-gradient(90deg, #97b59c, #5b7a62)",
                            }}
                          />
                        </div>
                        <span className="text-muted text-xs w-6 text-right">
                          {match.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Heatmap */}
      <div>
        <div className="text-[16px] font-bold text-text mb-3">
          详细对照表
        </div>
        <div className="overflow-x-auto rounded-[22px] border border-border shadow-[0_16px_40px_rgba(47,73,55,0.08)]">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ background: "var(--color-green-light)" }}>
                <th className="sticky left-0 z-10 px-3 py-2 text-left text-muted font-bold text-sm whitespace-nowrap"
                    style={{ background: "var(--color-green-light)" }}>
                  MBTI ↓ SBTI →
                </th>
                {sortedSbti.map((s) => (
                  <th
                    key={s}
                    className="px-2 py-2 text-muted font-bold text-xs whitespace-nowrap text-center"
                  >
                    <div>{s}</div>
                    {SBTI_LABELS[s] && (
                      <div className="font-normal text-[10px] opacity-60">{SBTI_LABELS[s]}</div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedMbti.map((mbti) => (
                <tr key={mbti} className="border-t border-border">
                  <td className="sticky left-0 z-10 px-3 py-2 font-bold text-text whitespace-nowrap bg-card">
                    {mbti}
                  </td>
                  {sortedSbti.map((sbti) => {
                    const c = matrix[mbti]?.[sbti] || 0;
                    return (
                      <td
                        key={sbti}
                        className="px-2 py-2 text-center border-l border-border text-sm font-semibold"
                        style={{
                          background: getCellBg(c, maxCount),
                          color: getCellColor(c, maxCount),
                        }}
                      >
                        {c > 0 ? c : "0"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-muted mt-2">
          <span>少</span>
          <div className="flex gap-0.5">
            <div className="w-5 h-3 rounded-sm" style={{ background: "#e6f7ef" }} />
            <div className="w-5 h-3 rounded-sm" style={{ background: "#daf0e2" }} />
            <div className="w-5 h-3 rounded-sm" style={{ background: "#c8e6d1" }} />
            <div className="w-5 h-3 rounded-sm" style={{ background: "#b6dcc5" }} />
          </div>
          <span>多</span>
        </div>
      </div>
    </div>
  );
}
