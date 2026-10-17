# One-off authoring helper: writes src/previews/<Comp>.html for core blocks.
# The files it writes are the source of truth afterwards (edit them directly).
import os
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'previews')
os.makedirs(OUT, exist_ok=True)
SUB = 'subtitle="静的な再現(実際の出力と細部が異なることがある)"'

P = {}

P['Group'] = (420, '''<div class="ds-stage">
  <span class="ds-label">グループ(背景色付き・constrained)</span>
  <div class="wp-block-group has-base-2-background-color has-background is-layout-constrained" data-wp-block="core/group">
    <h3 class="wp-block-heading" data-wp-block="core/heading">季節のおすすめ</h3>
    <p data-wp-block="core/paragraph">背景色と余白を持つまとまり。セクションの土台はすべてこのブロック。</p>
  </div>
  <div class="ds-row" style="margin-top: var(--wp--preset--spacing--40)">
    <div class="ds-col">
      <span class="ds-label">横並び(Row: is-layout-flex)</span>
      <div class="wp-block-group is-layout-flex is-nowrap" data-wp-block="core/group">
        <div class="ds-ph" data-label="画像" style="--ds-ratio: 1 / 1; width: 64px"></div>
        <p data-wp-block="core/paragraph">アイコンと文章を横に並べる</p>
      </div>
    </div>
    <div class="ds-col">
      <span class="ds-label">縦積み(Stack: is-vertical)</span>
      <div class="wp-block-group is-layout-flex is-vertical" data-wp-block="core/group" style="gap: var(--wp--preset--spacing--20)">
        <p class="has-small-font-size has-contrast-2-color" data-wp-block="core/paragraph">2026.10.17</p>
        <p data-wp-block="core/paragraph"><strong>秋の新作を公開しました</strong></p>
      </div>
    </div>
  </div>
  <span class="ds-label" style="margin-top: var(--wp--preset--spacing--40)">グリッド(Grid: is-layout-grid)</span>
  <div class="wp-block-group is-layout-grid" data-wp-block="core/group">
    <div class="ds-ph" data-label="1"></div><div class="ds-ph" data-label="2"></div><div class="ds-ph" data-label="3"></div>
  </div>
</div>''')

P['Columns'] = (300, '''<div class="ds-stage">
  <div class="wp-block-columns alignwide" data-wp-block="core/columns">
    <div class="wp-block-column" data-wp-block="core/column">
      <div class="ds-ph" data-label="写真" style="--ds-ratio: 3 / 2"></div>
      <h3 class="wp-block-heading" data-wp-block="core/heading" style="margin-top: var(--wp--preset--spacing--30)">職人の手仕事</h3>
      <p class="has-small-font-size" data-wp-block="core/paragraph">ひとつずつ手で仕上げています。</p>
    </div>
    <div class="wp-block-column" data-wp-block="core/column">
      <div class="ds-ph" data-label="写真" style="--ds-ratio: 3 / 2"></div>
      <h3 class="wp-block-heading" data-wp-block="core/heading" style="margin-top: var(--wp--preset--spacing--30)">長く使える素材</h3>
      <p class="has-small-font-size" data-wp-block="core/paragraph">修理の相談も受け付けます。</p>
    </div>
    <div class="wp-block-column" data-wp-block="core/column">
      <div class="ds-ph" data-label="写真" style="--ds-ratio: 3 / 2"></div>
      <h3 class="wp-block-heading" data-wp-block="core/heading" style="margin-top: var(--wp--preset--spacing--30)">全国へ送料無料</h3>
      <p class="has-small-font-size" data-wp-block="core/paragraph">5,500円(税込)以上のご注文で。</p>
    </div>
  </div>
</div>''')

P['CoverBlock'] = (440, '''<div class="wp-block-cover alignfull is-position-bottom-left" data-wp-block="core/cover">
  <div class="ds-ph wp-block-cover__image-background" data-label="ヒーロー写真(16:9)"></div>
  <span aria-hidden="true" class="wp-block-cover__background has-background-dim-50"></span>
  <div class="wp-block-cover__inner-container is-layout-constrained">
    <p class="has-small-font-size" data-wp-block="core/paragraph" style="letter-spacing: 0.16em">AUTUMN COLLECTION</p>
    <h2 class="wp-block-heading has-xxx-large-font-size" data-wp-block="core/heading">暮らしに寄り添う<br>秋のうつわ</h2>
    <div class="wp-block-buttons" data-wp-block="core/buttons">
      <div class="wp-block-button" data-wp-block="core/button"><a class="wp-block-button__link wp-element-button" href="#">新作を見る</a></div>
    </div>
  </div>
</div>''')

P['MediaText'] = (320, '''<div class="ds-stage">
  <div class="wp-block-media-text is-stacked-on-mobile has-base-2-background-color has-background" data-wp-block="core/media-text">
    <figure class="wp-block-media-text__media" style="margin: 0"><div class="ds-ph" data-label="工房の写真" style="--ds-ratio: 4 / 3"></div></figure>
    <div class="wp-block-media-text__content">
      <p class="has-small-font-size has-primary-color" data-wp-block="core/paragraph" style="letter-spacing: 0.16em">ABOUT</p>
      <h3 class="wp-block-heading" data-wp-block="core/heading">兵庫の小さな工房から</h3>
      <p data-wp-block="core/paragraph">土選びから焼成まで、すべて工房で行っています。</p>
      <div class="wp-block-buttons" data-wp-block="core/buttons"><div class="wp-block-button is-style-outline" data-wp-block="core/button"><a class="wp-block-button__link wp-element-button" href="#">私たちについて</a></div></div>
    </div>
  </div>
</div>''')

P['Image'] = (330, '''<div class="ds-stage ds-row">
  <figure class="wp-block-image ds-col" data-wp-block="core/image">
    <div class="ds-ph" data-label="既定"></div>
    <figcaption class="wp-element-caption">キャプションは small・中央揃え</figcaption>
  </figure>
  <figure class="wp-block-image is-style-rounded" data-wp-block="core/image" style="width: 160px">
    <div class="ds-ph" data-label="角丸(is-style-rounded)" style="--ds-ratio: 1 / 1"></div>
  </figure>
</div>''')

P['Gallery'] = (300, '''<div class="ds-stage">
  <figure class="wp-block-gallery has-nested-images columns-3" data-wp-block="core/gallery" style="margin: 0">
    <figure class="wp-block-image" data-wp-block="core/image"><div class="ds-ph" data-label="1" style="--ds-ratio: 1 / 1"></div></figure>
    <figure class="wp-block-image" data-wp-block="core/image"><div class="ds-ph" data-label="2" style="--ds-ratio: 1 / 1"></div></figure>
    <figure class="wp-block-image" data-wp-block="core/image"><div class="ds-ph" data-label="3" style="--ds-ratio: 1 / 1"></div></figure>
    <figure class="wp-block-image" data-wp-block="core/image"><div class="ds-ph" data-label="4" style="--ds-ratio: 1 / 1"></div></figure>
    <figure class="wp-block-image" data-wp-block="core/image"><div class="ds-ph" data-label="5" style="--ds-ratio: 1 / 1"></div></figure>
    <figure class="wp-block-image" data-wp-block="core/image"><div class="ds-ph" data-label="6" style="--ds-ratio: 1 / 1"></div></figure>
  </figure>
</div>''')

P['Heading'] = (360, '''<div class="ds-stage is-layout-flow">
  <h1 class="wp-block-heading has-xxx-large-font-size" data-wp-block="core/heading">春の新作(xxx-large)</h1>
  <h2 class="wp-block-heading" data-wp-block="core/heading">暮らしに寄り添う道具(h2・xx-large)</h2>
  <h3 class="wp-block-heading" data-wp-block="core/heading">人気の商品(h3・x-large)</h3>
  <h4 class="wp-block-heading" data-wp-block="core/heading">お手入れについて(h4・large)</h4>
  <h2 class="wp-block-heading has-serif-font-family" data-wp-block="core/heading" style="font-weight: 500; letter-spacing: 0.08em">手しごとの、うつわ(明朝・任意)</h2>
</div>''')

P['Paragraph'] = (300, '''<div class="ds-stage is-layout-constrained">
  <p class="has-large-font-size" data-wp-block="core/paragraph">リード文は large。ひとつの段落で要点を伝える。</p>
  <p data-wp-block="core/paragraph">本文は medium、行間 1.9、字間 0.04em。職人が一つずつ仕上げた器を、毎日の食卓へお届けします。土の風合いを残した仕上げは、使うほどに手になじみます。</p>
  <p class="has-small-font-size has-contrast-2-color" data-wp-block="core/paragraph">※ 注記は small・contrast-2。表示価格はすべて税込です。</p>
</div>''')

P['List'] = (220, '''<div class="ds-stage ds-row">
  <ul class="wp-block-list ds-col" data-wp-block="core/list">
    <li data-wp-block="core/list-item">電子レンジ・食洗機に対応</li>
    <li data-wp-block="core/list-item">ひとつずつ色合いが異なります</li>
    <li data-wp-block="core/list-item">ギフト包装は無料です</li>
  </ul>
  <ol class="wp-block-list ds-col" data-wp-block="core/list">
    <li data-wp-block="core/list-item">カートに入れる</li>
    <li data-wp-block="core/list-item">お届け先を入力する</li>
    <li data-wp-block="core/list-item">お支払い方法を選ぶ</li>
  </ol>
</div>''')

P['Quote'] = (200, '''<div class="ds-stage">
  <blockquote class="wp-block-quote" data-wp-block="core/quote">
    <p data-wp-block="core/paragraph">毎朝この器でコーヒーを飲むのが楽しみになりました。手に持ったときの重さがちょうどいいです。</p>
    <cite>40代・兵庫県のお客さま</cite>
  </blockquote>
</div>''')

P['Pullquote'] = (240, '''<div class="ds-stage">
  <figure class="wp-block-pullquote" data-wp-block="core/pullquote">
    <blockquote><p>道具は、使う人の毎日を少しだけ良くするためにある。</p><cite>工房主宰</cite></blockquote>
  </figure>
</div>''')

P['Buttons'] = (160, '''<div class="ds-stage">
  <div class="wp-block-buttons is-content-justification-center" data-wp-block="core/buttons">
    <div class="wp-block-button" data-wp-block="core/button"><a class="wp-block-button__link wp-element-button" href="#">商品一覧へ</a></div>
    <div class="wp-block-button is-style-outline" data-wp-block="core/button"><a class="wp-block-button__link wp-element-button" href="#">お問い合わせ</a></div>
  </div>
</div>''')

P['Button'] = (260, '''<div class="ds-stage is-layout-flow">
  <span class="ds-label">塗り(既定)・アウトライン・副色・無効</span>
  <div class="wp-block-buttons" data-wp-block="core/buttons">
    <div class="wp-block-button" data-wp-block="core/button"><a class="wp-block-button__link wp-element-button" href="#">カートに入れる</a></div>
    <div class="wp-block-button is-style-outline" data-wp-block="core/button"><a class="wp-block-button__link wp-element-button" href="#">詳しく見る</a></div>
    <div class="wp-block-button" data-wp-block="core/button"><a class="wp-block-button__link wp-element-button has-secondary-background-color has-on-secondary-color has-background has-text-color" href="#">カタログ請求</a></div>
    <div class="wp-block-button" data-wp-block="core/button"><a class="wp-block-button__link wp-element-button" aria-disabled="true">在庫切れ</a></div>
  </div>
  <span class="ds-label">幅いっぱい(has-custom-width)</span>
  <div class="wp-block-buttons" data-wp-block="core/buttons">
    <div class="wp-block-button has-custom-width" data-wp-block="core/button" style="width: 100%"><a class="wp-block-button__link wp-element-button" href="#">ご購入手続きへ</a></div>
  </div>
</div>''')

P['Separator'] = (200, '''<div class="ds-stage is-layout-flow">
  <span class="ds-label">既定(短い)</span><hr class="wp-block-separator has-alpha-channel-opacity" data-wp-block="core/separator">
  <span class="ds-label">幅いっぱい(is-style-wide)</span><hr class="wp-block-separator is-style-wide" data-wp-block="core/separator">
  <span class="ds-label">ドット(is-style-dots)</span><hr class="wp-block-separator is-style-dots" data-wp-block="core/separator">
</div>''')

P['Spacer'] = (160, '''<div class="ds-stage">
  <p data-wp-block="core/paragraph">上の要素</p>
  <div style="height: var(--wp--preset--spacing--60)" aria-hidden="true" class="wp-block-spacer" data-wp-block="core/spacer"></div>
  <p data-wp-block="core/paragraph">下の要素(高さは spacing のプリセットで指定する。点線はプレビュー用)</p>
</div>''')

P['Table'] = (300, '''<div class="ds-stage ds-row">
  <figure class="wp-block-table ds-col" data-wp-block="core/table">
    <table><tbody>
      <tr><th>サイズ</th><td>直径 15cm × 高さ 4cm</td></tr>
      <tr><th>素材</th><td>陶器(信楽の土)</td></tr>
      <tr><th>対応</th><td>電子レンジ・食洗機</td></tr>
    </tbody></table>
  </figure>
  <figure class="wp-block-table is-style-stripes ds-col" data-wp-block="core/table">
    <table><thead><tr><th>地域</th><th>送料(税込)</th></tr></thead><tbody>
      <tr><td>本州・四国・九州</td><td>880円</td></tr>
      <tr><td>北海道・沖縄</td><td>1,650円</td></tr>
      <tr><td>5,500円以上</td><td>無料</td></tr>
    </tbody></table>
  </figure>
</div>''')

P['Details'] = (220, '''<div class="ds-stage">
  <details class="wp-block-details" data-wp-block="core/details" open>
    <summary>お届けまでの日数は?</summary>
    <p data-wp-block="core/paragraph">ご注文から 3〜5 営業日で発送します。</p>
  </details>
  <details class="wp-block-details" data-wp-block="core/details">
    <summary>ギフト包装はできますか?</summary>
    <p data-wp-block="core/paragraph">無料で承ります。</p>
  </details>
</div>''')

P['Accordion'] = (260, '''<div class="ds-stage">
  <div class="wp-block-accordion" data-wp-block="core/accordion">
    <div class="wp-block-accordion-item" data-wp-block="core/accordion-item">
      <h3 class="wp-block-accordion-heading" data-wp-block="core/accordion-heading"><button class="wp-block-accordion-heading__toggle" aria-expanded="true"><span>返品・交換はできますか?</span><span class="wp-block-accordion-heading__toggle-icon" aria-hidden="true">−</span></button></h3>
      <div class="wp-block-accordion-panel" data-wp-block="core/accordion-panel"><p data-wp-block="core/paragraph">商品到着から 7 日以内にご連絡ください。</p></div>
    </div>
    <div class="wp-block-accordion-item" data-wp-block="core/accordion-item">
      <h3 class="wp-block-accordion-heading" data-wp-block="core/accordion-heading"><button class="wp-block-accordion-heading__toggle" aria-expanded="false"><span>支払い方法は?</span><span class="wp-block-accordion-heading__toggle-icon" aria-hidden="true">+</span></button></h3>
      <div class="wp-block-accordion-panel" data-wp-block="core/accordion-panel" hidden><p>クレジットカード・銀行振込に対応しています。</p></div>
    </div>
  </div>
</div>''')

P['Tabs'] = (220, '''<div class="ds-stage">
  <div class="wp-block-tabs" data-wp-block="core/tabs">
    <div class="wp-block-tabs__list" role="tablist" data-wp-block="core/tab-list">
      <button class="wp-block-tabs__tab" role="tab" aria-selected="true">商品の説明</button>
      <button class="wp-block-tabs__tab" role="tab" aria-selected="false">サイズ</button>
      <button class="wp-block-tabs__tab" role="tab" aria-selected="false">お手入れ</button>
    </div>
    <div class="wp-block-tabs__panel" role="tabpanel" data-wp-block="core/tab-panel"><p data-wp-block="core/paragraph">ひとつずつ手で形を整えた平皿です。</p></div>
  </div>
</div>''')

CART_ICON = '<svg class="wc-block-mini-cart__icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 6h3l3 14h14l3-10H9"/><circle cx="12" cy="25" r="1.6"/><circle cx="22" cy="25" r="1.6"/></svg>'
ACCOUNT_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>'
MENU_ICON = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'

P['Navigation'] = (140, f'''<div class="ds-stage">
  <nav class="wp-block-navigation is-layout-flex" aria-label="メインメニュー" data-wp-block="core/navigation">
    <button class="wp-block-navigation__responsive-container-open" aria-label="メニューを開く">{MENU_ICON}</button>
    <ul class="wp-block-navigation__container">
      <li class="wp-block-navigation-item" data-wp-block="core/navigation-link"><a class="wp-block-navigation-item__content" href="#">新着</a></li>
      <li class="wp-block-navigation-item" data-wp-block="core/navigation-link"><a class="wp-block-navigation-item__content" href="#">うつわ</a></li>
      <li class="wp-block-navigation-item" data-wp-block="core/navigation-link"><a class="wp-block-navigation-item__content" href="#">キッチン道具</a></li>
      <li class="wp-block-navigation-item" data-wp-block="core/navigation-link"><a class="wp-block-navigation-item__content" href="#">工房について</a></li>
    </ul>
  </nav>
</div>''')

P['TemplatePart'] = (400, f'''<div>
  <header class="wp-block-template-part" data-wp-block="core/template-part" data-area="header">
    <div class="wp-block-group alignfull has-global-padding is-layout-flex is-content-justification-space-between is-nowrap" data-wp-block="core/group" style="padding-top: var(--wp--preset--spacing--30); padding-bottom: var(--wp--preset--spacing--30); border-bottom: 1px solid var(--wp--preset--color--border)">
      <div class="wp-block-group is-layout-flex is-nowrap" data-wp-block="core/group">
        <div class="wp-block-site-logo" data-wp-block="core/site-logo"><div class="ds-ph" data-label="ロゴ"></div></div>
        <p class="wp-block-site-title" data-wp-block="core/site-title"><a href="#">うつわ工房</a></p>
      </div>
      <nav class="wp-block-navigation is-layout-flex" data-wp-block="core/navigation" aria-label="メインメニュー">
        <button class="wp-block-navigation__responsive-container-open" aria-label="メニューを開く">{MENU_ICON}</button>
        <ul class="wp-block-navigation__container">
          <li class="wp-block-navigation-item"><a class="wp-block-navigation-item__content" href="#">新着</a></li>
          <li class="wp-block-navigation-item"><a class="wp-block-navigation-item__content" href="#">商品一覧</a></li>
          <li class="wp-block-navigation-item"><a class="wp-block-navigation-item__content" href="#">工房について</a></li>
        </ul>
      </nav>
      <div class="wp-block-group is-layout-flex is-nowrap" data-wp-block="core/group">
        <div class="wc-block-customer-account" data-wp-block="woocommerce/customer-account"><a href="#" aria-label="マイアカウント">{ACCOUNT_ICON}</a></div>
        <div class="wc-block-mini-cart" data-wp-block="woocommerce/mini-cart"><button class="wc-block-mini-cart__button" aria-label="カート(2 点)">{CART_ICON}<span class="wc-block-mini-cart__badge">2</span></button></div>
      </div>
    </div>
  </header>
  <div class="ds-stage"><span class="ds-label">… ページの中身 …</span></div>
  <footer class="wp-block-template-part" data-wp-block="core/template-part" data-area="footer">
    <div class="wp-block-group alignfull has-global-padding is-layout-constrained has-contrast-background-color has-base-color has-background has-text-color" data-wp-block="core/group" style="padding-top: var(--wp--preset--spacing--60); padding-bottom: var(--wp--preset--spacing--50)">
      <div class="wp-block-columns alignwide" data-wp-block="core/columns">
        <div class="wp-block-column" data-wp-block="core/column"><p class="wp-block-site-title" data-wp-block="core/site-title">うつわ工房</p><p class="has-small-font-size" data-wp-block="core/paragraph">兵庫県明石市</p></div>
        <div class="wp-block-column" data-wp-block="core/column"><p class="has-small-font-size" data-wp-block="core/paragraph">特定商取引法に基づく表記<br>プライバシーポリシー<br>お問い合わせ</p></div>
      </div>
      <p class="has-small-font-size" data-wp-block="core/paragraph" style="margin-top: var(--wp--preset--spacing--50)">© うつわ工房</p>
    </div>
  </footer>
</div>''')

P['SiteTitle'] = (140, '''<div class="ds-stage">
  <p class="wp-block-site-title" data-wp-block="core/site-title"><a href="#">うつわ工房</a></p>
  <p class="wp-block-site-tagline" data-wp-block="core/site-tagline">兵庫の小さな工房から、毎日の器を</p>
</div>''')

P['SocialLinks'] = (120, '''<div class="ds-stage">
  <ul class="wp-block-social-links" data-wp-block="core/social-links">
    <li class="wp-social-link wp-social-link-instagram" data-wp-block="core/social-link"><a href="#" aria-label="Instagram">IG</a></li>
    <li class="wp-social-link wp-social-link-x" data-wp-block="core/social-link"><a href="#" aria-label="X">X</a></li>
    <li class="wp-social-link wp-social-link-line" data-wp-block="core/social-link"><a href="#" aria-label="LINE">LINE</a></li>
  </ul>
  <p class="has-small-font-size has-contrast-2-color" style="margin-top: var(--wp--preset--spacing--20)">実際は各サービスのロゴの SVG が入る(core/social-link が出力する)。</p>
</div>''')

P['Search'] = (160, '''<div class="ds-stage">
  <form role="search" class="wp-block-search__button-outside wp-block-search" data-wp-block="core/search">
    <label class="wp-block-search__label" for="ds-search">商品を探す</label>
    <div class="wp-block-search__inside-wrapper">
      <input class="wp-block-search__input" id="ds-search" type="search" placeholder="キーワード(例: 平皿)">
      <button class="wp-block-search__button wp-element-button" type="submit">検索</button>
    </div>
  </form>
</div>''')

P['Query'] = (420, '''<div class="ds-stage">
  <div class="wp-block-query" data-wp-block="core/query">
    <ul class="wp-block-post-template is-layout-grid" data-wp-block="core/post-template">
      <li class="wp-block-post">
        <figure class="wp-block-post-featured-image" data-wp-block="core/post-featured-image"><div class="ds-ph" data-label="アイキャッチ"></div></figure>
        <div class="wp-block-post-date" data-wp-block="core/post-date"><time>2026.10.17</time></div>
        <h3 class="wp-block-post-title" data-wp-block="core/post-title"><a href="#">秋の新作を公開しました</a></h3>
      </li>
      <li class="wp-block-post">
        <figure class="wp-block-post-featured-image" data-wp-block="core/post-featured-image"><div class="ds-ph" data-label="アイキャッチ"></div></figure>
        <div class="wp-block-post-date" data-wp-block="core/post-date"><time>2026.10.03</time></div>
        <h3 class="wp-block-post-title" data-wp-block="core/post-title"><a href="#">工房見学会のお知らせ</a></h3>
      </li>
      <li class="wp-block-post">
        <figure class="wp-block-post-featured-image" data-wp-block="core/post-featured-image"><div class="ds-ph" data-label="アイキャッチ"></div></figure>
        <div class="wp-block-post-date" data-wp-block="core/post-date"><time>2026.09.20</time></div>
        <h3 class="wp-block-post-title" data-wp-block="core/post-title"><a href="#">器のお手入れ方法</a></h3>
      </li>
    </ul>
  </div>
</div>''')

P['QueryPagination'] = (110, '''<div class="ds-stage">
  <nav class="wp-block-query-pagination" aria-label="ページ送り" data-wp-block="core/query-pagination">
    <a class="wp-block-query-pagination-previous" href="#" data-wp-block="core/query-pagination-previous">前へ</a>
    <div class="wp-block-query-pagination-numbers" data-wp-block="core/query-pagination-numbers">
      <a class="page-numbers" href="#">1</a><span aria-current="page" class="page-numbers current">2</span><a class="page-numbers" href="#">3</a>
    </div>
    <a class="wp-block-query-pagination-next" href="#" data-wp-block="core/query-pagination-next">次へ</a>
  </nav>
</div>''')

P['Breadcrumbs'] = (90, '''<div class="ds-stage">
  <nav class="wp-block-breadcrumbs" aria-label="パンくずリスト" data-wp-block="core/breadcrumbs">
    <ol><li><a href="#">ホーム</a></li><li><a href="#">お知らせ</a></li><li><span aria-current="page">秋の新作を公開しました</span></li></ol>
  </nav>
</div>''')

P['Video'] = (300, '''<div class="ds-stage">
  <figure class="wp-block-video" data-wp-block="core/video">
    <div class="ds-ph" data-label="動画(16:9)" style="--ds-ratio: 16 / 9"></div>
    <figcaption class="wp-element-caption">ろくろを挽く様子</figcaption>
  </figure>
</div>''')

P['File'] = (110, '''<div class="ds-stage">
  <div class="wp-block-file" data-wp-block="core/file">
    <a href="#">2026年秋 カタログ(PDF・2.4MB)</a>
    <a href="#" class="wp-block-file__button wp-element-button">ダウンロード</a>
  </div>
</div>''')

for name, (h, html) in P.items():
    with open(os.path.join(OUT, f'{name}.html'), 'w') as f:
        f.write(f'<!-- @dsCard height={h} {SUB} -->\n{html}\n')
print(len(P), 'core previews')
