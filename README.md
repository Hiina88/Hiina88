# Prompt Vault

AI作業の指示書を、目的別に即コピーできる司令塔。

> 使いたいプロンプトを **10秒以内に見つけて、ワンクリックでコピー** することがゴールです。

## 主な機能(MVP)

- プロンプト一覧表示 / 検索(タイトル・説明・本文・カテゴリ・タグを横断、AND 検索、大文字小文字無視、NFKC 正規化)
- カテゴリー絞り込み(件数表示付き) / タグ絞り込み(複数選択 AND)
- お気に入り表示(ヘッダ右上のトグル)
- プロンプト詳細表示(全文確認可能)
- ワンクリックコピー(コピー時に `usageCount +1`、`lastUsedAt` 更新、トースト通知)
- 新規追加 / 編集 / 削除
- 上に固定(pinned)/ お気に入り(favorite)
- 最近使ったプロンプトを上部に表示(横スクロール)
- LocalStorage に保存(リロードしてもデータが残る)
- 初期サンプルプロンプト 65 件(Codex Cloud 15 / Xポスト 8 / Instagram・SNS 7 / 長文記事 9 / 画像生成 5 / 動画生成 4 / 講座作成 4 / LP/セールス 5 / リサーチ 4 / 文章改善 4)

## 技術スタック

- Next.js 14 (App Router) + React 18
- TypeScript (strict)
- Tailwind CSS

追加ライブラリは入れていません。LocalStorage のみで動作するため、DB / 認証 / API は不要です。

## ディレクトリ構成

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                # メイン画面
├── components/
│   ├── PromptList.tsx
│   ├── PromptCard.tsx
│   ├── PromptEditor.tsx
│   ├── PromptDetail.tsx
│   ├── SearchBar.tsx
│   ├── CategoryFilter.tsx
│   ├── TagFilter.tsx
│   ├── RecentPrompts.tsx
│   ├── Toast.tsx
│   └── EmptyState.tsx
├── data/
│   └── initialPrompts.ts       # 初期サンプル(65件)
├── lib/
│   ├── promptUtils.ts          # 検索/並び替え/コピーなど純粋関数
│   └── storage.ts              # LocalStorage I/O(SSR セーフ + 既存非破壊)
└── types/
    └── prompt.ts
```

## 起動方法

```bash
# 依存関係インストール
npm install

# 開発サーバ起動(http://localhost:3000)
npm run dev

# 本番ビルド
npm run build

# 本番起動
npm start

# Lint
npm run lint
```

## データの取り扱い

- すべてのデータはブラウザの `localStorage` (`prompt-vault:prompts:v1`) に保存されます。
- 初回起動時のみ初期サンプルを投入します。投入済みフラグ (`prompt-vault:seeded:v1`) を持つため、ユーザーが全削除した状態を尊重します(再投入はしません)。
- 既存の保存データがある場合は破壊しません。

## 並び順の優先度

1. `pinned === true` を最上部
2. `favorite === true` を優先
3. `usageCount` が多い順
4. `updatedAt` が新しい順

## 検索仕様

- 対象: `title` / `description` / `prompt` / `category` / `tags`
- 大文字小文字を区別しない
- 全角・半角を NFKC 正規化
- スペース区切りで AND 検索

## 注意事項

- 本アプリは LocalStorage のみで動作します。複数端末同期は行いません。
- 初期サンプルに API キー・パスワード等の秘密情報は含まれていません。
- 医療・法律・金融・最新情報を扱うプロンプトには「最新情報の確認が必要」「専門家への相談」を促す指示を入れています。
