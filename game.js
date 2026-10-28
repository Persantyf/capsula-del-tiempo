'use strict';
/* Cápsula del Tiempo · made by p4rsan */

// =====================================================================
// UTILIDADES
// =====================================================================
const $ = s => document.querySelector(s);
const uid = () => Math.random().toString(36).slice(2, 10);
const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function wpick(list) {
  let t = Math.random() * list.reduce((a, x) => a + x.w, 0);
  for (const x of list) { t -= x.w; if (t <= 0) return x; }
  return list[list.length - 1];
}

// generador pseudoaleatorio con semilla (texturas estables)
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
function fmt(n) {
  if (!isFinite(n)) return '∞';
  if (n < 0) return '-' + fmt(-n);
  if (n < 10) return (Math.floor(n * 10) / 10).toString().replace('.', ',');
  if (n < 1000) return Math.floor(n).toString();
  const e = Math.floor(Math.log10(n) / 3);
  if (e >= SUFFIXES.length) return n.toExponential(2).replace('.', ',').replace('e+', 'e');
  const v = n / Math.pow(1000, e);
  const d = v < 10 ? 2 : v < 100 ? 1 : 0;
  return (Math.floor(v * 10 ** d) / 10 ** d).toFixed(d).replace('.', ',') + SUFFIXES[e];
}
const pct = p => Math.round(p * 100) + '%';
const fmtYear = y => y < 0 ? `${(-y).toLocaleString('es-ES')} a.C.` : `${Math.max(1, y).toLocaleString('es-ES')} d.C.`;

function roman(n) {
  if (n <= 0) return '0';
  const map = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let s = '';
  for (const [v, r] of map) while (n >= v) { s += r; n -= v; }
  return s;
}

function hexToRgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function mixRgb(A, B, t) { return A.map((v, i) => Math.round(v + (B[i] - v) * t)); }
const rgbStr = (rgb, f = 1) => `rgb(${rgb.map(v => clamp(Math.round(v * f), 0, 255)).join(',')})`;
const mixHex = (a, b, t) => rgbStr(mixRgb(hexToRgb(a), hexToRgb(b), t));

// =====================================================================
// PIXEL ART (sprites de 10x10 dibujados a mano)
// =====================================================================
const PAL = {
  k: '#1a1016', w: '#f4ead5', y: '#f2c14e', o: '#d9822b', O: '#a85a1f', b: '#8a5a2b', d: '#5a3a22',
  g: '#8fd14f', G: '#3f7a34', s: '#b8b4ac', S: '#6e6a70', r: '#d04a3a', R: '#8c2a22',
  p: '#9a5fd6', c: '#5fb8d6', C: '#2f6f9a', t: '#d6b07a', f: '#eab08a',
};

const SPRITES = {
  pan: ['..........', '...kkkk...', '..kyyyyk..', '.kyoyyoyk.', 'kyyyyyyyyk', 'kyoyyoyyok', 'koyyyyyyok', '.kooooook.', '..kkkkkk..'],
  piedra: ['..........', '...kkkk...', '..kSsssk..', '.kSswsssk.', '.ksssssSk.', 'kSsSssssSk', 'kSSsssSSSk', '.kSSSSSSk.', '..kkkkkk..'],
  cultura: ['....kk....', '...kyyk...', '...kyyk...', 'kkkyyyykkk', 'kyyyywyyyk', '.kyyyyyyk.', '..kyyyyk..', '.kyyyyyyk.', '.kyykkyyk.', '.kkk..kkk.'],
  frag: ['..........', '.....kk...', '....kook..', '...kowok..', '..koooOk..', '.kooooOOk.', '.kOoooOk..', '..kOOOk...', '...kkk....'],
  granja: ['.y..y..y..', 'kyk.yk.yk.', '.y.kyk.y..', '.yk.y.ky..', '..g.g.g...', '..g.g.g...', '..gkgkg...', '.kgggggk..', 'kbbbbbbbbk', 'kddddddddk'],
  granja2: ['..y..y..y.', '.kyk.yk.yk', '..y.kyk.y.', '..yk.y.ky.', '..g.g.g...', '..g.g.g...', '..gkgkg...', '.kgggggk..', 'kbbbbbbbbk', 'kddddddddk'],
  mina: ['..kkkkkk..', '.kbbbbbbk.', 'kbbkkkkbbk', 'kbk....kbk', 'kbk.yy.kbk', 'kbk.kk.kbk', 'kbk....kbk', 'kbksssskbk', 'kSssSSssSk', 'kkkkkkkkkk'],
  templo: ['....kk....', '..kkttkk..', '.kttttttk.', 'kkkkkkkkkk', '.kt.kt.kt.', '.kt.kt.kt.', '.kt.kt.kt.', '.kt.kt.kt.', 'kkkkkkkkkk', 'kttttttttk'],
  biblioteca: ['kkkkkkkkkk', 'krrkcckppk', 'krwkcwkpwk', 'krrkcckppk', 'krrkcckppk', 'krwkcwkpwk', 'krrkcckppk', 'kkkkkkkkkk', 'kbbbbbbbbk', 'kkkkkkkkkk'],
  pico: ['..kkkkkk..', '.kssssssk.', 'ksSkbbkSsk', 'kk.kbbk.kk', '...kbbk...', '...kbbk...', '...kbbk...', '...kbbk...', '...kddk...', '...kkkk...'],
  arqueologo: ['...kkkk...', '..kttttk..', '.kkkkkkkk.', '...kffk...', '...kffk...', '..kGGGGk..', '.kfkGGkfk.', '...kGGk...', '...kddk...', '...kkkk...'],
  semillas: ['..........', '.kk....kk.', 'kggk..kggk', 'kgGgkkgGgk', '.kkGGGGkk.', '....kGk...', '....kGk...', '..kkbbbkk.', '.kbdbbbdbk', '..kkkkkkk.'],
  herramientas: ['.kkkkkkk..', '.kSssssk..', '.kSssssk..', '.kkkbkkk..', '....kbk...', '....kbk...', '....kbk...', '....kbk...', '....kdk...', '....kkk...'],
  reliquias: ['..kkkkkk..', '.kSSSSSSk.', '.kssssssk.', '.kkskkskk.', '.kssssssk.', '.kssSSssk.', '.ksskkssk.', '.kssssssk.', '.kSSSSSSk.', 'kkkkkkkkkk'],
  pergaminos: ['..........', '.kkkkkkkk.', 'kttwwwwttk', '.kwkkkkwk.', '.kwwwwwwk.', '.kwkkkwwk.', '.kwwwwwwk.', 'kttwwwwttk', '.kkkkkkkk.'],
  anfora: ['..kkkkkk..', '...kddk...', '..kooook..', '.kooooook.', 'kooyyyyook', 'kooooooook', '.kOooooOk.', '..kOooOk..', '...kOOk...', '....kk....'],
  calavera: ['..kkkkkk..', '.kwwwwwwk.', 'kwwwwwwwwk', 'kwkkwwkkwk', 'kwkkwwkkwk', 'kwwwkkwwwk', '.kwwwwwwk.', '..kwkwkwk.', '..kkkkkk..'],
  moneda: ['..........', '...kkkk...', '..kyyyyk..', '.kyywwyyk.', '.kywyyoyk.', '.kywyyoyk.', '.kyyooyyk.', '..kyyyyk..', '...kkkk...'],
  ojo: ['..........', '...kkkk...', '.kkwwwwkk.', 'kwwkppkwwk', 'kwkpkkpkwk', 'kwwkppkwwk', '.kkwwwwkk.', '...kkkk...'],
  rayo: ['.....kkk..', '....kyyk..', '...kyyk...', '..kyyykkk.', '.kyyyyyyk.', '.kkkkyyk..', '....kyk...', '...kyk....', '...kk.....'],
  volcan: ['...r..r...', '....rr....', '...kkkk...', '...krrk...', '..kSrrSk..', '..kSSrSk..', '.kSSSSrSk.', '.kSSSSSSk.', 'kSSSSSSSSk', 'kkkkkkkkkk'],
  ola: ['..........', '....kkkk..', '..kkcccwk.', '.kcccckcwk', 'kcccck.kk.', 'kccck.....', 'kcccckkkk.', 'kCccccccck', 'kCCCCCCCCk', 'kkkkkkkkkk'],
  casa: ['....kk....', '...kddk...', '..kdddbk..', '.kddbdddk.', 'kkkkkkkkkk', '.kttktttk.', '.ktkkt.tk.', '.kttkt.tk.', '.kttkkkkk.', 'kkkkkkkkkk'],
  candado: ['...kkkk...', '..k....k..', '..k....k..', '.kkkkkkkk.', '.kyyyyyyk.', '.kyyykyyk.', '.kyyykyyk.', '.kyyyyyyk.', '.kkkkkkkk.'],
  fosil: ['..kkkkk...', '.kwwwwwk..', 'kwwkkkwwk.', 'kwkwwwkwk.', 'kwkwkkwwk.', 'kwkwwkwk..', 'kwwkkwwk..', '.kwwwwkk..', '..kkkk....'],
  tablilla: ['.kkkkkkkk.', 'kssssssssk', 'kskksksksk', 'kssssssssk', 'ksksskkssk', 'kssssssssk', 'kskkkskksk', 'kssssssssk', 'kSSSSSSSSk', '.kkkkkkkk.'],
  medalla: ['.rr....rr.', '..rr..rr..', '...rrrr...', '...kkkk...', '..kyyyyk..', '.kyywwyyk.', '.kywyyyyk.', '.kyyyyyyk.', '..kyyyyk..', '...kkkk...'],
  geoda: ['....kk....', '...kpwk...', '..kppwpk..', '.kpppwppk.', 'kppppppppk', '.kpppppk..', '..kSSSSk..', '.kSSSSSSk.', 'kkkkkkkkkk'],
};

const sprCache = {};
function sprCanvas(name, swap) {
  const key = name + (swap ? JSON.stringify(swap) : '');
  if (sprCache[key]) return sprCache[key].cv;
  const rows = SPRITES[name] || SPRITES.candado;
  const w = Math.max(...rows.map(r => r.length));
  const c = document.createElement('canvas');
  c.width = w;
  c.height = 10;
  const g = c.getContext('2d');
  const off = 10 - rows.length; // los sprites bajitos se apoyan abajo
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    const col = (swap && swap[ch]) || PAL[ch];
    if (col) { g.fillStyle = col; g.fillRect(x, y + off, 1, 1); }
  }));
  sprCache[key] = { cv: c, url: c.toDataURL() };
  return c;
}
function sprURL(name, swap) {
  sprCanvas(name, swap);
  return sprCache[name + (swap ? JSON.stringify(swap) : '')].url;
}
const spr = (name, size = 30, swap, cls = '') => `<img class="px ${cls}" src="${sprURL(name, swap)}" width="${size}" height="${size}" alt="">`;
// silueta para lo que aún no has descubierto
const SILHOUETTE = Object.fromEntries(Object.keys(PAL).map(k => [k, k === 'k' ? '#120c09' : '#3a2c22']));
const VILLAGER = { t: '#5a3a22', G: '#c84c3c' };

// texturas de bloques: 16x16 generadas con semilla
function blockTex(rgb, seed, kind) {
  const c = document.createElement('canvas');
  c.width = c.height = 16;
  const g = c.getContext('2d');
  const r = rng(seed);
  const base = kind === 'inestable' ? mixRgb(rgb, [150, 55, 40], 0.5) : rgb;
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      let f = 1 + (r() - 0.5) * 0.16;
      if (y < 2) f += 0.18;
      if (x < 1) f += 0.08;
      if (y > 13) f -= 0.25;
      if (x > 14) f -= 0.14;
      g.fillStyle = rgbStr(base, f);
      g.fillRect(x, y, 1, 1);
    }
  }
  for (let i = 0; i < 4; i++) {
    const x = 2 + Math.floor(r() * 11), y = 3 + Math.floor(r() * 9);
    g.fillStyle = rgbStr(base, 0.7);
    g.fillRect(x, y + 1, 2, 1);
    g.fillStyle = rgbStr(base, 1.28);
    g.fillRect(x, y, 2, 1);
  }
  const px = (x, y, col) => { g.fillStyle = col; g.fillRect(x, y, 1, 1); };
  if (kind === 'oro') {
    for (let i = 0; i < 7; i++) {
      const x = 2 + Math.floor(r() * 11), y = 2 + Math.floor(r() * 11);
      g.fillStyle = '#8a5f12'; g.fillRect(x, y + 1, 2, 1);
      g.fillStyle = '#f2c14e'; g.fillRect(x, y, 2, 1);
      px(x, y, '#fff6c9');
    }
  }
  if (kind === 'inestable') {
    for (let k = 0; k < 3; k++) {
      let x = 7 + Math.floor(r() * 3), y = 7 + Math.floor(r() * 3);
      for (let s = 0; s < 6; s++) {
        px(x, y, s < 2 ? '#ffe08a' : '#ff8a2b');
        x = clamp(x + Math.round(r() * 2 - 1) + (k === 0 ? 1 : k === 1 ? -1 : 0), 1, 14);
        y = clamp(y + Math.round(r() * 2 - 1) + (k === 2 ? 1 : -1), 1, 14);
      }
    }
  }
  if (kind === 'fosil') {
    // concha en espiral incrustada
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const d = Math.hypot(x - 7.5, y - 7.5);
        if (d > 2.6 && d < 4.4) px(x, y, (x + y) % 3 ? '#e8dcc0' : '#b8a888');
        else if (d <= 1.6) px(x, y, '#cbbd9c');
        else if (d >= 4.4 && d < 5.2) px(x, y, rgbStr(base, 0.6));
      }
    }
    px(9, 6, '#7a6a50'); px(10, 7, '#7a6a50'); px(10, 8, '#7a6a50');
  }
  if (kind === 'geoda') {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const m = Math.abs(dx) + Math.abs(dy);
        if (m > 4) continue;
        px(8 + dx, 8 + dy, m === 4 ? '#3a2050' : (dx + dy) % 2 ? '#b46cff' : '#8a4ad0');
      }
    }
    px(7, 6, '#f0d8ff'); px(8, 7, '#f0d8ff'); px(9, 9, '#e0b8ff'); px(6, 9, '#e0b8ff');
  }
  return c.toDataURL();
}

function holeTex(rgb, seed) {
  const c = document.createElement('canvas');
  c.width = c.height = 16;
  const g = c.getContext('2d');
  const r = rng(seed);
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      let f = 0.32 + (r() - 0.5) * 0.08;
      if (y < 3) f -= 0.12;
      if (x < 2) f -= 0.06;
      g.fillStyle = rgbStr(rgb, f);
      g.fillRect(x, y, 1, 1);
    }
  }
  return c.toDataURL();
}

function crackTex(stage) {
  const c = document.createElement('canvas');
  c.width = c.height = 16;
  const g = c.getContext('2d');
  const r = rng(77);
  for (let k = 0; k < stage + 1; k++) {
    let x = 6 + Math.floor(r() * 4), y = 6 + Math.floor(r() * 4);
    const dx = r() < 0.5 ? -1 : 1, dy = r() < 0.5 ? -1 : 1;
    for (let s = 0; s < 3 + stage * 2; s++) {
      g.fillStyle = 'rgba(15,8,6,.62)';
      g.fillRect(x, y, 1, 1);
      g.fillStyle = 'rgba(255,240,220,.16)';
      g.fillRect(x + 1, y, 1, 1);
      if (r() < 0.6) x += dx; else y += dy;
      if (r() < 0.25) y += dy;
      x = clamp(x, 0, 15);
      y = clamp(y, 0, 15);
    }
  }
  return c.toDataURL();
}

// =====================================================================
// DATOS DEL JUEGO
// =====================================================================
const RES = {
  comida: { name: 'Comida', spr: 'pan', color: '#f2c14e' },
  piedra: { name: 'Piedra', spr: 'piedra', color: '#cfcac0' },
  cultura: { name: 'Cultura', spr: 'cultura', color: '#ffe08a' },
};

const ERAS = [
  { name: 'Edad de Piedra', color: '#7d6142', sky: ['#e59a6a', '#f2b27a', '#f6cf96'], cost: null },
  { name: 'Edad del Bronce', color: '#93622f', sky: ['#5d97c2', '#7cb8d8', '#a8d8ea'], cost: { cultura: 600 } },
  { name: 'Edad del Hierro', color: '#596069', sky: ['#6f6a96', '#9a94b8', '#c9c3d8'], cost: { cultura: 30000, piedra: 40000 } },
];
const NIGHT = ['#0b1028', '#141a3a', '#232a52'];

// el id "cantera" se mantiene para no romper partidas guardadas
const BUILDINGS = {
  granja: { name: 'Granja', plural: 'granjas', spr: 'granja', era: 0, cost: { comida: 10 }, growth: 1.15, prod: { comida: 1 }, relic: 'semillas', cycle: 1.2 },
  cantera: { name: 'Mina', plural: 'minas', spr: 'mina', era: 0, cost: { comida: 30 }, growth: 1.15, prod: { piedra: 0.5 }, relic: 'herramientas', cycle: 1.8 },
  templo: { name: 'Templo', plural: 'templos', spr: 'templo', era: 0, cost: { comida: 60, piedra: 30 }, growth: 1.17, prod: { cultura: 0.2 }, relic: 'reliquias', cycle: 2.6 },
  biblioteca: { name: 'Biblioteca', plural: 'bibliotecas', spr: 'biblioteca', era: 1, cost: { piedra: 500, cultura: 100 }, growth: 1.2, prod: { cultura: 1.5 }, relic: 'pergaminos', cycle: 3.4 },
};

const MILESTONES = [10, 25, 50, 100, 150, 200, 300, 400, 500, 750, 1000];

const RELICS = {
  semillas: {
    name: 'Semillas', organic: true, effect: p => `+${pct(p)} comida`,
    names: {
      comun: ['Grano carbonizado', 'Semilla petrificada', 'Cesta de trigo fósil'],
      raro: ['Vasija de simiente', 'Espiga de bronce', 'Mazorca sagrada'],
      epico: ['Granero sellado', 'Jardín en miniatura'],
      legendario: ['La Primera Espiga'],
    },
  },
  herramientas: {
    name: 'Herramientas', organic: false, effect: p => `+${pct(p)} excavación · +${pct(p / 2)} piedra`,
    names: {
      comun: ['Lasca de sílex', 'Mango de hueso', 'Cincel romo'],
      raro: ['Hacha pulida', 'Martillo de cobre', 'Punzón grabado'],
      epico: ['Yunque del clan', 'Pico ceremonial'],
      legendario: ['El Martillo del Fundador'],
    },
  },
  reliquias: {
    name: 'Reliquias', organic: false, effect: p => `+${pct(p)} cultura`,
    names: {
      comun: ['Cuenta de collar', 'Figurilla rota', 'Amuleto de arcilla'],
      raro: ['Máscara de barro', 'Tótem tallado', 'Cuenco ritual'],
      epico: ['Ídolo de obsidiana', 'Corona de cobre'],
      legendario: ['El Ídolo Sin Rostro'],
    },
  },
  pergaminos: {
    name: 'Pergaminos', organic: true, effect: p => `−${pct(p / (1 + p))} costes`,
    names: {
      comun: ['Tablilla rota', 'Jirón de papiro'],
      raro: ['Tablilla de cuentas', 'Rollo sellado'],
      epico: ['Mapa estelar', 'Códice ilustrado'],
      legendario: ['El Códice Hundido'],
    },
  },
};

// la historia de cada objeto: lo que se lee en el Códice
const ARTLORE = {
  'Grano carbonizado': 'Se quemó en un horno hace siglos. El pan que iba a ser nunca se comió.',
  'Semilla petrificada': 'Dura como una piedra. Aun así, parece que quiere brotar.',
  'Cesta de trigo fósil': 'Alguien la dejó aquí para volver a por ella al día siguiente.',
  'Vasija de simiente': 'Sellada con cera y una oración. Las semillas de un año que no llegó.',
  'Espiga de bronce': 'No sirve para comer. Sirve para recordar que una vez sobró comida.',
  'Mazorca sagrada': 'Tiene marcas de dientes de algo pequeño. Y de algo muy grande.',
  'Granero sellado': 'Un granero entero en miniatura, lleno de grano. Una promesa al futuro.',
  'Jardín en miniatura': 'Un jardín tallado en una sola piedra. Cada hoja tiene un nombre grabado.',
  'La Primera Espiga': 'La primera planta que alguien cultivó a propósito. Todo empezó aquí.',
  'Lasca de sílex': 'Sigue afilada. Corta mejor que tus cuchillos.',
  'Mango de hueso': 'El hueso de quién, mejor no preguntar.',
  'Cincel romo': 'Lo usaron tanto que quedó romo. Alguien trabajó muy duro aquí.',
  'Hacha pulida': 'Pulida hasta brillar. Nunca se usó para cortar nada.',
  'Martillo de cobre': 'Tiene grabadas las iniciales de su dueño. Son las mismas que las tuyas.',
  'Punzón grabado': 'Con él se escribieron las primeras tablillas. Aún tiene polvo de arcilla.',
  'Yunque del clan': 'Pesa como una casa. Lo enterraron a propósito, para que nadie se lo llevara.',
  'Pico ceremonial': 'Un pico de oro que nunca tocó la tierra. Hasta hoy.',
  'El Martillo del Fundador': 'Con él se clavó la primera estaca de la primera aldea. Sigue caliente.',
  'Cuenta de collar': 'Una sola cuenta azul. El resto del collar sigue en algún sitio, más abajo.',
  'Figurilla rota': 'Una mujer con los brazos abiertos. Le falta la cabeza.',
  'Amuleto de arcilla': 'Protegía del mal de ojo. Contra el olvido no funcionó.',
  'Máscara de barro': 'Tiene tu cara. Exactamente tu cara.',
  'Tótem tallado': 'Cuatro animales, uno encima de otro. Como las capas.',
  'Cuenco ritual': 'Restos de algo rojo en el fondo. Prefieres pensar que era vino.',
  'Ídolo de obsidiana': 'Negro como la capa del fondo. Si lo miras mucho rato, te devuelve la mirada.',
  'Corona de cobre': 'La llevó un rey del que nadie recuerda el nombre. Ni siquiera él.',
  'El Ídolo Sin Rostro': 'No tiene cara porque todavía no ha decidido quién eres.',
  'Tablilla rota': 'Solo se lee la mitad: «…y entonces volvimos a empezar».',
  'Jirón de papiro': 'Una lista de la compra de hace cuatro mil años: pan, cerveza, paciencia.',
  'Tablilla de cuentas': 'Alguien contó las capas. El número está tachado.',
  'Rollo sellado': 'El sello tiene forma de ánfora. Dentro hay otra ánfora dibujada.',
  'Mapa estelar': 'Las estrellas están bien, pero sobra una. Una que se mueve.',
  'Códice ilustrado': 'Dibujos de aldeas, una encima de otra, como las capas de un pastel.',
  'El Códice Hundido': 'Un libro que cuenta tu historia. Las últimas páginas están en blanco.',
};

const FOSSILS = [
  { name: 'Trilobites', w: 20, rar: 0, lore: 'Un bicho con caparazón que vivió aquí antes que todo. Antes que tú, incluso.' },
  { name: 'Amonites', w: 20, rar: 0, lore: 'Una espiral perfecta. Los sacerdotes dicen que es el dibujo del tiempo.' },
  { name: 'Diente de megalodón', w: 14, rar: 1, lore: 'Del tamaño de una mano. Aquí hubo un mar, y algo enorme nadaba en él.' },
  { name: 'Huevo petrificado', w: 12, rar: 1, lore: 'Sigue entero. Si lo acercas al oído, juras que oyes algo dentro.' },
  { name: 'Pluma de piedra', w: 12, rar: 1, lore: 'Una pluma convertida en roca. El pájaro nunca supo que sería eterno.' },
  { name: 'Cráneo de oso cavernario', w: 10, rar: 2, lore: 'Alguien lo enterró rodeado de flores. Hace muchísimo.' },
  { name: 'Huella gigante', w: 8, rar: 2, lore: 'Algo caminó por aquí sobre dos patas. Era más alto que el templo.' },
  { name: 'Ojo de ámbar', w: 4, rar: 3, lore: 'Un insecto atrapado en resina dorada. Te está mirando.' },
];

const TABLETS = [
  'Si estás leyendo esto, ya has empezado a cavar. Bien. No pares.',
  'Las aldeas nacen, crecen y se entierran. Siempre en el mismo sitio. Siempre encima de la anterior. ¿No te parece raro?',
  'Los primeros que vivimos aquí encontramos la capa negra. Estaba caliente. Late como un corazón cuando nadie la mira.',
  'Contamos las capas. Había más de las que debía haber. En algunas estaban nuestras propias casas, en ruinas, antes de que las construyéramos.',
  'El sacerdote dice que aquí el tiempo no avanza: da vueltas. Que cada mil años la tierra se traga lo que somos para devolvérnoslo.',
  'Hoy he visto mi letra en una tablilla que todavía no he escrito.',
  'Las ánforas no son nuestras. Nadie en la aldea sabe hacerlas. Aparecen ya selladas, como regalos de alguien que nos conoce muy bien.',
  'Los cometas no caen del cielo. Suben desde la capa negra. Lo he visto con mis propios ojos.',
  'Si quieres romper el ciclo, tendrás que bajar hasta el fondo. Lleva contigo lo mejor de cada vida. El museo no es un museo: es tu equipaje.',
  'Ya casi estás. Cuando la capa negra se abra, no te asustes de lo que veas. Solo eres tú, esperándote. — P.',
];

const RARITIES = [
  { id: 'comun', name: 'Común', color: '#c9c1b4', power: 0.10, w: 60 },
  { id: 'raro', name: 'Raro', color: '#4ea3ff', power: 0.25, w: 28 },
  { id: 'epico', name: 'Épico', color: '#b46cff', power: 0.60, w: 10 },
  { id: 'legendario', name: 'Legendario', color: '#ffc23d', power: 1.50, w: 2 },
];
const RISK = [0.6, 0.4, 0.25]; // probabilidad de subir de rareza al arriesgar

const ENDINGS = {
  volcan: {
    name: 'Erupción volcánica', spr: 'volcan', tint: '#2b2424', hp: 3, hpLabel: 'Dureza x3',
    desc: 'Como Pompeya: la ceniza lo conserva TODO intacto, pero la roca volcánica es el triple de dura.',
    keep: { organic: 1, other: 1 },
  },
  inundacion: {
    name: 'Gran inundación', spr: 'ola', tint: '#34474a', hp: 1, hpLabel: 'Dureza normal',
    desc: 'El barro conserva perfectamente lo orgánico (semillas, pergaminos). Del resto, solo la mitad.',
    keep: { organic: 1, other: 0.5 },
  },
  abandono: {
    name: 'Abandono', spr: 'casa', tint: '#b39a6b', hp: 1 / 3, hpLabel: 'Dureza ÷3',
    desc: 'La gente se marcha poco a poco. Apenas queda nada (30 %), pero se excava rapidísimo.',
    keep: { organic: 0.3, other: 0.3 },
  },
};

const TIERS = {
  barro: { name: 'Ánfora de barro', short: 'Barro', color: '#e0905a', swap: { o: '#b5653a', O: '#7f4022', y: '#e0a07a' } },
  bronce: { name: 'Ánfora de bronce', short: 'Bronce', color: '#5fd0b4', swap: { o: '#3f9a86', O: '#25685a', y: '#8fe0c8' } },
  oro: { name: 'Ánfora de oro', short: 'Oro', color: '#ffd84a', swap: { o: '#f2c14e', O: '#a87a1f', y: '#fff1a8', d: '#a87a1f' } },
};
const TIER_IDS = ['barro', 'bronce', 'oro'];

const BUFFS = {
  frenesi: { name: 'Frenesí', desc: 'Producción x7', dur: 30, color: '#f2c14e', spr: 'rayo' },
  furia: { name: 'Furia del pico', desc: 'Excavación x10', dur: 20, color: '#ff6a3d', spr: 'pico' },
  suerte: { name: 'Buena estrella', desc: 'Críticos x3 · más rareza', dur: 30, color: '#8fd14f', spr: 'moneda' },
};

const SLOT = [
  { id: 'pan', spr: 'pan', w: 27 },
  { id: 'piedra', spr: 'piedra', w: 25 },
  { id: 'estrella', spr: 'cultura', w: 17 },
  { id: 'anfora', spr: 'anfora', w: 11 },
  { id: 'idolo', spr: 'reliquias', w: 6 },
  { id: 'calavera', spr: 'calavera', w: 14 },
];

const UPGRADES = [
  { id: 'manos', name: 'Manos curtidas', desc: 'Recolectar x3', era: 0, cost: { comida: 40 }, eff: { click: 3 } },
  { id: 'arado', name: 'Arado de madera', desc: 'Granjas x2', era: 0, cost: { comida: 150 }, eff: { granja: 2 }, req: s => s.b.granja >= 5 },
  { id: 'silex', name: 'Picos de sílex', desc: 'Minas x2', era: 0, cost: { comida: 300, piedra: 25 }, eff: { cantera: 2 }, req: s => s.b.cantera >= 5 },
  { id: 'cuerdas', name: 'Cuerdas y cestas', desc: 'Arqueólogos x2', era: 0, cost: { comida: 600, piedra: 150 }, eff: { arq: 2 }, req: s => s.arq >= 2 },
  { id: 'ofrendas', name: 'Ofrendas', desc: 'Templos x2', era: 0, cost: { comida: 500, piedra: 150 }, eff: { templo: 2 }, req: s => s.b.templo >= 3 },
  { id: 'fuego', name: 'Dominio del fuego', desc: 'Toda la producción x1,5', era: 0, cost: { comida: 1500, piedra: 400, cultura: 40 }, eff: { all: 1.5 }, req: s => s.b.templo >= 1 },
  { id: 'hoces', name: 'Hoces de bronce', desc: 'Granjas x3', era: 1, cost: { comida: 8000, piedra: 1500 }, eff: { granja: 3 } },
  { id: 'rueda', name: 'Vagonetas', desc: 'Minas x3', era: 1, cost: { comida: 12000, piedra: 4000 }, eff: { cantera: 3 } },
  { id: 'picobronce', name: 'Pico de bronce', desc: 'Excavación x3', era: 1, cost: { piedra: 3000 }, eff: { dig: 3 } },
  { id: 'escritura', name: 'Escritura', desc: 'Bibliotecas x2', era: 1, cost: { piedra: 6000, cultura: 1200 }, eff: { biblioteca: 2 }, req: s => s.b.biblioteca >= 1 },
  { id: 'rituales', name: 'Rituales', desc: 'Templos x3', era: 1, cost: { comida: 25000, cultura: 2000 }, eff: { templo: 3 } },
  { id: 'escuela', name: 'Escuela de arqueología', desc: 'Arqueólogos x3', era: 1, cost: { cultura: 3000 }, eff: { arq: 3 } },
  { id: 'aradohierro', name: 'Arado de hierro', desc: 'Granjas x4', era: 2, cost: { comida: 4e5, piedra: 8e4 }, eff: { granja: 4 } },
  { id: 'fragua', name: 'La fragua', desc: 'Minas x4 · Excavación x2', era: 2, cost: { piedra: 2.5e5 }, eff: { cantera: 4, dig: 2 } },
  { id: 'filosofia', name: 'Filosofía', desc: 'Templos y bibliotecas x3', era: 2, cost: { cultura: 6e4 }, eff: { templo: 3, biblioteca: 3 } },
  { id: 'moneda', name: 'La moneda', desc: 'Toda la producción x2', era: 2, cost: { comida: 1e6, piedra: 3e5, cultura: 1e5 }, eff: { all: 2 } },
];

const PERMS = [
  { id: 'vitrina', name: 'Vitrina extra', spr: 'templo', desc: '+1 hueco en el museo', base: 20, growth: 3, max: 5 },
  { id: 'pico', name: 'Pico del abuelo', spr: 'pico', desc: '+50 % daño de excavación', base: 8, growth: 1.7, max: 50 },
  { id: 'trebol', name: 'Pata de conejo', spr: 'moneda', desc: '+2 % probabilidad de crítico', base: 12, growth: 1.9, max: 15 },
  { id: 'ojo', name: 'Ojo clínico', spr: 'ojo', desc: '+15 % suerte con las rarezas', base: 15, growth: 1.9, max: 30 },
  { id: 'alfarero', name: 'Alfarero', spr: 'anfora', desc: '+1 ánfora escondida en cada capa', base: 25, growth: 2.4, max: 6 },
  { id: 'memoria', name: 'Memoria colectiva', spr: 'cultura', desc: '+20 % a toda la producción', base: 12, growth: 1.8, max: 100 },
  { id: 'asentamiento', name: 'Asentamiento', spr: 'granja', desc: 'Empiezas cada civilización con comida y piedra', base: 6, growth: 2.2, max: 20 },
  { id: 'cuadrilla', name: 'Cuadrilla', spr: 'arqueologo', desc: 'Empiezas con +2 arqueólogos gratis', base: 10, growth: 2, max: 20 },
  { id: 'cometas', name: 'Astrónomo', spr: 'rayo', desc: 'Los cometas pasan un 15 % más a menudo', base: 30, growth: 2.2, max: 5 },
  { id: 'cronista', name: 'Cronista', spr: 'pergaminos', desc: '+1 artefacto de cada tipo en tus ruinas', base: 60, growth: 3, max: 5 },
];

const LORE = [
  'Los arqueólogos se niegan a tocar la capa negra.',
  'Algunos juran que la capa negra está tibia.',
  'En la capa negra no crecen raíces. Y a veces algo parpadea.',
  'Hay símbolos en la capa negra. Se parecen demasiado a los tuyos.',
];

const VISIONS = [
  '«He visto una escalera que baja para siempre.»',
  '«La capa negra respira cada mil años. Justo cuando enterráis la aldea.»',
  '«Alguien ahí abajo conoce tu nombre. Y lo pronuncia bien.»',
  '«Los cometas son cartas. Alguien nos escribe desde abajo.»',
];

// sucesos: llegan solos y te obligan a decidir
const EVENTS = [
  {
    id: 'mercader', spr: 'anfora', title: 'Un mercader errante',
    text: 'Viene de tierras que no salen en ningún mapa. Te ofrece un ánfora sellada a cambio de piedra.',
    opts: [
      { label: 'Comprarla', cost: () => ({ piedra: prodAmount('piedra', 60, 80) }), act: () => { const t = rollTier(state.era); state.anforas[t]++; renderLuck(); return `Te llevas una ${TIERS[t].name.toLowerCase()}.`; } },
      { label: 'No, gracias', act: () => 'Se encoge de hombros y se marcha silbando.' },
    ],
  },
  {
    id: 'sequia', spr: 'pan', title: 'Sequía',
    text: 'No llueve desde hace semanas. Los campos se agrietan y la gente mira al cielo.',
    opts: [
      { label: 'Ofrenda al templo', cost: () => ({ cultura: prodAmount('cultura', 30, 20) }), act: () => { addBuff('frenesi'); return 'Esa misma noche llueve a cántaros. ¡Frenesí!'; } },
      { label: 'Esperar y rezar', act: () => {
        if (Math.random() < 0.5) { const a = prodAmount('comida', 120, 100); state.res.comida += a; return `Llueve. Cosecha extra: +${fmt(a)} comida.`; }
        state.res.comida *= 0.8;
        return 'No llueve. Pierdes un 20 % de la comida.';
      } },
    ],
  },
  {
    id: 'rio', spr: 'cultura', title: 'Algo brilla en el río',
    text: 'Un niño de la aldea trae algo que encontró entre las piedras del río.',
    opts: [
      { label: 'Quedártelo', act: () => `Es ${giveArtifact(Math.random() < 0.25 ? 1 : 0, 'El río').name}.` },
      { label: 'Devolverlo al río', act: () => Math.random() < 0.3 ? `El río te lo agradece y te devuelve otra cosa: ${giveArtifact(2, 'El río').name}.` : 'El río se lo traga. No pasa nada… de momento.' },
    ],
  },
  {
    id: 'dados', spr: 'calavera', title: 'Un forastero encapuchado',
    text: 'Te reta a los dados. Dice que nunca ha perdido. Le faltan casi todos los dientes.',
    opts: [
      { label: 'Apostar comida', cost: () => ({ comida: prodAmount('comida', 90, 100) }), act: c => {
        if (Math.random() < 0.5) { state.res.comida += c.comida * 3; return `¡Ganas! +${fmt(c.comida * 3)} comida.`; }
        return 'Pierdes. El forastero sonríe sin dientes.';
      } },
      { label: 'Ignorarlo', act: () => 'Se queda mirándote hasta que te vas.' },
    ],
  },
  {
    id: 'grieta', spr: 'pico', title: 'Una grieta en la aldea', req: () => state.arq >= 1,
    text: 'Tras un temblor se abre una grieta junto al pozo. Sale aire caliente de dentro.',
    opts: [
      { label: 'Mandar a un arqueólogo', act: () => {
        if (Math.random() < 0.6) { state.anforas.bronce++; renderLuck(); return 'Vuelve cubierto de hollín… ¡con un ánfora de bronce!'; }
        state.arq = Math.max(0, state.arq - 1);
        return 'No vuelve. Se oye un eco muy lejos, muy abajo.';
      } },
      { label: 'Taparla', act: () => { const a = prodAmount('cultura', 45, 30); state.res.cultura += a; return `Los sacerdotes bendicen el sitio. +${fmt(a)} cultura.`; } },
    ],
  },
  {
    id: 'fiesta', spr: 'granja', title: 'Fiesta de la cosecha',
    text: 'La aldea quiere celebrar. Hay ganas de música y de comer de más.',
    opts: [
      { label: '¡Que empiece la fiesta!', cost: () => ({ comida: prodAmount('comida', 40, 60) }), act: () => { addBuff('frenesi'); return 'Al día siguiente todos trabajan con más ganas que nunca.'; } },
      { label: 'Hay que trabajar', act: () => { const a = prodAmount('piedra', 60, 40); state.res.piedra += a; return `Refunfuñan, pero sacan +${fmt(a)} piedra.`; } },
    ],
  },
  {
    id: 'cronista', spr: 'pergaminos', title: 'Un anciano cronista', req: () => state.stats.runs >= 1,
    text: 'Jura que recuerda tus vidas anteriores. Pide algo de comer a cambio de contártelas.',
    opts: [
      { label: 'Invitarle a comer', cost: () => ({ comida: prodAmount('comida', 30, 40) }), act: () => { const f = 8 * state.run; state.frag += f; return `Sus historias te inspiran. +${f} fragmentos.`; } },
      { label: 'Echarlo', act: () => 'Se marcha murmurando tu nombre. Tu nombre de antes.' },
    ],
  },
  {
    id: 'saqueadores', spr: 'herramientas', title: 'Saqueadores de tumbas', req: () => state.found.length >= 1,
    text: 'Rondan la excavación por las noches. Quieren tus hallazgos.',
    opts: [
      { label: 'Pagar guardias', cost: () => ({ piedra: prodAmount('piedra', 45, 50) }), act: () => 'Los guardias los espantan. Tus hallazgos están a salvo.' },
      { label: 'Hacerles frente', act: () => {
        if (Math.random() < 0.5) { state.anforas.barro++; renderLuck(); return '¡Los atrapas! Llevaban un ánfora robada. Ahora es tuya.'; }
        if (!state.found.length) return 'Se escapan con las manos vacías.';
        const a = pick(state.found);
        state.found = state.found.filter(f => f !== a);
        renderFinds();
        return `Se escapan con ${a.name}.`;
      } },
    ],
  },
  {
    id: 'vision', spr: 'ojo', title: 'La visión del sacerdote', req: () => state.tablets >= 2,
    text: 'El sacerdote ha soñado con la capa negra. No para de temblar.',
    opts: [
      { label: 'Escucharle', act: () => { addBuff('suerte'); return pick(VISIONS); } },
      { label: 'Mandarle a dormir', act: () => 'Duerme doce horas seguidas. Al despertar no recuerda nada.' },
    ],
  },
];

// logros: algunos ocultos hasta que los consigues
const ACH = [
  { id: 'golpe', name: 'Primer golpe', desc: 'Rompe tu primer bloque', check: s => s.stats.blocks >= 1 },
  { id: 'topo', name: 'Topo', desc: 'Rompe 100 bloques', check: s => s.stats.blocks >= 100 },
  { id: 'tuneladora', name: 'Tuneladora', desc: 'Rompe 1.000 bloques', check: s => s.stats.blocks >= 1000 },
  { id: 'brazo', name: 'Brazo de hierro', desc: 'Llega a racha x2', check: () => ui.combo >= 50 },
  { id: 'leyenda', name: 'Leyenda', desc: 'Encuentra un artefacto legendario', check: s => s.stats.legendaries >= 1 },
  { id: 'cadena', name: 'Reacción en cadena', desc: 'Rompe 8 bloques con una sola explosión', hidden: true, check: () => ui.chainBest >= 8 },
  { id: 'bendecido', name: 'Bendecido', desc: 'Tres ídolos en el Oráculo', hidden: true, check: s => s.stats.idols >= 1 },
  { id: 'maldito', name: 'Maldito', desc: 'Tres calaveras en el Oráculo', hidden: true, check: s => s.stats.curses >= 1 },
  { id: 'estrellas', name: 'Cazaestrellas', desc: 'Caza 5 cometas', check: s => s.stats.comets >= 5 },
  { id: 'alfareria', name: 'Alfarería fina', desc: 'Abre 10 ánforas', check: s => s.stats.anforas >= 10 },
  { id: 'todoonada', name: 'Todo o nada', desc: 'Consigue un legendario arriesgando', hidden: true, check: s => s.stats.riskLegend >= 1 },
  { id: 'polvo', name: 'Polvo eres', desc: 'Pierde 3 artefactos arriesgando', hidden: true, check: s => s.stats.riskFails >= 3 },
  { id: 'hierro', name: 'Forjado', desc: 'Llega a la Edad del Hierro', check: s => s.era >= 2 },
  { id: 'vidas', name: 'Tres vidas', desc: 'Entierra 3 civilizaciones', check: s => s.stats.runs >= 3 },
  { id: 'pompeya', name: 'Pompeya', desc: 'Entierra una civilización bajo un volcán', check: s => (s.stats.endings.volcan || 0) >= 1 },
  { id: 'erudito', name: 'Erudito', desc: '15 entradas en el Códice', check: s => Object.keys(s.codex).length >= 15 },
  { id: 'tablilla', name: 'Alguien escribió esto', desc: 'Encuentra una tablilla', check: s => s.tablets >= 1 },
  { id: 'granero', name: 'Granero del mundo', desc: '100 granjas a la vez', check: s => s.b.granja >= 100 },
  { id: 'paleo', name: 'Paleontólogo', desc: 'Encuentra 4 fósiles distintos', check: () => countFossils() >= 4 },
  { id: 'sucesos', name: 'Vida interesante', desc: 'Resuelve 5 sucesos', check: s => s.stats.events >= 5 },
  { id: 'nodeberias', name: 'No deberías', desc: 'Toca la capa negra 13 veces', hidden: true, check: s => s.stats.abyss >= 13 },
];

// =====================================================================
// ESTADO
// =====================================================================
const SAVE_KEY = 'capsula_save_v1';
let state;
const D = { rates: { comida: 0, piedra: 0, cultura: 0 }, R: {}, resMult: {}, all: 1, costMult: 1, click: 1, dig: 1, arqDps: 0, crit: 0.08 };
const ui = {
  buyAmt: 1, tab: 'luck', combo: 0, comboT: 0, arqT: 0, blockEls: [], bEls: {},
  upKey: null, eraKey: null, pKey: null, shown: null, busy: false, spinning: false, risking: false,
  cometT: 45, eventT: 75, achT: 0, event: null, reelLast: [], tex: {}, cyc: {},
  chainCount: 0, chainLast: 0, chainBest: 0, cxMult: 1, achMult: 1, fossilSlot: 0, codexNew: 0, pipT: 0,
};

const lvl = id => state.perm[id] || 0;
const museumSlots = () => 3 + lvl('vitrina') + ui.fossilSlot;
const buffOn = id => state.buffs.some(b => b.id === id && b.until > Date.now());

function rollTier(era) {
  const r = Math.random();
  if (r < 0.05 + 0.05 * Math.max(0, era)) return 'oro';
  if (r < 0.32 + 0.12 * Math.max(0, era)) return 'bronce';
  return 'barro';
}

function makeLayer({ num, year, era, ending, comp, wealth, cols, rows, hp, artifacts, anforas = 2, tablet = false, luck = 0, specials = true }) {
  const n = cols * rows;
  const blocks = Array.from({ length: n }, () => ({ hp, max: hp, art: null, rar: null, kind: null, v: Math.floor(Math.random() * 4) }));
  const cells = shuffle([...Array(n).keys()]);
  let c = 0;
  artifacts.slice(0, n).forEach(type => { blocks[cells[c++]].art = type; });
  for (let i = 0; i < anforas && c < n; i++) {
    const b = blocks[cells[c++]];
    b.kind = 'anfora';
    b.tier = rollTier(era);
  }
  if (tablet && c < n) blocks[cells[c++]].kind = 'tablilla';
  if (specials) {
    for (; c < n; c++) {
      const r = Math.random();
      const b = blocks[cells[c]];
      if (r < 0.07) b.kind = 'oro';
      else if (r < 0.12) b.kind = 'inestable';
      else if (r < 0.155) b.kind = 'fosil';
      else if (r < 0.19) b.kind = 'geoda';
    }
  }
  return { id: uid(), num, year, era, ending, comp, wealth, cols, rows, blocks, luck, done: false, seed: Math.floor(Math.random() * 1e6) };
}

function makeSediment() {
  return makeLayer({
    num: 0, year: -12000, era: -1, ending: null, comp: {},
    wealth: { comida: 60, piedra: 40 }, cols: 8, rows: 3, hp: 2,
    artifacts: ['semillas', 'herramientas', 'reliquias'], anforas: 1, tablet: true, luck: 0.8,
  });
}

function startRes() {
  const l = lvl('asentamiento');
  if (!l) return { comida: 0, piedra: 0, cultura: 0 };
  return { comida: 150 * Math.pow(4, l - 1), piedra: 50 * Math.pow(4, l - 1), cultura: 0 };
}

const BASE_STATS = {
  clicks: 0, blocks: 0, artifacts: 0, legendaries: 0, layers: 0, runs: 0, crits: 0, anforas: 0, spins: 0, jackpots: 0,
  comets: 0, risks: 0, riskFails: 0, riskLegend: 0, idols: 0, curses: 0, events: 0, abyss: 0, fossils: 0, endings: {},
};

function newState() {
  return {
    v: 3, year: -10000, run: 1, era: 0,
    res: { comida: 0, piedra: 0, cultura: 0 }, frag: 0,
    b: { granja: 0, cantera: 0, templo: 0, biblioteca: 0 },
    arq: 0, pico: 0, up: {}, perm: {},
    found: [], museum: [],
    anforas: { barro: 0, bronce: 0, oro: 0 }, buffs: [],
    codex: {}, ach: {}, tablets: 0, tabletsPlaced: 1,
    layers: [makeSediment()],
    produced: { comida: 0, piedra: 0, cultura: 0 },
    stats: { ...BASE_STATS, endings: {} },
    muted: false, last: Date.now(),
  };
}

function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return newState();
    const s = JSON.parse(raw);
    const base = newState();
    const st = {
      ...base, ...s,
      res: { ...base.res, ...s.res },
      b: { ...base.b, ...s.b },
      anforas: { ...base.anforas, ...s.anforas },
      buffs: s.buffs || [],
      codex: s.codex || {},
      ach: s.ach || {},
      tablets: s.tablets || 0,
      tabletsPlaced: s.tabletsPlaced || 0,
      produced: { ...base.produced, ...s.produced },
      stats: { ...BASE_STATS, ...s.stats, endings: { ...(s.stats && s.stats.endings) } },
    };
    // partidas antiguas: lo que ya tenías entra al Códice
    [...st.found, ...st.museum].forEach(a => { st.codex[`${a.type}:${a.name}`] = st.codex[`${a.type}:${a.name}`] || 1; });
    return st;
  } catch (e) {
    return newState();
  }
}

function save() {
  state.last = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* sin guardado */ }
}

// =====================================================================
// CÓDICE
// =====================================================================
const CODEX_CATS = [
  { id: 'semillas', name: 'Semillas', spr: 'semillas' },
  { id: 'herramientas', name: 'Herramientas', spr: 'herramientas' },
  { id: 'reliquias', name: 'Reliquias', spr: 'reliquias' },
  { id: 'pergaminos', name: 'Pergaminos', spr: 'pergaminos' },
  { id: 'fosil', name: 'Fósiles', spr: 'fosil' },
];

function codexEntries(cat) {
  if (cat === 'fosil') return FOSSILS.map(f => ({ key: 'fosil:' + f.name, name: f.name, lore: f.lore, rar: f.rar }));
  const out = [];
  RARITIES.forEach((R, ri) => RELICS[cat].names[R.id].forEach(n => out.push({ key: `${cat}:${n}`, name: n, lore: ARTLORE[n], rar: ri })));
  return out;
}
const catComplete = cat => codexEntries(cat).every(e => state.codex[e.key]);
const codexTotal = () => CODEX_CATS.reduce((a, c) => a + codexEntries(c.id).length, 0);
const countFossils = () => FOSSILS.filter(f => state.codex['fosil:' + f.name]).length;

function refreshBonuses() {
  const sets = CODEX_CATS.filter(c => catComplete(c.id)).length;
  ui.cxMult = 1 + 0.01 * Object.keys(state.codex).length + 0.1 * sets;
  ui.achMult = 1 + 0.02 * Object.keys(state.ach).length;
  ui.fossilSlot = catComplete('fosil') ? 1 : 0;
}

// devuelve true si es la primera vez
function discover(cat, name) {
  const key = `${cat}:${name}`;
  if (state.codex[key]) return false;
  const wasComplete = catComplete(cat);
  state.codex[key] = Date.now();
  ui.codexNew++;
  refreshBonuses();
  if (!wasComplete && catComplete(cat)) {
    const C = CODEX_CATS.find(c => c.id === cat);
    setTimeout(() => {
      sfx.legend();
      flash('rgba(159,240,255,.35)');
      reveal('¡Colección completa!', C.name, cat === 'fosil' ? '+10 % producción y +1 vitrina en el museo' : '+10 % a toda la producción', '#9ff0ff');
    }, 2600);
  }
  renderCodex();
  return true;
}

// =====================================================================
// CÁLCULOS
// =====================================================================
function upMult(key) {
  let m = 1;
  for (const u of UPGRADES) if (state.up[u.id] && u.eff[key]) m *= u.eff[key];
  return m;
}
const msCount = n => MILESTONES.filter(m => n >= m).length;
const msMult = id => Math.pow(2, msCount(state.b[id]));

function relicBonus() {
  const r = { semillas: 0, herramientas: 0, reliquias: 0, pergaminos: 0 };
  for (const a of state.found) r[a.type] += a.power;
  for (const a of state.museum) r[a.type] += a.power;
  return r;
}

function recalc() {
  const R = relicBonus();
  D.R = R;
  D.all = upMult('all') * Math.pow(2, state.era) * (1 + 0.2 * lvl('memoria')) * (buffOn('frenesi') ? 7 : 1) * ui.cxMult * ui.achMult;
  D.resMult = { comida: 1 + R.semillas, piedra: 1 + R.herramientas / 2, cultura: 1 + R.reliquias };
  const rates = { comida: 0, piedra: 0, cultura: 0 };
  for (const [id, B] of Object.entries(BUILDINGS)) {
    const n = state.b[id];
    if (!n) continue;
    for (const [res, v] of Object.entries(B.prod)) rates[res] += v * n * upMult(id) * msMult(id) * D.resMult[res] * D.all;
  }
  D.rates = rates;
  D.costMult = 1 / (1 + R.pergaminos);
  D.click = (1 + 0.05 * rates.comida) * upMult('click');
  D.dig = Math.pow(1.5, state.pico) * upMult('dig') * (1 + R.herramientas) * (1 + 0.5 * lvl('pico')) * (buffOn('furia') ? 10 : 1);
  D.arqDps = state.arq * 0.25 * D.dig * upMult('arq');
  D.crit = Math.min(0.9, (0.08 + 0.02 * lvl('trebol')) * (buffOn('suerte') ? 3 : 1));
}

const comboMult = () => 1 + Math.min(ui.combo, 50) * 0.02;

function canAfford(cost) {
  for (const r in cost) if (state.res[r] < cost[r] - 1e-9) return false;
  return true;
}
function pay(cost) { for (const r in cost) state.res[r] -= cost[r]; }
function scaledCost(cost) {
  const o = {};
  for (const r in cost) o[r] = cost[r] * D.costMult;
  return o;
}
function costHtml(cost) {
  return Object.entries(cost).map(([r, v]) => `<span class="${state.res[r] >= v ? '' : 'no'}">${spr(RES[r].spr, 14)} ${fmt(v)}</span>`).join('');
}

function bCost(id, amount = 1) {
  const B = BUILDINGS[id];
  const g = B.growth;
  const factor = Math.pow(g, state.b[id]) * (Math.pow(g, amount) - 1) / (g - 1);
  const out = {};
  for (const [r, v] of Object.entries(B.cost)) out[r] = v * factor * D.costMult;
  return out;
}

function maxBuy(id) {
  if (!canAfford(bCost(id, 1))) return 0;
  let lo = 1;
  while (lo < 5000 && canAfford(bCost(id, lo * 2))) lo *= 2;
  let hi = lo * 2;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (canAfford(bCost(id, m))) lo = m; else hi = m;
  }
  return lo;
}
const buyAmount = id => ui.buyAmt === 'max' ? Math.max(1, maxBuy(id)) : ui.buyAmt;

function perUnit(id) {
  const [res, v] = Object.entries(BUILDINGS[id].prod)[0];
  return { res, v: v * upMult(id) * msMult(id) * D.resMult[res] * D.all };
}

const picoCost = () => ({ piedra: 15 * Math.pow(2.1, state.pico) * D.costMult });
const arqCost = () => ({ comida: 40 * Math.pow(1.22, Math.max(0, state.arq - 2 * lvl('cuadrilla'))) * D.costMult });
const permCost = p => Math.ceil(p.base * Math.pow(p.growth, lvl(p.id)));
const spinCost = () => ({ cultura: Math.max(15, D.rates.cultura * 20) });
function prodAmount(res, sec, floor) { return Math.max(floor, D.rates[res] * sec); }

const activeLayerIndex = () => state.layers.findIndex(L => !L.done);

function luckOf(li) {
  const L = state.layers[li];
  return 1 + 0.35 * Math.max(0, L.era) + 0.3 * li + 0.15 * lvl('ojo') + (L.luck || 0) + (buffOn('suerte') ? 1 : 0);
}

function rollRarity(luck) {
  const ws = RARITIES.map((r, i) => ({ i, w: r.w * Math.pow(luck, i) }));
  return wpick(ws).i;
}

const powerFor = (rar, era) => Math.round(RARITIES[rar].power * rand(0.8, 1.2) * (1 + 0.25 * Math.max(0, era)) * 100) / 100;

function createArtifact(type, rar, src) {
  return {
    id: uid(), type, rar, power: powerFor(rar, src.era), era: Math.max(0, src.era),
    name: pick(RELICS[type].names[RARITIES[rar].id]), from: src.num, year: src.year, src: src.label || null,
  };
}

function giveArtifact(rar, label, x, y, kicker) {
  const a = createArtifact(pick(Object.keys(RELICS)), rar, { num: 0, year: state.year, era: state.era, label });
  state.found.push(a);
  state.stats.artifacts++;
  announce(a, x == null ? innerWidth / 2 : x, y == null ? innerHeight / 2 : y, kicker);
  renderFinds();
  return a;
}

function layerPreview(endingId) {
  const E = ENDINGS[endingId];
  const arts = [];
  for (const [bid, B] of Object.entries(BUILDINGS)) {
    const count = state.b[bid];
    if (!count) continue;
    const n = Math.min(8, Math.floor(Math.sqrt(count))) + lvl('cronista');
    const keep = RELICS[B.relic].organic ? E.keep.organic : E.keep.other;
    for (let i = 0; i < Math.round(n * keep); i++) arts.push(B.relic);
  }
  return arts;
}
const layerWealth = () => ({ comida: state.produced.comida * 0.12, piedra: state.produced.piedra * 0.12 });

// =====================================================================
// SONIDO (sintetizado, sin archivos)
// =====================================================================
const snd = {
  ctx: null, noiseBuf: null,
  get() {
    if (state.muted) return null;
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
      const len = this.ctx.sampleRate;
      this.noiseBuf = this.ctx.createBuffer(1, len, len);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },
  tone(f, dur, type = 'triangle', vol = 0.05, slideTo = null, delay = 0) {
    const c = this.get();
    if (!c) return;
    const t = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  },
  noise(dur, vol = 0.08, freq = 1000, delay = 0) {
    const c = this.get();
    if (!c) return;
    const t = c.currentTime + delay;
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.noiseBuf;
    f.type = 'lowpass';
    f.frequency.value = freq;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(c.destination);
    s.start(t);
    s.stop(t + dur + 0.02);
  },
};
const NOTES = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568, 2093];
const sfx = {
  gather: () => snd.tone(rand(480, 560), 0.06, 'square', 0.03, 760),
  hit: combo => { snd.noise(0.05, 0.07, 1400 + combo * 40); snd.tone(170 + Math.min(combo, 50) * 7, 0.04, 'square', 0.02); },
  crit: () => { snd.tone(1400, 0.09, 'square', 0.04, 500); snd.noise(0.14, 0.12, 3200); },
  arq: () => snd.noise(0.03, 0.025, 900),
  breakB: () => { snd.noise(0.2, 0.14, 500); snd.tone(140, 0.14, 'sine', 0.09, 55); },
  glint: r => snd.tone(NOTES[Math.min(6, r + 2)] * 2, 0.12, 'sine', 0.03),
  loot: r => { for (let i = 0; i <= r + 1; i++) snd.tone(NOTES[i], 0.2, 'square', 0.035, null, i * 0.07); },
  legend: () => {
    for (let i = 0; i < NOTES.length; i++) snd.tone(NOTES[i], 0.35, 'square', 0.035, null, i * 0.08);
    snd.tone(NOTES[3], 1.2, 'sine', 0.05, null, 0.6);
    snd.tone(NOTES[5], 1.2, 'sine', 0.04, null, 0.6);
  },
  coin: () => [0, 2, 4, 3].forEach((n, i) => snd.tone(NOTES[n] * 2, 0.08, 'square', 0.025, null, i * 0.05)),
  pip: () => snd.tone(rand(1500, 1900), 0.025, 'square', 0.008),
  boom: () => { snd.noise(0.7, 0.32, 260); snd.tone(90, 0.6, 'sine', 0.22, 28); },
  tick: (n = 0) => snd.tone(850 + (n % 6) * 35, 0.025, 'square', 0.018),
  type: () => snd.tone(rand(300, 380), 0.02, 'square', 0.012),
  clunk: () => { snd.noise(0.08, 0.13, 700); snd.tone(130, 0.08, 'square', 0.05, 80); },
  fail: () => { snd.tone(320, 0.35, 'sawtooth', 0.04, 80); snd.noise(0.3, 0.08, 400); },
  heartbeat: () => { snd.tone(62, 0.12, 'sine', 0.22); snd.tone(55, 0.12, 'sine', 0.18, null, 0.17); },
  shimmer: () => [4, 5, 6, 5, 6].forEach((n, i) => snd.tone(NOTES[n], 0.16, 'sine', 0.025, null, i * 0.06)),
  discover: () => [2, 4, 3, 5].forEach((n, i) => snd.tone(NOTES[n], 0.22, 'triangle', 0.04, null, i * 0.1)),
  bell: () => { snd.tone(880, 0.6, 'sine', 0.06); snd.tone(1320, 0.5, 'sine', 0.03, null, 0.02); },
  buy: () => snd.tone(440, 0.06, 'square', 0.025, 880),
  milestone: () => [0, 1, 2, 3, 4].forEach((n, i) => snd.tone(NOTES[n], 0.12, 'square', 0.03, null, i * 0.06)),
  deny: () => snd.tone(160, 0.1, 'square', 0.03, 110),
  era: () => [0, 2, 4].forEach((n, i) => snd.tone(NOTES[n] / 2, 1, 'triangle', 0.06, null, i * 0.12)),
  complete: () => [0, 1, 2, 3, 2, 3].forEach((n, i) => snd.tone(NOTES[n], 0.18, 'square', 0.03, null, i * 0.09)),
  rumble: () => { snd.noise(2.4, 0.2, 110); snd.tone(55, 2.2, 'sine', 0.12, 30); },
  abyss: () => snd.tone(55, 0.8, 'sine', 0.14, 38),
};

// =====================================================================
// EFECTOS VISUALES
// =====================================================================
const fx = { cv: null, ctx: null, parts: [] };
const flyers = [];

function fxInit() {
  fx.cv = $('#fx');
  fx.ctx = fx.cv.getContext('2d');
  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    fx.cv.width = innerWidth * dpr;
    fx.cv.height = innerHeight * dpr;
    fx.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  addEventListener('resize', () => { resize(); setupVillage(); });
}

// partículas cuadradas (pixel), con gravedad
function burst(x, y, color, n = 10, speed = 200, size = 4, gravity = 700) {
  if (x == null) return;
  const colors = Array.isArray(color) ? color : [color];
  for (let i = 0; i < n && fx.parts.length < 700; i++) {
    const a = Math.random() * Math.PI * 2, s = speed * rand(0.3, 1);
    const life = rand(0.4, 0.95);
    fx.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - speed * 0.4, g: gravity, life, max: life, size: Math.round(size * rand(0.6, 1.4)), color: pick(colors) });
  }
}

function fxStep(dt) {
  const c = fx.ctx;
  c.clearRect(0, 0, innerWidth, innerHeight);
  for (let i = fx.parts.length - 1; i >= 0; i--) {
    const p = fx.parts[i];
    p.life -= dt;
    if (p.life <= 0) { fx.parts.splice(i, 1); continue; }
    p.vy += p.g * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    c.globalAlpha = Math.min(1, p.life / p.max * 1.6);
    c.fillStyle = p.color;
    c.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
  }
  c.globalAlpha = 1;
}

// recursos que salen volando hasta su contador
function fly(x, y, sprName, target, n = 1, swap) {
  if (x == null || !target) return;
  const [tx, ty] = centerOf(target);
  for (let i = 0; i < n && flyers.length < 70; i++) {
    const e = el('img', 'flyer px');
    e.src = sprURL(sprName, swap);
    e.width = e.height = 22;
    document.body.appendChild(e);
    const x0 = x + rand(-12, 12), y0 = y + rand(-12, 12);
    flyers.push({
      e, x0, y0, tx, ty, target,
      cx: (x0 + tx) / 2 + rand(-140, 140), cy: Math.min(y0, ty) - rand(30, 170),
      t: -i * 0.07, dur: rand(0.55, 0.85),
    });
  }
}

function flyStep(dt) {
  for (let i = flyers.length - 1; i >= 0; i--) {
    const f = flyers[i];
    f.t += dt;
    if (f.t < 0) { f.e.style.opacity = 0; continue; }
    const k = Math.min(1, f.t / f.dur);
    const q = k * k; // acelera al llegar
    const x = (1 - q) * (1 - q) * f.x0 + 2 * (1 - q) * q * f.cx + q * q * f.tx;
    const y = (1 - q) * (1 - q) * f.y0 + 2 * (1 - q) * q * f.cy + q * q * f.ty;
    f.e.style.opacity = 1;
    f.e.style.transform = `translate(${Math.round(x - 11)}px, ${Math.round(y - 11)}px) scale(${1.2 - 0.5 * k})`;
    if (k >= 1) {
      f.e.remove();
      flyers.splice(i, 1);
      restartAnim(f.target, 'pulse');
      if (ui.pipT <= 0) { sfx.pip(); ui.pipT = 0.09; }
    }
  }
}

function floatText(x, y, html, cls = '') {
  if (x == null) return;
  const e = el('div', 'float ' + cls, html);
  e.style.left = (x + rand(-14, 14)) + 'px';
  e.style.top = y + 'px';
  document.body.appendChild(e);
  e.addEventListener('animationend', () => e.remove());
}

function restartAnim(e, cls) {
  if (!e) return;
  e.classList.remove(cls);
  void e.offsetWidth;
  e.classList.add(cls);
}

function shake(level = 1) { restartAnim($('#game'), 'shake-' + level); }

function flash(color) {
  const f = $('#flash');
  f.style.background = color;
  restartAnim(f, 'on');
}

function reveal(kicker, title, sub, color) {
  const r = $('#reveal');
  r.style.setProperty('--rvc', color);
  r.querySelector('.rv-kicker').textContent = kicker;
  r.querySelector('.rv-title').textContent = title;
  r.querySelector('.rv-sub').textContent = sub;
  restartAnim(r, 'show');
}

function toast(html, cls = '', style = '') {
  const box = $('#toasts');
  const t = el('div', 'toast ' + cls, html);
  if (style) t.setAttribute('style', style);
  box.appendChild(t);
  while (box.children.length > 5) box.firstChild.remove();
  setTimeout(() => t.classList.add('out'), 4200);
  setTimeout(() => t.remove(), 4700);
}

const resBox = r => r === 'frag' ? ui.fragBox : ui.resEls[r] && ui.resEls[r].box;
function pulseRes(r) { restartAnim(resBox(r), 'pulse'); }

function deny(e) { sfx.deny(); if (e) restartAnim(e, 'deny'); }

const centerOf = e => { const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

function isVisible(e) {
  const r = e.getBoundingClientRect();
  return r.bottom > 66 && r.top < innerHeight && r.width > 0;
}

// =====================================================================
// ALDEA (canvas pixelado en la superficie, con día y noche)
// =====================================================================
const village = { cv: null, g: null, W: 0, H: 40, S: 3, lastDraw: 0, pos: {}, parts: [] };
const DAY = 240; // segundos que dura un día completo

function setupVillage() {
  const cv = $('#village');
  if (!cv) { village.cv = null; return; }
  village.cv = cv;
  village.g = cv.getContext('2d');
  village.W = Math.max(60, Math.floor(cv.clientWidth / village.S));
  cv.width = village.W;
  cv.height = village.H;
  drawVillage(performance.now());
}

// luz del día: 1 a mediodía, 0 a medianoche
const daylight = time => 0.5 + 0.5 * Math.cos(((time / 1000) % DAY) / DAY * Math.PI * 2);

// posición en pantalla de un punto de la aldea
function villageToScreen(px, py) {
  const v = village;
  if (!v.cv || !v.cv.isConnected) return null;
  const r = v.cv.getBoundingClientRect();
  if (r.bottom < 66 || r.top > innerHeight) return null;
  return [r.left + px * r.width / v.W, r.top + py * r.height / v.H];
}

function villageEmit(id, color, n = 5) {
  const list = village.pos[id];
  if (!list || !list.length) return null;
  const x = pick(list);
  for (let i = 0; i < n; i++) {
    village.parts.push({ x: x + rand(1, 9), y: village.H - 18 + rand(0, 4), vy: -rand(6, 14), vx: rand(-3, 3), life: rand(0.6, 1.2), color });
  }
  return villageToScreen(x + 5, village.H - 14);
}

function drawVillage(time) {
  const v = village;
  if (!v.cv || !v.cv.isConnected) return;
  const g = v.g, W = v.W, H = v.H;
  const dt = Math.min(0.2, (time - (v.lastT || time)) / 1000);
  v.lastT = time;
  g.imageSmoothingEnabled = false;
  const light = daylight(time);
  const sky = ERAS[state.era].sky;
  const k = clamp((0.55 - light) / 0.45, 0, 1); // cuánto de noche
  [0, 8, 16].forEach((y, i) => { g.fillStyle = mixHex(sky[i], NIGHT[i], k); g.fillRect(0, y, W, H); });
  // estrellas
  if (k > 0.3) {
    for (let i = 0; i < 26; i++) {
      const sx = (i * 37 + 11) % W, sy = (i * 13 + 3) % 20;
      if ((Math.floor(time / 500) + i) % 7 === 0) continue;
      g.fillStyle = `rgba(255,255,230,${(k - 0.3) * 1.3})`;
      g.fillRect(sx, sy, 1, 1);
    }
  }
  // sol y luna recorren el cielo
  const phase = ((time / 1000) % DAY) / DAY;
  const arc = p => [Math.round(p * (W + 20) - 10), Math.round(22 - Math.sin(p * Math.PI) * 18)];
  const sunP = (phase + 0.75) % 1;
  if (sunP < 0.5) {
    const [x, y] = arc(sunP * 2);
    g.fillStyle = '#fff1b0'; g.fillRect(x, y, 6, 4); g.fillRect(x + 1, y - 1, 4, 6);
  } else {
    const [x, y] = arc(sunP * 2 - 1);
    g.fillStyle = '#e8ecff'; g.fillRect(x, y, 5, 5);
    g.fillStyle = mixHex(sky[0], NIGHT[0], k); g.fillRect(x + 2, y, 3, 3);
  }
  // nubes
  g.fillStyle = `rgba(255,255,255,${0.55 - k * 0.35})`;
  for (let i = 0; i < 3; i++) {
    const cx = Math.round(((time / 140 + i * 97) % (W + 30)) - 15);
    g.fillRect(cx, 5 + i * 3, 9, 2);
    g.fillRect(cx + 2, 4 + i * 3, 5, 1);
  }
  // colinas
  g.fillStyle = rgbStr(mixRgb(hexToRgb(sky[0]).map(c => c * 0.62), [10, 13, 30], k * 0.7));
  for (let x = 0; x < W; x++) {
    const h = 6 + Math.round(Math.sin(x * 0.07 + 1) * 3 + Math.sin(x * 0.19) * 1.5);
    g.fillRect(x, H - 8 - h, 1, h);
  }
  // suelo
  g.fillStyle = '#5c9a3e'; g.fillRect(0, H - 8, W, 1);
  g.fillStyle = '#467a30'; g.fillRect(0, H - 7, W, 2);
  g.fillStyle = '#6b4a2e'; g.fillRect(0, H - 5, W, 5);
  g.fillStyle = '#5a3d26';
  for (let x = 2; x < W; x += 7) g.fillRect(x, H - 3, 2, 1);

  // construcciones (con su animación)
  const caps = { granja: 12, cantera: 6, templo: 5, biblioteca: 5 };
  const by = H - 17;
  let x = 3;
  v.pos = {};
  const sway = Math.floor(time / 600) % 2;
  for (const id of Object.keys(BUILDINGS)) {
    const n = Math.min(state.b[id], caps[id]);
    v.pos[id] = [];
    for (let i = 0; i < n && x < W - 14; i++) {
      const name = id === 'granja' && (sway + i) % 2 ? 'granja2' : BUILDINGS[id].spr;
      g.drawImage(sprCanvas(name), x, by);
      v.pos[id].push(x);
      if (id === 'cantera') {
        // vagoneta que entra y sale de la mina
        const cart = Math.round((Math.sin(time / 700 + i) + 1) * 1.5);
        g.fillStyle = '#3a2a20'; g.fillRect(x + 10, by + 9, 5, 1);
        g.fillStyle = '#6e6a70'; g.fillRect(x + 10 + cart, by + 6, 3, 3);
        g.fillStyle = '#b8b4ac'; g.fillRect(x + 10 + cart, by + 6, 3, 1);
        if (Math.random() < 0.04) v.parts.push({ x: x + 5, y: by + 5, vy: -rand(3, 8), vx: rand(-6, 6), life: 0.4, color: '#ffe08a' });
      }
      if (id === 'templo' && Math.random() < 0.05) v.parts.push({ x: x + 5, y: by - 1, vy: -rand(3, 6), vx: rand(-1, 1), life: rand(1, 2), color: 'rgba(220,220,220,.7)' });
      x += id === 'cantera' ? 16 : 11;
    }
    if (n) x += 4;
  }

  // aldeanos y arqueólogos paseando
  const nPeople = Math.min(10, Math.floor((state.b.granja + state.b.cantera + state.b.templo) / 5));
  const people = [];
  for (let i = 0; i < nPeople; i++) people.push({ swap: VILLAGER, i, speed: 2600 });
  for (let i = 0; i < Math.min(state.arq, 6); i++) people.push({ swap: null, i: i + 20, speed: 2000 });
  for (const p of people) {
    const s = Math.sin(time / p.speed + p.i * 1.7);
    const px = Math.round(4 + (s + 1) / 2 * (W - 16));
    const bob = Math.floor(time / 160 + p.i) % 2;
    g.drawImage(sprCanvas('arqueologo', p.swap), px, by - bob);
  }

  // oscuridad de noche sobre el suelo y las casas
  if (k > 0) {
    g.fillStyle = `rgba(8,10,30,${k * 0.55})`;
    g.fillRect(0, H - 22, W, 22);
    // luces encendidas
    g.fillStyle = `rgba(255,214,120,${k})`;
    (v.pos.biblioteca || []).forEach(bx => { g.fillRect(bx + 2, by + 2, 1, 1); g.fillRect(bx + 5, by + 2, 1, 1); g.fillRect(bx + 8, by + 5, 1, 1); });
    (v.pos.templo || []).forEach(bx => { g.fillRect(bx + 4, by + 5, 2, 3); });
    (v.pos.cantera || []).forEach(bx => { g.fillRect(bx + 4, by + 4, 2, 1); });
  }

  // partículas de la aldea
  for (let i = v.parts.length - 1; i >= 0; i--) {
    const p = v.parts[i];
    p.life -= dt;
    if (p.life <= 0) { v.parts.splice(i, 1); continue; }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    g.fillStyle = p.color;
    g.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
  }
  if (v.parts.length > 300) v.parts.splice(0, v.parts.length - 300);
}

// =====================================================================
// ACCIONES: SUPERFICIE
// =====================================================================
function gather(x, y) {
  const v = D.click;
  state.res.comida += v;
  state.produced.comida += v;
  state.stats.clicks++;
  sfx.gather();
  floatText(x, y - 10, `+${fmt(v)} ${spr('pan', 16)}`, 'f-food');
  burst(x, y, ['#f2c14e', '#d9822b', '#fff1b0'], 6, 150, 4);
  fly(x, y, 'pan', resBox('comida'), 1);
  restartAnim($('#gather'), 'pop');
}

// cuando un edificio completa su ciclo, lo producido sale de la aldea hacia el contador
function cyclePop(id) {
  const E = ui.bEls[id];
  const u = perUnit(id);
  const amt = u.v * state.b[id] * BUILDINGS[id].cycle;
  const color = RES[u.res].color;
  const n = clamp(Math.floor(Math.log10(state.b[id] + 1)) + 1, 1, 4);
  let src = villageEmit(id, color, 4 + n * 2);
  if (!src && E && isVisible(E.row)) src = centerOf(E.row.querySelector('img'));
  if (src) fly(src[0], src[1], RES[u.res].spr, resBox(u.res), n);
  if (E && isVisible(E.row)) {
    const r = E.count.getBoundingClientRect();
    floatText(r.left - 10, r.top + 4, `+${fmt(amt)}`, 'f-cyc');
    restartAnim(E.count, 'bump');
  }
}

function buyBuilding(id, row) {
  const amt = ui.buyAmt === 'max' ? maxBuy(id) : ui.buyAmt;
  const cost = bCost(id, Math.max(1, amt));
  if (amt < 1 || !canAfford(cost)) return deny(row);
  const before = msCount(state.b[id]);
  pay(cost);
  state.b[id] += amt;
  sfx.buy();
  const [x, y] = centerOf(row);
  burst(x + 120, y, ['#f2c14e', '#fff1b0'], 8, 140, 4);
  // la construcción nueva aparece en la aldea
  setTimeout(() => { const p = villageEmit(id, '#ffffff', 10); if (p) burst(p[0], p[1], ['#fff1b0', '#ffffff'], 10, 120, 3); }, 80);
  if (msCount(state.b[id]) > before) {
    const B = BUILDINGS[id];
    setTimeout(() => {
      sfx.milestone();
      flash('rgba(242,193,78,.35)');
      reveal('¡Hito!', `${state.b[id]} ${B.plural}`, `Producción de ${B.plural} x2`, '#f2c14e');
      burst(x, y, ['#f2c14e', '#fff1b0', '#d9822b'], 50, 320, 5);
    }, 80);
  }
  recalc();
  update();
}

function buyUpgrade(id, e) {
  const u = UPGRADES.find(x => x.id === id);
  const cost = scaledCost(u.cost);
  if (!canAfford(cost)) return deny(e);
  pay(cost);
  state.up[id] = true;
  sfx.loot(1);
  const [x, y] = centerOf(e);
  burst(x, y, ['#8fd14f', '#d6ffb0'], 18, 220, 4);
  toast(`<b>${u.name}</b> · ${u.desc}`);
  recalc();
  update();
}

function buyTool(tool, e) {
  const cost = tool === 'pico' ? picoCost() : arqCost();
  if (!canAfford(cost)) return deny(e);
  pay(cost);
  if (tool === 'pico') state.pico++; else state.arq++;
  sfx.buy();
  const [x, y] = centerOf(e);
  burst(x, y, '#b8b4ac', 10, 160, 4);
  recalc();
  update();
}

function buyPerm(id, e) {
  const p = PERMS.find(x => x.id === id);
  if (lvl(id) >= p.max) return;
  const c = permCost(p);
  if (state.frag < c) return deny(e);
  state.frag -= c;
  state.perm[id] = lvl(id) + 1;
  if (id === 'cuadrilla') state.arq += 2;
  sfx.loot(2);
  const [x, y] = centerOf(e);
  burst(x, y, ['#f2c14e', '#d9822b'], 22, 220, 4);
  recalc();
  renderMuseum();
  update();
}

function advanceEra() {
  const next = ERAS[state.era + 1];
  if (!next) return;
  const cost = scaledCost(next.cost);
  if (!canAfford(cost)) return deny($('#era-btn'));
  pay(cost);
  state.era++;
  recalc();
  renderBuildings();
  ui.eraKey = ui.pKey = ui.upKey = null;
  sfx.era();
  flash('rgba(255,216,122,.4)');
  shake(2);
  reveal('Nueva era', next.name, 'Producción x2 · nuevas construcciones y mejoras', '#ffd47a');
  update();
}

function expose(id) {
  if (state.museum.length >= museumSlots()) return;
  const i = state.found.findIndex(a => a.id === id);
  if (i < 0) return;
  state.museum.push(state.found.splice(i, 1)[0]);
  sfx.loot(0);
  renderFinds();
  renderMuseum();
}

function retire(id) {
  const i = state.museum.findIndex(a => a.id === id);
  if (i < 0) return;
  state.found.push(state.museum.splice(i, 1)[0]);
  sfx.buy();
  renderFinds();
  renderMuseum();
}

// =====================================================================
// ACCIONES: EXCAVACIÓN
// =====================================================================
function blockCenter(bi) {
  const e = ui.blockEls[bi];
  return e ? centerOf(e) : [null, null];
}

function playerHit(bi, x, y) {
  const li = activeLayerIndex();
  // la rejilla pintada puede ser de una capa recién terminada
  if (li < 0 || state.layers[li].id !== ui.layerId) return;
  ui.combo = ui.comboT > 0 ? ui.combo + 1 : 1;
  ui.comboT = 0.9;
  state.stats.clicks++;
  if (ui.combo >= 3) restartAnim($('#combo'), 'bump');
  if ([10, 25, 50].includes(ui.combo)) sfx.milestone();
  const crit = Math.random() < D.crit;
  hitBlock(li, bi, D.dig * comboMult() * (crit ? 5 : 1), { player: true, crit }, x, y);
}

function autoDig(dmg) {
  const li = activeLayerIndex();
  if (li < 0 || state.layers[li].id !== ui.layerId) return;
  const open = [];
  state.layers[li].blocks.forEach((b, i) => { if (b.hp > 0) open.push(i); });
  if (!open.length) return;
  const bi = pick(open);
  const [x, y] = blockCenter(bi);
  hitBlock(li, bi, dmg, {}, x, y);
  floatText(x, y - 4, spr('pico', 18), 'f-arq');
}

const HIDDEN_KINDS = ['anfora', 'tablilla'];
function glintColor(b) {
  if (b.hp <= 0) return null;
  if (b.art && b.rar != null) return RARITIES[b.rar].color;
  if (b.seen && b.kind === 'anfora') return TIERS[b.tier].color;
  if (b.seen && b.kind === 'tablilla') return '#9ff0ff';
  return null;
}

function hitBlock(li, bi, dmg, opt, x, y) {
  const L = state.layers[li];
  const b = L.blocks[bi];
  if (!b || b.hp <= 0) return;
  b.hp -= dmg;
  const e = ui.blockEls[bi];
  if (x == null && e) [x, y] = centerOf(e);

  // a mitad de vida, lo escondido empieza a brillar
  if ((b.art || HIDDEN_KINDS.includes(b.kind)) && !b.seen && b.hp <= b.max * 0.5) {
    b.seen = true;
    if (b.art && b.rar == null) b.rar = rollRarity(luckOf(li));
    sfx.glint(b.art ? b.rar : b.kind === 'anfora' ? TIER_IDS.indexOf(b.tier) : 3);
  }
  const tint = e ? e.dataset.c : '#7d6142';
  if (opt.crit) {
    state.stats.crits++;
    sfx.crit();
    shake(1);
    burst(x, y, ['#fff1b0', '#f2c14e', tint], 18, 300, 5);
    floatText(x, y - 14, `CRIT ${fmt(dmg)}`, 'f-crit');
  }
  if (b.hp <= 0) {
    b.hp = 0;
    if (opt.explosion) {
      const now = performance.now();
      ui.chainCount = now - ui.chainLast < 1500 ? ui.chainCount + 1 : 1;
      ui.chainLast = now;
      ui.chainBest = Math.max(ui.chainBest, ui.chainCount);
    }
    breakBlock(li, bi, x, y);
    return;
  }
  if (e) { styleBlock(e, b); restartAnim(e, 'hit'); }
  if (opt.player) {
    if (!opt.crit) {
      sfx.hit(ui.combo);
      floatText(x, y - 8, fmt(dmg), 'f-dmg');
    }
    burst(x, y, tint, 5, 140, 4);
  } else if (!opt.explosion) {
    sfx.arq();
    burst(x, y, tint, 3, 90, 3);
  }
}

function breakBlock(li, bi, x, y) {
  const L = state.layers[li];
  const b = L.blocks[bi];
  const n = L.blocks.length;
  const gold = b.kind === 'oro';
  const mult = gold ? 8 : 1;
  const gc = L.wealth.comida / n * rand(0.6, 1.4) * mult;
  const gp = L.wealth.piedra / n * rand(0.6, 1.4) * mult;
  const fr = Math.max(1, Math.round((1 + Math.max(0, L.era)) * (b.art ? 3 : 1) * (gold ? 3 : 1)));
  state.res.comida += gc;
  state.res.piedra += gp;
  state.frag += fr;
  state.stats.blocks++;

  const e = ui.blockEls[bi];
  if (e) styleBlock(e, b);
  const tint = e ? e.dataset.c : '#7d6142';
  sfx.breakB();
  burst(x, y, [tint, '#000000', tint], 18, 280, 6);
  floatText(x, y - 6, `+${fmt(gc)} ${spr('pan', 14)} +${fmt(gp)} ${spr('piedra', 14)}`, gold ? 'f-gold' : 'f-loot');
  fly(x, y, 'pan', resBox('comida'), gold ? 4 : 1);
  fly(x, y, 'piedra', resBox('piedra'), gold ? 4 : 1);
  fly(x, y, 'frag', resBox('frag'), 1);

  if (gold) {
    sfx.coin();
    burst(x, y, ['#f2c14e', '#fff6c9', '#a87a1f'], 45, 360, 5, 500);
    fly(x, y, 'moneda', resBox('comida'), 5);
  }
  if (b.kind === 'anfora') {
    state.anforas[b.tier]++;
    const T = TIERS[b.tier];
    sfx.shimmer();
    burst(x, y, [T.color, '#fff1b0'], 40, 300, 5, 400);
    toast(`${spr('anfora', 34, T.swap)}<div><div class="kick">¡Ánfora!</div><b>${T.name}</b><small>Ábrela en la pestaña Suerte</small></div>`, 'loot', `--rc:${T.color}`);
    if (b.tier === 'oro') { flash('rgba(255,216,74,.35)'); shake(1); }
    renderLuck();
  }
  if (b.kind === 'fosil') foundFossil(x, y, L);
  if (b.kind === 'geoda') {
    const a = prodAmount('cultura', 40, 20);
    state.res.cultura += a;
    sfx.shimmer();
    burst(x, y, ['#b46cff', '#e0b8ff', '#ffffff', '#8a4ad0'], 50, 340, 5, 450);
    floatText(x, y - 26, `GEODA +${fmt(a)} ${spr('cultura', 16)}`, 'f-geoda');
    fly(x, y, 'cultura', resBox('cultura'), 4);
    if (Math.random() < 0.25) addBuff('suerte');
  }
  if (b.kind === 'tablilla') foundTablet(x, y);
  if (b.art) {
    if (b.rar == null) b.rar = rollRarity(luckOf(li));
    const a = createArtifact(b.art, b.rar, L);
    state.found.push(a);
    state.stats.artifacts++;
    announce(a, x, y);
    renderFinds();
  }
  if (b.kind === 'inestable') {
    const layerId = L.id;
    setTimeout(() => explode(layerId, bi), 110);
  }
  updateLayerProgress();
  if (L.blocks.every(k => k.hp <= 0)) layerDone(li);
}

// roca inestable: revienta a sus vecinos (y puede encadenar)
function explode(layerId, bi) {
  const li = activeLayerIndex();
  if (li < 0 || state.layers[li].id !== layerId || ui.layerId !== layerId) return;
  const L = state.layers[li];
  const [x, y] = blockCenter(bi);
  sfx.boom();
  shake(2);
  flash('rgba(255,120,40,.35)');
  burst(x, y, ['#ff8a2b', '#ffe08a', '#d04a3a', '#3a2420'], 70, 480, 7, 500);
  floatText(x, y - 20, '¡BOOM!', 'f-boom');
  const cx = bi % L.cols, cy = Math.floor(bi / L.cols);
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = cx + dx, ny = cy + dy;
      if ((!dx && !dy) || nx < 0 || ny < 0 || nx >= L.cols || ny >= L.rows) continue;
      const ni = ny * L.cols + nx;
      const nb = L.blocks[ni];
      if (nb && nb.hp > 0) hitBlock(li, ni, nb.max * 2, { explosion: true });
    }
  }
}

function foundFossil(x, y, L) {
  const f = wpick(FOSSILS);
  state.stats.fossils++;
  burst(x, y, ['#e8dcc0', '#b8a888', '#ffffff'], 30, 260, 5);
  if (discover('fosil', f.name)) {
    sfx.discover();
    toast(`${spr('fosil', 34)}<div><div class="kick">¡Nuevo fósil!</div><b>${f.name}</b><small class="lore">${f.lore}</small></div>`, 'loot', `--rc:${RARITIES[f.rar].color}`);
    if (f.rar >= 2) reveal('Fósil', f.name, f.lore, RARITIES[f.rar].color);
  } else {
    const fr = 5 * (1 + Math.max(0, L.era));
    state.frag += fr;
    floatText(x, y - 26, `${f.name} (repetido) +${fr} ${spr('frag', 14)}`, 'f-frag');
  }
}

function foundTablet(x, y) {
  burst(x, y, ['#9ff0ff', '#ffffff', '#5fb8d6'], 60, 320, 5, 300);
  if (state.tablets >= TABLETS.length) {
    state.frag += 20;
    floatText(x, y - 20, `+20 ${spr('frag', 14)}`, 'f-frag');
    return;
  }
  const idx = state.tablets++;
  sfx.discover();
  flash('rgba(159,240,255,.3)');
  renderCodex();
  setTimeout(() => showTablet(idx), 500);
}

function showTablet(idx) {
  const m = $('#modal');
  if (!m.classList.contains('hidden') || ui.busy) { setTimeout(() => showTablet(idx), 800); return; }
  const full = TABLETS[idx];
  m.innerHTML = `<div class="modal-card tablet-card">
    <div class="tablet">${spr('tablilla', 56)}<div class="t-num">Tablilla ${roman(idx + 1)} de ${roman(TABLETS.length)}</div><p class="t-text"></p></div>
    <div class="modal-actions"><button class="btn gold" data-act="close">Seguir</button></div></div>`;
  m.classList.remove('hidden');
  const p = m.querySelector('.t-text');
  let i = 0;
  const iv = setInterval(() => {
    i++;
    p.textContent = full.slice(0, i);
    if (i % 3 === 0) sfx.type();
    if (i >= full.length) clearInterval(iv);
  }, 32);
  m.onclick = ev => {
    if (i < full.length) { i = full.length; p.textContent = full; clearInterval(iv); return; }
    if (ev.target.closest('[data-act]')) closeModal();
  };
}

function announce(a, x, y, kicker) {
  const R = RARITIES[a.rar];
  const isNew = discover(a.type, a.name);
  burst(x, y, [R.color, '#ffffff'], 20 + a.rar * 25, 260 + a.rar * 80, 5, 400);
  sfx.loot(a.rar);
  if (isNew) setTimeout(sfx.discover, 300);
  toast(`${spr(a.type, 34)}<div><div class="kick">${kicker || R.name}${isNew ? ' · <span class="new">¡NUEVO!</span>' : ''}</div><b>${a.name}</b><small>${R.name} · ${RELICS[a.type].effect(a.power)}</small>${isNew ? `<small class="lore">${ARTLORE[a.name]}</small>` : ''}</div>`, 'loot', `--rc:${R.color}`);
  if (a.rar === 2) { flash('rgba(180,108,255,.3)'); shake(1); }
  if (a.rar === 3) {
    state.stats.legendaries++;
    flash('rgba(255,194,61,.45)');
    shake(2);
    sfx.legend();
    reveal(kicker || '¡Legendario!', a.name, RELICS[a.type].effect(a.power), R.color);
    setTimeout(() => burst(innerWidth / 2, innerHeight * 0.38, [R.color, '#fff6c9', '#ffffff'], 140, 560, 6, 300), 150);
  }
}

function layerDone(li) {
  const L = state.layers[li];
  L.done = true;
  const bonus = Math.round(L.blocks.length * 0.5 * (1 + Math.max(0, L.era)));
  state.frag += bonus;
  state.stats.layers++;
  const tier = L.num ? rollTier(L.era) : 'barro';
  state.anforas[tier]++;
  sfx.complete();
  setTimeout(() => {
    reveal('Capa excavada', L.num ? `Capa ${roman(L.num)}` : 'Sedimentos', `+${bonus} fragmentos · ${TIERS[tier].name} de regalo`, '#ffd47a');
    renderStrata();
    renderLuck();
  }, 500);
}

// =====================================================================
// SUERTE: ÁNFORAS (ruleta), ORÁCULO (tragaperras), RIESGO, COMETAS, BUFFS
// =====================================================================
function addBuff(id) {
  const B = BUFFS[id];
  const now = Date.now();
  const cur = state.buffs.find(b => b.id === id && b.until > now);
  if (cur) cur.until += B.dur * 1000;
  else state.buffs.push({ id, until: now + B.dur * 1000 });
  state.buffs = state.buffs.filter(b => b.until > now);
  reveal('¡Bendición!', B.name, `${B.desc} durante ${B.dur} s`, B.color);
  flash('rgba(242,193,78,.3)');
  recalc();
}

function prizePool(tier) {
  const t = TIER_IDS.indexOf(tier);
  const sec = [45, 150, 480][t];
  const k = (t + 1) * (t + 1);
  const types = Object.keys(RELICS);
  const pool = [
    { w: 26, q: 0, kind: 'res', res: 'comida', amt: prodAmount('comida', sec, 40 * k) },
    { w: 22, q: 0, kind: 'res', res: 'piedra', amt: prodAmount('piedra', sec, 20 * k) },
    { w: 12, q: 1, kind: 'res', res: 'cultura', amt: prodAmount('cultura', sec, 12 * k) },
    { w: 14, q: 1, kind: 'frag', amt: [6, 20, 70][t] },
    { w: 12, q: t ? 1 : 0, kind: 'art', rar: t ? 1 : 0, type: pick(types) },
    { w: 4, q: 2, kind: 'buff', id: 'frenesi' },
    { w: 3, q: 2, kind: 'buff', id: 'furia' },
    { w: [3, 6, 9][t], q: 2, kind: 'art', rar: 2, type: pick(types) },
    { w: [0.6, 1.5, 4][t], q: 3, kind: 'art', rar: 3, type: pick(types) },
  ];
  if (t < 2) pool.push({ w: [1.5, 3][t], q: 2, kind: 'anfora', tier: TIER_IDS[t + 1] });
  return pool;
}

function prizeView(p) {
  if (p.kind === 'res') return [spr(RES[p.res].spr, 40), '+' + fmt(p.amt)];
  if (p.kind === 'frag') return [spr('frag', 40), `+${p.amt} frag.`];
  if (p.kind === 'art') return [spr(p.type, 40), RARITIES[p.rar].name];
  if (p.kind === 'buff') return [spr(BUFFS[p.id].spr, 40), BUFFS[p.id].name];
  return [spr('anfora', 40, TIERS[p.tier].swap), TIERS[p.tier].short];
}

function applyPrize(p, x, y) {
  if (p.kind === 'res') { state.res[p.res] += p.amt; fly(x, y, RES[p.res].spr, resBox(p.res), 6); sfx.coin(); }
  if (p.kind === 'frag') { state.frag += p.amt; fly(x, y, 'frag', resBox('frag'), 5); sfx.coin(); }
  if (p.kind === 'art') {
    const a = createArtifact(p.type, p.rar, { num: 0, year: state.year, era: state.era, label: 'Ánfora' });
    state.found.push(a);
    state.stats.artifacts++;
    announce(a, x, y);
    renderFinds();
  }
  if (p.kind === 'buff') addBuff(p.id);
  if (p.kind === 'anfora') { state.anforas[p.tier]++; sfx.shimmer(); }
  const colors = ['#c9c1b4', '#4ea3ff', '#b46cff', '#ffc23d'];
  burst(x, y, [colors[p.q], '#ffffff'], 30 + p.q * 30, 300 + p.q * 80, 5, 400);
}

function openAnfora(tier) {
  if (ui.busy || !state.anforas[tier]) return deny();
  ui.busy = true;
  state.anforas[tier]--;
  state.stats.anforas++;
  renderLuck();
  const T = TIERS[tier];
  const pool = prizePool(tier);
  const win = wpick(pool);
  const N = 50, WIN = 44, CW = 104;
  const items = Array.from({ length: N }, (_, i) => i === WIN ? win : wpick(pool));
  const m = $('#modal');
  m.onclick = null;
  m.innerHTML = `<div class="modal-card roulette-card" style="--rc:${T.color}">
    <h2>${spr('anfora', 36, T.swap)} ${T.name}</h2>
    <div class="roulette"><div class="r-strip">${items.map((p, i) => {
      const [icon, label] = prizeView(p);
      return `<div class="r-card q${p.q}" data-i="${i}">${icon}<span>${label}</span></div>`;
    }).join('')}</div><div class="r-marker"></div></div>
    <div class="r-result" id="r-result">Rompiendo el sello…</div>
    <div class="modal-actions">
      <button class="btn" data-act="close" disabled>Recoger</button>
      <button class="btn gold" data-act="again" disabled>Abrir otra</button>
    </div>
  </div>`;
  m.classList.remove('hidden');
  sfx.clunk();

  const strip = m.querySelector('.r-strip');
  const box = m.querySelector('.roulette');
  const target = WIN * CW + 48 - box.clientWidth / 2 + rand(-38, 38);
  strip.style.transform = 'translateX(0px)';
  void strip.offsetWidth;
  strip.style.transition = 'transform 5.4s cubic-bezier(.05,.75,.1,1)';
  strip.style.transform = `translateX(${-target}px)`;

  let done = false, last = -1, n = 0;
  const tick = () => {
    if (done || !strip.isConnected) return;
    const tx = -new DOMMatrix(getComputedStyle(strip).transform).m41;
    const idx = Math.floor((tx + box.clientWidth / 2) / CW);
    if (idx !== last) { last = idx; sfx.tick(n++); }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  setTimeout(() => {
    done = true;
    const card = strip.querySelector(`[data-i="${WIN}"]`);
    card.classList.add('win');
    const [x, y] = centerOf(card);
    applyPrize(win, x, y);
    if (win.q >= 2) shake(win.q === 3 ? 2 : 1);
    const [, label] = prizeView(win);
    m.querySelector('#r-result').innerHTML = `Te ha tocado: <b class="q${win.q}">${win.kind === 'art' ? `${RARITIES[win.rar].name} (${RELICS[win.type].name})` : label}</b>`;
    m.querySelector('[data-act="close"]').disabled = false;
    m.querySelector('[data-act="again"]').disabled = !state.anforas[tier];
    ui.busy = false;
    m.onclick = ev => {
      const act = ev.target.closest('[data-act]');
      if (!act || act.disabled) return;
      if (act.dataset.act === 'close') closeModal();
      if (act.dataset.act === 'again') openAnfora(tier);
    };
    update();
  }, 5600);
}

function slotResult(r) {
  const ids = r.map(s => s.id);
  const count = id => ids.filter(x => x === id).length;
  if (count('calavera') === 3) return { kind: 'curse' };
  for (const s of SLOT) if (s.id !== 'calavera' && count(s.id) === 3) return { kind: 'triple', id: s.id };
  for (const s of SLOT) if (s.id !== 'calavera' && count(s.id) === 2) return { kind: 'pair', id: s.id };
  return { kind: 'none' };
}

function spin() {
  if (ui.spinning || ui.busy) return;
  const cost = spinCost();
  if (!canAfford(cost)) return deny($('#spin'));
  pay(cost);
  ui.spinning = true;
  state.stats.spins++;
  const res = [wpick(SLOT), wpick(SLOT), wpick(SLOT)];
  const suspense = res[0].id === res[1].id && res[0].id !== 'calavera';
  const durs = [900, 1350, suspense ? 3100 : 1800];
  const machine = $('#slot');
  machine.classList.remove('win', 'lose', 'tension', 'jackpot');
  $('#slot-msg').textContent = 'Los dioses deciden…';
  $('#spin').disabled = true;

  document.querySelectorAll('#slot .strip').forEach((strip, i) => {
    const n = 22 + i * 6 + (suspense && i === 2 ? 24 : 0);
    const syms = [ui.reelLast[i] || pick(SLOT)];
    for (let k = 1; k < n - 1; k++) syms.push(pick(SLOT));
    syms.push(res[i]);
    strip.innerHTML = syms.map(s => `<div class="sym">${spr(s.spr, 50)}</div>`).join('');
    strip.style.transition = 'none';
    strip.style.transform = 'translateY(0px)';
    void strip.offsetWidth;
    strip.style.transition = `transform ${durs[i]}ms cubic-bezier(.12,.7,.22,1.04)`;
    strip.style.transform = `translateY(-${(syms.length - 1) * 64}px)`;
    ui.reelLast[i] = res[i];
    setTimeout(() => {
      sfx.clunk();
      restartAnim(strip.parentElement, 'stop');
      if (i === 1 && suspense) {
        machine.classList.add('tension');
        $('#slot-msg').textContent = '¡¡Dos iguales!! …';
      }
    }, durs[i]);
  });

  let t = 0;
  const iv = setInterval(() => {
    t += 80;
    if (t >= durs[2]) { clearInterval(iv); return; }
    if (suspense && t > durs[1]) { if (t % 400 < 80) sfx.heartbeat(); } else sfx.tick(t / 80);
  }, 80);

  setTimeout(() => {
    ui.spinning = false;
    machine.classList.remove('tension');
    payout(res);
    update();
  }, durs[2] + 150);
}

function payout(res) {
  const r = slotResult(res);
  const machine = $('#slot');
  const msg = $('#slot-msg');
  const [x, y] = centerOf(machine);
  const gain = (resId, sec, floor, label) => {
    const a = prodAmount(resId, sec, floor);
    state.res[resId] += a;
    fly(x, y, RES[resId].spr, resBox(resId), 6);
    return `${label} <b>+${fmt(a)}</b> ${RES[resId].name.toLowerCase()}`;
  };
  if (r.kind === 'curse') {
    state.stats.curses++;
    state.res.comida *= 0.75;
    state.res.piedra *= 0.75;
    sfx.fail();
    flash('rgba(208,74,58,.45)');
    shake(2);
    machine.classList.add('lose');
    msg.innerHTML = '<b class="bad">MALDICIÓN.</b> Pierdes un 25 % de comida y piedra.';
    reveal('Tres calaveras', 'Maldición', '−25 % comida y piedra', '#d04a3a');
    return;
  }
  if (r.kind === 'none') {
    const nearIdol = res.filter(s => s.id === 'idolo').length === 2;
    msg.innerHTML = nearIdol ? '¡Casi! Dos ídolos…' : pick(['Nada. Los dioses bostezan.', 'Nada esta vez.', 'Las piedras no hablan.', 'Otra vez será.']);
    machine.classList.add('lose');
    return;
  }
  machine.classList.add('win');
  if (r.kind === 'pair') {
    if (r.id === 'pan') msg.innerHTML = gain('comida', 60, 60, 'Pareja de pan:');
    if (r.id === 'piedra') msg.innerHTML = gain('piedra', 60, 40, 'Pareja de piedra:');
    if (r.id === 'estrella') msg.innerHTML = gain('cultura', 60, 30, 'Pareja de estrellas:');
    if (r.id === 'anfora') { state.anforas.barro++; msg.innerHTML = 'Pareja de ánforas: <b>Ánfora de barro</b>'; renderLuck(); }
    if (r.id === 'idolo') { giveArtifact(1, 'Oráculo', x, y); msg.innerHTML = 'Pareja de ídolos: <b>artefacto raro</b>'; }
    sfx.coin();
    burst(x, y, ['#f2c14e', '#fff1b0'], 30, 260, 4);
    return;
  }
  // trío
  state.stats.jackpots++;
  machine.classList.add('jackpot');
  sfx.legend();
  shake(2);
  burst(x, y, ['#f2c14e', '#fff1b0', '#ffffff', '#d9822b'], 120, 500, 6, 400);
  if (r.id === 'pan') { msg.innerHTML = gain('comida', 600, 500, '¡TRES PANES!'); reveal('¡Premio!', 'Tres panes', '10 minutos de comida', '#f2c14e'); }
  if (r.id === 'piedra') { msg.innerHTML = gain('piedra', 600, 300, '¡TRES PIEDRAS!'); reveal('¡Premio!', 'Tres piedras', '10 minutos de piedra', '#f2c14e'); }
  if (r.id === 'estrella') { gain('cultura', 120, 100, ''); addBuff('frenesi'); msg.innerHTML = '¡TRES ESTRELLAS! <b>Frenesí</b> + cultura'; }
  if (r.id === 'anfora') { state.anforas.oro++; msg.innerHTML = '¡TRES ÁNFORAS! <b>Ánfora de oro</b>'; reveal('¡Premio!', 'Ánfora de oro', 'Ábrela… si te atreves', '#ffd84a'); renderLuck(); }
  if (r.id === 'idolo') {
    state.stats.idols++;
    giveArtifact(3, 'Oráculo', x, y, '¡¡JACKPOT!!');
    msg.innerHTML = '<b>¡¡JACKPOT!!</b> Artefacto legendario';
  }
}

function riskArtifact(id) {
  if (ui.risking) return;
  const a = state.found.find(x => x.id === id);
  if (!a || a.rar >= 3) return;
  const card = document.querySelector(`[data-card="${id}"]`);
  if (!card) return;
  ui.risking = true;
  state.stats.risks++;
  card.classList.add('rolling');
  let n = 0;
  const iv = setInterval(() => {
    n++;
    card.style.setProperty('--rc', RARITIES[n % 4].color);
    sfx.tick(n);
  }, 85);
  setTimeout(() => {
    clearInterval(iv);
    ui.risking = false;
    const [x, y] = centerOf(card);
    if (Math.random() < RISK[a.rar]) {
      a.rar++;
      a.name = pick(RELICS[a.type].names[RARITIES[a.rar].id]);
      a.power = powerFor(a.rar, a.era || 0);
      if (a.rar === 3) state.stats.riskLegend++;
      announce(a, x, y, '¡Mejorado!');
    } else {
      state.stats.riskFails++;
      state.found = state.found.filter(f => f !== a);
      sfx.fail();
      shake(1);
      burst(x, y, ['#6e6a70', '#b8b4ac', '#3a3236'], 40, 260, 5);
      floatText(x, y - 10, 'Se ha hecho polvo…', 'f-fail');
    }
    renderFinds();
  }, 1500);
}

function spawnComet() {
  const e = el('button', 'comet', spr('cultura', 40, { y: '#fff6c9', w: '#ffffff', k: '#f2c14e' }));
  document.body.appendChild(e);
  const fromLeft = Math.random() < 0.5;
  const y0 = rand(90, innerHeight * 0.45);
  const dur = 9500;
  const t0 = performance.now();
  if (!fromLeft) e.classList.add('flip');
  sfx.shimmer();
  const step = now => {
    if (!e.isConnected) return;
    const k = (now - t0) / dur;
    if (k >= 1) { e.remove(); return; }
    const x = fromLeft ? -60 + (innerWidth + 120) * k : innerWidth + 60 - (innerWidth + 120) * k;
    const y = y0 + Math.sin(k * Math.PI * 3) * 26 + k * 70;
    e.style.transform = `translate(${x}px, ${y}px)`;
    if (Math.random() < 0.5) burst(x + (fromLeft ? 0 : 40), y + 20, ['#fff6c9', '#f2c14e'], 1, 40, 3, 80);
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  e.addEventListener('pointerdown', ev => {
    ev.preventDefault();
    e.remove();
    catchComet(ev.clientX, ev.clientY);
  });
}

function catchComet(x, y) {
  state.stats.comets++;
  burst(x, y, ['#fff6c9', '#f2c14e', '#ffffff'], 70, 420, 5, 300);
  sfx.shimmer();
  const r = wpick([{ w: 34, id: 'frenesi' }, { w: 24, id: 'furia' }, { w: 16, id: 'suerte' }, { w: 14, id: 'anfora' }, { w: 12, id: 'lluvia' }]);
  if (BUFFS[r.id]) { addBuff(r.id); return; }
  if (r.id === 'anfora') {
    const t = rollTier(state.era + 1);
    state.anforas[t]++;
    reveal('¡Cometa!', TIERS[t].name, 'Te espera en la pestaña Suerte', TIERS[t].color);
    renderLuck();
    return;
  }
  const gains = Object.keys(RES).map(res => [res, prodAmount(res, 300, 50)]);
  gains.forEach(([res, v]) => { state.res[res] += v; fly(x, y, RES[res].spr, resBox(res), 5); });
  sfx.coin();
  reveal('¡Cometa!', 'Lluvia de riquezas', gains.map(([res, v]) => `+${fmt(v)} ${RES[res].name.toLowerCase()}`).join(' · '), '#f2c14e');
}

// ---------- sucesos ----------
function showEvent() {
  const pool = EVENTS.filter(e => !e.req || e.req());
  const E = pick(pool);
  const costs = E.opts.map(o => o.cost ? o.cost() : null);
  const box = $('#event');
  box.innerHTML = `<div class="ev-head">${spr(E.spr, 38)}<div><div class="kick">Suceso</div><b>${E.title}</b></div></div>
    <p class="ev-text">${E.text}</p>
    <div class="ev-opts">${E.opts.map((o, i) => `<button class="ev-opt" data-ev="${i}" ${costs[i] && !canAfford(costs[i]) ? 'disabled' : ''}>${o.label}${costs[i] ? `<span class="ev-cost">${costHtml(costs[i])}</span>` : ''}</button>`).join('')}</div>
    <div class="ev-timer"><i></i></div>`;
  box.classList.remove('done');
  restartAnim(box, 'show');
  ui.event = { E, costs, start: Date.now(), dur: 30000 };
  sfx.bell();
}

function chooseEvent(i) {
  const ev = ui.event;
  if (!ev || ev.resolved) return;
  const cost = ev.costs[i];
  if (cost && !canAfford(cost)) return deny();
  if (cost) pay(cost);
  ev.resolved = true;
  state.stats.events++;
  const text = ev.E.opts[i].act(cost);
  const box = $('#event');
  box.querySelector('.ev-opts').innerHTML = `<p class="ev-result">${text}</p>`;
  box.classList.add('done');
  sfx.buy();
  recalc();
  setTimeout(closeEvent, 4200);
}

function closeEvent() {
  $('#event').classList.remove('show');
  ui.event = null;
  ui.eventT = rand(100, 200);
}

function checkAchievements() {
  let any = false;
  for (const A of ACH) {
    if (state.ach[A.id] || !A.check(state)) continue;
    state.ach[A.id] = Date.now();
    any = true;
    sfx.milestone();
    toast(`${spr('medalla', 34)}<div><div class="kick">Logro desbloqueado</div><b>${A.name}</b><small>${A.desc} · +2 % producción</small></div>`, 'loot', '--rc:#f2c14e');
  }
  if (any) { refreshBonuses(); renderCodex(); }
}

// =====================================================================
// PRESTIGIO
// =====================================================================
function openPrestige() {
  if (ui.busy) return;
  const m = $('#modal');
  const wealth = layerWealth();
  const lost = state.found.length;
  let sel = null;
  const cards = Object.entries(ENDINGS).map(([id, E]) => {
    const arts = layerPreview(id);
    const counts = {};
    arts.forEach(t => { counts[t] = (counts[t] || 0) + 1; });
    const prev = Object.entries(counts).map(([t, c]) => `<span>${spr(t, 22)}x${c}</span>`).join('') || '<span class="no">Nada sobrevive</span>';
    return `<button class="ending" data-end="${id}">
      ${spr(E.spr, 50)}<h3>${E.name}</h3><p>${E.desc}</p>
      <div class="e-prev">${prev}</div><div class="e-hp">${E.hpLabel} · ${arts.length} artefactos enterrados</div>
    </button>`;
  }).join('');
  m.innerHTML = `<div class="modal-card">
    <h2>¿Cómo termina esta civilización?</h2>
    <p class="muted">Quedará enterrada como la <b>Capa ${roman(state.run)}</b> y en tu próxima vida la excavarás. Lo que construiste decide lo que encontrarás. También habrá ánforas escondidas, fósiles, geodas, vetas de oro y rocas inestables${state.tabletsPlaced < TABLETS.length ? '… y una tablilla' : ''}.</p>
    <div class="loot-line">Botín repartido entre los bloques: ${spr('pan', 16)} ${fmt(wealth.comida)} · ${spr('piedra', 16)} ${fmt(wealth.piedra)}</div>
    <div class="endings">${cards}</div>
    ${lost ? `<p class="warn">Ojo: ${lost} hallazgo${lost > 1 ? 's' : ''} que no está${lost > 1 ? 'n' : ''} en el museo se perderá${lost > 1 ? 'n' : ''}.</p>` : ''}
    ${activeLayerIndex() >= 0 ? '<p class="warn">La capa que estás excavando quedará más enterrada: costará más llegar, pero ganará pátina (+suerte).</p>' : ''}
    <div class="modal-actions">
      <button class="btn" data-act="cancel">Todavía no</button>
      <button class="btn gold" data-act="go" disabled>Dejar pasar 1000 años</button>
    </div>
  </div>`;
  m.classList.remove('hidden');
  m.onclick = ev => {
    const end = ev.target.closest('[data-end]');
    if (end) {
      sel = end.dataset.end;
      m.querySelectorAll('.ending').forEach(x => x.classList.toggle('sel', x === end));
      m.querySelector('[data-act="go"]').disabled = false;
      sfx.buy();
      return;
    }
    const act = ev.target.closest('[data-act]');
    if (!act) { if (ev.target === m) closeModal(); return; }
    if (act.dataset.act === 'cancel') closeModal();
    if (act.dataset.act === 'go' && sel) doPrestige(sel);
  };
}

function closeModal() {
  const m = $('#modal');
  m.classList.add('hidden');
  m.innerHTML = '';
  m.onclick = null;
}

function doPrestige(endingId) {
  const E = ENDINGS[endingId];
  const arts = layerPreview(endingId);
  const anforas = 2 + state.era + lvl('alfarero');
  const tablet = state.tabletsPlaced < TABLETS.length;
  if (tablet) state.tabletsPlaced++;
  const rows = Math.min(6, 3 + Math.ceil((arts.length + anforas + 1) / 8));
  const layer = makeLayer({
    num: state.run, year: state.year, era: state.era, ending: endingId, comp: { ...state.b },
    wealth: layerWealth(), cols: 8, rows,
    hp: 5 * Math.pow(1.8, state.run - 1) * E.hp, artifacts: arts, anforas, tablet,
  });
  const fromYear = state.year;

  state.layers.unshift(layer);
  state.year += 1000;
  state.run++;
  state.stats.runs++;
  state.stats.endings[endingId] = (state.stats.endings[endingId] || 0) + 1;
  state.era = 0;
  state.res = startRes();
  state.b = { granja: 0, cantera: 0, templo: 0, biblioteca: 0 };
  state.arq = 2 * lvl('cuadrilla');
  state.pico = 0;
  state.up = {};
  state.found = [];
  state.produced = { comida: 0, piedra: 0, cultura: 0 };
  save();

  // animación: el año corre
  const m = $('#modal');
  m.onclick = null;
  m.innerHTML = `<div class="timewarp">${spr(E.spr, 80)}<div class="tw-year">${fmtYear(fromYear)}</div><div class="tw-sub">Pasan mil años…</div></div>`;
  sfx.rumble();
  shake(2);
  const yEl = m.querySelector('.tw-year');
  const t0 = performance.now();
  const anim = now => {
    const k = Math.min(1, (now - t0) / 2200);
    const eased = 1 - Math.pow(1 - k, 3);
    yEl.textContent = fmtYear(Math.round((fromYear + 1000 * eased) / 10) * 10);
    if (k < 1) requestAnimationFrame(anim);
  };
  requestAnimationFrame(anim);
  // el cierre va por temporizador para no depender de que el navegador pinte frames
  setTimeout(() => {
    closeModal();
    recalc();
    renderAll();
    reveal(`Civilización ${roman(state.run)}`, fmtYear(state.year), `Bajo tus pies: la Capa ${roman(layer.num)}`, '#a98bff');
    sfx.era();
  }, 2700);
}

// =====================================================================
// RENDER
// =====================================================================
function buildHeader() {
  $('#logo').innerHTML = spr('anfora', 40, TIERS.oro.swap);
  $('#gather-icon').innerHTML = spr('granja', 44);
  const box = $('#resources');
  box.innerHTML = '';
  ui.resEls = {};
  for (const [id, R] of Object.entries(RES)) {
    const e = el('div', 'res', `${spr(R.spr, 28)}<div><b></b><small></small></div>`);
    e.title = R.name;
    box.appendChild(e);
    ui.resEls[id] = { box: e, v: e.querySelector('b'), r: e.querySelector('small') };
  }
  const f = el('div', 'res frag', `${spr('frag', 28)}<div><b></b><small>fragmentos</small></div>`);
  f.title = 'Fragmentos: salen al excavar y se gastan en el Taller (mejoras permanentes)';
  box.appendChild(f);
  ui.fragEl = f.querySelector('b');
  ui.fragBox = f;
}

function goalText() {
  const li = activeLayerIndex();
  if (state.b.granja === 0) return 'Recolecta <b>10 de comida</b> y construye tu primera <b>granja</b>.';
  if (state.b.cantera === 0) return 'Abre una <b>mina</b> para conseguir piedra.';
  if (state.run === 1 && state.stats.blocks === 0) return 'Pica en el <b>subsuelo</b>: hay algo enterrado bajo tus pies.';
  if (state.b.templo === 0) return 'Levanta un <b>templo</b> para generar cultura.';
  if (state.stats.spins === 0 && state.res.cultura >= 15) return 'Prueba suerte en <b>el Oráculo</b> (pestaña Suerte).';
  if (state.era === 0) return 'Reúne cultura para llegar a la <b>Edad del Bronce</b>.';
  if (state.run === 1 && state.stats.runs === 0) return 'Ya puedes <b>dejar pasar 1000 años</b>… o seguir creciendo para dejar ruinas más ricas.';
  if (li >= 0) return `Excava la <b>${state.layers[li].num ? 'Capa ' + roman(state.layers[li].num) : 'capa de sedimentos'}</b>: tu pasado te espera.`;
  if (ERAS[state.era + 1]) return `Avanza a la <b>${ERAS[state.era + 1].name}</b> para dejar mejores ruinas.`;
  return 'Entierra tu civilización y sigue bajando. Algo te espera en el fondo.';
}

function renderBuildings() {
  const box = $('#buildings');
  box.innerHTML = '';
  ui.bEls = {};
  for (const [id, B] of Object.entries(BUILDINGS)) {
    if (B.era > state.era) {
      if (B.era === state.era + 1) {
        box.appendChild(el('div', 'brow locked', `${spr('candado', 40)}<div class="bmain"><b>${B.name}</b><small>Se desbloquea en la ${ERAS[B.era].name}</small></div>`));
      }
      continue;
    }
    const res = Object.keys(B.prod)[0];
    const row = el('button', 'brow', `${spr(B.spr, 40)}<div class="bmain"><b>${B.name} <em></em></b><small class="bprod"></small><div class="cyc" style="--cc:${RES[res].color}"><i></i></div><span class="bcost"></span><div class="ms"><i></i></div></div><span class="bcount"></span>`);
    row.dataset.b = id;
    box.appendChild(row);
    ui.bEls[id] = {
      row, amt: row.querySelector('em'), prod: row.querySelector('.bprod'), cost: row.querySelector('.bcost'),
      count: row.querySelector('.bcount'), ms: row.querySelector('.ms i'), msBox: row.querySelector('.ms'), cyc: row.querySelector('.cyc i'),
    };
  }
}

function renderDigTools() {
  $('#dig-tools').innerHTML = `
    <button class="tool" data-tool="pico">${spr('pico', 36)}<div class="bmain"><b>Mejorar pico <em id="pico-lvl"></em></b><small>Daño por golpe x1,5</small><span class="bcost" id="pico-cost"></span></div></button>
    <button class="tool" data-tool="arq">${spr('arqueologo', 36)}<div class="bmain"><b>Arqueólogo <em id="arq-n"></em></b><small>Excava solo, aunque no piques</small><span class="bcost" id="arq-cost"></span></div></button>`;
}

const layerTitle = L => L.num ? `Capa ${roman(L.num)}` : 'Sedimentos';
function layerTag(L) {
  if (!L.num) return 'Antes de todo';
  return `${fmtYear(L.year)} · ${ERAS[L.era].name}`;
}
function layerRgb(L) {
  const base = hexToRgb(L.era < 0 ? '#5b4a39' : ERAS[L.era].color);
  return L.ending ? mixRgb(base, hexToRgb(ENDINGS[L.ending].tint), 0.4) : base;
}

function layerTextures(L) {
  if (ui.tex[L.id]) return ui.tex[L.id];
  const rgb = layerRgb(L);
  const t = {
    normal: [0, 1, 2, 3].map(i => blockTex(rgb, L.seed + i * 13)),
    oro: blockTex(rgb, L.seed + 101, 'oro'),
    inestable: blockTex(rgb, L.seed + 202, 'inestable'),
    fosil: blockTex(rgb, L.seed + 505, 'fosil'),
    geoda: blockTex(rgb, L.seed + 606, 'geoda'),
    hole: holeTex(rgb, L.seed + 303),
    band: blockTex(mixRgb(rgb, [0, 0, 0], 0.15), L.seed + 404),
  };
  ui.tex[L.id] = t;
  return t;
}

const VISIBLE_KINDS = ['oro', 'inestable', 'fosil', 'geoda'];

function styleBlock(e, b) {
  const r = b.hp / b.max;
  const broken = b.hp <= 0;
  e.classList.toggle('broken', broken);
  e.classList.toggle('c1', !broken && r < 0.8 && r >= 0.55);
  e.classList.toggle('c2', !broken && r < 0.55 && r >= 0.3);
  e.classList.toggle('c3', !broken && r < 0.3);
  const gc = glintColor(b);
  e.classList.toggle('glint', !!gc);
  if (gc) e.style.setProperty('--g', gc);
  if (broken) {
    e.style.backgroundImage = `url(${e.dataset.hole})`;
    if (!e.firstChild) {
      if (b.art) e.innerHTML = spr(b.art, 30, null, 'hole');
      else if (b.kind === 'anfora') e.innerHTML = spr('anfora', 30, TIERS[b.tier].swap, 'hole');
      else if (b.kind === 'tablilla' || b.kind === 'fosil' || b.kind === 'geoda') e.innerHTML = spr(b.kind, 30, null, 'hole');
    }
  }
}

function renderStrata() {
  const box = $('#strata');
  box.innerHTML = '';
  ui.blockEls = [];
  ui.progressEl = null;

  box.appendChild(el('div', 'stratum surface', `<canvas id="village"></canvas><div class="surface-label">Tu aldea · ${fmtYear(state.year)}</div>`));

  const active = activeLayerIndex();
  ui.layerId = active >= 0 ? state.layers[active].id : null;
  state.layers.forEach((L, i) => {
    const tex = layerTextures(L);
    if (i === active) {
      const s = el('div', 'stratum active');
      s.style.backgroundImage = `url(${tex.band})`;
      const luck = luckOf(i);
      s.innerHTML = `<div class="layer-head"><span><b>${layerTitle(L)}</b> <span class="tagline">${layerTag(L)}</span>${L.ending ? spr(ENDINGS[L.ending].spr, 18) : ''}</span><span class="tagline" id="layer-count"></span></div>
        <div class="progress"><i id="layer-progress"></i></div>
        <div class="grid" style="--cols:${L.cols}"></div>
        <div class="tagline layer-foot">Suerte x${luck.toFixed(2).replace('.', ',')}${i > 0 ? ` (pátina de ${i} capa${i > 1 ? 's' : ''})` : ''} · <span class="leg-oro">oro</span> · <span class="leg-ine">inestable</span> · <span class="leg-fos">fósil</span> · <span class="leg-geo">geoda</span></div>`;
      const grid = s.querySelector('.grid');
      L.blocks.forEach((b, bi) => {
        const e = el('div', 'block');
        const img = VISIBLE_KINDS.includes(b.kind) ? tex[b.kind] : tex.normal[b.v || 0];
        e.dataset.bi = bi;
        e.dataset.c = rgbStr(layerRgb(L), 0.9 + (b.v || 0) * 0.05);
        e.dataset.hole = tex.hole;
        e.style.backgroundImage = `url(${img})`;
        if (VISIBLE_KINDS.includes(b.kind)) e.classList.add('k-' + b.kind);
        styleBlock(e, b);
        grid.appendChild(e);
        ui.blockEls[bi] = e;
      });
      box.appendChild(s);
      ui.progressEl = s.querySelector('#layer-progress');
      ui.countEl = s.querySelector('#layer-count');
      updateLayerProgress();
    } else {
      const buried = active >= 0 && i > active;
      const s = el('div', 'stratum collapsed' + (buried ? ' buried' : ''));
      s.style.backgroundImage = `url(${tex.band})`;
      const right = L.done ? 'excavada' : `enterrada · pátina +${Math.round(i * 30)} % suerte`;
      s.innerHTML = `<span><b>${layerTitle(L)}</b> <span class="tagline">${layerTag(L)}</span>${L.ending ? spr(ENDINGS[L.ending].spr, 16) : ''}</span><span class="tagline">${right}</span>`;
      box.appendChild(s);
    }
  });

  if (active < 0) {
    box.appendChild(el('div', 'stratum no-dig', 'No queda nada por excavar. Deja pasar mil años para crear una capa nueva.'));
  }

  const awake = state.tablets >= TABLETS.length;
  const abyss = el('div', 'stratum abyss' + (awake ? ' awake' : ''), `<span class="eyes" style="left:${Math.round(rand(15, 80))}%;top:${Math.round(rand(30, 60))}%"></span><span class="abyss-txt">· · ·</span>`);
  abyss.title = awake ? 'Se está abriendo.' : LORE[Math.min(LORE.length - 1, Math.floor(state.stats.runs / 3))];
  box.appendChild(abyss);
  requestAnimationFrame(setupVillage);
}

function updateLayerProgress() {
  const li = activeLayerIndex();
  if (li < 0 || !ui.progressEl) return;
  const L = state.layers[li];
  const broken = L.blocks.filter(b => b.hp <= 0).length;
  ui.progressEl.style.width = (broken / L.blocks.length * 100) + '%';
  ui.countEl.textContent = `${broken}/${L.blocks.length} bloques`;
}

function artCard(a, actions) {
  const R = RARITIES[a.rar];
  const origin = a.src || (a.from ? `Capa ${roman(a.from)} · ${fmtYear(a.year)}` : 'Sedimentos');
  return `<div class="art r${a.rar}" data-card="${a.id}" style="--rc:${R.color}">${spr(a.type, 34)}
    <div class="amain"><b>${a.name}</b><small>${R.name} · ${RELICS[a.type].effect(a.power)}</small><small class="aorig">${origin}</small></div>
    <div class="aacts">${actions}</div></div>`;
}

function renderFinds() {
  recalc();
  const box = $('#tab-finds');
  const R = D.R;
  const chips = Object.entries(RELICS).map(([t, T]) => `<span class="chip ${R[t] > 0 ? 'on' : ''}">${spr(t, 16)} ${T.effect(R[t])}</span>`).join('');
  const full = state.museum.length >= museumSlots();
  const list = [...state.found].sort((a, b) => b.rar - a.rar || b.power - a.power);
  box.innerHTML = `<p class="tab-intro">Bonus activos (hallazgos + museo):</p><div class="bonus">${chips}</div>
    <p class="tab-intro">Hallazgos de esta civilización. <b>Se pierden al pasar mil años</b> salvo que los expongas en el museo. <b>Arriesgar</b>: subes de rareza… o se hace polvo.</p>
    ${list.length ? list.map(a => artCard(a,
      `<button class="mini-btn" data-expose="${a.id}" ${full ? 'disabled title="Museo lleno: retira algo primero"' : ''}>Exponer</button>`
      + (a.rar < 3 ? `<button class="mini-btn risk" data-risk="${a.id}">Arriesgar ${Math.round(RISK[a.rar] * 100)}%</button>` : ''))).join('')
      : '<div class="slot-empty">Aún no has encontrado nada. ¡A picar!</div>'}`;
  $('#tabs [data-tab="finds"]').textContent = `Hallazgos${state.found.length ? ` (${state.found.length})` : ''}`;
}

function renderMuseum() {
  const box = $('#tab-museum');
  const slots = museumSlots();
  let html = `<p class="tab-intro">Lo que expongas aquí <b>se conserva para siempre</b> y su bonus se aplica en todas tus civilizaciones. ${state.museum.length}/${slots} vitrinas.</p>`;
  for (let i = 0; i < slots; i++) {
    const a = state.museum[i];
    html += a ? artCard(a, `<button class="mini-btn" data-retire="${a.id}">Retirar</button>`) : '<div class="slot-empty">Vitrina vacía</div>';
  }
  box.innerHTML = html;
  $('#tabs [data-tab="museum"]').textContent = `Museo ${state.museum.length}/${slots}`;
}

function renderLuck() {
  const box = $('#tab-luck');
  if (!box.querySelector('#slot')) {
    box.innerHTML = `
      <div class="slot" id="slot">
        <div class="slot-top">${spr('ojo', 26)} EL ORÁCULO ${spr('ojo', 26)}</div>
        <div class="reels">${[0, 1, 2].map(i => `<div class="reel"><div class="strip"><div class="sym">${spr((ui.reelLast[i] || SLOT[4]).spr, 50)}</div></div></div>`).join('')}</div>
        <div class="slot-msg" id="slot-msg">Tira y que decidan los dioses.</div>
        <button class="lever" id="spin">TIRAR <span id="spin-cost"></span></button>
        <details class="paytable"><summary>Tabla de premios</summary>
          <div>${spr('reliquias', 16)}${spr('reliquias', 16)}${spr('reliquias', 16)} <b>JACKPOT</b>: artefacto legendario</div>
          <div>${spr('anfora', 16)}${spr('anfora', 16)}${spr('anfora', 16)} Ánfora de oro</div>
          <div>${spr('cultura', 16)}${spr('cultura', 16)}${spr('cultura', 16)} Frenesí (producción x7) + cultura</div>
          <div>${spr('pan', 16)}${spr('pan', 16)}${spr('pan', 16)} / ${spr('piedra', 16)}${spr('piedra', 16)}${spr('piedra', 16)} 10 min de producción</div>
          <div>Pareja: premio pequeño (ídolos = artefacto raro)</div>
          <div class="bad">${spr('calavera', 16)}${spr('calavera', 16)}${spr('calavera', 16)} Maldición: −25 % comida y piedra</div>
        </details>
      </div>
      <div class="section-title"><span>Ánforas selladas</span></div>
      <div id="anforas" class="anforas"></div>
      <p class="tab-intro">Salen escondidas en las capas, al terminar de excavar una capa, en el Oráculo, de los cometas y de algunos sucesos.</p>
      <p class="tab-intro">De vez en cuando cruza un <b>cometa</b> por la pantalla. ¡Cázalo!</p>`;
  }
  $('#anforas').innerHTML = TIER_IDS.map(t => {
    const T = TIERS[t];
    const n = state.anforas[t];
    return `<div class="anf ${n ? 'has' : ''}" style="--rc:${T.color}">${spr('anfora', 44, T.swap)}<b>${T.short}</b><span>x${n}</span>
      <button class="mini-btn" data-open="${t}" ${n ? '' : 'disabled'}>Abrir</button></div>`;
  }).join('');
  const total = TIER_IDS.reduce((a, t) => a + state.anforas[t], 0);
  $('#tabs [data-tab="luck"]').innerHTML = total ? `Suerte <span class="badge">${total}</span>` : 'Suerte';
}

function renderWorkshop() {
  const box = $('#tab-workshop');
  box.innerHTML = `<p class="tab-intro">Mejoras <b>permanentes</b> que se pagan con fragmentos ${spr('frag', 14)}. No se pierden al pasar mil años.</p>`;
  for (const p of PERMS) {
    const e = el('button', 'perm', `${spr(p.spr, 34)}<div class="bmain"><b>${p.name} <em></em></b><small>${p.desc}</small><span class="bcost"></span></div>`);
    e.dataset.perm = p.id;
    box.appendChild(e);
  }
}

function renderCodex() {
  const box = $('#tab-codex');
  if (!box) return;
  const total = codexTotal();
  const have = Object.keys(state.codex).length;
  const achN = Object.keys(state.ach).length;
  let html = `<div class="cx-total">${spr('pergaminos', 30)}<div><b>${have}/${total} descubrimientos</b><small>+1 % de producción por cada uno · +10 % por colección completa · bonus actual x${ui.cxMult.toFixed(2).replace('.', ',')}</small></div></div>`;

  // la historia de la capa negra
  html += `<details class="cx-sec" open><summary>${spr('tablilla', 20)} La capa negra <span>${state.tablets}/${TABLETS.length}</span></summary>`;
  for (let i = 0; i < TABLETS.length; i++) {
    html += i < state.tablets
      ? `<button class="cx-tablet" data-tablet="${i}"><b>Tablilla ${roman(i + 1)}</b><small>${TABLETS[i].slice(0, 54)}…</small></button>`
      : `<div class="cx-tablet locked"><b>Tablilla ${roman(i + 1)}</b><small>${i === state.tablets ? 'Está enterrada en alguna capa. Sigue cavando.' : '???'}</small></div>`;
  }
  html += '</details>';

  for (const C of CODEX_CATS) {
    const entries = codexEntries(C.id);
    const n = entries.filter(e => state.codex[e.key]).length;
    const done = n === entries.length;
    html += `<details class="cx-sec${done ? ' done' : ''}"><summary>${spr(C.spr, 20)} ${C.name} <span>${n}/${entries.length}${done ? ' ✓' : ''}</span></summary>`;
    for (const e of entries) {
      const got = state.codex[e.key];
      html += got
        ? `<div class="cx-entry" style="--rc:${RARITIES[e.rar].color}">${spr(C.spr, 26)}<div><b>${e.name}</b><small>${e.lore}</small></div></div>`
        : `<div class="cx-entry locked" style="--rc:${RARITIES[e.rar].color}">${spr(C.spr, 26, SILHOUETTE)}<div><b>???</b><small>${RARITIES[e.rar].name}. Aún no lo has encontrado.</small></div></div>`;
    }
    html += '</details>';
  }

  html += `<details class="cx-sec"><summary>${spr('medalla', 20)} Logros <span>${achN}/${ACH.length}</span></summary><div class="ach-grid">`;
  for (const A of ACH) {
    const got = state.ach[A.id];
    const show = got || !A.hidden;
    html += `<div class="ach${got ? ' got' : ''}" title="${show ? A.desc : 'Logro oculto'}">${spr('medalla', 28, got ? null : SILHOUETTE)}<b>${show ? A.name : '???'}</b><small>${show ? A.desc : 'Oculto'}</small></div>`;
  }
  html += '</div></details>';

  const s = state.stats;
  const rows = [
    ['Civilización actual', roman(state.run)], ['Año', fmtYear(state.year)], ['Civilizaciones enterradas', s.runs],
    ['Capas excavadas', s.layers], ['Bloques rotos', fmt(s.blocks)], ['Golpes críticos', fmt(s.crits)],
    ['Artefactos encontrados', fmt(s.artifacts)], ['Legendarios', s.legendaries], ['Fósiles desenterrados', s.fossils],
    ['Ánforas abiertas', s.anforas], ['Tiradas en el Oráculo', s.spins], ['Premios gordos', s.jackpots],
    ['Cometas cazados', s.comets], ['Sucesos vividos', s.events], ['Clics', fmt(s.clicks)],
  ];
  html += `<details class="cx-sec"><summary>${spr('ojo', 20)} Estadísticas</summary>${rows.map(([k, v]) => `<div class="stat-row"><span>${k}</span><span>${v}</span></div>`).join('')}</details>`;
  html += `<p class="lore">${LORE[Math.min(LORE.length - 1, Math.floor(s.runs / 3))]}</p><button class="danger" id="reset">Borrar partida</button>`;

  // mantener abiertas las secciones que el jugador tenía abiertas
  const open = [...box.querySelectorAll('details')].map(d => d.open);
  box.innerHTML = html;
  if (open.length) box.querySelectorAll('details').forEach((d, i) => { if (open[i] != null) d.open = open[i]; });
  $('#tabs [data-tab="codex"]').innerHTML = ui.codexNew && ui.tab !== 'codex' ? `Códice <span class="badge">${ui.codexNew}</span>` : 'Códice';
}

function renderAll() {
  ui.upKey = ui.eraKey = ui.pKey = null;
  renderBuildings();
  renderStrata();
  renderFinds();
  renderMuseum();
  renderLuck();
  renderCodex();
  update();
}

// actualización ligera, 10 veces por segundo
function update() {
  if (!ui.shown) ui.shown = { ...state.res };
  for (const id in RES) {
    const target = state.res[id];
    const s = ui.shown[id];
    ui.shown[id] = Math.abs(target - s) < Math.max(1, target * 0.002) ? target : s + (target - s) * 0.35;
    ui.resEls[id].v.textContent = fmt(ui.shown[id]);
    ui.resEls[id].r.textContent = `+${fmt(D.rates[id])}/s`;
  }
  ui.fragEl.textContent = fmt(state.frag);
  $('#year').textContent = `Año ${fmtYear(state.year)} · Civilización ${roman(state.run)}`;
  $('#era-name').textContent = ERAS[state.era].name;
  $('#goal').innerHTML = goalText();
  $('#gather-val').textContent = `+${fmt(D.click)} comida por clic`;

  // buffs activos (y aura en pantalla)
  const now = Date.now();
  state.buffs = state.buffs.filter(b => b.until > now);
  $('#buffs').innerHTML = state.buffs.map(b => {
    const B = BUFFS[b.id];
    const left = (b.until - now) / 1000;
    return `<div class="buff" style="--bc:${B.color}">${spr(B.spr, 20)}<span>${B.name} ${Math.ceil(left)}s</span><i style="width:${clamp(left / B.dur * 100, 0, 100)}%"></i></div>`;
  }).join('');
  for (const id in BUFFS) document.body.classList.toggle('aura-' + id, buffOn(id));

  // construcciones
  for (const id in ui.bEls) {
    const E = ui.bEls[id];
    const amt = buyAmount(id);
    const cost = bCost(id, amt);
    E.row.classList.toggle('can', canAfford(cost));
    E.amt.textContent = amt > 1 ? `x${amt}` : '';
    const u = perUnit(id);
    E.prod.textContent = `+${fmt(u.v)}/s cada una · total +${fmt(u.v * state.b[id])}/s`;
    E.cost.innerHTML = costHtml(cost);
    E.count.textContent = state.b[id];
    const n = state.b[id];
    const next = MILESTONES.find(m => m > n);
    const prev = [...MILESTONES].reverse().find(m => m <= n) || 0;
    E.ms.style.width = next ? ((n - prev) / (next - prev) * 100) + '%' : '100%';
    E.msBox.title = next ? `Hito en ${next}: producción x2` : 'Todos los hitos';
    E.msBox.dataset.next = next ? `${n}/${next} → x2` : 'MAX';
  }

  // mejoras
  const ups = UPGRADES.filter(u => !state.up[u.id] && u.era <= state.era && (!u.req || u.req(state)));
  const upBox = $('#upgrades');
  const key = ups.map(u => u.id).join(',');
  if (key !== ui.upKey) {
    ui.upKey = key;
    upBox.innerHTML = ups.length ? '' : '<p class="empty">No hay mejoras disponibles ahora mismo.</p>';
    for (const u of ups) {
      const e = el('button', 'upg', `<b>${u.name}</b><small>${u.desc}</small><span class="ucost"></span>`);
      e.dataset.u = u.id;
      upBox.appendChild(e);
    }
  }
  upBox.querySelectorAll('.upg').forEach(e => {
    const cost = scaledCost(UPGRADES.find(x => x.id === e.dataset.u).cost);
    e.classList.toggle('can', canAfford(cost));
    e.querySelector('.ucost').innerHTML = costHtml(cost);
  });

  // era
  const next = ERAS[state.era + 1];
  const eraBox = $('#era-box');
  if (ui.eraKey !== state.era) {
    ui.eraKey = state.era;
    eraBox.innerHTML = next
      ? `<button class="era-btn" id="era-btn"><span>Avanzar a la <b>${next.name}</b></span><small>Producción x2 · nuevas construcciones y mejoras · ruinas más valiosas</small><span class="ecost"></span></button>`
      : '<div class="era-max">Has llegado a la última era disponible (de momento).</div>';
  }
  if (next) {
    const cost = scaledCost(next.cost);
    $('#era-btn').classList.toggle('can', canAfford(cost));
    eraBox.querySelector('.ecost').innerHTML = costHtml(cost);
  }

  // prestigio
  const canP = state.era >= 1;
  if (ui.pKey !== canP) {
    ui.pKey = canP;
    $('#prestige-box').innerHTML = canP
      ? `<button class="prestige-btn" id="prestige-btn">Dejar pasar 1000 años<small>Entierra tu civilización y empieza encima de sus ruinas</small></button>`
      : '<div class="prestige-locked">Llega a la <b>Edad del Bronce</b> para poder enterrar tu civilización.</div>';
  }

  // excavación
  const pc = picoCost(), ac = arqCost();
  $('#pico-lvl').textContent = `nv ${state.pico}`;
  $('#pico-cost').innerHTML = costHtml(pc);
  $('[data-tool="pico"]').classList.toggle('can', canAfford(pc));
  $('#arq-n').textContent = `(${state.arq})`;
  $('#arq-cost').innerHTML = costHtml(ac);
  $('[data-tool="arq"]').classList.toggle('can', canAfford(ac));
  $('#dig-stats').textContent = `${fmt(D.dig * comboMult())} por golpe · ${Math.round(D.crit * 100)}% crít · arqueólogos ${fmt(D.arqDps)}/s`;
  const cb = $('#combo');
  cb.textContent = ui.combo >= 3 ? `RACHA x${comboMult().toFixed(2).replace('.', ',')}` : '';
  cb.className = 'combo' + (ui.combo >= 40 ? ' hot3' : ui.combo >= 20 ? ' hot2' : ui.combo >= 8 ? ' hot1' : '');
  $('#strata').classList.toggle('hot', ui.combo >= 20);

  // oráculo
  const sp = $('#spin');
  if (sp) {
    const c = spinCost();
    $('#spin-cost').innerHTML = costHtml(c);
    sp.disabled = ui.spinning;
    sp.classList.toggle('can', canAfford(c) && !ui.spinning);
  }

  // suceso en curso: los botones se activan o no según puedas pagar
  if (ui.event && !ui.event.resolved) {
    $('#event').querySelectorAll('[data-ev]').forEach(b => {
      const c = ui.event.costs[+b.dataset.ev];
      if (c) b.disabled = !canAfford(c);
    });
  }

  // taller
  document.querySelectorAll('#tab-workshop .perm').forEach(e => {
    const p = PERMS.find(x => x.id === e.dataset.perm);
    const l = lvl(p.id), maxed = l >= p.max, c = permCost(p);
    e.classList.toggle('can', !maxed && state.frag >= c);
    e.classList.toggle('maxed', maxed);
    e.querySelector('em').textContent = `nv ${l}${maxed ? ' · máx' : ''}`;
    e.querySelector('.bcost').innerHTML = maxed ? '' : `<span class="${state.frag >= c ? '' : 'no'}">${spr('frag', 14)} ${fmt(c)}</span>`;
  });
  const canPerm = PERMS.some(p => lvl(p.id) < p.max && state.frag >= permCost(p));
  $('#tabs [data-tab="workshop"]').innerHTML = canPerm ? 'Taller <span class="badge">!</span>' : 'Taller';
}

// =====================================================================
// BUCLE
// =====================================================================
function produce(sec) {
  for (const r in D.rates) {
    const g = D.rates[r] * sec;
    state.res[r] += g;
    state.produced[r] += g;
  }
}

function offline(sec) {
  sec = Math.min(sec, 7200);
  // los buffs no cuentan mientras no estás
  state.buffs = [];
  recalc();
  const before = { ...state.res };
  produce(sec);
  const gains = Object.keys(RES).filter(r => state.res[r] - before[r] >= 1)
    .map(r => `${spr(RES[r].spr, 14)} +${fmt(state.res[r] - before[r])}`).join(' · ');
  if (gains && sec > 30) toast(`<div><b>Mientras no estabas</b> (${Math.round(sec / 60)} min)<br>${gains}</div>`);
}

let lastFrame = performance.now(), lastWall = Date.now(), uiT = 0, saveT = 0;
function frame(now) {
  const wall = Date.now();
  let dt = (now - lastFrame) / 1000;
  const gap = (wall - lastWall) / 1000;
  lastFrame = now;
  lastWall = wall;
  if (gap > 3) { offline(gap); dt = 0; }
  dt = Math.min(dt, 0.25);

  recalc();
  produce(dt);
  if (D.arqDps > 0) {
    ui.arqT += dt;
    if (ui.arqT >= 0.5) { ui.arqT -= 0.5; autoDig(D.arqDps * 0.5); }
  }
  if (ui.comboT > 0) { ui.comboT -= dt; if (ui.comboT <= 0) ui.combo = 0; }
  ui.pipT -= dt;

  // ciclos de producción de cada edificio
  for (const id in ui.bEls) {
    const E = ui.bEls[id];
    if (!state.b[id]) { E.cyc.style.width = '0%'; continue; }
    ui.cyc[id] = (ui.cyc[id] || 0) + dt / BUILDINGS[id].cycle;
    if (ui.cyc[id] >= 1) { ui.cyc[id] %= 1; cyclePop(id); }
    E.cyc.style.width = (ui.cyc[id] * 100) + '%';
  }

  const calm = !document.hidden && $('#modal').classList.contains('hidden');
  ui.cometT -= dt;
  if (ui.cometT <= 0) {
    ui.cometT = rand(60, 150) / (1 + 0.15 * lvl('cometas'));
    if (calm) spawnComet();
  }
  if (!ui.event) {
    ui.eventT -= dt;
    if (ui.eventT <= 0 && calm && state.b.granja > 0) showEvent();
  } else if (!ui.event.resolved) {
    const k = (Date.now() - ui.event.start) / ui.event.dur;
    const bar = $('#event .ev-timer i');
    if (bar) bar.style.width = (100 - k * 100) + '%';
    if (k >= 1) {
      ui.event.resolved = true;
      $('#event .ev-opts').innerHTML = '<p class="ev-result">No te decidiste a tiempo. La ocasión pasó.</p>';
      setTimeout(closeEvent, 2500);
    }
  }
  ui.achT += dt;
  if (ui.achT >= 1) { ui.achT = 0; checkAchievements(); }

  fxStep(dt);
  flyStep(dt);
  if (now - village.lastDraw > 66) { village.lastDraw = now; drawVillage(now); }

  uiT += dt;
  if (uiT >= 0.1) { uiT = 0; update(); }
  saveT += dt;
  if (saveT >= 10) { saveT = 0; save(); }
  requestAnimationFrame(frame);
}

// =====================================================================
// EVENTOS DEL NAVEGADOR
// =====================================================================
function bindEvents() {
  $('#gather').addEventListener('pointerdown', e => { e.preventDefault(); gather(e.clientX, e.clientY); });

  $('#buy-amt').addEventListener('click', e => {
    const b = e.target.closest('[data-amt]');
    if (!b) return;
    ui.buyAmt = b.dataset.amt === 'max' ? 'max' : +b.dataset.amt;
    $('#buy-amt').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    update();
  });

  $('#buildings').addEventListener('click', e => {
    const row = e.target.closest('[data-b]');
    if (row) buyBuilding(row.dataset.b, row);
  });
  $('#upgrades').addEventListener('click', e => {
    const u = e.target.closest('[data-u]');
    if (u) buyUpgrade(u.dataset.u, u);
  });
  $('#era-box').addEventListener('click', e => { if (e.target.closest('#era-btn')) advanceEra(); });
  $('#prestige-box').addEventListener('click', e => { if (e.target.closest('#prestige-btn')) openPrestige(); });
  $('#dig-tools').addEventListener('click', e => {
    const t = e.target.closest('[data-tool]');
    if (t) buyTool(t.dataset.tool, t);
  });

  $('#strata').addEventListener('pointerdown', e => {
    const blk = e.target.closest('.block');
    if (blk && !blk.classList.contains('broken')) {
      e.preventDefault();
      playerHit(+blk.dataset.bi, e.clientX, e.clientY);
      return;
    }
    if (e.target.closest('.abyss')) {
      state.stats.abyss++;
      sfx.abyss();
      shake(1);
      const msg = state.tablets >= TABLETS.length ? 'Se está abriendo… vuelve pronto.' : 'Demasiado dura… por ahora.';
      floatText(e.clientX, e.clientY - 10, msg, 'f-fail');
    }
  });

  $('#event').addEventListener('click', e => {
    const b = e.target.closest('[data-ev]');
    if (b && !b.disabled) chooseEvent(+b.dataset.ev);
  });

  $('#tabs').addEventListener('click', e => {
    const b = e.target.closest('[data-tab]');
    if (!b) return;
    ui.tab = b.dataset.tab;
    document.querySelectorAll('#tabs button').forEach(x => x.classList.toggle('on', x === b));
    document.querySelectorAll('.tab').forEach(x => x.classList.toggle('on', x.id === 'tab-' + ui.tab));
    if (ui.tab === 'codex') { ui.codexNew = 0; renderCodex(); }
    if (ui.tab === 'finds') renderFinds();
  });

  $('#tab-luck').addEventListener('click', e => {
    if (e.target.closest('#spin')) return spin();
    const o = e.target.closest('[data-open]');
    if (o && !o.disabled) openAnfora(o.dataset.open);
  });
  $('#tab-finds').addEventListener('click', e => {
    const b = e.target.closest('[data-expose]');
    if (b && !b.disabled) return expose(b.dataset.expose);
    const r = e.target.closest('[data-risk]');
    if (r) riskArtifact(r.dataset.risk);
  });
  $('#tab-museum').addEventListener('click', e => {
    const b = e.target.closest('[data-retire]');
    if (b) retire(b.dataset.retire);
  });
  $('#tab-workshop').addEventListener('click', e => {
    const b = e.target.closest('[data-perm]');
    if (b) buyPerm(b.dataset.perm, b);
  });
  $('#tab-codex').addEventListener('click', e => {
    const t = e.target.closest('[data-tablet]');
    if (t) return showTablet(+t.dataset.tablet);
    const b = e.target.closest('#reset');
    if (!b) return;
    if (!b.classList.contains('armed')) {
      b.classList.add('armed');
      b.textContent = '¿Seguro? Pulsa otra vez para borrarlo TODO';
      setTimeout(() => { b.classList.remove('armed'); b.textContent = 'Borrar partida'; }, 3000);
      return;
    }
    localStorage.removeItem(SAVE_KEY);
    state = newState();
    ui.shown = null;
    ui.tex = {};
    refreshBonuses();
    recalc();
    renderAll();
    toast('Partida borrada. Todo vuelve a empezar.');
  });

  $('#mute').addEventListener('click', () => {
    state.muted = !state.muted;
    $('#mute').classList.toggle('off', state.muted);
  });

  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  addEventListener('beforeunload', save);
}

// =====================================================================
// ARRANQUE
// =====================================================================
function init() {
  state = load();
  const root = document.documentElement.style;
  [1, 2, 3].forEach(s => root.setProperty(`--crack${s}`, `url(${crackTex(s)})`));
  refreshBonuses();
  fxInit();
  buildHeader();
  renderDigTools();
  renderWorkshop();
  bindEvents();
  $('#mute').classList.toggle('off', state.muted);
  recalc();
  const away = (Date.now() - (state.last || Date.now())) / 1000;
  if (away > 10) offline(away);
  renderAll();
  requestAnimationFrame(frame);
}

init();
