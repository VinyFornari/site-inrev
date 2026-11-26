#!/usr/bin/env node
/**
 * Gera a home estática: JSX compilado com esbuild, React de produção
 * local e fontes em woff2. A saída fica na raiz (Cloudflare Pages).
 * Idempotente: regrava index.html e os assets com hash, e não mexe no blog.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const ASSETS = path.join(ROOT, 'assets');

const JS_FILES = [
  'globe.jsx',
  'space-field.jsx',
  'app.jsx',
  'sections.jsx',
  'contact-footer.jsx',
  'entry.jsx',
];

const FONTS = [
  ['dm-sans-latin.woff2', '__DM_SANS_LATIN__', true],
  ['dm-sans-latin-ext.woff2', '__DM_SANS_LATIN_EXT__', false],
  ['plus-jakarta-sans-latin.woff2', '__PJS_LATIN__', true],
  ['plus-jakarta-sans-latin-ext.woff2', '__PJS_LATIN_EXT__', false],
  ['plus-jakarta-sans-vietnamese.woff2', '__PJS_VIETNAMESE__', false],
  ['plus-jakarta-sans-cyrillic.woff2', '__PJS_CYRILLIC__', false],
];

function fail(msg) {
  console.error('build-home: ' + msg);
  process.exit(1);
}

function hash8(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex').slice(0, 8);
}

function readSrc(rel) {
  const abs = path.join(SRC, rel);
  if (!fs.existsSync(abs)) fail('arquivo ausente: src/' + rel);
  return fs.readFileSync(abs);
}

function cleanGenerated() {
  for (const name of fs.readdirSync(ASSETS)) {
    if (/^(?:app|react|react-dom)\.[0-9a-f]{8}\.js$/.test(name)) {
      fs.rmSync(path.join(ASSETS, name));
    }
  }
  fs.rmSync(path.join(ASSETS, 'fonts'), { recursive: true, force: true });
}

function writeHashed(dir, filename, buf) {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  const name = `${base}.${hash8(buf)}${ext}`;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), buf);
  return name;
}

function vendorReact(filename) {
  const abs = path.join(ROOT, 'node_modules', filename);
  if (!fs.existsSync(abs)) fail('dependência ausente: ' + filename + ' (npm ci)');
  const buf = fs.readFileSync(abs);
  const text = buf.toString('utf8');
  if (!text.includes('18.3.1')) fail(filename + ' não é React 18.3.1');
  if (!text.includes('production.min.js')) fail(filename + ' não é o build de produção');
  return buf;
}

async function compileApp() {
  const source = JS_FILES.map((name) => readSrc(path.join('js', name)).toString('utf8')).join('\n');
  for (const needle of ['/blog/', '/politica-de-privacidade/', '/politica-de-cookies/', 'instagram.com/inrev_cm', "animationDelay: '0.1s'"]) {
    if (!source.includes(needle)) fail('JSX sem ' + needle);
  }
  if (source.includes('__hideSplash') || source.includes('text/babel')) fail('JSX ainda referencia o splash ou o Babel');

  const result = await esbuild.transform(source, {
    loader: 'jsx',
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    minify: true,
    target: 'es2020',
    legalComments: 'none',
    charset: 'utf8',
  });
  if (result.warnings.length) {
    for (const warning of result.warnings) console.error(warning);
    fail('esbuild emitiu avisos');
  }
  const js = result.code;
  for (const needle of ['/blog/', '/politica-de-privacidade/', '/politica-de-cookies/', 'instagram.com/inrev_cm', '0.1s', 'Evolving', 'ReactDOM.createRoot', 'Fale com um Especialista', '/assets/logo-inrev.png']) {
    if (!js.includes(needle)) fail('bundle sem ' + needle);
  }
  if (js.includes('__hideSplash') || /babel/i.test(js)) fail('bundle ainda tem splash ou Babel');
  if (Buffer.byteLength(js) > 180 * 1024) fail('app.js passou de 180 KB');
  return Buffer.from(js);
}

/**
 * Pré-renderiza a home inteira com react-dom/server, rodando o mesmo bundle
 * num contexto isolado. O HTML já sai com header, hero e todas as seções;
 * no navegador o React só hidrata (hydrateRoot).
 */
function prerender(js) {
  const React = require('react');
  const { renderToString } = require('react-dom/server');
  if (React.version !== '18.3.1') fail('react do SSR não é 18.3.1');
  const ctx = { React, console, __INREV_SSR__: true };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(js, ctx, { filename: 'app.js' });
  if (typeof ctx.InrevApp !== 'function') fail('bundle não expôs InrevApp');
  const markup = renderToString(React.createElement(ctx.InrevApp));
  for (const needle of ['Evolving.', 'Fale Conosco', 'Fale com um Especialista', 'id="solutions"', 'id="expertise"', 'id="about"', 'id="contact"', '<footer', '/blog/']) {
    if (!markup.includes(needle)) fail('pré-render sem ' + needle);
  }
  if (/class="sr[ "]/.test(markup)) fail('pré-render saiu com bloco invisível (.sr)');
  return markup;
}

function buildHtml({ appName, reactName, reactDomName, fontUrls, preloads, markup }) {
  let faces = readSrc('font-faces.css').toString('utf8');
  for (const [token, url] of Object.entries(fontUrls)) {
    if (!faces.includes(token)) fail('token de fonte ausente: ' + token);
    faces = faces.split(token).join(url);
  }
  if (faces.includes('__')) fail('sobrou token de fonte no CSS');
  if (!faces.includes('font-display: swap')) fail('font-display: swap ausente');

  const homeCss = readSrc('home.css').toString('utf8');
  if (!homeCss.includes('heroFadeUp 0.45s')) fail('o fade do hero não está em 0,45s');
  if (!homeCss.includes('prefers-reduced-motion')) fail('falta prefers-reduced-motion');
  if (homeCss.includes('heroFadeUp 1s')) fail('o fade de 1s ainda está no CSS');

  const meta = readSrc('meta.html').toString('utf8').trimEnd();
  const requiredMeta = [
    '<meta charset="UTF-8">',
    'content="Consultoria de IA para PMEs em Ribeirão Preto/SP: Estratégia e Mentoria em IA, Capacitação e Cultura de IA, Automação Inteligente, Dados e Inteligência de Negócio."',
    '<link rel="canonical" href="https://www.inrev.com.br/">',
    '<meta property="og:image" content="https://www.inrev.com.br/assets/logo-inrev.png">',
    '<meta property="og:url" content="https://www.inrev.com.br/">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<meta name="twitter:image" content="https://www.inrev.com.br/assets/logo-inrev.png">',
  ];
  for (const needle of requiredMeta) {
    if (!meta.includes(needle)) fail('meta tag divergente: ' + needle);
  }

  const preloadTags = [
    '  <link rel="preload" href="/assets/logo-inrev.png" as="image">',
    ...preloads.map((href) =>
      `  <link rel="preload" href="${href}" as="font" type="font/woff2" crossorigin>`),
  ].join('\n');
  const scripts = [
    `/assets/${reactName}`,
    `/assets/${reactDomName}`,
    `/assets/${appName}`,
  ].map((src) => `  <script defer src="${src}"></script>`).join('\n');

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
${meta}
${preloadTags}
  <style>
${faces}
${homeCss}
  </style>
${scripts}
</head>
<body>
  <div id="root">${markup}</div>
</body>
</html>
`;

  const banned = ['unpkg.com', 'fonts.googleapis.com', 'fonts.gstatic.com', 'babel', '__bundler', 'text/babel', 'Unpacking', 'id="splash"', 'id="__bundler'];
  for (const needle of banned) {
    if (html.includes(needle)) fail('index.html ainda contém ' + needle);
  }
  if (!html.includes('id="root"')) fail('index.html sem #root');
  if (Buffer.byteLength(html) > 120 * 1024) fail('index.html passou de 120 KB');
  return html;
}

async function main() {
  cleanGenerated();

  const fontUrls = {};
  const preloads = [];
  const fontDir = path.join(ASSETS, 'fonts');
  for (const [filename, token, preload] of FONTS) {
    const buf = readSrc(path.join('fonts', filename));
    if (buf.slice(0, 4).toString() !== 'wOF2') fail(filename + ' não é woff2');
    const name = writeHashed(fontDir, filename, buf);
    const url = `/assets/fonts/${name}`;
    fontUrls[token] = url;
    if (preload) preloads.push(url);
  }
  // O título usa Plus Jakarta Sans. Ela entra na frente na fila de preload.
  preloads.sort((a, b) => Number(a.includes('dm-sans')) - Number(b.includes('dm-sans')));

  const reactName = writeHashed(ASSETS, 'react.js', vendorReact(path.join('react', 'umd', 'react.production.min.js')));
  const reactDomName = writeHashed(ASSETS, 'react-dom.js', vendorReact(path.join('react-dom', 'umd', 'react-dom.production.min.js')));
  const appBuf = await compileApp();
  const appName = writeHashed(ASSETS, 'app.js', appBuf);

  const markup = prerender(appBuf.toString('utf8'));
  const html = buildHtml({ appName, reactName, reactDomName, fontUrls, preloads, markup });
  fs.writeFileSync(path.join(ROOT, 'index.html'), html);

  const htmlBytes = Buffer.byteLength(html);
  console.log(`home ok: index.html ${htmlBytes} B, app ${appBuf.length} B, ${reactName}, ${reactDomName}`);
  console.log('preload: ' + preloads.join(', '));
}

main();
