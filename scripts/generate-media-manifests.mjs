import { promises as fs } from 'fs';
import path from 'path';

const ROOT = process.cwd();
const HERO_DIR = path.join(ROOT, 'images', 'hero');
const GALLERY_DIR = path.join(ROOT, 'images', 'gallery');
const HERO_OUT = path.join(ROOT, 'hero.json');
const GALLERY_OUT = path.join(ROOT, 'gallery.json');

const IMG_EXT = new Set(['.jpg','.jpeg','.png','.webp','.avif']);

// ギャラリーカテゴリ -> 表示名
const categoryLabels = {
  drinks: 'ドリンク',
  food: 'フード', 
  interior: '店内',
  exterior: '外観'
};

async function collect(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter(e => e.isFile())
      .map(e => ({ file: e.name, ext: path.extname(e.name).toLowerCase() }))
      .filter(o => IMG_EXT.has(o.ext))
      .sort((a,b) => a.file.localeCompare(b.file, 'ja'))
      .map(o => ({ file: o.file, path: path.relative(ROOT, path.join(dir, o.file)).replace(/\\/g,'/') }));
  } catch (e) {
    return [];
  }
}

async function collectGalleryWithCategories(galleryDir) {
  try {
    const entries = await fs.readdir(galleryDir, { withFileTypes: true });
    const result = [];
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        // サブディレクトリ内の画像を取得
        const categoryPath = path.join(galleryDir, entry.name);
        const categoryImages = await collect(categoryPath);
        
        // カテゴリ情報を追加（英語のフォルダ名をそのまま使用）
        categoryImages.forEach(img => {
          result.push({
            ...img,
            category: entry.name,
            categoryLabel: categoryLabels[entry.name] || entry.name,
            path: path.relative(ROOT, path.join(categoryPath, img.file)).replace(/\\/g,'/')
          });
        });
      } else if (entry.isFile()) {
        // ルートレベルの画像（カテゴリなし）
        const ext = path.extname(entry.name).toLowerCase();
        if (IMG_EXT.has(ext)) {
          result.push({
            file: entry.name,
            category: null,
            path: path.relative(ROOT, path.join(galleryDir, entry.name)).replace(/\\/g,'/')
          });
        }
      }
    }
    
    return result.sort((a, b) => {
      // カテゴリ順、その後ファイル名順
      if (a.category !== b.category) {
        if (!a.category) return -1; // カテゴリなしを最初に
        if (!b.category) return 1;
        return a.category.localeCompare(b.category, 'en');
      }
      return a.file.localeCompare(b.file, 'ja');
    });
  } catch (e) {
    return [];
  }
}

async function main() {
  const hero = await collect(HERO_DIR);
  const gallery = await collectGalleryWithCategories(GALLERY_DIR);
  
  await fs.writeFile(HERO_OUT, JSON.stringify(hero, null, 2));
  await fs.writeFile(GALLERY_OUT, JSON.stringify(gallery, null, 2));
  
  const categories = [...new Set(gallery.map(g => g.category))];
  console.log(`hero.json (${hero.length}) / gallery.json (${gallery.length}) を生成`);
  console.log(`ギャラリーカテゴリ: ${categories.join(', ')}`);
}

main();
