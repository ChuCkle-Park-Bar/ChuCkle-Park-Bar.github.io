import { promises as fs } from 'fs';
import path from 'path';

const ROOT = process.cwd();
const HERO_DIR = path.join(ROOT, 'images', 'hero');
const GALLERY_DIR = path.join(ROOT, 'images', 'gallery');
const HERO_OUT = path.join(ROOT, 'hero.json');
const GALLERY_OUT = path.join(ROOT, 'gallery.json');

const IMG_EXT = new Set(['.jpg','.jpeg','.png','.webp','.avif']);

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

async function main() {
  const hero = await collect(HERO_DIR);
  const gallery = await collect(GALLERY_DIR);
  await fs.writeFile(HERO_OUT, JSON.stringify(hero, null, 2));
  await fs.writeFile(GALLERY_OUT, JSON.stringify(gallery, null, 2));
  console.log(`hero.json (${hero.length}) / gallery.json (${gallery.length}) を生成 (ファイル名昇順)`);
}

main();
