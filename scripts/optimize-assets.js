const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, '..', 'assets');
const OUTPUT_DIR = path.join(__dirname, '..', 'assets-optimized');
const MAX_DIMENSION = 1920;
const QUALITY = 75;

async function optimizeAssets() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  function walkDir(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        walkDir(filePath, fileList);
      } else if (/\.(png|jpg|jpeg)$/i.test(file)) {
        fileList.push(filePath);
      }
    }
    return fileList;
  }

  const files = walkDir(INPUT_DIR);
  console.log(`Found ${files.length} images to optimize`);

  let totalOriginal = 0;
  let totalOptimized = 0;

  for (const file of files) {
    const relativePath = path.relative(INPUT_DIR, file);
    const outputPath = path.join(OUTPUT_DIR, relativePath);
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const originalSize = fs.statSync(file).size;
    totalOriginal += originalSize;

    try {
      const image = sharp(file);
      const metadata = await image.metadata();

      let resizeOptions = {};
      if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
        resizeOptions = {
          width: MAX_DIMENSION,
          height: MAX_DIMENSION,
          fit: 'inside',
          withoutEnlargement: true,
        };
      }

      const ext = path.extname(file).toLowerCase();
      let pipeline = image.resize(resizeOptions);

      if (ext === '.png') {
        pipeline = pipeline.png({
          quality: QUALITY,
          compressionLevel: 9,
          adaptiveFiltering: true,
          palette: true,
        });
      } else {
        pipeline = pipeline.jpeg({
          quality: QUALITY,
          mozjpeg: true,
          progressive: true,
        });
      }

      await pipeline.toFile(outputPath);

      const optimizedSize = fs.statSync(outputPath).size;
      totalOptimized += optimizedSize;

      const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
      console.log(`✓ ${relativePath}: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(optimizedSize / 1024 / 1024).toFixed(2)}MB (${savings}% saved)`);
    } catch (error) {
      console.error(`✗ Failed to optimize ${relativePath}:`, error.message);
      fs.copyFileSync(file, outputPath);
      totalOptimized += originalSize;
    }
  }

  console.log(`\nTotal: ${(totalOriginal / 1024 / 1024).toFixed(2)}MB → ${(totalOptimized / 1024 / 1024).toFixed(2)}MB (${((totalOriginal - totalOptimized) / totalOriginal * 100).toFixed(1)}% saved)`);
}

optimizeAssets().catch(console.error);