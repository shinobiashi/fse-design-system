# マークアップの約束

デザイン案の HTML を、あとでブロックテーマ(テンプレート・パターン・theme.json)へ機械的に移せるようにするための約束。見た目より先にこれを守る。

## ブロックの印

ブロックに当たる要素には、WordPress が出力するのと同じクラスと、ブロック名を書いた `data-wp-block` を付ける。

```html
<div class="wp-block-group alignwide is-layout-flex is-content-justification-space-between" data-wp-block="core/group">
  <p class="woocommerce-result-count" data-wp-block="woocommerce/product-results-count">24 件の商品</p>
  <form class="woocommerce-ordering" data-wp-block="woocommerce/catalog-sorting">…</form>
</div>
```

- 外側のクラスは、コアのブロックが `wp-block-<名前>`(`core/media-text` → `wp-block-media-text`)、WooCommerce のブロックは各部品の README の「外側のクラス」と、再現プレビューのクラス構成に従う。
- ブロックの中の要素(`wp-block-cover__inner-container` など)は、再現プレビューにあるものはその名前を使う。無いものは自由に書いてよいが、ブロックの外へはみ出す構造(ブロックの外側の要素を飾るための入れ子)を作らない。
- ブロックスタイルは `is-style-<名前>`(`is-style-outline` など)。部品の README の「ブロックスタイル」にあるものだけを使う。
- 色・文字サイズの指定は WordPress のクラスで書ける: `has-primary-background-color`・`has-base-color`・`has-x-large-font-size`。クラスで書けるものはクラスで書く。

## セクション

トップページなど、パターンを並べて作るページでは、各セクションを全幅の `core/group` にし、`data-pattern` にパターンの slug を書く。

```html
<section class="wp-block-group alignfull has-global-padding is-layout-constrained has-base-2-background-color has-background"
         data-wp-block="core/group" data-pattern="features-columns-01">
  <h2 class="wp-block-heading has-text-align-center" data-wp-block="core/heading">選ばれる理由</h2>
  <div class="wp-block-columns alignwide" data-wp-block="core/columns">…</div>
</section>
```

- `data-pattern` の slug は、指示されたパターン以外を書かない。指示に無いセクションを足さない。
- ヘッダーとフッターは `core/template-part` で、`<header class="wp-block-template-part" data-wp-block="core/template-part" data-area="header">` のように `data-area` を付ける。

## スタイルの書き方

- 色・文字サイズ・余白・角丸・影は、プリセット変数かクラスでだけ書く。生の値は枠線の太さ(1px・2px)と `ds-ph` の `--ds-ratio` だけ。
- `style` 属性には変数の参照だけを書く(`style="padding-top: var(--wp--preset--spacing--80)"`)。これはブロックの「スタイルで変えられること」に当たる指定で、テーマ化のときにブロックの属性へ移せる。
- ブロックの supports に無い見た目(例: 段落に影)を作りたいときは、`<style>` にクラスで書き、`/* テーマCSS: 理由 */` の注記を付ける。テーマ化のときに style.css へ移す。使うのは最小限にする。
- 書かないもの: 自分で書く `position: absolute`・`fixed`、`!important`、JavaScript、外部の CSS フレームワーク、Web フォント以外の外部読み込み。

## レスポンシブ

- ブレークポイントは WordPress と同じ 600px と 782px。カラムは 781px 以下で縦に積む(`core/columns` の既定)。
- 文字サイズはスマホでも同じ slug を使う。`xxx-large` だけはスマホで `xx-large` 相当に落とす(テーマ化のときに theme.json の fluid で表す)。
- スマホのヘッダーはロゴ・メニューボタン(`core/navigation` の開くボタン)・ミニカートの 3 つまで。

## 写真と素材

- 写真は `<div class="ds-ph" data-label="ヒーロー写真" style="--ds-ratio: 16 / 9"></div>` で置き場所を示す。縦横比は「縦横比」のトークン(`ratio-…`)から選ぶ。
- ロゴは提供されたファイルを `core/site-logo` の位置に置く。提供が無いときは `core/site-title`(店名の文字)にする。ロゴを描き起こさない。
- ストック写真の候補が与えられたときは、その画像を使ってよい(透かし入りのまま。本番では正式なライセンスに差し替える)。
