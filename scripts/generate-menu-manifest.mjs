import { promises as fs } from 'fs';
import path from 'path';

// 設定
const ROOT = process.cwd();
const MENU_DIR = path.join(ROOT, 'images', 'menu');
const OUT_FILE = path.join(ROOT, 'menu.json');

// 対象拡張子
const exts = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

// カテゴリ -> 表示名
const categoryLabels = {
  cocktail: 'カクテル',
  whisky: 'ウイスキー',
  food: '小皿',
  nonalc: 'ノンアル'
};

function parseFileName(file) {
  const base = file.replace(/\.[^.]+$/, '');
  const parts = base.split('_');
  if (parts.length !== 4) return null; // 規約外は無視
  const [indexRaw, name, description, priceRaw] = parts;
  const index = Number(indexRaw.replace(/^0+/, '')) || 0;
  const price = Number(priceRaw.replace(/[^0-9]/g, '')) || 0;
  return { index, name, description, price };
}

async function main() {
  const result = [];
  let categories; 
  try {
    categories = await fs.readdir(MENU_DIR, { withFileTypes: true });
  } catch (e) {
    console.error('images/menu ディレクトリが見つかりません:', e.message);
    process.exit(1);
  }

  for (const dirent of categories) {
    if (!dirent.isDirectory()) continue;
    const category = dirent.name; // フォルダ名 = カテゴリ
    const catDir = path.join(MENU_DIR, category);
    const files = await fs.readdir(catDir, { withFileTypes: true });
    for (const f of files) {
      if (!f.isFile()) continue;
      const ext = path.extname(f.name).toLowerCase();
      if (!exts.has(ext)) continue;
      const parsed = parseFileName(f.name);
      if (!parsed) {
        console.warn('命名規約外のためスキップ:', path.join(category, f.name));
        continue;
      }
      result.push({
        category,
        categoryLabel: categoryLabels[category] || category,
        index: parsed.index,
        name: parsed.name,
        description: parsed.description,
        price: parsed.price,
        image: `images/menu/${category}/${f.name}`
      });
    }
  }

  // カテゴリ -> index 昇順
  result.sort((a, b) => a.category.localeCompare(b.category, 'ja') || a.index - b.index);

  await fs.writeFile(OUT_FILE, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`menu.json を出力しました: ${OUT_FILE} (件数: ${result.length})`);
}

main();
