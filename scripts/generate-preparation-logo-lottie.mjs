import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const sourceImagePath = process.env.PREPARATION_LOGO_SOURCE
  ? resolve(process.env.PREPARATION_LOGO_SOURCE)
  : join(homedir(), 'Downloads', 'preparations_bible.png');
const outputPath = join(projectRoot, 'assets', 'animations', 'preparation-logo.json');

const sourceImage = readFileSync(sourceImagePath);
const logoDataUri = `data:image/png;base64,${sourceImage.toString('base64')}`;

const W = 1024;
const H = 1024;
const fps = 60;
const outFrame = 210;

let layerIndex = 1;

function color(hex, alpha = 1) {
  const clean = hex.replace('#', '');
  return [
    Number.parseInt(clean.slice(0, 2), 16) / 255,
    Number.parseInt(clean.slice(2, 4), 16) / 255,
    Number.parseInt(clean.slice(4, 6), 16) / 255,
    alpha,
  ];
}

function hold(value) {
  return { a: 0, k: value };
}

function ease(x1 = 0.333, y1 = 0, x2 = 0.667, y2 = 1) {
  return {
    i: { x: [x2], y: [y2] },
    o: { x: [x1], y: [y1] },
  };
}

function keyframes(frames) {
  return {
    a: 1,
    k: frames.map((frame, index) => {
      const next = frames[index + 1];
      const item = {
        t: frame.t,
        s: Array.isArray(frame.v) ? frame.v : [frame.v],
      };

      if (next) {
        item.e = Array.isArray(next.v) ? next.v : [next.v];
        Object.assign(item, ease(frame.x1, frame.y1, frame.x2, frame.y2));
      }

      return item;
    }),
  };
}

function layerTransform({ opacity = 100, position = [W / 2, H / 2, 0], scale = [100, 100, 100], rotation = 0, anchor = [W / 2, H / 2, 0] } = {}) {
  return {
    o: typeof opacity === 'object' ? opacity : hold(opacity),
    r: typeof rotation === 'object' ? rotation : hold(rotation),
    p: typeof position === 'object' && 'a' in position ? position : hold(position),
    a: hold(anchor),
    s: typeof scale === 'object' && 'a' in scale ? scale : hold(scale),
  };
}

function shapeLayer(name, shapes, transform = {}, ip = 0, op = outFrame, bm = 0) {
  return {
    ddd: 0,
    ind: layerIndex++,
    ty: 4,
    nm: name,
    sr: 1,
    ks: layerTransform(transform),
    ao: 0,
    shapes,
    ip,
    op,
    st: 0,
    bm,
  };
}

function imageLayer(name, transform, ip = 0, op = outFrame) {
  return {
    ddd: 0,
    ind: layerIndex++,
    ty: 2,
    nm: name,
    refId: 'preparation-logo-source',
    sr: 1,
    ks: layerTransform(transform),
    ao: 0,
    ip,
    op,
    st: 0,
    bm: 0,
  };
}

function textLayer(name, text, transform, textOptions = {}, ip = 0, op = outFrame) {
  return {
    ddd: 0,
    ind: layerIndex++,
    ty: 5,
    nm: name,
    sr: 1,
    ks: layerTransform(transform),
    ao: 0,
    t: {
      d: {
        k: [
          {
            s: {
              sz: textOptions.sizeBox ?? [920, 96],
              ps: textOptions.position ?? [-460, -48],
              s: textOptions.fontSize ?? 58,
              f: 'Inter-Bold',
              t: text,
              j: 2,
              tr: textOptions.tracking ?? 54,
              lh: textOptions.lineHeight ?? 70,
              ls: 0,
              fc: textOptions.fill ?? color('#f5d37a').slice(0, 3),
            },
            t: 0,
          },
        ],
      },
      p: {},
      m: {
        g: 1,
        a: { a: 0, k: [0, 0] },
      },
      a: [],
    },
    ip,
    op,
    st: 0,
    bm: 0,
  };
}

function pathShape(name, vertices, closed = false) {
  return {
    ty: 'sh',
    nm: name,
    ind: 0,
    ks: {
      a: 0,
      k: {
        i: vertices.map(() => [0, 0]),
        o: vertices.map(() => [0, 0]),
        v: vertices,
        c: closed,
      },
    },
  };
}

function bezierPath(name, vertices, inTangents, outTangents, closed = false) {
  return {
    ty: 'sh',
    nm: name,
    ind: 0,
    ks: {
      a: 0,
      k: {
        i: inTangents,
        o: outTangents,
        v: vertices,
        c: closed,
      },
    },
  };
}

function stroke(hex, width, opacity = 100) {
  return {
    ty: 'st',
    nm: 'Stroke',
    c: hold(color(hex)),
    o: typeof opacity === 'object' ? opacity : hold(opacity),
    w: hold(width),
    lc: 2,
    lj: 2,
    ml: 4,
    bm: 0,
  };
}

function fill(hex, opacity = 100) {
  return {
    ty: 'fl',
    nm: 'Fill',
    c: hold(color(hex)),
    o: typeof opacity === 'object' ? opacity : hold(opacity),
    r: 1,
    bm: 0,
  };
}

function rect(name, size, position = [0, 0], radius = 0) {
  return {
    ty: 'rc',
    nm: name,
    d: 1,
    s: hold(size),
    p: hold(position),
    r: hold(radius),
  };
}

function ellipse(name, size, position = [0, 0]) {
  return {
    ty: 'el',
    nm: name,
    d: 1,
    s: hold(size),
    p: hold(position),
  };
}

function trim(name, startFrame, endFrame) {
  return {
    ty: 'tm',
    nm: name,
    s: hold(0),
    e: keyframes([
      { t: startFrame, v: 0 },
      { t: endFrame, v: 100 },
    ]),
    o: hold(0),
    m: 1,
  };
}

function group(name, items) {
  return {
    ty: 'gr',
    nm: name,
    it: [
      ...items,
      {
        ty: 'tr',
        p: hold([0, 0]),
        a: hold([0, 0]),
        s: hold([100, 100]),
        r: hold(0),
        o: hold(100),
        sk: hold(0),
        sa: hold(0),
      },
    ],
  };
}

function pageLine(y, side) {
  const left = side === 'left';
  const start = left ? [132, y] : [892, y];
  const mid = left ? [330, y + 8] : [694, y + 8];
  const end = [512, 838];
  return bezierPath(
    `${side} page line ${y}`,
    [start, mid, end],
    [[0, 0], left ? [-88, -4] : [88, -4], left ? [-58, -20] : [58, -20]],
    [left ? [88, 4] : [-88, 4], left ? [58, 20] : [-58, 20], [0, 0]],
    false
  );
}

const layers = [];

layers.push(
  shapeLayer('deep midnight background', [
    group('background fill', [
      rect('canvas', [W, H], [W / 2, H / 2]),
      fill('#050711', 100),
    ]),
  ])
);

layers.push(
  shapeLayer('halo behind opening bible', [
    group('soft gold halo', [
      ellipse('halo', [780, 780], [512, 472]),
      fill('#c9a348', keyframes([
        { t: 0, v: 0 },
        { t: 48, v: 16 },
        { t: 160, v: 24 },
        { t: 210, v: 18 },
      ])),
    ]),
  ])
);

const leftPage = pathShape('left page', [[512, 760], [92, 690], [155, 500], [512, 562]], true);
const rightPage = pathShape('right page', [[512, 760], [932, 690], [869, 500], [512, 562]], true);

layers.push(
  shapeLayer('left bible page opening', [
    group('left page fill', [leftPage, fill('#f9eebf', 92)]),
  ], {
    opacity: keyframes([{ t: 0, v: 0 }, { t: 12, v: 85 }, { t: 40, v: 100 }]),
    rotation: keyframes([{ t: 0, v: -19 }, { t: 50, v: 0 }]),
    scale: keyframes([{ t: 0, v: [18, 95, 100] }, { t: 50, v: [100, 100, 100] }]),
  })
);

layers.push(
  shapeLayer('right bible page opening', [
    group('right page fill', [rightPage, fill('#f9eebf', 92)]),
  ], {
    opacity: keyframes([{ t: 0, v: 0 }, { t: 12, v: 85 }, { t: 40, v: 100 }]),
    rotation: keyframes([{ t: 0, v: 19 }, { t: 50, v: 0 }]),
    scale: keyframes([{ t: 0, v: [18, 95, 100] }, { t: 50, v: [100, 100, 100] }]),
  })
);

layers.push(
  imageLayer('lion and bp mark emerging from pages', {
    opacity: keyframes([
      { t: 42, v: 0 },
      { t: 72, v: 42 },
      { t: 108, v: 100 },
    ]),
    position: keyframes([
      { t: 42, v: [512, 570, 0] },
      { t: 112, v: [512, 512, 0] },
    ]),
    scale: keyframes([
      { t: 42, v: [82, 82, 100] },
      { t: 112, v: [100, 100, 100] },
    ]),
  }, 35)
);

layers.push(
  shapeLayer('premium gold bloom', [
    group('gold wash', [
      rect('gold wash', [W, H], [W / 2, H / 2]),
      fill('#d7aa3a', keyframes([
        { t: 92, v: 0 },
        { t: 126, v: 16 },
        { t: 170, v: 8 },
      ])),
    ]),
  ], {}, 90, outFrame, 5)
);

layers.push(
  shapeLayer('light sweep across logo', [
    group('sweep bar', [
      rect('wide diagonal sweep', [170, 1420], [0, 0], 24),
      fill('#fff5c7', keyframes([
        { t: 104, v: 0 },
        { t: 122, v: 58 },
        { t: 150, v: 0 },
      ])),
    ]),
  ], {
    position: keyframes([
      { t: 104, v: [-180, 506, 0] },
      { t: 150, v: [1210, 506, 0] },
    ]),
    rotation: -18,
  }, 100, 158, 1)
);

layers.push(
  textLayer('bible preparations title fade', 'BIBLE PREPARATIONS', {
    opacity: keyframes([
      { t: 116, v: 0 },
      { t: 148, v: 100 },
    ]),
    position: [512, 928, 0],
    scale: keyframes([
      { t: 116, v: [96, 96, 100] },
      { t: 148, v: [100, 100, 100] },
    ]),
    anchor: [0, 0, 0],
  }, {
    fontSize: 57,
    tracking: 42,
    lineHeight: 68,
    fill: color('#f2cf75').slice(0, 3),
  }, 110)
);

for (const [i, [x, y, size, delay]] of [
  [236, 214, 12, 126],
  [792, 244, 10, 134],
  [458, 152, 8, 142],
  [604, 636, 9, 150],
  [320, 704, 7, 158],
  [718, 726, 7, 166],
].entries()) {
  layers.push(
    shapeLayer(`gold shimmer spark ${i + 1}`, [
      group('spark', [
        rect('spark vertical', [size * 0.34, size * 2.8], [x, y], size),
        rect('spark horizontal', [size * 2.8, size * 0.34], [x, y], size),
        fill('#ffe9a6', keyframes([
          { t: delay, v: 0 },
          { t: delay + 8, v: 94 },
          { t: delay + 24, v: 0 },
        ])),
      ]),
    ], {
      scale: keyframes([
        { t: delay, v: [70, 70, 100] },
        { t: delay + 8, v: [125, 125, 100] },
        { t: delay + 24, v: [80, 80, 100] },
      ]),
      rotation: keyframes([
        { t: delay, v: 0 },
        { t: delay + 24, v: 45 },
      ]),
    }, delay, delay + 28, 1)
  );
}

const animation = {
  v: '5.7.4',
  fr: fps,
  ip: 0,
  op: outFrame,
  w: W,
  h: H,
  nm: 'Bible Preparations Logo Reveal',
  ddd: 0,
  assets: [
    {
      id: 'preparation-logo-source',
      w: W,
      h: H,
      u: '',
      p: logoDataUri,
      e: 1,
    },
  ],
  fonts: {
    list: [
      {
        fName: 'Inter-Bold',
        fFamily: 'Inter',
        fStyle: 'Bold',
        ascent: 78,
      },
    ],
  },
  layers: layers.reverse(),
  markers: [
    { tm: 0, cm: 'Bible opens', dr: 50 },
    { tm: 50, cm: 'Logo emerges', dr: 68 },
    { tm: 118, cm: 'Light sweep and title fade', dr: 42 },
    { tm: 150, cm: 'Premium gold shimmer', dr: 48 },
  ],
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(animation)}\n`);

console.log(`Generated ${outputPath}`);
