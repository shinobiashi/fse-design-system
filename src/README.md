WordPress {{wordpress}} と WooCommerce {{woocommerce}} のブロックテーマ(FSE)にそのまま落とし込める前提で、サイトのデザイン案を作るための土台。部品は両者の全ブロック(コア {{coreBlocks}}・WooCommerce {{wooBlocks}})で、トークンの名前は theme.json のプリセットの slug と一致する。

**色と書体の値は中立の仮置き。** 案件ごとにブリーフの色・書体へ差し替える。差し替えるのは値だけで、トークンの名前(slug)・部品の構造・マークアップの約束は変えない。

## まず守ること

- **出力は WordPress のブロックが出す HTML に寄せる。** ブロックに当たる要素には、WordPress が付けるのと同じクラス(`wp-block-group`・`wp-block-columns` など)と、`data-wp-block="core/group"` のようにブロック名を書いた属性を付ける。部品一覧に無いブロックは作らない。詳しくは「マークアップの約束」。
- **値はプリセット変数でだけ書く。** 色は `var(--wp--preset--color--primary)`、文字サイズは `var(--wp--preset--font-size--medium)`、余白は `var(--wp--preset--spacing--50)`、角丸は `var(--wp--custom--radius--md)`。`#1f4e5a` や `24px` のような生の値を書かない(枠線の太さ `1px`・`2px` だけは例外)。
- **トップページはセクションの積み重ねにする。** 各セクションは全幅の `core/group` で、`data-pattern` にパターンの slug(例: `hero-cover-01`)を書く。セクションの順番は指示どおりにし、勝手に足さない。
- **セクションの中身は、指定されたパターンの部品に従う。** omotegae のパターンは公開中の {{activePatterns}} 件がそれぞれ部品(`PatternHeroCover01` など)になっていて、使うブロックと、入れる文言の項目・文字数の上限が書いてある。使うブロックは一覧で、順番・入れ子・数は表さない。何をいくつ並べるかは、パターンの説明と文言の項目(`member_1_…`〜`member_3_…` なら 3 つ)から決める。一覧は「omotegae のパターン」。
- **自分で絶対配置を書かない・JavaScript を書かない。** 重ね合わせが要るときは `core/cover`(CoverBlock)を使う。開閉は `core/details`・`core/accordion`、切り替えは `core/tabs` を使う。
- **写真は置き場所を示すだけにする。** 写真の代わりに `ds-ph` の箱(`<div class="ds-ph" data-label="商品写真" style="--ds-ratio: 1 / 1"></div>`)を置き、縦横比は「縦横比」のトークンから選ぶ。ストック写真の候補があるときだけ、その画像を使う。

## 色

| トークン | 変数 | 使いどころ |
|---|---|---|
| `base` | `--wp--preset--color--base` | ページの背景 |
| `base-2` | `--wp--preset--color--base-2` | セクションの背景・カード・入力欄の地 |
| `contrast` | `--wp--preset--color--contrast` | 本文・見出し |
| `contrast-2` | `--wp--preset--color--contrast-2` | 補足・日付・注記・税込表記 |
| `border` / `border-strong` | `--wp--preset--color--border` など | 装飾の線 / 入力欄など操作できる部品の枠 |
| `primary` / `on-primary` | `--wp--preset--color--primary` など | 主ボタン・リンク・強調 / その上の文字 |
| `secondary` / `on-secondary` | | 副ボタン・カテゴリ・タグ |
| `accent` / `on-accent` | | キャンペーン・新着など数か所だけ |
| `sale` / `on-sale` | | セール価格とセールバッジ |
| `success`・`warning`・`error` | | 通知・在庫表示 |
| `focus` | | フォーカスリング |

- 本文は `contrast` を `base` か `base-2` の上に置く。どの組み合わせも 4.5:1 以上(24px 以上の文字は 3:1 以上)を保つ。
- `primary` の面は 1 画面の 1 割ほどまでにする。ボタン・リンク・小さな強調に使い、大きな背景には `base-2` を使う。
- `accent` と `sale` は目を引くための色なので、1 画面に数か所までにする。
- `sale`・`success`・`warning`・`error` は色だけで意味を伝えない。必ず「SALE」「在庫あり」「入力してください」などの文字を添える。
- 色を差し替えるときは、`on-…` の色も一緒に見直し、地の色と 4.5:1 以上になるようにする。

## 文字

- 書体は `sans`(Noto Sans JP ほか)が基本。`serif`(Noto Serif JP ほか)は和の業種・高級感のある案件で、ファーストビューの見出しにだけ使う。
- 文字サイズは 6 段階: `small`(注記)・`medium`(本文)・`large`(リード・価格)・`x-large`(セクション見出し)・`xx-large`(ページ見出し)・`xxx-large`(キャッチコピー、1 ページ 1 回)。この他のサイズを作らない。
- 本文は行間 1.8〜1.9、字間 0.04em。見出しは行間 1.3〜1.5 で、`font-feature-settings: "palt"` で字間を詰める。詳しくは「日本語の文字組み」。
- 価格は `large` 以上・太字・等幅数字(`font-variant-numeric: tabular-nums`)。税込の表記は `small` で `contrast-2`。

## 余白とレイアウト

| トークン | 変数 | 値 |
|---|---|---|
{{spacingTable}}

- セクションの上下の余白は PC で `spacing-80`、スマホで `spacing-70`。左右の余白は `spacing-40`(`has-global-padding`)。
- セクションの中身は `is-layout-constrained` にする。本文は `content-size`(720px)、商品一覧・カラム・カバーの中身は `alignwide`(`wide-size` 1200px)、背景を画面端まで伸ばすものは `alignfull`。
- 要素の間隔は `block-gap`(1.5rem)が既定。詰めるときは `spacing-30`、離すときは `spacing-60` を使う。
- スマホ(781px 未満)ではカラムを縦に積む。横スクロールを作らない。

## 角丸・影・縦横比

- 角丸は 5 段階: 写真と表は `radius-none`、入力欄とバッジは `radius-sm`、ボタンとカードは `radius-md`、大きなカードとミニカートは `radius-lg`、丸ボタンとピル型のタグは `radius-full`。1 つの案件では、ボタンとカードの角丸をそろえる。
- 影は基本的に使わない。浮かせる必要がある部品(ミニカートの引き出し・ドロップダウン)だけ `shadow-natural`。
- 商品画像は `ratio-square` が既定。アパレルなど縦長の商品は `ratio-3-4`。1 つの一覧の中で比率を混ぜない。

## 状態とアクセシビリティ

- フォーカスは `focus` の色で 2px の実線を 2px 離して描く。消さない。
- タップできる部品は 44×44px 以上にする。
- 無効な状態は透明度 0.45 と、カーソルで示す。色だけで示さない。
- 入力エラーは、枠を `error` にし、その下に `error` の文字で理由を書く。

## WooCommerce のページ

- 商品詳細・商品一覧・カート・チェックアウト・注文完了は、WooCommerce のテンプレートの構成に沿って作る(「WooCommerce のテンプレート構成」)。並び順を変えたいときは、変えた点をデザインの注記に書く。
- 商品カードは、商品画像(`WcProductImage`、セールバッジを右上に重ねる)→ 商品名(`PostTitle`)→ 価格(`WcProductPrice`)→ カートに入れるボタン(`WcProductButton`)の順が既定。評価(`WcProductRating`)は商品名の下に置ける。
- 価格は「¥3,300(税込)」の形で書く。セール中は元の価格に取り消し線を引き、セール価格を `sale` の色で並べる。
- カート(`WcCart`)とチェックアウト(`WcCheckout`)の中身は WooCommerce が組み立てる。項目を増やしたり並べ替えたりせず、色・文字・余白・角丸だけで見た目を作る。

## 部品の読み方

- 各部品の README に、ブロック名、置ける場所、スタイルで変えられること(supports)、ブロックスタイル(`is-style-…`)、属性が書いてある。スタイルで変えられることに無い見た目は、テーマ側の CSS が要るので、多用しない。
- プレビューは 2 種類。見た目を再現した {{richPreviews}} 部品は、そのクラス構成をそのまま使ってよい。それ以外は「仕様カード」で、見た目の再現ではない。
- `components/index.d.ts` は各ブロックの属性(ブロックのコメント `<!-- wp:… -->` に入る JSON)の一覧。React の部品ではない。

## アイコン

- アイコンの素材は持たない。必要なときは WordPress の Icon ブロック(`core/icon`)と同じく、1.5px 前後の線で描いた 24px の SVG を使い、色は `currentColor` にする。
- 絵文字を飾りに使わない。ソーシャルリンクは `core/social-links` の形にする。
