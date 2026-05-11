const prompts = [
  {
    id: "codex-mobile-issue",
    tool: "Codexスマホ版",
    category: "codex",
    source: "https://openai.com/business/guides-and-resources/how-openai-uses-codex/",
    title: "スマホから投げるGitHub Issue型タスク",
    summary: "移動中でもCodexへ背景・完了条件・検証をまとめて渡し、PRレビュー可能な差分まで進めるための型。",
    patterns: ["背景→要件→制約→完了条件の順に書く", "大きい変更は先に実装計画を作らせる", "テスト・スクショ・差分要約まで依頼する"],
    prompt: `あなたはこのリポジトリのシニア実装担当です。スマホからの短い依頼なので、足りない情報は最小限だけ質問し、それ以外は妥当な仮定を明記して進めてください。

# 背景
[ユーザー/事業上の背景]

# 変更したいこと
- [機能・修正1]
- [機能・修正2]

# 制約
- 既存の設計・スタイルを優先
- 破壊的変更は避ける
- セキュリティ/個人情報/アクセシビリティを確認

# 進め方
1. まず関連ファイルを調査し、短い実装計画を提示
2. 計画に沿って最小差分で実装
3. 必要なテスト/リンター/型チェックを実行
4. 変更点、検証結果、残リスクをPR本文形式で要約

# 完了条件
- [ユーザーが確認できる状態]
- テスト結果が分かる
- レビューしやすい差分になっている`
  },
  {
    id: "claude-code-debug",
    tool: "Claude Code",
    category: "claude-code",
    source: "https://docs.anthropic.com/en/docs/claude-code/overview",
    title: "原因探索→修正→再発防止デバッグ",
    summary: "Claude Codeのリポジトリ探索力を活かし、症状から根本原因と再発防止テストまで一気通貫で進める型。",
    patterns: ["最初に再現手順と期待値を固定", "探索ログを短く残させる", "修正だけでなくテスト追加を要求"],
    prompt: `このバグを根本原因まで調査して修正してください。

# 症状
[何が起きているか]

# 再現手順
1. [手順]
2. [手順]

# 期待値
[本来どうなるべきか]

# 依頼
- 関連ファイルを読んで、原因仮説を最大3つに絞る
- 最も可能性が高い仮説から検証する
- 修正は最小差分にする
- 同じ不具合を防ぐテストまたはチェックを追加する
- 最後に「原因 / 変更 / 検証 / 注意点」を箇条書きで報告する

# 禁止
- 関係ないリファクタリング
- テスト未実行のまま完了扱いにすること`
  },
  {
    id: "gpt55-strategist",
    tool: "GPT-5.5",
    category: "gpt55",
    source: "https://developers.openai.com/api/docs/guides/prompt-guidance",
    title: "少ない指示で深く考える戦略参謀",
    summary: "GPT-5.5向けに、過剰な儀式よりも目的・判断基準・出力形式をクリアにする汎用プロンプト。",
    patterns: ["最初に成功条件を定義", "不確実性は推測と事実に分ける", "最後に次アクションを3つ出す"],
    prompt: `あなたはトップ1%の戦略参謀です。以下のテーマについて、事実・推論・提案を分けて、意思決定に使える形で答えてください。

# テーマ
[相談したいテーマ]

# 目的
[何を決めたいか / 何を達成したいか]

# 前提
- [既知の条件]
- [制約]

# 出力形式
1. 結論: 先に1段落で
2. 判断材料: 重要度順に5点
3. 選択肢: 3案をメリット/デメリット/リスク付きで比較
4. 推奨案: なぜそれか
5. 盲点: 見落としやすいリスク
6. 次の一手: 今日できる3アクション

不明点があっても止まらず、合理的な仮定を置いたうえで明記してください。`
  },
  {
    id: "image20-art-director",
    tool: "ChatGPT Images 2.0",
    category: "image20",
    source: "https://openai.com/academy/image-generation/",
    title: "一発で意図を伝えるアートディレクション",
    summary: "目的・主題・動き・場所・スタイル・テキスト品質をまとめ、生成/編集のブレを減らす画像プロンプト。",
    patterns: ["用途と媒体を最初に指定", "主題・構図・光・質感を明示", "文字入りは短く、シャープなレンダリングを指定"],
    prompt: `以下の条件で画像を作成してください。

# 用途
[例: スマホLPのヒーロー画像 / SNS告知 / アプリストア画像]

# 主題
[誰/何が中心か]

# シーン
[どこで、何が起きているか]

# 構図
- 縦長9:16、スマホで見やすい余白
- 主役は中央やや上、背景は情報量を抑える
- 重要要素はセーフエリア内に配置

# スタイル
[例: 高級SaaS広告、未来的、柔らかい自然光、3D clay、ミニマル]

# 色と質感
[ブランドカラー / 光 / レンズ / 素材]

# 文字
入れる文字: 「[短い文言]」
シャープで読みやすい文字レンダリング。文字の歪み・誤字を避ける。

# 避けること
[不要な要素、過度な装飾、ブランド毀損につながる表現]`
  },
  {
    id: "opus47-deep-work",
    tool: "Claude Opus 4.7",
    category: "opus47",
    source: "https://platform.claude.com/docs/en/about-claude/models/whats-new-claude-4-7",
    title: "長文コンテキストを使う深い仕事",
    summary: "大きな資料・コード・仕様を読ませて、矛盾発見から実行計画まで落とすOpus 4.7向けプロンプト。",
    patterns: ["コンテキストの優先順位を指定", "長文は引用位置や根拠を要求", "自己検証ステップを明示"],
    prompt: `あなたはClaude Opus 4.7です。長いコンテキストを精密に扱い、矛盾・欠落・実行可能性を検証してください。

# ゴール
[最終的に作りたい成果物]

# 読む資料の優先順位
1. [最重要資料]
2. [補助資料]
3. [参考資料]

# タスク
- まず全体像を10行以内で要約
- 重要な制約・決定事項・未決事項を抽出
- 矛盾や曖昧さを「影響度: 高/中/低」で分類
- 成果物を作るための実行計画をフェーズ分けする
- 最後に自分の結論を再点検し、弱い根拠や確認すべき点を列挙

# 出力
## 要約
## 重要論点
## 矛盾/欠落
## 実行計画
## 確認質問
## 自己検証メモ`
  },
  {
    id: "codex-review",
    tool: "Codexスマホ版",
    category: "codex",
    source: "https://platform.openai.com/docs/codex",
    title: "PRレビュー専用・差分から危険箇所を探す",
    summary: "スマホでPR確認するときに、Codexへリスク順レビューと修正提案を作らせる型。",
    patterns: ["重大度順にレビュー", "再現可能な指摘だけ採用", "修正パッチ案を添える"],
    prompt: `このPR差分をレビューしてください。目的は「マージ前に本当に危ない点だけを見つける」ことです。

# 見てほしい観点
- 仕様漏れ、破壊的変更、データ損失
- セキュリティ、権限、個人情報
- パフォーマンス劣化
- モバイルUI/アクセシビリティ
- テスト不足

# 出力ルール
- 重大度 High / Medium / Low で分類
- ファイル名と該当箇所を示す
- なぜ問題か、どう直すかを書く
- 根拠が弱いものは「確認推奨」に分ける
- 最後にマージ可否を一言で判断する`
  },
  {
    id: "claude-code-refactor",
    tool: "Claude Code",
    category: "claude-code",
    source: "https://docs.anthropic.com/en/docs/claude-code/common-workflows",
    title: "安全な段階的リファクタリング",
    summary: "大きな改修を小さなコミット単位へ分割し、挙動維持を確認しながら進める型。",
    patterns: ["最初に依存関係を地図化", "挙動維持テストを先に確認", "段階ごとに検証"],
    prompt: `次のリファクタリングを安全に進めてください。

# 目的
[何を整理したいか]

# 絶対に変えない挙動
- [外部API]
- [UI]
- [保存データ]

# 進め方
1. 関連ファイルと依存関係を調べる
2. 変更前に既存テスト/動作確認コマンドを把握
3. リファクタリングを3〜5ステップに分割
4. 各ステップ後に検証
5. 最終的に差分を要約し、今後の改善余地を分けて提案

大規模な書き換えが必要なら、まず計画だけ提示して止まってください。`
  },
  {
    id: "image20-edit",
    tool: "ChatGPT Images 2.0",
    category: "image20",
    source: "https://platform.openai.com/docs/guides/images/image-generation",
    title: "元画像の良さを残す精密編集",
    summary: "人物・商品・構図など残す要素を明示し、編集範囲だけを変えるためのプロンプト。",
    patterns: ["保持する要素を先に列挙", "変更する範囲を限定", "質感・照明の整合性を指定"],
    prompt: `添付画像を編集してください。

# 必ず保持
- 人物/商品の形、表情、質感
- カメラアングルと主要な構図
- 元の光の方向と自然な影

# 変更したい点
[例: 背景を高級ホテルのラウンジに変更 / 服だけを白いジャケットに変更]

# 仕上がり
- 写真として自然
- 境界が不自然に見えない
- 元画像と同じ解像感・レンズ感
- スマホ画面で見たとき主題が明確

# 避けること
顔や手の崩れ、ブランドロゴの改変、不自然な文字、過度な美化。`
  }
];

const grid = document.querySelector("#promptGrid");
const template = document.querySelector("#promptCardTemplate");
const searchInput = document.querySelector("#searchInput");
const chips = [...document.querySelectorAll(".chip")];
const promptCount = document.querySelector("#promptCount");
const toast = document.querySelector("#toast");
const favoriteIds = new Set(JSON.parse(localStorage.getItem("favoritePromptIds") || "[]"));
let activeFilter = "all";

const toolColors = {
  codex: "#8be9fd",
  "claude-code": "#ffb86c",
  gpt55: "#50fa7b",
  image20: "#ff79c6",
  opus47: "#bd93f9"
};

function normalize(value) {
  return value.toLowerCase().replace(/\s+/g, "");
}

function getFilteredPrompts() {
  const query = normalize(searchInput.value.trim());
  return prompts.filter((item) => {
    const matchesFilter = activeFilter === "all" || item.category === activeFilter;
    const haystack = normalize([item.tool, item.title, item.summary, item.patterns.join(" "), item.prompt].join(" "));
    return matchesFilter && (!query || haystack.includes(query));
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.setTimeout(() => toast.classList.remove("is-visible"), 1600);
}

async function copyPrompt(prompt) {
  try {
    await navigator.clipboard.writeText(prompt);
    showToast("コピーしました");
  } catch {
    showToast("コピーできませんでした");
  }
}

function saveFavorites() {
  localStorage.setItem("favoritePromptIds", JSON.stringify([...favoriteIds]));
}

function render() {
  const filtered = getFilteredPrompts();
  promptCount.textContent = filtered.length.toString();
  grid.innerHTML = "";

  if (!filtered.length) {
    grid.innerHTML = `<p class="summary">該当するプロンプトがありません。検索語を変えてください。</p>`;
    return;
  }

  filtered.forEach((item) => {
    const node = template.content.firstElementChild.cloneNode(true);
    const badge = node.querySelector(".tool-badge");
    const favoriteButton = node.querySelector(".favorite-button");
    const patternList = node.querySelector(".pattern-list");

    badge.textContent = item.tool;
    badge.style.background = toolColors[item.category];
    node.querySelector("h3").textContent = item.title;
    node.querySelector(".summary").textContent = item.summary;
    node.querySelector("code").textContent = item.prompt;
    node.querySelector(".source-link").href = item.source;

    item.patterns.forEach((pattern) => {
      const li = document.createElement("li");
      li.textContent = pattern;
      patternList.append(li);
    });

    if (favoriteIds.has(item.id)) {
      favoriteButton.classList.add("is-active");
      favoriteButton.textContent = "★";
    }

    favoriteButton.addEventListener("click", () => {
      if (favoriteIds.has(item.id)) {
        favoriteIds.delete(item.id);
        favoriteButton.classList.remove("is-active");
        favoriteButton.textContent = "☆";
      } else {
        favoriteIds.add(item.id);
        favoriteButton.classList.add("is-active");
        favoriteButton.textContent = "★";
      }
      saveFavorites();
    });

    node.querySelector(".copy-button").addEventListener("click", () => copyPrompt(item.prompt));
    grid.append(node);
  });
}

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    activeFilter = chip.dataset.filter;
    chips.forEach((item) => item.classList.toggle("is-active", item === chip));
    render();
  });
});

searchInput.addEventListener("input", render);
render();
