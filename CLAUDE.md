# CLAUDE.md

デザインシステム「FSE基盤」の元データと生成スクリプト。全体像は `README.md`、公開手順は `PUBLISHING.md`。

## ルール

- `data/` と `dist/` は手で編集しない。`data/` は `npm run sync`、`dist/` は `npm run build` が作る。
- 変更したら `npm run all` を通す(`validate` が OK で終わること)。CI は `data/` が `sync` の結果と一致することも確かめる。
- トークンの名前(slug)は theme.json のプリセットの slug と一致させる。名前を変えると、omotegae のプロンプトと過去のデザインが参照できなくなるので、変えない。値は変えてよい。
- 色を足したり変えたりしたら、`scripts/validate.mjs` の `PAIRS` にコントラストの組み合わせを足す。
- 再現プレビュー(`src/previews/<部品>.html`)は、WordPress / WooCommerce が実際に出力するクラス構成に合わせ、値はプリセット変数(`var(--wp--preset--…)`)とクラス(`has-…-color` など)だけで書く。1 行目は `<!-- @dsCard height=N subtitle="…" -->`(group は build が付ける)。
- 部品の名前は `scripts/lib.mjs` の `componentName()` が決める(コアは `PostTitle`、WooCommerce は `WcProductPrice`)。`core/cover` は表紙と衝突するので `CoverBlock`。
- `sources/omotegae-patterns.json` は手で編集しない。omotegae の管理画面から書き出した JSON を `npm run import-patterns <file>` で置く(パターンの正は omotegae の本番 DB)。パターンの部品名は `Pattern` + slug の PascalCase(`hero-cover-01` → `PatternHeroCover01`)。
- omotegae の書き出しは外部からの入力として扱う。`scripts/sync.mjs` と `scripts/import-patterns.mjs` で形と型を検査し、合わないものは既定値で埋めずにエラーにする(読むキーを足したら検査も足す)。書き出しの文字列を生成物に入れるときはエスケープする(`index.d.ts` のコメントなら `*/`)。
- パターンの `block_map` は使うブロックの平らな一覧で、順番・入れ子・数を持たない。生成物で組み立ての手順として見せない(何をいくつ並べるかは、説明と文言の項目から決める)。
- `scripts/authoring/` は最初の再現プレビューを書き出した使い捨てのスクリプト。いまは `src/previews/` が正なので、プレビューはそちらを直接直す。
- 外部パッケージを足さない(Node の標準ライブラリと git だけで動かす)。
- 文書は日本語。チャットやコミットにトークンや鍵を書かない。
