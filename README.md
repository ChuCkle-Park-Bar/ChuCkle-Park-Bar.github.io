# ChuCkle Park Bar Web Page

静的サイト (GitHub Pages) 用資産管理 + 自動 JSON マニフェスト生成 + SEO / PWA 対応 + モダンUI実装のドキュメントです。

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
  hero/        ... ヒーロー画像 (スライド等)
  gallery/     ... ギャラリー画像 (カテゴリ別サブフォルダ対応)
    drinks/    ... ドリンク画像
    food/      ... フード画像  
    interior/  ... 店内画像
    exterior/  ... 外観画像
  menu/        ... メニュー画像 (カテゴリ別)
    cocktail/  ... カクテル
    whisky/    ... ウイスキー
    food/      ... フード
    nonalc/    ... ノンアルコール
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

### hero.json

```json
[
  { "file": "hero_01.jpg", "path": "images/hero/hero_01.jpg" }
]
```

### gallery.json

```json
[
  {
    "file": "drinks_01.jpg", 
    "path": "images/gallery/drinks/drinks_01.jpg",
    "category": "drinks",
    "categoryLabel": "ドリンク"
  }
]
```

- ファイル名昇順で並びます。
- ギャラリーは **カテゴリ別フィルタリング機能** に対応。
- `alt` はアクセシビリティ / SEO 用。必要に応じて手動編集してください。

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

## コマンド一覧

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
3. ターミナルでプロジェクトルートへ移動。
4. 必要な生成コマンドを実行。
5. 生成された `*.json` をコミット。

### 例: すべて再生成

```bash
npm run generate:all
```

出力例:

```text
menu.json を出力しました: /Users/project/menu.json (件数: 9)
hero.json (2) / gallery.json (26) を生成
ギャラリーカテゴリ: drinks, exterior, food, interior
```

## トラブルシュート (画像生成)

| 事象 | 対処 |
|------|------|
| menu 生成で警告 `命名規約外のためスキップ` | ファイル名が 4 分割か、アンダースコア個数を確認。 |
| 画像を追加したのに JSON に出ない | 対象拡張子か、コマンドを再実行したか確認。 |
| `images/menu` が無いエラー | ディレクトリを作成して再実行。 |

## SEO & UX 実装

### SEO 対応

実装済み:

- `<title>` 最適化 / `meta description` / `canonical` / `meta robots`
- Open Graph / Twitter Card メタデータ
- 構造化データ (JSON-LD / `BarOrPub` + `ReserveAction`)
- `sitemap.xml` / `robots.txt`
- 各画像の `alt` 属性 (hero / gallery / menu サムネイル)

### UX/UI 実装

**技術スタック:**
- **Tailwind CSS**: ユーティリティファーストCSSフレームワーク
- **AOS (Animate On Scroll)**: スクロール連動アニメーション
- **Swiper**: タッチ対応スライダー (Hero画像 & ギャラリー)
- **GLightbox**: 軽量ライトボックス (画像拡大表示)

**主要機能:**
- レスポンシブデザイン (モバイルファースト)
- ダークテーマ (`bg-black` + `text-zinc-100`)
- フィルタリング機能 (メニュー & ギャラリー / CSSベース・軽量)
- スムーズスクロール & スクロールスパイ
- パララックス効果 (Hero背景)
- PWA対応 (オフライン閲覧可能)

更新時の注意:

- 住所や営業時間を変更したら JSON-LD の `address` / `openingHoursSpecification` を更新
- 画像を追加したら必要に応じて alt を JSON に追記し、`git push` で公開反映
- フィルタリングカテゴリを追加する場合、HTML内のボタンも更新

## フィルタリング機能の詳細

### メニューフィルタリング

- **方式**: CSSベースのシンプルフィルタリング（軽量・高速）
- **カテゴリ**: cocktail（カクテル）, whisky（ウイスキー）, food（フード）, nonalc（ノンアル）
- **動作**: `opacity` transition でスムーズな表示/非表示

### ギャラリーフィルタリング  

- **方式**: Swiperスライダーの動的再構築
- **カテゴリ**: drinks（ドリンク）, food（フード）, interior（店内）, exterior（外観）
- **動作**: カテゴリ選択時にスライドを再生成してSwiperを再初期化

### フィルタボタンの拡張

新しいカテゴリを追加する場合:

1. 画像を適切なフォルダに配置
2. `index.html` 内の該当セクションでボタンを追加:
   ```html
   <button data-filter=".newcategory">新カテゴリ</button>
   ```
3. 生成スクリプト内のカテゴリマップを更新（必要に応じて）

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

## 今後の拡張アイデア

- 生成スクリプトに画像メタデータ (幅/高さ) の自動付与
- 価格やカテゴリの多言語化
- 画像最適化 (sharp 等) のビルド統合
- WebP/AVIF 自動生成 + `<picture>` 対応
- メニューを JSON-LD `Menu` / `MenuItem` / `Offer` で構造化
- ライトハウス計測ワークフロー (GitHub Actions)
- LCP 改善: Hero 1枚目 `preload` 化 & 低解像度プレースホルダ (LQIP)
- フィルタリングアニメーション強化（Isotope / Framer Motion等）

## パフォーマンス最適化

### 実装済み
- CDN プリコネクト (`preconnect`)
- 画像遅延読み込み (`loading="lazy"`)
- Service Worker によるキャッシュ戦略
- CSS transitions による軽量アニメーション
- JSON マニフェストによる動的コンテンツ管理

### 今後の改善案
- Critical CSS のインライン化
- 画像最適化パイプライン（WebP/AVIF自動変換）
- Bundle サイズの最適化（必要ライブラリのみ読み込み）

---

更新: 2025-08-23 (実装状況に合わせて全面更新)
