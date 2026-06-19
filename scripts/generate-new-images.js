const fs = require('fs');
const path = require('path');

// Minimal PNG generator - creates a colored rectangle
function createPlaceholderPNG(width, height, hexColor) {
  // Minimal valid PNG: 1x1 pixel in given color
  const r = parseInt(hexColor.slice(0, 2), 16);
  const g = parseInt(hexColor.slice(2, 4), 16);
  const b = parseInt(hexColor.slice(4, 6), 16);

  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);   // width
  ihdrData.writeUInt32BE(height, 4);   // height
  ihdrData.writeUInt8(8, 8);            // bit depth
  ihdrData.writeUInt8(2, 9);            // color type (RGB)
  ihdrData.writeUInt8(0, 10);           // compression
  ihdrData.writeUInt8(0, 11);           // filter
  ihdrData.writeUInt8(0, 12);           // interlace
  const ihdr = createChunk('IHDR', ihdrData);

  // IDAT chunk - raw image data (filter byte + RGB for each pixel per row)
  const rawData = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (1 + width * 3);
    rawData[rowStart] = 0; // filter byte
    for (let x = 0; x < width; x++) {
      const pxStart = rowStart + 1 + x * 3;
      rawData[pxStart] = r;
      rawData[pxStart + 1] = g;
      rawData[pxStart + 2] = b;
    }
  }
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(rawData);
  const idat = createChunk('IDAT', compressed);

  // IEND chunk
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crcVal = crc32(crcData);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crcVal, 0);
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

const outputDir = path.join(__dirname, '..', 'assets', 'images');

// Generate the three images
const images = [
  { name: 'pre_exile_header_relief.png', width: 600, height: 200, color: '0F1D2E' },
  { name: 'ancient_babylon_engraving.png', width: 400, height: 300, color: '1A2A3E' },
  { name: 'judean_ruins.png', width: 400, height: 250, color: '162335' },
];

for (const img of images) {
  const png = createPlaceholderPNG(img.width, img.height, img.color);
  const filePath = path.join(outputDir, img.name);
  fs.writeFileSync(filePath, png);
  console.log(`Created ${filePath} (${png.length} bytes)`);
}

console.log('All placeholder images generated.');
