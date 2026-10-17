# 案件ごとの差し替え

このシステムは、案件の色・書体を当てはめて使う。当てはめたものが、そのままテーマの theme.json になる。

## 何を差し替えるか

| 差し替えるもの | 元になるもの | theme.json の場所 |
|---|---|---|
| `primary` と `on-primary` | ブリーフの配色(palette の `primary`) | `settings.color.palette` |
| `secondary`・`accent` と各 `on-…` | ブリーフの配色の残り。無ければ `primary` から決める | `settings.color.palette` |
| `base`〜`border-strong` | 原則そのまま。暖色・寒色に寄せるときは彩度をわずかに足す | `settings.color.palette` |
| `sale`・`success`・`warning`・`error` | 原則そのまま。ブランドの色と近すぎるときだけ調整 | `settings.color.palette` |
| 書体 | ブリーフの書体(`fontFamilies`) | `settings.typography.fontFamilies` |
| 文字サイズの値 | ブリーフの文字サイズ。無ければこのシステムの値 | `settings.typography.fontSizes` |
| 角丸 | トーンのスライダー(やわらか ↔ シャープ) | `settings.custom.radius` |
| `content-size`・`wide-size` | ブリーフのレイアウト | `settings.layout` |

差し替えないもの: トークンの名前(slug)、余白の段階(`spacing-20`〜`80`)、縦横比、マークアップの約束、部品の構成。

## 差し替えるときの確認

1. 色を変えたら、`contrast`/`contrast-2` と `base`/`base-2`、各 `on-…` とその地の色が 4.5:1 以上かを確かめる。
2. `primary` が暗い色なら `on-primary` は白、明るい色なら `contrast` にする。
3. `sale` とブランドの色が近いときは、セール価格が埋もれないよう `sale` を調整し、セールバッジの文字で区別できることを確かめる。
4. 角丸は、ボタン・カード・入力欄を同じ考え方でそろえる(全部シャープ、または全部やわらか)。

## トーンのスライダーとの対応

omotegae のヒアリング(Step3)の 4 本のスライダーとの対応の目安。

| スライダー | 低い側 | 高い側 |
|---|---|---|
| クラシック ↔ モダン | 明朝を見出しに使う・字間を広めに | ゴシックのみ・余白を大きく |
| やわらか ↔ シャープ | `radius-md`〜`radius-lg`、ピル型のボタン | `radius-none`〜`radius-sm`、線を細く |
| シンプル ↔ リッチ | 色は `primary` だけ・写真は少なめ | `secondary`・`accent` も使う・写真を大きく |
| 落ち着いた ↔ 鮮やか | 彩度の低い `primary`・`base-2` を多用 | 彩度の高い `primary`・`accent` の面を広めに |
