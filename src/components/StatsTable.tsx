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
  userMbti?: string | null;
  userSbti?: string | null;
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[16px] font-bold text-text mb-3">{children}</div>
  );
}

/* ── 排行榜 ── */
function RankingChart({
  title,
  items,
  getLabel,
  getSubLabel,
}: {
  title: string;
  items: { key: string; count: number }[];
  getLabel: (key: string) => string;
  getSubLabel?: (key: string) => string | undefined;
}) {
  const maxCount = items.length > 0 ? items[0].count : 1;
  const TOP_N = 10;
  const display = items.slice(0, TOP_N);

  if (display.length === 0) return null;

  return (
    <>
      <SectionTitle>{title}</SectionTitle>
      <div className="space-y-2">
        {display.map((item, i) => (
          <div key={item.key} className="flex items-center gap-2.5">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                background: i < 3 ? "var(--color-green)" : "var(--color-border)",
                color: i < 3 ? "#fff" : "var(--color-muted)",
              }}
            >
              {i + 1}
            </span>
            <div className="flex-shrink-0 w-20 text-sm">
              <span className="font-bold text-text">{getLabel(item.key)}</span>
              {getSubLabel && getSubLabel(item.key) && (
                <span className="text-muted text-xs ml-1">
                  {getSubLabel(item.key)}
                </span>
              )}
            </div>
            <div className="flex-1 bg-bg rounded-full h-3.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(item.count / maxCount) * 100}%`,
                  background:
                    i === 0
                      ? "linear-gradient(90deg, #6d9176, #4d6a53)"
                      : i === 1
                        ? "linear-gradient(90deg, #97b59c, #6d9176)"
                        : i === 2
                          ? "linear-gradient(90deg, #b6ccb8, #97b59c)"
                          : "linear-gradient(90deg, #d4e3d7, #b6ccb8)",
                }}
              />
            </div>
            <span className="text-muted text-xs w-8 text-right font-semibold">
              {item.count}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

/* ── 个人匹配卡片 ── */
function PersonalMatch({
  mbti,
  sbti,
  matrix,
  total,
}: {
  mbti: string;
  sbti: string;
  matrix: Record<string, Record<string, number>>;
  total: number;
}) {
  const pairCount = matrix[mbti]?.[sbti] || 0;
  const sameMbti = Object.values(matrix[mbti] || {}).reduce(
    (a, b) => a + b,
    0
  );
  const sameSbtiTotal = Object.entries(matrix).reduce(
    (acc, [, row]) => acc + (row[sbti] || 0),
    0
  );

  // 在同一 MBTI 中的 SBTI 排名
  const sameMbtiRankings = Object.entries(matrix[mbti] || {}).sort(
    (a, b) => b[1] - a[1]
  );
  const myRank =
    sameMbtiRankings.findIndex(([s]) => s === sbti) + 1;
  const uniqueSbtis = sameMbtiRankings.filter(([, c]) => c > 0).length;

  const pairPct = total > 0 ? ((pairCount / total) * 100).toFixed(2) : "0";
  const mbtiPct = total > 0 ? ((sameMbti / total) * 100).toFixed(1) : "0";
  const sbtiPct = total > 0 ? ((sameSbtiTotal / total) * 100).toFixed(1) : "0";

  return (
    <div
      className="rounded-[22px] p-5 border-2"
      style={{
        background:
          "linear-gradient(135deg, #edf6ef 0%, #d4e8d8 50%, #edf6ef 100%)",
        borderColor: "var(--color-green)",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">&#x1F3C6;</span>
        <span className="font-bold text-text text-base">你的匹配结果</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green">{mbti}</div>
          <div className="text-xs text-muted">你的 MBTI</div>
        </div>
        <div className="text-2xl text-green font-bold">&times;</div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green">{sbti}</div>
          <div className="text-xs text-muted">
            你的 SBTI
            {SBTI_LABELS[sbti] && (
              <span className="ml-1">({SBTI_LABELS[sbti]})</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card/80 rounded-xl p-3 text-center border border-border">
          <div className="text-lg font-bold text-green">{pairCount}</div>
          <div className="text-xs text-muted">和你一样的人</div>
        </div>
        <div className="bg-card/80 rounded-xl p-3 text-center border border-border">
          <div className="text-lg font-bold text-green">{pairPct}%</div>
          <div className="text-xs text-muted">占比</div>
        </div>
        <div className="bg-card/80 rounded-xl p-3 text-center border border-border">
          <div className="text-lg font-bold text-green">
            {myRank > 0 ? `第 ${myRank}` : "-"}
          </div>
          <div className="text-xs text-muted">
            在 {mbti} 中排名 (共 {uniqueSbtis})
          </div>
        </div>
        <div className="bg-card/80 rounded-xl p-3 text-center border border-border">
          <div className="text-lg font-bold text-green">{sameMbti}</div>
          <div className="text-xs text-muted">
            {mbti} 共 {sameMbti} 人 ({mbtiPct}%)
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="bg-card/80 rounded-xl p-3 text-center border border-border">
          <div className="text-lg font-bold text-green">{sameSbtiTotal}</div>
          <div className="text-xs text-muted">
            {sbti} 共 {sameSbtiTotal} 人 ({sbtiPct}%)
          </div>
        </div>
        <div className="bg-card/80 rounded-xl p-3 text-center border border-border">
          <div className="text-lg font-bold text-green">{total}</div>
          <div className="text-xs text-muted">总参与人数</div>
        </div>
      </div>
    </div>
  );
}

/* ── 主组件 ── */
export default function StatsTable({
  total,
  matrix,
  topMatches,
  topMbtiMatches,
  mbtiTypes,
  sbtiTypes,
  userMbti,
  userSbti,
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

  // 计算各类型总数
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

  // 排行榜数据
  const mbtiRanked = Object.entries(rowSums)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);

  const sbtiRanked = Object.entries(colSums)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);

  // 热力图排序
  const sortedMbti = [...mbtiTypes].sort(
    (a, b) => (rowSums[b] || 0) - (rowSums[a] || 0)
  );
  const sortedSbti = [...sbtiTypes].sort(
    (a, b) => (colSums[b] || 0) - (colSums[a] || 0)
  );

  return (
    <div className="space-y-6">
      {/* Total */}
      <div className="text-right text-sm text-muted">
        共 <span className="font-bold text-green">{total}</span> 人参与
      </div>

      {/* Personal Match Card */}
      {userMbti && userSbti && (
        <PersonalMatch
          mbti={userMbti}
          sbti={userSbti}
          matrix={matrix}
          total={total}
        />
      )}

      {/* Popularity Rankings - Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-[18px] p-5 border border-border shadow-[0_16px_40px_rgba(47,73,55,0.08)]">
          <RankingChart
            title="MBTI 人气排行 TOP 10"
            items={mbtiRanked}
            getLabel={(k) => k}
          />
        </div>
        <div className="bg-card rounded-[18px] p-5 border border-border shadow-[0_16px_40px_rgba(47,73,55,0.08)]">
          <RankingChart
            title="SBTI 人气排行 TOP 10"
            items={sbtiRanked}
            getLabel={(k) => k}
            getSubLabel={(k) => SBTI_LABELS[k]}
          />
        </div>
      </div>

      {/* Top Matches: SBTI → MBTI */}
      {Object.keys(topMatches).length > 0 && (
        <div>
          <SectionTitle>每个 SBTI 对应最多的 MBTI TOP 3</SectionTitle>
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
                      <div
                        key={match.mbti}
                        className="flex items-center gap-2"
                      >
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
                              background:
                                "linear-gradient(90deg, #97b59c, #5b7a62)",
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
          <SectionTitle>每个 MBTI 对应最多的 SBTI TOP 3</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {mbtiTypes
              .filter((m) => topMbtiMatches[m])
              .sort((a, b) => {
                const sumA = topMbtiMatches[a].reduce(
                  (s, m) => s + m.count,
                  0
                );
                const sumB = topMbtiMatches[b].reduce(
                  (s, m) => s + m.count,
                  0
                );
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
                      <div
                        key={match.sbti}
                        className="flex items-center gap-2"
                      >
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
                              background:
                                "linear-gradient(90deg, #97b59c, #5b7a62)",
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
        <SectionTitle>详细对照表</SectionTitle>
        <div className="overflow-x-auto rounded-[22px] border border-border shadow-[0_16px_40px_rgba(47,73,55,0.08)]">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ background: "var(--color-green-light)" }}>
                <th
                  className="sticky left-0 z-10 px-3 py-2 text-left text-muted font-bold text-sm whitespace-nowrap"
                  style={{ background: "var(--color-green-light)" }}
                >
                  MBTI ↓ SBTI →
                </th>
                {sortedSbti.map((s) => (
                  <th
                    key={s}
                    className="px-2 py-2 text-muted font-bold text-xs whitespace-nowrap text-center"
                  >
                    <div>{s}</div>
                    {SBTI_LABELS[s] && (
                      <div className="font-normal text-[10px] opacity-60">
                        {SBTI_LABELS[s]}
                      </div>
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
                    const isUserCell =
                      userMbti === mbti && userSbti === sbti && c > 0;
                    return (
                      <td
                        key={sbti}
                        className="px-2 py-2 text-center border-l border-border text-sm font-semibold"
                        style={{
                          background: isUserCell
                            ? "#a8d5b8"
                            : getCellBg(c, maxCount),
                          color: isUserCell
                            ? "#fff"
                            : getCellColor(c, maxCount),
                          outline: isUserCell
                            ? "2px solid var(--color-green)"
                            : undefined,
                          outlineOffset: "-2px",
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
            <div
              className="w-5 h-3 rounded-sm"
              style={{ background: "#e6f7ef" }}
            />
            <div
              className="w-5 h-3 rounded-sm"
              style={{ background: "#daf0e2" }}
            />
            <div
              className="w-5 h-3 rounded-sm"
              style={{ background: "#c8e6d1" }}
            />
            <div
              className="w-5 h-3 rounded-sm"
              style={{ background: "#b6dcc5" }}
            />
          </div>
          <span>多</span>
          {userMbti && userSbti && (
            <>
              <span className="mx-1">|</span>
              <div
                className="w-5 h-3 rounded-sm border"
                style={{
                  background: "#a8d5b8",
                  borderColor: "var(--color-green)",
                }}
              />
              <span>你的组合</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
