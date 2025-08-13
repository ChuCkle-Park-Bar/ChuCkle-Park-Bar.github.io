# ChuCkle Park Bar Web Page

静的サイト (GitHub Pages) 用資産管理 + 自動 JSON マニフェスト生成 + SEO / PWA 対応のドキュメントです。

## 概要

`images/` 配下に画像を配置し、スクリプトを実行すると以下 3 つの JSON がルート直下に生成 / 更新されます。

| 生成物 | 役割 |
|--------|------|
| `hero.json` | ヒーローエリア用画像の一覧 (`images/hero/`) + alt テキスト |
| `gallery.json` | ギャラリー画像一覧 (`images/gallery/`) + alt テキスト |
| `menu.json` | メニュー項目一覧 (`images/menu/<category>/` の命名規約を解析) |

## 前提

- Node.js (推奨: 18 LTS 以上)
- 初回のみ依存インストール: `npm install`

## 画像ディレクトリ構成

```text
images/
  hero/      ... ヒーロー画像 (スライド等)
  gallery/   ... ギャラリー画像
  menu/
    cocktail/
    whisky/
    food/
    nonalc/
```

拡張子は `.jpg .jpeg .png .webp .avif` が対象です。

## メニュー画像の命名規約

`images/menu/<category>/` 配下の各ファイル名は **必ず 4 パートをアンダースコア `_` で区切る**:

```text
<表示順番号2桁+>_<商品名>_<説明文>_<価格>.<拡張子>
例: 01_Yuzu Gimlet_柚子とジンの爽快なバランス。_1300.jpeg
```

- 表示順番号: 先頭ゼロ許容。内部では数値化され昇順ソート。
- 商品名: アンダースコア不可 (必要ならハイフン等を利用)。
- 説明文: アンダースコア不可。句読点・全角文字可。
- 価格: 数値部分のみ抽出されます (例: `1,300円` → `1300` でも可)。
- 規約外のファイルは `menu.json` 生成時に警告を出してスキップされます。

## 生成される JSON 形式

### hero.json / gallery.json

```json
[
  { "file": "hero_01.jpg", "path": "images/hero/hero_01.jpg", "alt": "静かな照明に包まれたバーカウンター" }
]
```

- ファイル名昇順で並びます。
- `alt` はアクセシビリティ / SEO 用。生成スクリプトは現状 alt を自動付与しないため、必要に応じて手動編集してください。

### menu.json (例)

```json
[
  {
    "category": "whisky",
    "categoryLabel": "ウイスキー",
    "index": 1,
    "name": "響",
    "description": "山崎蒸溜所で生まれたモルト原酒だけでつくられたウイスキー。",
    "price": 1800,
    "image": "images/menu/whisky/01_響_山崎蒸溜所で生まれたモルト原酒だけでつくられたウイスキー。_1800.jpg"
  }
]
```

- `categoryLabel` は `scripts/generate-menu-manifest.mjs` 内の `categoryLabels` マップで定義。
- ソート順: `category` 昇順 → `index` 昇順。

## コマンド一覧 (PowerShell)

| 目的 | コマンド |
|------|----------|
| メニューのみ生成 | `npm run generate:menu` |
| ヒーロー & ギャラリー生成 | `npm run generate:media` |
| すべて生成 | `npm run generate:all` |
| ローカル開発サーバ (<http://localhost:5173>) | `npm run dev` |
| ブラウザ自動オープン付き | `npm run dev:open` |

## 追加/更新フロー (画像)

1. 画像を規定フォルダへ配置 / 置き換え。
2. (メニュー画像なら) 命名規約を確認。
3. PowerShell でプロジェクトルートへ移動。
4. 必要な生成コマンドを実行。
5. 生成された `*.json` をコミット。

### 例: すべて再生成

```powershell
npm run generate:all
```

出力例:

```text
menu.json を出力しました: C:\git\WebPage\menu.json (件数: 12)
hero.json (2) / gallery.json (3) を生成 (ファイル名昇順)
```

## トラブルシュート (画像生成)

| 事象 | 対処 |
|------|------|
| menu 生成で警告 `命名規約外のためスキップ` | ファイル名が 4 分割か、アンダースコア個数を確認。 |
| 画像を追加したのに JSON に出ない | 対象拡張子か、コマンドを再実行したか確認。 |
| `images/menu` が無いエラー | ディレクトリを作成して再実行。 |

## SEO 対応

実装済み:

- `<title>` 最適化 / `meta description` / `canonical` / `meta robots`
- Open Graph / Twitter Card メタ
- 構造化データ (JSON-LD / `BarOrPub` + `ReserveAction`)
- `sitemap.xml` / `robots.txt`
- 各画像の `alt` 属性 (hero / gallery / menu サムネイル)

更新時の注意:

- 住所や営業時間を追加したら JSON-LD の `address` / `openingHoursSpecification` を追記
- 画像を追加したら alt を JSON に追記し、`git push` で公開反映

## PWA 対応

実装済みファイル:

| ファイル | 役割 |
|----------|------|
| `manifest.webmanifest` | アプリ名 / アイコン / ショートカット / share_target |
| `sw.js` | キャッシュ & オフライン (versioned) |
| `offline.html` | オフライン時フォールバック |

### Service Worker

- バージョン文字列: `sw.js` 内 `VERSION` 更新でキャッシュ再取得を強制
- キャッシュ戦略:
  - HTML: Network First → Cache → `offline.html`
  - 画像 / スクリプト / CSS: Stale-While-Revalidate
  - その他: Cache First fallback offline

### 画像追加時の PWA 推奨手順

1. 画像を `images/...` に追加
2. `npm run generate:media` (hero / gallery 変更時)
3. alt テキストを `hero.json` / `gallery.json` に追記
4. 必要なら代表画像を事前キャッシュしたい場合 `sw.js` の `CORE_ASSETS` に追記 & `VERSION` を上げる
5. コミット & デプロイ

### オフライン挙動テスト

1. ローカルで `npm run dev`
2. ブラウザで開き一度ロード (SW 登録)
3. DevTools > Application > Service Workers で登録確認
4. ネットワークを Offline に切替 → リロードで `offline.html` が表示されることを確認

### manifest.webmanifest 拡張点

追加済み: `shortcuts`, `display_override`, `categories`, `share_target`。不要なら削除可。

## 今後の拡張アイデア (任意)

- 生成スクリプトに画像メタデータ (幅/高さ) の自動付与
- 価格やカテゴリの多言語化
- 画像最適化 (sharp 等) のビルド統合
- WebP/AVIF 自動生成 + `<picture>` 対応
- メニューを JSON-LD `Menu` / `MenuItem` / `Offer` で構造化
- ライトハウス計測ワークフロー (GitHub Actions)
- LCP 改善: Hero 1枚目 `preload` 化 & 低解像度プレースホルダ (LQIP)

---

更新: 2025-08-13 (SEO & PWA 追記)
