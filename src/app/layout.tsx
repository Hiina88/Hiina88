import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prompt Vault — AI作業の指示書を、目的別に即コピー",
  description:
    "AI / Codex Cloud / Genspark / SNS / 画像・動画生成・長文記事などで使うプロンプトを目的別に保存・検索・ワンクリックコピーできるアプリです。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
