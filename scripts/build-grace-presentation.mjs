import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const runtimeNodeModules = 'C:/Users/desvo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const PptxGenJS = require(`${runtimeNodeModules}/pptxgenjs/dist/pptxgen.bundle.js`);
const { createCanvas } = require(`${runtimeNodeModules}/@napi-rs/canvas/index.js`);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outPath = path.join(rootDir, 'Grace presentation.pptx');
const assetDir = path.join(rootDir, 'assets', 'grace-presentation');

const colors = {
  cream: 'F6F1E7',
  paper: 'FFFDF8',
  ink: '17313D',
  teal: '1F5A64',
  gold: 'C8A24D',
  olive: '72835B',
  rose: '9E5B54',
  sand: 'E7D7BF',
  slate: '52606D',
  softBlue: 'BFD8E1',
};

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function addRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawVerticalGradient(ctx, w, h, topHex, bottomHex) {
  const top = hexToRgb(topHex);
  const bottom = hexToRgb(bottomHex);
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, `rgb(${top.r},${top.g},${top.b})`);
  grad.addColorStop(1, `rgb(${bottom.r},${bottom.g},${bottom.b})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function createCanvasFile(fileName, width, height, painter) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  painter(ctx, width, height);
  return fs.writeFile(path.join(assetDir, fileName), canvas.toBuffer('image/png'));
}

function softenClouds(ctx, w, h, tint = 'FFFFFF', alpha = 0.12) {
  ctx.save();
  ctx.fillStyle = `rgba(${hexToRgb(tint).r},${hexToRgb(tint).g},${hexToRgb(tint).b},${alpha})`;
  for (let i = 0; i < 18; i++) {
    const x = (i * 173) % w;
    const y = 40 + ((i * 97) % (h * 0.33));
    const rw = 120 + ((i * 31) % 180);
    const rh = 30 + ((i * 17) % 40);
    addRoundedRect(ctx, x, y, rw, rh, rh / 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawSunriseVineyard(ctx, w, h, mode = 'warm') {
  const skyTop = mode === 'cool' ? '6E8DA3' : 'A8B7D1';
  const skyBottom = mode === 'cool' ? 'F1CFA1' : 'F7D6A1';
  drawVerticalGradient(ctx, w, h, skyTop, skyBottom);

  const sun = ctx.createRadialGradient(w * 0.78, h * 0.28, 10, w * 0.78, h * 0.28, h * 0.22);
  sun.addColorStop(0, 'rgba(255,255,236,0.98)');
  sun.addColorStop(0.25, 'rgba(255,233,165,0.75)');
  sun.addColorStop(1, 'rgba(255,233,165,0)');
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, w, h);

  softenClouds(ctx, w, h, 'FFFFFF', 0.08);

  const hills = [
    { y: h * 0.48, color: '#8AA471' },
    { y: h * 0.56, color: '#6E8A58' },
    { y: h * 0.66, color: '#4F6946' },
  ];
  hills.forEach((hill, idx) => {
    ctx.fillStyle = hill.color;
    ctx.beginPath();
    ctx.moveTo(0, hill.y + idx * 20);
    ctx.bezierCurveTo(w * 0.22, hill.y - 70, w * 0.52, hill.y + 40, w, hill.y - 20 + idx * 8);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
  });

  ctx.save();
  ctx.translate(0, h * 0.22);
  for (let i = 0; i < 18; i++) {
    const x = (i * 83) % w;
    const y = h * 0.22 + (i % 3) * 20;
    const row = ctx.createLinearGradient(x, y, x + 250, y + 180);
    row.addColorStop(0, 'rgba(66,98,52,0.98)');
    row.addColorStop(1, 'rgba(123,162,81,0.98)');
    ctx.strokeStyle = row;
    ctx.lineWidth = 26 - (i % 4) * 3;
    ctx.beginPath();
    ctx.moveTo(x - 120, y + 210);
    ctx.quadraticCurveTo(w * 0.5, h * 0.65 + i * 2, x + 460, y + 20);
    ctx.stroke();
  }
  ctx.restore();

  ctx.fillStyle = 'rgba(52,79,39,0.95)';
  for (let i = 0; i < 24; i++) {
    const x = 60 + (i * 89) % (w - 120);
    const y = h * 0.78 + (i % 5) * 8;
    ctx.beginPath();
    ctx.ellipse(x, y, 15, 24, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(48,38,26,0.9)';
  ctx.fillRect(0, h * 0.82, w, h * 0.18);

  ctx.fillStyle = 'rgba(57,70,40,0.85)';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.72);
  ctx.lineTo(w * 0.18, h * 0.63);
  ctx.lineTo(w * 0.4, h * 0.7);
  ctx.lineTo(w * 0.65, h * 0.61);
  ctx.lineTo(w, h * 0.68);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
}

function drawOpenBible(ctx, w, h) {
  drawVerticalGradient(ctx, w, h, 'F4E7CF', 'E4D1B8');
  const light = ctx.createRadialGradient(w * 0.52, h * 0.27, 20, w * 0.52, h * 0.27, h * 0.45);
  light.addColorStop(0, 'rgba(255,255,245,0.9)');
  light.addColorStop(1, 'rgba(255,255,245,0)');
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = 'rgba(108,70,31,0.98)';
  addRoundedRect(ctx, w * 0.17, h * 0.58, w * 0.66, h * 0.21, 18);
  ctx.fill();
  ctx.fillStyle = 'rgba(85,53,20,0.98)';
  addRoundedRect(ctx, w * 0.19, h * 0.61, w * 0.62, h * 0.16, 14);
  ctx.fill();

  ctx.save();
  ctx.translate(w * 0.19, h * 0.23);
  ctx.rotate(-0.03);
  ctx.fillStyle = '#FFF9EE';
  addRoundedRect(ctx, 0, 0, w * 0.28, h * 0.45, 16);
  ctx.fill();
  ctx.fillStyle = '#FFFDF7';
  addRoundedRect(ctx, w * 0.27, 0, w * 0.28, h * 0.45, 16);
  ctx.fill();

  ctx.fillStyle = 'rgba(70,70,70,0.32)';
  for (let col = 0; col < 26; col++) {
    const x1 = 26 + col * 8;
    const x2 = w * 0.27 + 26 + col * 8;
    ctx.fillRect(x1, 18, 3, h * 0.34);
    ctx.fillRect(x2, 18, 3, h * 0.34);
  }
  ctx.restore();

  ctx.strokeStyle = 'rgba(146,107,43,0.55)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.26);
  ctx.bezierCurveTo(w * 0.48, h * 0.31, w * 0.46, h * 0.38, w * 0.5, h * 0.57);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,243,200,0.92)';
  ctx.beginPath();
  ctx.arc(w * 0.53, h * 0.18, 38, 0, Math.PI * 2);
  ctx.fill();
}

function drawJusticeScales(ctx, w, h) {
  drawVerticalGradient(ctx, w, h, '202833', '0F141A');
  const glow = ctx.createRadialGradient(w * 0.48, h * 0.36, 10, w * 0.48, h * 0.36, h * 0.42);
  glow.addColorStop(0, 'rgba(255,219,140,0.2)');
  glow.addColorStop(1, 'rgba(255,219,140,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = 'rgba(30,30,32,0.8)';
  ctx.fillRect(0, h * 0.72, w, h * 0.28);

  ctx.strokeStyle = '#B08A48';
  ctx.fillStyle = '#B08A48';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.16);
  ctx.lineTo(w * 0.5, h * 0.64);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.16, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(w * 0.28, h * 0.26);
  ctx.lineTo(w * 0.72, h * 0.26);
  ctx.stroke();

  ctx.lineWidth = 4;
  for (const side of [-1, 1]) {
    const x = w * 0.5 + side * w * 0.18;
    ctx.beginPath();
    ctx.moveTo(w * 0.5 + side * w * 0.08, h * 0.26);
    ctx.lineTo(x, h * 0.42);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, h * 0.42);
    ctx.lineTo(x - 55 * side, h * 0.5);
    ctx.lineTo(x + 55 * side, h * 0.5);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, h * 0.5, 52, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(208,176,112,0.12)';
    ctx.fill();
  }

  ctx.strokeStyle = 'rgba(246,241,231,0.12)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 12; i++) {
    ctx.beginPath();
    ctx.moveTo((i * 143) % w, 0);
    ctx.lineTo(((i * 143) % w) + 100, h);
    ctx.stroke();
  }
}

function drawMercyCourtyard(ctx, w, h) {
  drawVerticalGradient(ctx, w, h, 'D4D0C6', 'BFA58B');
  ctx.fillStyle = 'rgba(250,246,238,0.18)';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#A5927E';
  ctx.fillRect(0, h * 0.66, w, h * 0.34);
  ctx.fillStyle = '#D8C9B5';
  for (let i = 0; i < 18; i++) {
    const x = (i % 6) * (w / 6);
    const y = h * 0.52 + Math.floor(i / 6) * 36;
    ctx.fillRect(x + 18, y, w / 6 - 36, 2);
  }

  ctx.fillStyle = '#C7B8A2';
  for (let i = 0; i < 4; i++) {
    const x = w * 0.14 + i * w * 0.18;
    ctx.fillRect(x, h * 0.14, 32, h * 0.52);
  }
  ctx.fillStyle = 'rgba(239,235,225,0.85)';
  ctx.fillRect(w * 0.11, h * 0.62, w * 0.78, 28);
  ctx.fillRect(w * 0.22, h * 0.54, w * 0.56, 20);

  // Jesus figure
  ctx.save();
  ctx.translate(w * 0.28, h * 0.52);
  ctx.fillStyle = '#6F513B';
  ctx.beginPath();
  ctx.ellipse(0, -120, 26, 32, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#E7E0D6';
  ctx.beginPath();
  ctx.moveTo(-44, -90);
  ctx.quadraticCurveTo(-8, -140, 36, -92);
  ctx.lineTo(54, 28);
  ctx.lineTo(-58, 28);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#D2C4AF';
  ctx.beginPath();
  ctx.moveTo(-54, -92);
  ctx.lineTo(-16, -138);
  ctx.lineTo(0, -70);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#B78C64';
  ctx.beginPath();
  ctx.moveTo(38, -88);
  ctx.lineTo(94, -4);
  ctx.lineTo(72, 4);
  ctx.lineTo(18, -48);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#E9DCC7';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(24, -8);
  ctx.lineTo(98, 10);
  ctx.stroke();
  ctx.restore();

  // kneeling woman
  ctx.save();
  ctx.translate(w * 0.56, h * 0.62);
  ctx.fillStyle = '#5C465A';
  ctx.beginPath();
  ctx.ellipse(-8, -90, 20, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#566C7A';
  ctx.beginPath();
  ctx.moveTo(-58, -40);
  ctx.quadraticCurveTo(-10, -118, 54, -42);
  ctx.lineTo(34, 18);
  ctx.lineTo(-42, 18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#9F7A4F';
  ctx.beginPath();
  ctx.moveTo(-68, -38);
  ctx.lineTo(-10, -104);
  ctx.lineTo(-2, -44);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // onlookers
  const people = [
    [0.15, 0.3, '#77604F'],
    [0.74, 0.28, '#7E6754'],
    [0.78, 0.18, '#3D4A57'],
  ];
  people.forEach(([px, py, color]) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(w * px, h * py, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(w * px - 14, h * py + 18, 28, 70);
  });

  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(0, 0, w, h * 0.22);
}

function drawVineCorner(ctx, w, h) {
  ctx.fillStyle = 'rgba(63,90,42,0.92)';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.85);
  ctx.bezierCurveTo(w * 0.25, h * 0.68, w * 0.45, h * 0.98, w, h * 0.74);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(214,184,72,0.12)';
  for (let i = 0; i < 30; i++) {
    ctx.beginPath();
    ctx.arc((i * 37) % w, h * 0.78 + (i % 3) * 18, 9, 0, Math.PI * 2);
    ctx.fill();
  }
}

async function makeAssets() {
  await fs.mkdir(assetDir, { recursive: true });
  await createCanvasFile('vineyard-sunrise.png', 1800, 1013, (ctx, w, h) => {
    drawSunriseVineyard(ctx, w, h, 'warm');
  });
  await createCanvasFile('bible-sunlight.png', 1800, 1013, drawOpenBible);
  await createCanvasFile('justice-scales.png', 1800, 1013, drawJusticeScales);
  await createCanvasFile('mercy-courtyard.png', 1800, 1013, drawMercyCourtyard);
}

function addHeader(slide, title, section = '') {
  slide.addShape(PptxGenJS.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.65, line: { color: colors.teal, transparency: 100 }, fill: { color: colors.teal } });
  slide.addShape(PptxGenJS.ShapeType.rect, { x: 0, y: 0.65, w: 13.333, h: 0.06, line: { color: colors.gold, transparency: 100 }, fill: { color: colors.gold } });
  slide.addText(title, {
    x: 0.55,
    y: 0.18,
    w: 9.2,
    h: 0.22,
    fontFace: 'Georgia',
    fontSize: 16,
    color: 'FFFFFF',
    bold: true,
    margin: 0,
  });
  if (section) {
    slide.addText(section, {
      x: 10.2,
      y: 0.18,
      w: 2.55,
      h: 0.22,
      fontFace: 'Aptos',
      fontSize: 9,
      color: 'EADFC9',
      align: 'right',
      italic: true,
      margin: 0,
    });
  }
}

function addFooter(slide, num) {
  slide.addText(String(num).padStart(2, '0'), {
    x: 12.58,
    y: 7.03,
    w: 0.35,
    h: 0.16,
    fontFace: 'Aptos',
    fontSize: 8,
    color: colors.slate,
    align: 'right',
    margin: 0,
  });
}

function addQuestion(slide, text, y, w = 6.0) {
  slide.addShape(PptxGenJS.ShapeType.roundRect, {
    x: 0.72,
    y,
    w,
    h: 0.46,
    rectRadius: 0.06,
    line: { color: colors.gold, transparency: 30, pt: 1 },
    fill: { color: 'FFF7E9', transparency: 0 },
  });
  slide.addText(text, {
    x: 0.92,
    y: y + 0.08,
    w: w - 0.35,
    h: 0.22,
    fontFace: 'Aptos',
    fontSize: 12,
    color: colors.ink,
    bold: false,
    margin: 0,
  });
}

function addBodyText(slide, lines, opts = {}) {
  slide.addText(lines.join('\n'), {
    x: opts.x ?? 0.75,
    y: opts.y ?? 1.05,
    w: opts.w ?? 5.5,
    h: opts.h ?? 4.85,
    fontFace: opts.fontFace ?? 'Aptos',
    fontSize: opts.fontSize ?? 18,
    color: opts.color ?? colors.ink,
    breakLine: false,
    margin: opts.margin ?? 0,
    valign: opts.valign ?? 'top',
    fit: 'shrink',
    paraSpaceAfterPt: 10,
    bullet: opts.bullet ?? false,
    italic: opts.italic ?? false,
    bold: opts.bold ?? false,
  });
}

function addVerseBox(slide, reference, verse, opts = {}) {
  slide.addShape(PptxGenJS.ShapeType.roundRect, {
    x: opts.x ?? 0.8,
    y: opts.y ?? 4.9,
    w: opts.w ?? 5.55,
    h: opts.h ?? 1.1,
    rectRadius: 0.05,
    line: { color: colors.gold, transparency: 40, pt: 1.2 },
    fill: { color: 'FFF9EE' },
  });
  slide.addText(reference, {
    x: (opts.x ?? 0.8) + 0.18,
    y: (opts.y ?? 4.9) + 0.1,
    w: (opts.w ?? 5.55) - 0.36,
    h: 0.16,
    fontFace: 'Georgia',
    fontSize: 10,
    color: colors.olive,
    bold: true,
    margin: 0,
  });
  slide.addText(verse, {
    x: (opts.x ?? 0.8) + 0.18,
    y: (opts.y ?? 4.9) + 0.28,
    w: (opts.w ?? 5.55) - 0.36,
    h: 0.6,
    fontFace: 'Georgia',
    fontSize: 14,
    color: colors.ink,
    italic: true,
    margin: 0,
    fit: 'shrink',
  });
}

async function buildDeck() {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Codex';
  pptx.company = 'OpenAI';
  pptx.subject = 'Grace, Justice denied or Mercy required';
  pptx.title = 'Grace, Justice denied or Mercy required';
  pptx.lang = 'en-US';
  pptx.theme = {
    headFontFace: 'Georgia',
    bodyFontFace: 'Aptos',
    lang: 'en-US',
  };
  pptx.defineLayout({ name: 'WIDE', width: 13.333, height: 7.5 });
  pptx.layout = 'WIDE';

  const slides = [];

  {
    const slide = pptx.addSlide();
    slide.background = { color: colors.cream };
    slide.addImage({ path: path.join(assetDir, 'vineyard-sunrise.png'), x: 0, y: 0, w: 13.333, h: 7.5 });
    slide.addShape(PptxGenJS.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, line: { color: '000000', transparency: 100 }, fill: { color: '17313D', transparency: 30 } });
    slide.addShape(PptxGenJS.ShapeType.rect, { x: 0, y: 4.9, w: 13.333, h: 2.6, line: { color: '000000', transparency: 100 }, fill: { color: '17313D', transparency: 20 } });
    slide.addShape(PptxGenJS.ShapeType.rect, { x: 0.7, y: 5.15, w: 5.1, h: 0.08, line: { color: colors.gold, transparency: 100 }, fill: { color: colors.gold } });
    slide.addText('Grace, Justice denied or Mercy required', {
      x: 0.72, y: 5.32, w: 8.7, h: 0.6,
      fontFace: 'Georgia', fontSize: 24, color: 'FFFFFF', bold: true, margin: 0,
    });
    slide.addText('Matthew 20:1-16, John 8:1-11, and the scandal of mercy', {
      x: 0.74, y: 5.98, w: 7.8, h: 0.3,
      fontFace: 'Aptos', fontSize: 12, color: 'F7EEDC', margin: 0,
    });
    slide.addText('Adventist church discussion deck', {
      x: 0.74, y: 6.32, w: 5, h: 0.18,
      fontFace: 'Aptos', fontSize: 9, color: 'E8D6B4', margin: 0, italic: true,
    });
    slides.push(slide);
  }

  {
    const slide = pptx.addSlide();
    slide.background = { color: colors.paper };
    addHeader(slide, 'Grace, Justice denied or Mercy required', 'Opening');
    slide.addImage({ path: path.join(assetDir, 'justice-scales.png'), x: 8.0, y: 0.9, w: 5.0, h: 5.9 });
    slide.addText('When does grace feel unfair?', {
      x: 0.8, y: 1.05, w: 5.4, h: 0.8,
      fontFace: 'Georgia', fontSize: 24, color: colors.ink, bold: true, margin: 0,
    });
    addBodyText(slide, [
      'Start with the feeling in the room.',
      'Most people understand grace as kindness.',
      'But Matthew 20 shows why grace can feel like a threat to fairness, rank, and deservedness.'
    ], { x: 0.82, y: 2.0, w: 5.2, h: 1.8, fontSize: 16 });
    addQuestion(slide, 'What is your first reaction to the workers who arrived late?', 4.38, 5.8);
    addQuestion(slide, 'Where do we see ourselves in the parable?', 4.95, 5.8);
    addVerseBox(slide, 'Matthew 20:15', '“Am I not allowed to do what I choose with what belongs to me?”', { x: 0.8, y: 5.65, w: 5.75, h: 0.95 });
    slides.push(slide);
  }

  {
    const slide = pptx.addSlide();
    slide.background = { color: colors.cream };
    addHeader(slide, 'Matthew 20:1-16', 'The story');
    slide.addShape(PptxGenJS.ShapeType.roundRect, { x: 0.65, y: 0.98, w: 6.0, h: 5.95, rectRadius: 0.05, line: { color: colors.gold, pt: 1, transparency: 35 }, fill: { color: 'FFFDF8' } });
    slide.addImage({ path: path.join(assetDir, 'vineyard-sunrise.png'), x: 7.0, y: 1.0, w: 5.7, h: 5.85 });
    slide.addText('The landowner hires workers at different hours, yet pays each the same wage.', {
      x: 0.95, y: 1.3, w: 5.4, h: 0.8, fontFace: 'Georgia', fontSize: 20, color: colors.ink, bold: true, margin: 0,
    });
    addBodyText(slide, [
      'The complaint is not simply about money.',
      'It is about comparison.',
      'The early workers measure generosity by rank, output, and time served.',
      'Jesus closes the story with a kingdom reversal: the last become first.'
    ], { x: 1.0, y: 2.15, w: 5.1, h: 2.2, fontSize: 15 });
    addVerseBox(slide, 'Matthew 20:13-16', '“Friend, I am doing you no wrong ... Is your eye evil because I am good?”', { x: 0.95, y: 4.75, w: 5.2, h: 1.15 });
    slides.push(slide);
  }

  {
    const slide = pptx.addSlide();
    slide.background = { color: colors.paper };
    addHeader(slide, 'What Grace Is', 'Definition');
    slide.addImage({ path: path.join(assetDir, 'bible-sunlight.png'), x: 7.4, y: 0.95, w: 5.4, h: 5.95 });
    slide.addText('Grace is God giving what we cannot earn.', {
      x: 0.8, y: 1.05, w: 5.9, h: 0.45,
      fontFace: 'Georgia', fontSize: 22, color: colors.teal, bold: true, margin: 0,
    });
    addBodyText(slide, [
      'Grace is favor, gift, rescue, welcome, and divine initiative.',
      'It is not wages for good performance.',
      'It is not God pretending sin does not matter.',
      'Grace is generosity that reaches sinners, not rewards achievers.'
    ], { x: 0.85, y: 1.8, w: 6.0, h: 2.4, fontSize: 15 });
    addQuestion(slide, 'How would you explain grace to a teenager in one sentence?', 4.4, 5.9);
    addVerseBox(slide, 'Ephesians 2:8-9', '“By grace are ye saved through faith ... it is the gift of God.”', { x: 0.85, y: 5.0, w: 6.0, h: 1.05 });
    slides.push(slide);
  }

  {
    const slide = pptx.addSlide();
    slide.background = { color: colors.cream };
    addHeader(slide, 'What Grace Is Not', 'Clarifying');
    slide.addImage({ path: path.join(assetDir, 'justice-scales.png'), x: 7.6, y: 1.0, w: 5.0, h: 5.8 });
    slide.addText('Grace is not a loophole.', {
      x: 0.78, y: 1.0, w: 5.6, h: 0.45,
      fontFace: 'Georgia', fontSize: 22, color: colors.rose, bold: true, margin: 0,
    });
    addBodyText(slide, [
      'Not permission to stay unchanged.',
      'Not the softening of holiness.',
      'Not the cancellation of justice.',
      'Not a divine shrug.',
      'Bonhoeffer called out the danger of “cheap grace.”'
    ], { x: 0.86, y: 1.9, w: 5.2, h: 2.25, fontSize: 15 });
    addVerseBox(slide, 'Titus 2:11-12', '“The grace of God ... teaches us to say No to ungodliness.”', { x: 0.86, y: 4.85, w: 5.55, h: 1.0 });
    addQuestion(slide, 'What happens when grace is treated as permission?', 6.0, 5.6);
    slides.push(slide);
  }

  {
    const slide = pptx.addSlide();
    slide.background = { color: colors.paper };
    addHeader(slide, 'Grace Words', 'Theological vocabulary');
    slide.addShape(PptxGenJS.ShapeType.roundRect, { x: 0.75, y: 1.05, w: 11.8, h: 5.65, rectRadius: 0.04, line: { color: colors.sand, pt: 1 }, fill: { color: 'FFFDF8' } });
    const cols = [
      ['Common grace', 'God’s kindness shown broadly in creation, restraint, and providence.'],
      ['Prevenient grace', 'Grace that goes before, stirring response before conversion.'],
      ['Irresistible / effectual grace', 'Grace understood by Calvinists as bringing the elect surely to faith.'],
      ['Sanctifying grace', 'Grace that forms character and holiness after conversion.'],
      ['Marvelous grace', 'A worshipful way to speak about grace’s wonder.'],
      ['Sufficient grace', 'Grace enough for weakness, pain, and endurance.'],
    ];
    cols.forEach((item, i) => {
      const row = Math.floor(i / 2);
      const col = i % 2;
      const x = 1.1 + col * 5.95;
      const y = 1.5 + row * 1.57;
      slide.addShape(PptxGenJS.ShapeType.roundRect, { x, y, w: 5.25, h: 1.22, rectRadius: 0.04, line: { color: colors.gold, transparency: 45, pt: 1 }, fill: { color: i % 2 ? 'F3F6F1' : 'FFF5E5' } });
      slide.addText(item[0], { x: x + 0.15, y: y + 0.12, w: 5.0, h: 0.18, fontFace: 'Georgia', fontSize: 12, bold: true, color: colors.teal, margin: 0 });
      slide.addText(item[1], { x: x + 0.15, y: y + 0.36, w: 4.95, h: 0.5, fontFace: 'Aptos', fontSize: 11, color: colors.ink, margin: 0, fit: 'shrink' });
    });
    addQuestion(slide, 'Which of these terms have you heard used differently in church?', 6.0, 11.3);
    slides.push(slide);
  }

  {
    const slide = pptx.addSlide();
    slide.background = { color: colors.cream };
    addHeader(slide, 'Why We Need Grace', 'Human need');
    slide.addImage({ path: path.join(assetDir, 'bible-sunlight.png'), x: 7.3, y: 1.0, w: 5.65, h: 5.8 });
    addBodyText(slide, [
      'Because guilt is real.',
      'Because the heart bends toward comparison, pride, and self-justification.',
      'Because we cannot heal ourselves by pretending we are fine.',
      'Because forgiveness is deeper than improvement.',
      'Because mercy meets us where merit cannot.'
    ], { x: 0.8, y: 1.15, w: 6.0, h: 2.8, fontSize: 15 });
    addVerseBox(slide, 'Romans 3:23-24', '“For all have sinned ... and are justified freely by his grace.”', { x: 0.8, y: 4.55, w: 6.0, h: 1.02 });
    addQuestion(slide, 'What changes when we stop trying to earn what can only be received?', 5.95, 6.0);
    slides.push(slide);
  }

  {
    const slide = pptx.addSlide();
    slide.background = { color: colors.paper };
    addHeader(slide, 'Why Grace Feels Unfair', 'The offense');
    slide.addImage({ path: path.join(assetDir, 'justice-scales.png'), x: 7.45, y: 1.0, w: 5.4, h: 5.8 });
    addBodyText(slide, [
      'It upsets our accounting.',
      'It levels people who expected hierarchy.',
      'It welcomes latecomers without apology.',
      'It breaks the link between status and blessing.'
    ], { x: 0.82, y: 1.25, w: 5.8, h: 1.9, fontSize: 16 });
    addQuestion(slide, 'Who are the “late workers” in our churches and communities?', 3.5, 6.1);
    addQuestion(slide, 'Why do we instinctively want grace to be rationed?', 4.12, 6.1);
    addVerseBox(slide, 'Matthew 20:10-12', '“These who were hired last worked only one hour ...”', { x: 0.82, y: 5.0, w: 5.95, h: 1.0 });
    slides.push(slide);
  }

  {
    const slide = pptx.addSlide();
    slide.background = { color: colors.cream };
    addHeader(slide, 'The Landowner Answers', 'Matthew 20');
    slide.addImage({ path: path.join(assetDir, 'vineyard-sunrise.png'), x: 7.05, y: 0.95, w: 5.8, h: 5.95 });
    addBodyText(slide, [
      'The landowner insists he has not been unjust.',
      'He keeps his promise to the first workers.',
      'Then he chooses generosity for the rest.',
      'The issue is not fairness versus fraud.',
      'The issue is fairness versus generosity.'
    ], { x: 0.8, y: 1.1, w: 6.0, h: 2.7, fontSize: 15 });
    addVerseBox(slide, 'Matthew 20:13-15', '“I am not being unfair to you ... I want to give to the one who was hired last the same as I gave you.”', { x: 0.82, y: 4.55, w: 6.0, h: 1.2 });
    addQuestion(slide, 'Do we want grace for ourselves and contracts for everyone else?', 6.05, 6.0);
    slides.push(slide);
  }

  {
    const slide = pptx.addSlide();
    slide.background = { color: colors.paper };
    addHeader(slide, 'John 8', 'Mercy and holiness');
    slide.addImage({ path: path.join(assetDir, 'mercy-courtyard.png'), x: 7.35, y: 0.95, w: 5.55, h: 5.95 });
    addBodyText(slide, [
      'The accusers want punishment.',
      'Jesus exposes their own sin without excusing hers.',
      'He protects the woman from condemnation and calls her away from sin.',
      'Grace does not deny truth; it rescues the sinner inside it.'
    ], { x: 0.82, y: 1.1, w: 6.0, h: 2.75, fontSize: 15 });
    addVerseBox(slide, 'John 8:7, 11', '“He that is without sin among you, let him first cast a stone ... Neither do I condemn thee: go, and sin no more.”', { x: 0.82, y: 4.55, w: 6.0, h: 1.22 });
    addQuestion(slide, 'How does Jesus hold mercy and holiness together here?', 6.08, 6.0);
    slides.push(slide);
  }

  {
    const slide = pptx.addSlide();
    slide.background = { color: colors.cream };
    addHeader(slide, 'Voices on Grace', 'Quotes');
    slide.addShape(PptxGenJS.ShapeType.roundRect, { x: 0.7, y: 1.0, w: 11.9, h: 5.85, rectRadius: 0.04, line: { color: colors.sand, pt: 1 }, fill: { color: 'FFFDF8' } });
    const quoteBoxes = [
      { x: 0.98, y: 1.35, w: 3.55, h: 1.5, title: 'Bonhoeffer', quote: '“Cheap grace is grace without discipleship.”', tint: 'F4E6D5' },
      { x: 4.88, y: 1.35, w: 3.55, h: 1.5, title: 'C. S. Lewis', quote: '“Pride is the complete anti-God state of mind.”', tint: 'E5F0EE' },
      { x: 8.78, y: 1.35, w: 3.55, h: 1.5, title: 'Spurgeon', quote: '“It is not thy hold on Christ that saves thee; it is Christ.”', tint: 'F6E8E2' },
      { x: 1.95, y: 3.55, w: 9.3, h: 1.45, title: 'A biblical summary', quote: '“By grace are ye saved through faith ... not of works, lest any man should boast.”', tint: 'FFF2D9' },
    ];
    quoteBoxes.forEach((box) => {
      slide.addShape(PptxGenJS.ShapeType.roundRect, { x: box.x, y: box.y, w: box.w, h: box.h, rectRadius: 0.03, line: { color: colors.gold, transparency: 45, pt: 1 }, fill: { color: box.tint } });
      slide.addText(box.title, { x: box.x + 0.15, y: box.y + 0.12, w: box.w - 0.3, h: 0.16, fontFace: 'Georgia', fontSize: 11, color: colors.teal, bold: true, margin: 0 });
      slide.addText(box.quote, { x: box.x + 0.16, y: box.y + 0.37, w: box.w - 0.32, h: box.h - 0.46, fontFace: 'Georgia', fontSize: 15, color: colors.ink, italic: true, margin: 0, fit: 'shrink' });
    });
    addQuestion(slide, 'Which quote best challenges how we talk about grace in church?', 5.9, 8.7);
    slides.push(slide);
  }

  {
    const slide = pptx.addSlide();
    slide.background = { color: colors.paper };
    addHeader(slide, 'Discussion', 'Questions');
    slide.addImage({ path: path.join(assetDir, 'vineyard-sunrise.png'), x: 8.25, y: 0.95, w: 4.6, h: 5.95 });
    addBodyText(slide, [
      'Use these to open the room up:',
      '1. When has grace felt unfair to you?',
      '2. Which is harder for you: receiving grace or giving it?',
      '3. How does this parable challenge Adventist community life?',
      '4. What does grace ask us to change after it forgives us?'
    ], { x: 0.82, y: 1.15, w: 6.5, h: 3.0, fontSize: 16 });
    addVerseBox(slide, 'Luke 7:47', '“Her sins, which are many, are forgiven; for she loved much.”', { x: 0.82, y: 4.75, w: 6.3, h: 1.0 });
    addQuestion(slide, 'Which question should we leave space to answer out loud?', 6.05, 6.3);
    slides.push(slide);
  }

  {
    const slide = pptx.addSlide();
    slide.background = { color: colors.cream };
    addHeader(slide, 'Closing', 'Invitation');
    slide.addImage({ path: path.join(assetDir, 'bible-sunlight.png'), x: 0, y: 0.95, w: 13.333, h: 6.55 });
    slide.addShape(PptxGenJS.ShapeType.rect, { x: 0, y: 0.95, w: 13.333, h: 6.55, line: { color: '000000', transparency: 100 }, fill: { color: '17313D', transparency: 46 } });
    slide.addText('Grace does not deny justice.\nIt reveals mercy at the heart of God.', {
      x: 0.92, y: 2.0, w: 7.5, h: 1.2, fontFace: 'Georgia', fontSize: 24, color: 'FFFFFF', bold: true, margin: 0, fit: 'shrink'
    });
    slide.addText('So the question is not whether God is good enough to forgive.\nThe question is whether we will receive the gift, and then live like people who have received it.', {
      x: 0.95, y: 3.35, w: 7.2, h: 1.15, fontFace: 'Aptos', fontSize: 14, color: 'F6EFD9', margin: 0, fit: 'shrink'
    });
    slide.addShape(PptxGenJS.ShapeType.roundRect, { x: 0.95, y: 5.08, w: 4.6, h: 1.0, rectRadius: 0.04, line: { color: colors.gold, pt: 1, transparency: 20 }, fill: { color: 'FFF1D3', transparency: 8 } });
    slide.addText('“The last shall be first.”', {
      x: 1.17, y: 5.38, w: 4.15, h: 0.22, fontFace: 'Georgia', fontSize: 20, color: colors.ink, italic: true, bold: true, margin: 0, align: 'center'
    });
    slides.push(slide);
  }

  slides.forEach((slide, idx) => addFooter(slide, idx + 1));

  await pptx.writeFile({ fileName: outPath });
}

await makeAssets();
await buildDeck();
