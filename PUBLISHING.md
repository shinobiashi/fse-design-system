# デザインシステムへの公開

公開先: Claude の Design System アーティファクト「FSE基盤」。URL は `publish-target.json` に記録している。

公開は Claude(Claude Code、または Artifact ツールが使える Claude のセッション)から行う。GitHub Actions からは公開できない。Claude に次のように頼めばよい:

> fse-design-system の main を取得して `npm run all` を実行し、PUBLISHING.md の手順で FSE基盤 に公開して

## 手順(Claude が行う)

1. `npm run all` を実行し、`validate` が `OK` で終わることを確かめる。
2. 公開先のアーティファクトの index(`project/design-system.json`)を読む(`Artifact` の `read`、`path: "project/design-system.json"`)。
3. `dist/publish-plan.json` の `batches` の順に、`Artifact` の `publish` で `url` = 公開先、`root` = `dist`、`files` = そのバッチのパス(`"project/…": "project/…"`)を送る。1 回に送れるのは 255 ファイルまで。index はここでは送らない。
4. 部品が消えた(WordPress / WooCommerce でブロックが削除された)ときは、そのパスを `null` にして消す。前回の公開との差は `git diff <前回公開したコミット> -- dist/` ではなく、アーティファクトの `list`(`scope: "files"`)と `dist/project/` の比較で調べる。
5. 最後に index を送る。手順 2 で読んだ内容を元に `lastChange` だけを書き換える(`by`: 依頼した人、`at`: 現在時刻、`via`: `GitHub · shinobiashi/fse-design-system@<コミットの短い SHA>`、`note`: 例「WordPress 7.2.0 / WooCommerce 11.3.0 に更新」)。ほかのキーは読んだまま残す。送る直前にもう一度読み直す。
6. `publish-target.json` の `lastPublished` を、公開したコミットとバージョンに更新してコミットする。

## 守ること

- `project/` の外へは書かない。`project/manifest.json`・`project/tokens.css`・`project/api/` はページが作るので送らない。
- ページ上で人が直したもの(トークンの値・説明文)は、次の公開で上書きされる。ページで直したら、同じ変更を `src/` にも入れてから公開する。
- デザインシステムを「既定」にしない(omotegae の案件のときだけ指定して使う)。
