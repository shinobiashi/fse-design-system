# レビューバックログ(今回対応しない指摘)
| 追記日 | ID | 重大度 | 場所 | 内容 | 起票状況 |
|---|---|---|---|---|---|
| 2026-10-18 | R1-X1 | Low | scripts/lib.mjs:58-68 | `.cache/<名前>` があって `.git` が無いと、`sparseClone` が削除せずに clone して失敗する(feat/check-patterns の R1、差分範囲外) | 未起票 |
| 2026-10-18 | R1-L1 | Low | scripts/check-patterns.mjs | Ctrl+C / SIGTERM で止めると一時コピーが残る(feat/check-patterns の R1) | 未起票 |
| 2026-10-18 | R1-L2 | Low | scripts/check-patterns.mjs | コピーのシンボリックリンクが元のツリーを指しうる(いまは 0 件)。追跡していないものも複製する(feat/check-patterns の R1) | 未起票 |
