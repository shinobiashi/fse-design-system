# fse-design-system — FSE基盤

WordPress と WooCommerce のブロックテーマ(FSE)に落とし込む前提で、サイトのデザイン案を作るためのデザインシステム「FSE基盤」の元データと生成スクリプト。

公開先は Claude の Design System アーティファクト(「FSE基盤」)。Claude でデザインを作るときにこのシステムを指定すると、トークン(theme.json のプリセットと同じ名前)・部品(WordPress と WooCommerce の全ブロック)・マークアップの約束に沿ったデザインが出る。omotegae のデザイン 3 案の作成で使う。

## いまの対象

| | バージョン | ブロック数 |
|---|---|---|
| WordPress | 7.1.3(`WordPress/wordpress-develop`) | 115 |
| WooCommerce | 11.2.1(`woocommerce/woocommerce`) | 178 |

| omotegae のパターン | 本番の管理画面から書き出した JSON(`sources/omotegae-patterns.json`) | 37 件(公開中 33 件が部品) |

正は `sources.json`(固定するリリースタグと書き出しファイルの場所)と `data/versions.json`(同期の結果)。

> いまの `sources/omotegae-patterns.json` は、omotegae の `PatternSeeder` から作った**仮のデータ**。omotegae の書き出し機能(PR #98)を本番に出したら、本番から書き出した JSON で置き換える(下の「omotegae のパターンの取り込み」)。

## 仕組み

```
sources.json ──sync──▶ data/ ──build──▶ dist/project/ ──公開──▶ Design System アーティファクト
 (タグ)        (block.json・theme.json・    (tokens.json・README・部品)
                Woo のテンプレートを正規化)
src/ ─────────────────────────┘
 (トークン・文章・再現プレビュー・注記)
```

| パス | 中身 | 手で編集するか |
|---|---|---|
| `sources.json` | 取り込む WordPress / WooCommerce のリリースタグと、omotegae の書き出しファイルの場所 | する(または更新の PR が書き換える) |
| `sources/omotegae-patterns.json` | omotegae の管理画面から書き出したパターン(形式 `omotegae-patterns/1`) | しない(`npm run import-patterns` が置く) |
| `data/` | タグから取り出したブロック定義・theme.json の既定値・Woo のテンプレート構成 | しない(`npm run sync` が作る) |
| `src/tokens.base.json` | 色・書体・文字サイズ・角丸・レイアウトのトークン | する |
| `src/README.md`・`src/sections/` | デザインシステムの説明(使い方の規則) | する |
| `src/previews/<部品>.html` | 見た目を再現したプレビュー(51 部品) | する |
| `src/pattern-previews/<部品>.html` | omotegae のパターンの再現プレビュー(無ければ仕様カード) | する |
| `src/notes/<名前空間>__<ブロック>.md` | 部品ごとの「デザインでの扱い」 | する |
| `src/bundle.base.css` | プレビュー用のスタイル(WordPress の出力クラスをプリセット変数で描く) | する |
| `src/cover.html` | デザインシステムの表紙 | する |
| `dist/` | ビルドの出力(コミットしない) | しない |

余白・影・縦横比のトークンは、WordPress の theme.json の既定値から自動で作る(WordPress を更新すると追従する)。部品の README・仕様カード・`index.d.ts`・「WooCommerce のテンプレート構成」「ブロック一覧と対応状況」の節も自動生成。

## コマンド

Node 22 以上と git が必要(外部パッケージは使わない)。

```bash
npm run sync       # sources.json のタグから data/ を作り直す(GitHub から必要なファイルだけ取得)
npm run build      # data/ と src/ から dist/project/ を作る
npm run validate   # 形式・コントラスト・置き換え漏れの検査
npm run all        # 上の 3 つ
npm run check-updates   # 新しいリリースがあれば sources.json を上げて作り直し、変更点を dist/update-summary.md に書く
npm run import-patterns <file>   # omotegae から書き出したパターンを取り込み、変更点を出す
npm run check-patterns   # 壊れた omotegae の書き出しを sync・build・取り込みに与え、検査が拒否することを確かめる(作業ツリーの一時コピーで実行。CI でも実行)
python3 scripts/render-check.py [部品名…]   # 任意: プレビューを Chromium で描画し dist/render/ に保存(Python の playwright が必要)
```

## omotegae のパターンの取り込み

パターンの正は omotegae の**本番の `patterns` テーブル**(管理画面で追加・編集でき、`PatternSeeder` はそれを上書きしない)。パターンを追加・編集したら、次の手順でデザインシステムに反映する。

1. omotegae の管理画面 → パターン → 「JSON で書き出す」で `omotegae-patterns-YYYYMMDD-HHMMSS.json` を保存する。
2. `npm run import-patterns <保存したファイル>` を実行する。`sources/omotegae-patterns.json` を置き換えて同期・ビルド・検査をやり直し、追加・変更されたパターンを一覧で出す。
3. 公開中のパターンが増えたら、必要に応じて再現プレビュー(`src/pattern-previews/<部品>.html`)を足す。
4. コミットして、`PUBLISHING.md` の手順で公開する。

Claude に頼む場合は、書き出したファイルを渡して「FSE基盤に取り込んで公開して」と伝えればよい。公開中のパターンだけが部品(`PatternHeroCover01` など)になり、下書きと非推奨は「omotegae のパターン」の節の一覧にだけ載る。

## WordPress / WooCommerce の更新への追従

1. `.github/workflows/check-updates.yml` が毎週月曜 9:00(JST)に新しい安定版を探す(タグが数字だけのもの。beta・RC は対象外)。
2. 見つかったら `sources.json` を上げ、同期・ビルド・検査をやり直して、変更点の要約(追加・削除されたブロック、属性や supports の変更、テンプレート構成の変更)を本文にした PR を作る。
3. PR を確認してマージする。新しいブロックに再現プレビューや注記が要るなら、同じ PR に足す。
4. マージ後、`PUBLISHING.md` の手順でデザインシステムに反映する(アーティファクトへの公開は Claude から行う。GitHub Actions からは公開できない)。

注意: GitHub Actions の `GITHUB_TOKEN` で作った PR では CI が自動で走らない。PR を一度閉じて開き直すか、PR のブランチに空コミットを積むと走る。

## 公開

`PUBLISHING.md` を参照。
