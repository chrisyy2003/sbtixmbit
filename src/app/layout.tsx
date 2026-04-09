import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SBTI × MBTI 对照统计",
  description: "统计不同 SBTI 人格对应什么 MBTI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body
        className="antialiased"
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}
