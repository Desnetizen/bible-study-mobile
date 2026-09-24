import { execFile } from 'child_process';
import { promisify } from 'util';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execFileAsync = promisify(execFile);
const ASSETS_DIR = path.join(process.cwd(), 'assets');

// pngquant path from npm bin
const pngquantPath = path.join(process.cwd(), 'node_modules', 'pngquant-bin', 'vendor', 'pngquant');

async function compressPNG(filePath) {
  const originalSize = fs.statSync(filePath).size;
  const tempPath = filePath + '.tmp';

  try {
    // pngquant: quality 65-80, speed 1 (best compression), strip metadata
    const args = [
      '--quality=65-80',
      '--speed=1',
      '--strip',
      '--force',
      '--output', tempPath,
      filePath,
    ];

    await execFileAsync(pngquantPath, args, { timeout: 30000 });
    const newSize = fs.statSync(tempPath).size;
    if (newSize < originalSize) {
      fs.renameSync(tempPath, filePath);
      const saved = ((1 - newSize / originalSize) * 100).toFixed(1);
      console.log(`${path.basename(filePath)}: ${(originalSize / 1024).toFixed(0)}KB → ${(newSize / 1024).toFixed(0)}KB (${saved}% saved)`);
    } else {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
  } catch (err) {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    // If pngquant fails (e.g. file too small), fall back to sharp
    console.log(`pngquant failed for ${path.basename(filePath)}, trying sharp...`);
    await compressPNGWithSharp(filePath);
  }
}

async function compressPNGWithSharp(filePath) {
  const originalSize = fs.statSync(filePath).size;
  const tempPath = filePath + '.tmp';

  try {
    await sharp(filePath)
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(tempPath);

    const newSize = fs.statSync(tempPath).size;
    if (newSize < originalSize) {
      fs.renameSync(tempPath, filePath);
      const saved = ((1 - newSize / originalSize) * 100).toFixed(1);
      console.log(`${path.basename(filePath)} (sharp): ${(originalSize / 1024).toFixed(0)}KB → ${(newSize / 1024).toFixed(0)}KB (${saved}% saved)`);
    } else {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
  } catch (err) {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    console.error(`Failed: ${path.basename(filePath)} - ${err.message}`);
  }
}

async function compressJPEG(filePath) {
  const originalSize = fs.statSync(filePath).size;
  const tempPath = filePath + '.tmp';

  try {
    await sharp(filePath)
      .jpeg({ quality: 60, mozjpeg: true, chromaSubsampling: '4:4:4' })
      .toFile(tempPath);

    const newSize = fs.statSync(tempPath).size;
    if (newSize < originalSize) {
      fs.renameSync(tempPath, filePath);
      const saved = ((1 - newSize / originalSize) * 100).toFixed(1);
      console.log(`${path.basename(filePath)}: ${(originalSize / 1024).toFixed(0)}KB → ${(newSize / 1024).toFixed(0)}KB (${saved}% saved)`);
    } else {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
  } catch (err) {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    console.error(`Failed: ${path.basename(filePath)} - ${err.message}`);
  }
}

async function main() {
  const files = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(png|jpg|jpeg)$/i.test(entry.name)) files.push(full);
    }
  }
  walk(ASSETS_DIR);

  const pngs = files.filter(f => /\.png$/i.test(f));
  const jpgs = files.filter(f => /\.jpe?g$/i.test(f));

  console.log(`Found ${pngs.length} PNGs and ${jpgs.length} JPEGs to compress...\n`);

  // Compress PNGs with pngquant (in batches)
  console.log('--- PNG compression (pngquant) ---');
  for (let i = 0; i < pngs.length; i += 5) {
    const batch = pngs.slice(i, i + 5);
    await Promise.all(batch.map(compressPNG));
  }

  // Compress JPEGs with sharp
  console.log('\n--- JPEG compression (sharp mozjpeg) ---');
  for (let i = 0; i < jpgs.length; i += 5) {
    const batch = jpgs.slice(i, i + 5);
    await Promise.all(batch.map(compressJPEG));
  }

  // Report total size
  let totalSize = 0;
  function walkSize(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walkSize(full);
      else if (/\.(png|jpg|jpeg)$/i.test(entry.name)) totalSize += fs.statSync(full).size;
    }
  }
  walkSize(ASSETS_DIR);
  console.log(`\nTotal image size after compression: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
}

main().catch(console.error);
