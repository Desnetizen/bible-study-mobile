const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function recompress(filePath) {
  const originalSize = fs.statSync(filePath).size;
  const tempPath = filePath + '.tmp';
  try {
    await sharp(filePath)
      .png({ compressionLevel: 9, adaptiveFiltering: true, effort: 10, quality: 80 })
      .toFile(tempPath);
    const newSize = fs.statSync(tempPath).size;
    if (newSize < originalSize) {
      fs.renameSync(tempPath, filePath);
      console.log(`${path.basename(filePath)}: ${(originalSize/1024).toFixed(0)}KB -> ${(newSize/1024).toFixed(0)}KB (${((1-newSize/originalSize)*100).toFixed(1)}% saved)`);
    } else {
      fs.unlinkSync(tempPath);
      console.log(`${path.basename(filePath)}: no improvement`);
    }
  } catch(e) {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    console.log(`Failed ${path.basename(filePath)}: ${e.message}`);
  }
}

recompress('C:\\Users\\desvo\\bible-study-mobile\\assets\\Chapters\\daniel-chapter-9.png');
recompress('C:\\Users\\desvo\\bible-study-mobile\\assets\\images\\historical_context_hero.png');
recompress('C:\\Users\\desvo\\bible-study-mobile\\assets\\Places\\bethel.png');