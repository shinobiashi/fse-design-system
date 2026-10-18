# デザインシステムへの公開

公開先: Claude の Design System アーティファクト「FSE基盤」。URL は `publish-target.json` に記録している。

公開は Claude(Claude Code、または Artifact ツールが使える Claude のセッション)から行う。GitHub Actions からは公開できない。Claude に次のように頼めばよい:

> fse-design-system の main を取得して `npm run all` を実行し、PUBLISHING.md の手順で FSE基盤 に公開して

## 手順(Claude が行う)

1. `npm run all` を実行し、`validate` が `OK` で終わることを確かめる。
2. 公開先のアーティファクトそのものを読み(`Artifact` の `read`、`path` なし)、続けて index(`project/design-system.json`)を読む(`path: "project/design-system.json"`)。`path` 付きの `read` だけでは、`publish` が「最新の版を見ていない」として拒否される。
3. `dist/publish-plan.json` の `batches` の順に、`Artifact` の `publish` で送る。`url` = 公開先、`root` = `dist`、`file_path` = バッチの 1 件目の**絶対パス**(`<リポジトリ>/dist/project/…`)、`files` = 残りのパス(`"project/…": "project/…"`)。`file_path` と同じパスを `files` にも入れると重複として拒否される。`project/components/index.d.ts` は拡張子から型が決まらないので、`{"from": "project/components/index.d.ts", "contentType": "text/plain"}` で送る。1 回に送れるのは 255 ファイルまで。index はここでは送らない。
4. 部品が消えた(WordPress / WooCommerce でブロックが削除された)ときは、そのパスを `null` にして消す。前回の公開との差は `git diff <前回公開したコミット> -- dist/` ではなく、アーティファクトの `list`(`scope: "files"`)と `dist/project/` の比較で調べる。
5. 最後に index を送る。手順 2 で読んだ内容を元に `lastChange` だけを書き換える(`by`: 依頼した人、`at`: 現在時刻、`via`: `GitHub · shinobiashi/fse-design-system@<コミットの短い SHA>`、`note`: 例「WordPress 7.2.0 / WooCommerce 11.3.0 に更新」)。ほかのキーは読んだまま残す。送る直前にもう一度読み直す。書き換えた index は scratchpad の `<フォルダ>/project/design-system.json` に置き、`root` = そのフォルダ、`file_path` = その絶対パスで送る。
6. `publish-target.json` の `lastPublished` を、公開したコミットとバージョンに更新し、ブランチを切って PR にする(`*.md` だけの変更ではないので main へ直接コミットしない)。

## 守ること

- `project/` の外へは書かない。`project/manifest.json`・`project/tokens.css`・`project/api/` はページが作るので送らない。
- ページ上で人が直したもの(トークンの値・説明文)は、次の公開で上書きされる。ページで直したら、同じ変更を `src/` にも入れてから公開する。
- デザインシステムを「既定」にしない(omotegae の案件のときだけ指定して使う)。
