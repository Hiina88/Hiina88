# AI Prompt Atelier

スマホでAIプロンプトを検索・コピー・保存できる、自分専用AI辞典アプリです。

> 完成優先版です。ログインなし・DBなし・難しいサーバーなしで、まずスマホから使える状態を優先しています。

## できること

- プロンプト保存
- カテゴリ分け
- タグ検索
- お気に入り
- ワンタップコピー
- 編集
- 削除
- 検索
- 最近使った履歴
- 成功率メモ
- 使用用途メモ
- バックアップ保存・読込
- iPhoneのホーム画面に追加できるPWA対応

## 入っているカテゴリ

1. Codex
2. Claude Code
3. GPT-5.5
4. ChatGPT image2.0
5. Claude Opus 4.7
6. Instagram運用
7. X運用

## 初心者向け：公開はNetlifyが一番ラクです

1. GitHubにこのリポジトリを置きます。
2. Netlifyで「Add new site」を押します。
3. 「Import an existing project」を押します。
4. GitHubを選び、このリポジトリを選びます。
5. Build command に `npm run build` と入れます。
6. Publish directory に `dist` と入れます。
7. 「Deploy site」を押します。
8. 完成したURLをiPhoneのSafariで開きます。
9. 共有ボタンを押し、「ホーム画面に追加」を押します。

## バックアップ

アプリ内の「使い方」タブから「バックアップ保存」を押すと、保存済みプロンプトをJSONファイルとしてダウンロードできます。スマホ変更やブラウザデータ削除に備えて、月1回くらい保存しておくと安心です。

## 注意

このアプリはログインなし・DBなしです。保存したデータは、使っているスマホのブラウザ内に保存されます。スマホを変えたり、ブラウザデータを消したりすると消える可能性があります。大事なプロンプトはメモアプリなどにもコピーしてください。

## 開発用コマンド

```bash
npm run build
npm run dev
npm run preview
```

`npm run build` で `dist` フォルダが作られます。Netlifyでは、この `dist` を公開します。
