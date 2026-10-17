# One-off authoring helper: writes src/previews/<Comp>.html for WooCommerce blocks.
import os
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'previews')
SUB = 'subtitle="静的な再現(実際の出力と細部が異なることがある)"'
CART_ICON = '<svg class="wc-block-mini-cart__icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 6h3l3 14h14l3-10H9"/><circle cx="12" cy="25" r="1.6"/><circle cx="22" cy="25" r="1.6"/></svg>'
ACCOUNT_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>'

def stars(n, total=5):
    return '<span class="wc-block-components-product-rating__stars" role="img" aria-label="5 点中 %d 点">%s<span class="is-empty">%s</span></span>' % (n, '★' * n, '★' * (total - n))

def price(regular, sale=None):
    if sale:
        return ('<div class="wc-block-components-product-price" data-wp-block="woocommerce/product-price">'
                f'<del aria-hidden="true">¥{regular}</del><ins>¥{sale}</ins><span class="ds-tax">(税込)</span></div>')
    return f'<div class="wc-block-components-product-price" data-wp-block="woocommerce/product-price">¥{regular}<span class="ds-tax">(税込)</span></div>'

def card(name, regular, sale=None, rating=None, cta='カートに入れる'):
    badge = '<span class="wc-block-components-product-sale-badge" data-wp-block="woocommerce/product-sale-badge">SALE</span>' if sale else ''
    rate = (f'<div class="wc-block-components-product-rating" data-wp-block="woocommerce/product-rating">{stars(rating)}'
            f'<span class="wc-block-components-product-rating__reviews_count">(12)</span></div>') if rating else ''
    return f'''<li class="wc-block-product">
        <div class="wc-block-components-product-image" data-wp-block="woocommerce/product-image"><div class="ds-ph" data-label="商品画像"></div>{badge}</div>
        <h3 class="wp-block-post-title" data-wp-block="core/post-title"><a href="#">{name}</a></h3>
        {rate}{price(regular, sale)}
        <div class="wp-block-button wc-block-components-product-button" data-wp-block="woocommerce/product-button"><a class="wp-block-button__link wp-element-button add_to_cart_button" href="#">{cta}</a></div>
      </li>'''

P = {}

P['WcProductCollection'] = (470, f'''<div class="ds-stage">
  <div class="wp-block-woocommerce-product-collection alignwide" data-wp-block="woocommerce/product-collection">
    <ul class="wc-block-product-template columns-4" data-wp-block="woocommerce/product-template">
      {card('信楽の平皿 15cm', '3,300')}
      {card('粉引のマグカップ', '3,850', '3,080', 4)}
      {card('木の取り分けスプーン', '1,980', None, 5)}
      {card('土鍋 二人用', '9,900', None, None, '選択肢を選ぶ')}
    </ul>
  </div>
</div>''')

P['WcProductImage'] = (300, '''<div class="ds-stage ds-row">
  <div class="ds-col" style="max-width: 220px"><span class="ds-label">既定(正方形)</span>
    <div class="wc-block-components-product-image" data-wp-block="woocommerce/product-image"><div class="ds-ph" data-label="商品画像"></div></div></div>
  <div class="ds-col" style="max-width: 220px"><span class="ds-label">セールバッジを重ねる</span>
    <div class="wc-block-components-product-image" data-wp-block="woocommerce/product-image"><div class="ds-ph" data-label="商品画像"></div><span class="wc-block-components-product-sale-badge" data-wp-block="woocommerce/product-sale-badge">SALE</span></div></div>
</div>''')

P['WcProductPrice'] = (200, f'''<div class="ds-stage is-layout-flow">
  <span class="ds-label">通常</span>{price('3,300')}
  <span class="ds-label">セール中(元の価格に取り消し線・セール価格は sale)</span>{price('3,850', '3,080')}
  <span class="ds-label">価格帯(バリエーションのある商品)</span><div class="wc-block-components-product-price" data-wp-block="woocommerce/product-price">¥2,200 – ¥4,400<span class="ds-tax">(税込)</span></div>
</div>''')

P['WcProductSaleBadge'] = (110, '''<div class="ds-stage ds-row">
  <span class="wc-block-components-product-sale-badge" data-wp-block="woocommerce/product-sale-badge">SALE</span>
  <span class="wc-block-components-product-sale-badge" data-wp-block="woocommerce/product-sale-badge">20%OFF</span>
</div>''')

P['WcProductRating'] = (120, f'''<div class="ds-stage is-layout-flow">
  <div class="wc-block-components-product-rating" data-wp-block="woocommerce/product-rating">{stars(4)}<span class="wc-block-components-product-rating__reviews_count">(12 件のレビュー)</span></div>
  <div class="wc-block-components-product-rating" data-wp-block="woocommerce/product-rating">{stars(5)}<span class="wc-block-components-product-rating__reviews_count">(3 件のレビュー)</span></div>
</div>''')

P['WcProductButton'] = (150, '''<div class="ds-stage ds-row">
  <div class="ds-col"><div class="wp-block-button wc-block-components-product-button" data-wp-block="woocommerce/product-button"><a class="wp-block-button__link wp-element-button add_to_cart_button" href="#">カートに入れる</a></div></div>
  <div class="ds-col"><div class="wp-block-button wc-block-components-product-button" data-wp-block="woocommerce/product-button"><a class="wp-block-button__link wp-element-button" href="#">選択肢を選ぶ</a></div></div>
  <div class="ds-col"><div class="wp-block-button wc-block-components-product-button" data-wp-block="woocommerce/product-button"><a class="wp-block-button__link wp-element-button" aria-disabled="true">在庫切れ</a></div></div>
</div>''')

P['WcAddToCartWithOptions'] = (330, '''<div class="ds-stage" style="max-width: 460px">
  <form class="wc-block-add-to-cart-with-options" data-wp-block="woocommerce/add-to-cart-with-options">
    <div data-wp-block="woocommerce/add-to-cart-with-options-variation-selector">
      <span class="wc-block-variation-selector__label">色</span>
      <div class="wc-block-variation-selector__pills" role="radiogroup" aria-label="色">
        <button type="button" class="wc-block-variation-selector__pill" role="radio" aria-checked="true">白</button>
        <button type="button" class="wc-block-variation-selector__pill" role="radio" aria-checked="false">飴釉</button>
        <button type="button" class="wc-block-variation-selector__pill" role="radio" aria-checked="false" aria-disabled="true">黒(在庫切れ)</button>
      </div>
    </div>
    <p class="wc-block-components-product-stock-indicator wc-block-components-product-stock-indicator--low-stock" data-wp-block="woocommerce/product-stock-indicator">残り 3 点</p>
    <div class="wc-block-add-to-cart-with-options__actions">
      <div class="wc-block-components-quantity-selector" data-wp-block="woocommerce/add-to-cart-with-options-quantity-selector">
        <button type="button" class="wc-block-components-quantity-selector__button" aria-label="1 つ減らす">−</button>
        <input class="wc-block-components-quantity-selector__input" type="number" value="1" aria-label="数量">
        <button type="button" class="wc-block-components-quantity-selector__button" aria-label="1 つ増やす">+</button>
      </div>
      <button type="submit" class="wp-block-button__link wp-element-button">カートに入れる</button>
    </div>
  </form>
</div>''')

P['WcProductGallery'] = (440, '''<div class="ds-stage" style="max-width: 440px">
  <div class="wc-block-product-gallery" data-wp-block="woocommerce/product-gallery">
    <div class="wc-block-product-gallery-large-image" data-wp-block="woocommerce/product-gallery-large-image"><div class="ds-ph" data-label="メイン画像"></div></div>
    <div class="wc-block-product-gallery-thumbnails" data-wp-block="woocommerce/product-gallery-thumbnails">
      <div class="is-active"><div class="ds-ph" data-label="1"></div></div><div><div class="ds-ph" data-label="2"></div></div><div><div class="ds-ph" data-label="3"></div></div><div><div class="ds-ph" data-label="4"></div></div><div><div class="ds-ph" data-label="5"></div></div>
    </div>
  </div>
</div>''')

P['WcProductDetails'] = (300, '''<div class="ds-stage">
  <div class="wp-block-woocommerce-product-details is-style-minimal woocommerce-tabs" data-wp-block="woocommerce/product-details">
    <ul class="tabs" role="tablist">
      <li class="active" role="presentation"><a href="#" role="tab" aria-selected="true">説明</a></li>
      <li role="presentation"><a href="#" role="tab">追加情報</a></li>
      <li role="presentation"><a href="#" role="tab">レビュー(12)</a></li>
    </ul>
    <div class="panel" role="tabpanel">
      <table class="woocommerce-product-attributes"><tbody>
        <tr><th>サイズ</th><td>直径 15cm × 高さ 4cm</td></tr>
        <tr><th>重さ</th><td>約 320g</td></tr>
        <tr><th>素材</th><td>陶器</td></tr>
      </tbody></table>
    </div>
  </div>
</div>''')

P['WcProductStockIndicator'] = (130, '''<div class="ds-stage is-layout-flow">
  <p class="wc-block-components-product-stock-indicator wc-block-components-product-stock-indicator--in-stock" data-wp-block="woocommerce/product-stock-indicator">在庫あり</p>
  <p class="wc-block-components-product-stock-indicator wc-block-components-product-stock-indicator--low-stock" data-wp-block="woocommerce/product-stock-indicator">残り 3 点</p>
  <p class="wc-block-components-product-stock-indicator wc-block-components-product-stock-indicator--out-of-stock" data-wp-block="woocommerce/product-stock-indicator">在庫切れ</p>
</div>''')

P['WcBreadcrumbs'] = (90, '''<div class="ds-stage">
  <nav class="woocommerce-breadcrumb" aria-label="パンくずリスト" data-wp-block="woocommerce/breadcrumbs"><a href="#">ホーム</a><span aria-hidden="true">/</span><a href="#">うつわ</a><span aria-hidden="true">/</span><span>信楽の平皿 15cm</span></nav>
</div>''')

P['WcCatalogSorting'] = (110, '''<div class="ds-stage">
  <form class="woocommerce-ordering" data-wp-block="woocommerce/catalog-sorting">
    <select name="orderby" class="orderby" aria-label="並び替え">
      <option>おすすめ順</option><option>新着順</option><option>価格の安い順</option><option>価格の高い順</option><option>人気順</option>
    </select>
  </form>
</div>''')

P['WcProductResultsCount'] = (90, '''<div class="ds-stage">
  <p class="woocommerce-result-count" data-wp-block="woocommerce/product-results-count">24 件中 1〜12 件を表示</p>
</div>''')

P['WcProductFilters'] = (470, '''<div class="ds-stage" style="max-width: 300px">
  <div class="wc-block-product-filters" data-wp-block="woocommerce/product-filters">
    <div data-wp-block="woocommerce/product-filter-active">
      <ul class="wc-block-product-filter-removable-chips__items" data-wp-block="woocommerce/product-filter-removable-chips">
        <li class="wc-block-product-filter-removable-chips__item">色: 白 <button class="wc-block-product-filter-removable-chips__remove" aria-label="色: 白 を外す">×</button></li>
      </ul>
    </div>
    <div data-wp-block="woocommerce/product-filter-taxonomy">
      <h3 class="wc-block-product-filter__heading">カテゴリ</h3>
      <ul class="wc-block-product-filter-checkbox-list__items" data-wp-block="woocommerce/product-filter-checkbox-list">
        <li><label class="wc-block-product-filter-checkbox-list__label"><input class="wc-block-product-filter-checkbox-list__input" type="checkbox" checked> 皿 <span class="wc-block-product-filter-checkbox-list__count">(12)</span></label></li>
        <li><label class="wc-block-product-filter-checkbox-list__label"><input class="wc-block-product-filter-checkbox-list__input" type="checkbox"> 碗・鉢 <span class="wc-block-product-filter-checkbox-list__count">(8)</span></label></li>
        <li><label class="wc-block-product-filter-checkbox-list__label"><input class="wc-block-product-filter-checkbox-list__input" type="checkbox"> マグ <span class="wc-block-product-filter-checkbox-list__count">(5)</span></label></li>
      </ul>
    </div>
    <div data-wp-block="woocommerce/product-filter-attribute">
      <h3 class="wc-block-product-filter__heading">色</h3>
      <div class="wc-block-product-filter-chips__items" data-wp-block="woocommerce/product-filter-chips">
        <button class="wc-block-product-filter-chips__item" role="checkbox" aria-checked="true">白</button>
        <button class="wc-block-product-filter-chips__item" role="checkbox" aria-checked="false">飴釉</button>
        <button class="wc-block-product-filter-chips__item" role="checkbox" aria-checked="false">黒</button>
      </div>
    </div>
    <div data-wp-block="woocommerce/product-filter-price">
      <h3 class="wc-block-product-filter__heading">価格</h3>
      <input class="wc-block-product-filter-price-slider__range" type="range" min="0" max="10000" value="6000" aria-label="上限の価格" data-wp-block="woocommerce/product-filter-price-slider">
      <div class="wc-block-product-filter-price-slider__inputs"><span>¥0</span><span>〜</span><span>¥6,000</span></div>
    </div>
  </div>
</div>''')

P['WcMiniCart'] = (380, f'''<div class="ds-stage">
  <div class="wc-block-mini-cart" data-wp-block="woocommerce/mini-cart">
    <button class="wc-block-mini-cart__button" aria-label="カート(2 点・¥6,380)">{CART_ICON}<span class="wc-block-mini-cart__badge">2</span><span class="wc-block-mini-cart__amount">¥6,380</span></button>
  </div>
  <span class="ds-label" style="margin-top: var(--wp--preset--spacing--30)">開いたときの引き出し(mini-cart-contents)</span>
  <div class="wc-block-mini-cart__drawer" data-wp-block="woocommerce/mini-cart-contents">
    <h2 class="wc-block-components-title" data-wp-block="woocommerce/mini-cart-title-block">カート(2 点)</h2>
    <div class="wc-block-components-order-summary-item"><div class="ds-ph" data-label="画像"></div><div><strong>信楽の平皿 15cm</strong><div class="wc-block-components-order-summary-item__quantity">数量 1</div></div><span>¥3,300</span></div>
    <div class="wc-block-components-order-summary-item"><div class="ds-ph" data-label="画像"></div><div><strong>粉引のマグカップ</strong><div class="wc-block-components-order-summary-item__quantity">数量 1</div></div><span>¥3,080</span></div>
    <div class="wc-block-components-totals-item wc-block-components-totals-footer-item"><span>小計</span><span>¥6,380</span></div>
    <div class="wp-block-buttons" data-wp-block="woocommerce/mini-cart-footer-block" style="margin-top: var(--wp--preset--spacing--30)">
      <div class="wp-block-button is-style-outline" style="flex: 1"><a class="wp-block-button__link wp-element-button" href="#" style="width: 100%">カートを見る</a></div>
      <div class="wp-block-button" style="flex: 1"><a class="wp-block-button__link wp-element-button" href="#" style="width: 100%">購入手続きへ</a></div>
    </div>
  </div>
</div>''')

P['WcCustomerAccount'] = (100, f'''<div class="ds-stage ds-row">
  <div class="wc-block-customer-account" data-wp-block="woocommerce/customer-account"><a href="#" aria-label="マイアカウント">{ACCOUNT_ICON}</a></div>
  <div class="wc-block-customer-account" data-wp-block="woocommerce/customer-account"><a href="#">{ACCOUNT_ICON}<span>ログイン</span></a></div>
</div>''')

P['WcStoreNotices'] = (280, '''<div class="ds-stage is-layout-flow" data-wp-block="woocommerce/store-notices">
  <div class="wc-block-components-notice-banner is-success" role="status"><span class="wc-block-components-notice-banner__icon" aria-hidden="true">✓</span><div class="wc-block-components-notice-banner__content">「信楽の平皿 15cm」をカートに追加しました。</div></div>
  <div class="wc-block-components-notice-banner is-error" role="alert"><span class="wc-block-components-notice-banner__icon" aria-hidden="true">!</span><div class="wc-block-components-notice-banner__content">在庫が足りないため、数量を 3 点に変更しました。</div></div>
  <div class="wc-block-components-notice-banner is-warning" role="status"><span class="wc-block-components-notice-banner__icon" aria-hidden="true">!</span><div class="wc-block-components-notice-banner__content">あと 1,120円で送料無料です。</div></div>
  <div class="wc-block-components-notice-banner is-info" role="status"><span class="wc-block-components-notice-banner__icon" aria-hidden="true">i</span><div class="wc-block-components-notice-banner__content">年末年始は 12/28〜1/4 の発送をお休みします。</div></div>
</div>''')

P['WcCart'] = (520, '''<div class="ds-stage">
  <div class="wp-block-woocommerce-cart wc-block-cart" data-wp-block="woocommerce/cart">
    <div class="wc-block-components-sidebar-layout" data-wp-block="woocommerce/filled-cart-block">
      <div data-wp-block="woocommerce/cart-items-block">
        <table class="wc-block-cart-items" data-wp-block="woocommerce/cart-line-items-block">
          <thead><tr><th colspan="2">商品</th><th style="text-align: right">合計</th></tr></thead>
          <tbody>
            <tr class="wc-block-cart-items__row">
              <td class="wc-block-cart-item__image"><div class="ds-ph" data-label="画像"></div></td>
              <td><a class="wc-block-components-product-name" href="#">信楽の平皿 15cm</a>
                <div class="wc-block-components-product-price" style="font-size: var(--wp--preset--font-size--small); font-weight: 400">¥3,300</div>
                <div class="wc-block-components-quantity-selector" style="margin-top: var(--wp--preset--spacing--20)"><button class="wc-block-components-quantity-selector__button" aria-label="1 つ減らす">−</button><input class="wc-block-components-quantity-selector__input" value="1" aria-label="数量"><button class="wc-block-components-quantity-selector__button" aria-label="1 つ増やす">+</button></div>
                <button class="wc-block-cart-item__remove-link">削除</button></td>
              <td class="wc-block-cart-item__total">¥3,300</td>
            </tr>
            <tr class="wc-block-cart-items__row">
              <td class="wc-block-cart-item__image"><div class="ds-ph" data-label="画像"></div></td>
              <td><a class="wc-block-components-product-name" href="#">粉引のマグカップ</a>
                <div class="wc-block-components-product-price" style="font-size: var(--wp--preset--font-size--small); font-weight: 400"><del>¥3,850</del><ins>¥3,080</ins></div>
                <div class="wc-block-components-quantity-selector" style="margin-top: var(--wp--preset--spacing--20)"><button class="wc-block-components-quantity-selector__button" aria-label="1 つ減らす">−</button><input class="wc-block-components-quantity-selector__input" value="1" aria-label="数量"><button class="wc-block-components-quantity-selector__button" aria-label="1 つ増やす">+</button></div>
                <button class="wc-block-cart-item__remove-link">削除</button></td>
              <td class="wc-block-cart-item__total">¥3,080</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="wc-block-components-sidebar" data-wp-block="woocommerce/cart-totals-block">
        <h2 class="wc-block-components-title" data-wp-block="woocommerce/cart-order-summary-heading-block">ご注文内容</h2>
        <div class="wc-block-components-totals-coupon__form" data-wp-block="woocommerce/cart-order-summary-coupon-form-block"><div class="wc-block-components-text-input" style="flex: 1"><input aria-label="クーポンコード" placeholder="クーポンコード"></div><button class="wp-element-button" style="padding: 0.5em 1em">適用</button></div>
        <div class="wc-block-components-totals-item" data-wp-block="woocommerce/cart-order-summary-subtotal-block" style="margin-top: var(--wp--preset--spacing--30)"><span>小計</span><span>¥6,380</span></div>
        <div class="wc-block-components-totals-item" data-wp-block="woocommerce/cart-order-summary-shipping-block"><span>送料<br><span class="wc-block-components-totals-item__description">本州・四国・九州</span></span><span>¥880</span></div>
        <div class="wc-block-components-totals-item wc-block-components-totals-footer-item" data-wp-block="woocommerce/cart-order-summary-totals-block"><span>合計(税込)</span><span>¥7,260</span></div>
        <a class="wp-block-button__link wp-element-button wc-block-cart__submit-button" href="#" data-wp-block="woocommerce/proceed-to-checkout-block">ご購入手続きへ</a>
      </div>
    </div>
  </div>
</div>''')

P['WcCheckout'] = (900, '''<div class="ds-stage">
  <div class="wp-block-woocommerce-checkout wc-block-checkout" data-wp-block="woocommerce/checkout">
    <div class="wc-block-components-sidebar-layout">
      <form class="wc-block-checkout__form" data-wp-block="woocommerce/checkout-fields-block">
        <div class="wc-block-components-express-payment" data-wp-block="woocommerce/checkout-express-payment-block">
          <p class="wc-block-components-express-payment__title">かんたん決済</p>
          <div class="wc-block-components-express-payment__buttons"><div class="ds-ph" data-label="決済ボタン"></div><div class="ds-ph" data-label="決済ボタン"></div></div>
        </div>
        <fieldset class="wc-block-components-checkout-step" data-wp-block="woocommerce/checkout-contact-information-block" style="border: 0; padding: 0; margin: 0">
          <div class="wc-block-components-checkout-step__heading"><h2 class="wc-block-components-checkout-step__title">連絡先</h2></div>
          <p class="wc-block-components-checkout-step__description">注文の確認メールをお送りします。</p>
          <div class="wc-block-components-text-input"><label for="ds-email">メールアドレス</label><input id="ds-email" type="email" value="hanako@example.jp"></div>
        </fieldset>
        <fieldset class="wc-block-components-checkout-step" data-wp-block="woocommerce/checkout-shipping-address-block" style="border: 0; padding: 0; margin: 0">
          <div class="wc-block-components-checkout-step__heading"><h2 class="wc-block-components-checkout-step__title">お届け先</h2></div>
          <div class="wc-block-components-address-form">
            <div class="wc-block-components-text-input"><label>姓</label><input value="明石"></div>
            <div class="wc-block-components-text-input"><label>名</label><input value="花子"></div>
            <div class="wc-block-components-text-input has-error"><label>郵便番号</label><input value="673-00" aria-invalid="true"><div class="wc-block-components-validation-error" role="alert">郵便番号を 7 桁で入力してください。</div></div>
            <div class="wc-block-components-text-input"><label>都道府県</label><input value="兵庫県"></div>
            <div class="wc-block-components-text-input is-wide"><label>市区町村・番地</label><input value="明石市大明石町 1-1"></div>
            <div class="wc-block-components-text-input is-wide"><label>電話番号</label><input value="078-000-0000"></div>
          </div>
        </fieldset>
        <fieldset class="wc-block-components-checkout-step" data-wp-block="woocommerce/checkout-shipping-methods-block" style="border: 0; padding: 0; margin: 0">
          <div class="wc-block-components-checkout-step__heading"><h2 class="wc-block-components-checkout-step__title">配送方法</h2></div>
          <div class="wc-block-components-radio-control">
            <label class="wc-block-components-radio-control__option"><input class="wc-block-components-radio-control__input" type="radio" name="ds-ship" checked><span><span class="wc-block-components-radio-control__label">通常配送</span><span class="wc-block-components-radio-control__description">3〜5 営業日で発送</span></span><span class="wc-block-components-radio-control__secondary-label">¥880</span></label>
            <label class="wc-block-components-radio-control__option"><input class="wc-block-components-radio-control__input" type="radio" name="ds-ship"><span><span class="wc-block-components-radio-control__label">日時指定</span><span class="wc-block-components-radio-control__description">お届け日と時間帯を選べます</span></span><span class="wc-block-components-radio-control__secondary-label">¥1,100</span></label>
          </div>
        </fieldset>
        <fieldset class="wc-block-components-checkout-step" data-wp-block="woocommerce/checkout-payment-block" style="border: 0; padding: 0; margin: 0">
          <div class="wc-block-components-checkout-step__heading"><h2 class="wc-block-components-checkout-step__title">お支払い方法</h2></div>
          <div class="wc-block-components-radio-control">
            <label class="wc-block-components-radio-control__option"><input class="wc-block-components-radio-control__input" type="radio" name="ds-pay" checked><span class="wc-block-components-radio-control__label">クレジットカード</span></label>
            <label class="wc-block-components-radio-control__option"><input class="wc-block-components-radio-control__input" type="radio" name="ds-pay"><span class="wc-block-components-radio-control__label">銀行振込</span></label>
          </div>
        </fieldset>
        <label class="wc-block-components-checkbox" data-wp-block="woocommerce/checkout-terms-block"><input type="checkbox"><span><a href="#">利用規約</a>と<a href="#">プライバシーポリシー</a>に同意します</span></label>
        <div class="wc-block-checkout__actions" data-wp-block="woocommerce/checkout-actions-block"><a href="#">← カートに戻る</a><button class="wp-block-button__link wp-element-button" type="submit">注文を確定する</button></div>
      </form>
      <div class="wc-block-components-sidebar" data-wp-block="woocommerce/checkout-totals-block">
        <h2 class="wc-block-components-title" data-wp-block="woocommerce/checkout-order-summary-block">ご注文内容</h2>
        <div class="wc-block-components-order-summary-item" data-wp-block="woocommerce/checkout-order-summary-cart-items-block"><div class="ds-ph" data-label="画像"></div><div>信楽の平皿 15cm<div class="wc-block-components-order-summary-item__quantity">数量 1</div></div><span>¥3,300</span></div>
        <div class="wc-block-components-order-summary-item"><div class="ds-ph" data-label="画像"></div><div>粉引のマグカップ<div class="wc-block-components-order-summary-item__quantity">数量 1</div></div><span>¥3,080</span></div>
        <div class="wc-block-components-totals-item"><span>小計</span><span>¥6,380</span></div>
        <div class="wc-block-components-totals-item"><span>送料</span><span>¥880</span></div>
        <div class="wc-block-components-totals-item wc-block-components-totals-footer-item"><span>合計(税込)</span><span>¥7,260</span></div>
      </div>
    </div>
  </div>
</div>''')

P['WcFeaturedProduct'] = (400, '''<div class="wp-block-woocommerce-featured-product wc-block-featured-product alignfull" data-wp-block="woocommerce/featured-product">
  <div class="ds-ph wc-block-featured-product__background" data-label="商品の大きな写真"></div>
  <div class="wc-block-featured-product__wrapper">
    <p class="has-small-font-size has-accent-color" style="letter-spacing: 0.16em; font-weight: 700">PICK UP</p>
    <h2 class="wc-block-featured-product__title has-x-large-font-size">土鍋 二人用</h2>
    <div class="wc-block-featured-product__price wc-block-components-product-price">¥9,900<span class="ds-tax">(税込)</span></div>
    <div class="wp-block-buttons"><div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="#">商品を見る</a></div></div>
  </div>
</div>''')

P['WcProductCategories'] = (260, '''<div class="ds-stage">
  <ul class="wc-block-product-categories-list wc-block-product-categories-list--depth-0" data-wp-block="woocommerce/product-categories">
    <li class="wc-block-product-categories-list-item"><a href="#"><div class="ds-ph" data-label="皿"></div>皿 <span class="wc-block-product-categories-list-item-count">(12)</span></a></li>
    <li class="wc-block-product-categories-list-item"><a href="#"><div class="ds-ph" data-label="碗・鉢"></div>碗・鉢 <span class="wc-block-product-categories-list-item-count">(8)</span></a></li>
    <li class="wc-block-product-categories-list-item"><a href="#"><div class="ds-ph" data-label="マグ"></div>マグ <span class="wc-block-product-categories-list-item-count">(5)</span></a></li>
    <li class="wc-block-product-categories-list-item"><a href="#"><div class="ds-ph" data-label="道具"></div>キッチン道具 <span class="wc-block-product-categories-list-item-count">(9)</span></a></li>
  </ul>
</div>''')

P['WcProductReviews'] = (330, f'''<div class="ds-stage">
  <div class="wp-block-woocommerce-product-reviews" data-wp-block="woocommerce/product-reviews">
    <h2 class="wp-block-heading has-large-font-size" data-wp-block="woocommerce/product-reviews-title">「信楽の平皿 15cm」のレビュー(12)</h2>
    <div class="wc-block-components-review-list-item" data-wp-block="woocommerce/product-review-template">
      <div class="wc-block-components-review-list-item__meta"><span class="wc-block-components-review-list-item__author">H.A さん</span><span class="wc-block-components-product-rating">{stars(5)}</span><time class="wc-block-components-review-list-item__published-date">2026.10.02</time></div>
      <p>料理が映える色合いで、毎日使っています。</p>
    </div>
    <div class="wc-block-components-review-list-item">
      <div class="wc-block-components-review-list-item__meta"><span class="wc-block-components-review-list-item__author">K.T さん</span><span class="wc-block-components-product-rating">{stars(4)}</span><time class="wc-block-components-review-list-item__published-date">2026.09.18</time></div>
      <p>思っていたより少し重めですが、安定感があります。</p>
    </div>
  </div>
</div>''')

for name, (h, html) in P.items():
    with open(os.path.join(OUT, f'{name}.html'), 'w') as f:
        f.write(f'<!-- @dsCard height={h} {SUB} -->\n{html}\n')
print(len(P), 'woo previews')
