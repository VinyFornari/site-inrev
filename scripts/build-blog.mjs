#!/usr/bin/env node
/**
 * Gera o blog estático, as páginas legais, 404, sitemap, RSS e robots
 * direto na raiz do repositório (saída do Cloudflare Pages).
 * Idempotente: apaga só o que ele mesmo gera e preserva /blog/img e a home.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { marked } from 'marked';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://www.inrev.com.br';
const SITE_NAME = 'Inrev Control & Management';
const PER_PAGE = 12;
const AUTHOR_DEFAULT = 'Redação Inrev';
const WHATSAPP = 'https://wa.me/5516997557604';
const INSTAGRAM = 'https://www.instagram.com/inrev_cm/';
const LINKEDIN = 'https://www.linkedin.com/company/inrev-control-management';
const MAX_IMAGE_BYTES = 250 * 1024;

const CATEGORIES = [
  'Modelos & Lançamentos',
  'Big Techs',
  'Agentes & Automação',
  'Regulação & Ética',
  'Negócios & PME',
  'Ferramentas',
  'Brasil',
];

const CATEGORY_SLUGS = {
  'Modelos & Lançamentos': 'modelos-e-lancamentos',
  'Big Techs': 'big-techs',
  'Agentes & Automação': 'agentes-e-automacao',
  'Regulação & Ética': 'regulacao-e-etica',
  'Negócios & PME': 'negocios-e-pme',
  'Ferramentas': 'ferramentas',
  'Brasil': 'brasil',
};

const MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

const NAV = [
  { label: 'Soluções', href: '/#solutions' },
  { label: 'Expertise', href: '/#expertise' },
  { label: 'Sobre', href: '/#about' },
  { label: 'Blog', href: '/blog/', key: 'blog' },
  { label: 'Contato', href: '/#contact' },
];

const PILLARS = [
  ['Estratégia & Mentoria em IA', '/#expertise'],
  ['Capacitação & Cultura de IA', '/#expertise'],
  ['Automação Inteligente', '/#expertise'],
  ['Dados & Inteligência de Negócio', '/#expertise'],
];

marked.setOptions({ gfm: true, breaks: false });

function fail(msg) {
  console.error('build-blog: ' + msg);
  process.exit(1);
}

function inside(rel) {
  const abs = path.resolve(ROOT, rel);
  if (abs !== ROOT && !abs.startsWith(ROOT + path.sep)) fail('caminho fora da raiz: ' + rel);
  return abs;
}

function write(rel, contents) {
  const abs = inside(rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, contents);
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function xml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
  }[c]));
}

function jsonLdScript(data) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${json}</script>`;
}

function absUrl(pathname) {
  return SITE + (pathname.startsWith('/') ? pathname : `/${pathname}`);
}

function isoDate(value, file) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, '0');
    const d = String(value.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const match = String(value ?? '').trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) fail(`${file}: date deve ser AAAA-MM-DD`);
  return `${match[1]}-${match[2]}-${match[3]}`;
}

function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} de ${MONTHS[m - 1]} de ${y}`;
}

function rfc822(iso) {
  return new Date(`${iso}T12:00:00-03:00`).toUTCString();
}

function isoDateTime(iso) {
  return `${iso}T08:00:00-03:00`;
}

function wordsOf(markdown) {
  const plain = String(markdown)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#+\s*/gm, '')
    .replace(/[^\p{L}\p{N}º]+/gu, ' ');
  return plain.split(/\s+/).filter(Boolean);
}

function readingMinutes(markdown) {
  return Math.max(1, Math.round(wordsOf(markdown).length / 200));
}

function splitCallout(markdown) {
  const lines = String(markdown).replace(/\r\n/g, '\n').split('\n');
  const start = lines.findIndex((line) => /^## O que isso muda para (a )?sua empresa\s*$/i.test(line.trim()));
  if (start === -1) return { before: String(markdown).trim(), callout: '', after: '' };
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^##\s+/.test(lines[i])) {
      end = i;
      break;
    }
  }
  const callout = lines.slice(start + 1, end).join('\n').trim();
  return {
    before: lines.slice(0, start).join('\n').trim(),
    callout,
    after: lines.slice(end).join('\n').trim(),
  };
}

function renderMarkdown(markdown) {
  const html = marked.parse(markdown, { async: false });
  return html.replace(/<a href="(https?:[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer"');
}

function asList(value) {
  if (value == null || value === '') return [];
  return (Array.isArray(value) ? value : [value]).map((item) => String(item));
}

function asSources(value, file) {
  if (value == null) return [];
  if (!Array.isArray(value)) fail(`${file}: sources deve ser uma lista`);
  return value.map((source, index) => {
    if (!source || typeof source !== 'object' || !source.name || !source.url) {
      fail(`${file}: sources[${index}] precisa de name e url`);
    }
    const url = String(source.url);
    if (!/^https?:\/\//i.test(url)) fail(`${file}: url de fonte inválida`);
    return { name: String(source.name), url };
  });
}

function optionalUrl(value, file, field) {
  if (value == null || value === '') return '';
  const url = String(value);
  if (!/^https?:\/\//i.test(url)) fail(`${file}: ${field} deve ser http(s)`);
  return url;
}

function assertImage(urlPath, file, extensions = ['.webp']) {
  if (!urlPath.startsWith('/blog/img/') || !extensions.some((ext) => urlPath.endsWith(ext))) {
    fail(`${file}: imagem deve estar em /blog/img/ (${extensions.join(', ')}): ${urlPath}`);
  }
  const abs = inside(urlPath.slice(1));
  if (!fs.existsSync(abs)) fail(`${file}: imagem ausente ${urlPath}`);
  const size = fs.statSync(abs).size;
  if (size > MAX_IMAGE_BYTES) fail(`${file}: ${urlPath} tem ${size} bytes (limite 250 KB)`);
  return size;
}

function loadPosts() {
  const dir = inside('content/blog');
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((name) => name.endsWith('.md')).sort();
  const posts = [];
  const slugs = new Set();
  for (const name of files) {
    const raw = fs.readFileSync(path.join(dir, name), 'utf8');
    const parsed = matter(raw);
    const data = parsed.data || {};
    if (data.draft === true) {
      console.log('rascunho ignorado: ' + name);
      continue;
    }
    const slug = String(data.slug || '').trim();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) fail(`${name}: slug inválido`);
    if (slugs.has(slug)) fail(`${name}: slug repetido ${slug}`);
    slugs.add(slug);
    const date = isoDate(data.date, name);
    if (name !== `${date}-${slug}.md`) fail(`${name}: nome esperado ${date}-${slug}.md`);
    const title = String(data.title || '').trim();
    const summary = String(data.summary || '').trim();
    const category = String(data.category || '').trim();
    if (!title) fail(`${name}: title obrigatório`);
    if (!summary) fail(`${name}: summary obrigatório`);
    if ([...summary].length > 160) fail(`${name}: summary tem ${[...summary].length} caracteres (máximo 160)`);
    if (!CATEGORY_SLUGS[category]) fail(`${name}: category deve ser uma de: ${CATEGORIES.join(' | ')}`);
    const cover = String(data.cover || '').trim();
    const coverAlt = String(data.coverAlt || '').trim();
    if (!coverAlt) fail(`${name}: coverAlt obrigatório`);
    assertImage(cover, name, ['.webp']);
    const og = cover.replace(/\.webp$/, '-og.jpg');
    assertImage(og, name, ['.jpg', '.jpeg']);
    const { before, callout, after } = splitCallout(parsed.content || '');
    const full = [before, callout, after].filter(Boolean).join('\n\n');
    posts.push({
      file: name,
      title,
      slug,
      date,
      modified: data.updated ? isoDate(data.updated, name) : date,
      summary,
      category,
      categorySlug: CATEGORY_SLUGS[category],
      tags: asList(data.tags),
      cover,
      og,
      coverAlt,
      coverCredit: String(data.coverCredit || '').trim(),
      coverCreditUrl: optionalUrl(data.coverCreditUrl, name, 'coverCreditUrl'),
      coverLicense: String(data.coverLicense || '').trim(),
      coverLicenseUrl: optionalUrl(data.coverLicenseUrl, name, 'coverLicenseUrl'),
      sources: asSources(data.sources, name),
      author: String(data.author || AUTHOR_DEFAULT).trim() || AUTHOR_DEFAULT,
      instagramUrl: optionalUrl(data.instagramUrl, name, 'instagramUrl'),
      linkedinUrl: optionalUrl(data.linkedinUrl, name, 'linkedinUrl'),
      before,
      after,
      callout,
      wordCount: wordsOf(full).length,
      minutes: readingMinutes(full),
      path: `/blog/${slug}/`,
    });
  }
  posts.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title, 'pt'));
  return posts;
}

function cleanOutput() {
  const blog = inside('blog');
  fs.mkdirSync(blog, { recursive: true });
  for (const name of fs.readdirSync(blog)) {
    if (name === 'img') continue;
    fs.rmSync(path.join(blog, name), { recursive: true, force: true });
  }
  for (const rel of ['sitemap.xml', 'robots.txt', '404.html', 'politica-de-privacidade', 'politica-de-cookies']) {
    fs.rmSync(inside(rel), { recursive: true, force: true });
  }
}

function chunk(items) {
  if (items.length === 0) return [[]];
  const pages = [];
  for (let i = 0; i < items.length; i += PER_PAGE) pages.push(items.slice(i, i + PER_PAGE));
  return pages;
}

function pagePath(base, page) {
  if (page <= 1) return base;
  return `${base}page/${page}/`;
}

const YEAR = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', year: 'numeric' }).format(new Date());

function iconInstagram() {
  return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"></circle></svg>';
}

function iconLinkedIn() {
  return '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V24h-4V8.5zM8.5 8.5h3.8v2.1h.1c.5-1 1.8-2.1 3.8-2.1 4 0 4.8 2.6 4.8 6V24h-4v-7.7c0-1.8 0-4.1-2.5-4.1s-2.9 2-2.9 4V24h-4V8.5z"></path></svg>';
}

function header(active) {
  const links = (cls) => NAV.map((item) => {
    const current = item.key && item.key === active ? ' aria-current="page"' : '';
    return `<a href="${esc(item.href)}"${current}>${esc(item.label)}</a>`;
  }).join('');
  return `<a class="skip" href="#conteudo">Ir para o conteúdo</a>
<input class="nav-toggle" type="checkbox" id="nav-toggle">
<header class="site-header">
  <div class="header-inner">
    <a class="logo" href="/"><img src="/assets/logo-inrev.png" alt="Inrev" width="124" height="32"></a>
    <nav class="header-nav" aria-label="Principal">${links('header')}</nav>
    <div class="header-tools">
      <a class="header-cta" href="${WHATSAPP}" target="_blank" rel="noopener noreferrer">Fale Conosco</a>
      <label class="menu-toggle" for="nav-toggle" aria-label="Abrir menu"><span></span><span></span><span></span></label>
    </div>
  </div>
</header>
<div class="mobile-overlay">
  <label class="mobile-backdrop" for="nav-toggle" aria-label="Fechar menu"></label>
  <nav aria-label="Menu">${links('mobile')}</nav>
</div>`;
}

function footer() {
  const pillars = PILLARS.map(([label, href]) => `<a class="ft-link" href="${esc(href)}">${esc(label)}</a>`).join('');
  return `<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-grid">
      <div>
        <a class="logo" href="/"><img src="/assets/logo-inrev.png" alt="Inrev" width="132" height="34"></a>
        <p class="blurb">Apoiamos PMEs a se adaptarem à nova economia usando inteligência artificial como alavanca de negócio. Inovação, estratégia e tecnologia para empresas em constante evolução.</p>
        <a class="footer-blog" href="/blog/">Blog</a>
      </div>
      <div>
        <p class="ft-title">Expertise</p>
        <div class="ft-list">${pillars}</div>
      </div>
      <div>
        <p class="ft-title">Contact</p>
        <div class="ft-list">
          <span class="ft-link">Av. Antônio Diederichsen, 400</span>
          <span class="ft-link">Ribeirão Preto / São Paulo</span>
          <a class="ft-link" href="mailto:atendimento@inrev.com.br">atendimento@inrev.com.br</a>
          <span class="ft-link">Seg à Sex: 9h às 17h</span>
        </div>
      </div>
      <div>
        <p class="ft-title">Social</p>
        <div class="ft-list">
          <a class="ft-link ft-social" href="${LINKEDIN}" target="_blank" rel="noopener noreferrer">${iconLinkedIn()} LinkedIn</a>
          <a class="ft-link ft-social" href="${INSTAGRAM}" target="_blank" rel="noopener noreferrer">${iconInstagram()} Instagram</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© ${YEAR} Inrev Gestão e Desenvolvimento LTDA. CNPJ 42.388.088/0001-00. Todos os direitos reservados.</p>
      <nav aria-label="Legal">
        <a class="ft-link" href="/politica-de-privacidade/">Política de Privacidade</a>
        <a class="ft-link" href="/politica-de-cookies/">Política de Cookies</a>
      </nav>
    </div>
  </div>
</footer>`;
}

function layout({
  title, description, canonical, active = null, robots = 'index,follow',
  ogType = 'website', image = '', imageAlt = '', imageWidth = '', imageHeight = '',
  published = '', modified = '', extraHead = '', jsonLd = null, body,
}) {
  const imageType = /\.jpe?g$/i.test(image)
    ? 'image/jpeg'
    : /\.png$/i.test(image)
      ? 'image/png'
      : /\.webp$/i.test(image)
        ? 'image/webp'
        : '';
  const imageTags = image ? `
  <meta property="og:image" content="${esc(image)}">
  ${imageType ? `<meta property="og:image:type" content="${imageType}">` : ''}
  ${imageWidth ? `<meta property="og:image:width" content="${esc(imageWidth)}">` : ''}
  ${imageHeight ? `<meta property="og:image:height" content="${esc(imageHeight)}">` : ''}
  <meta property="og:image:alt" content="${esc(imageAlt || title)}">
  <meta name="twitter:image" content="${esc(image)}">` : '';
  const articleTags = published ? `
  <meta property="article:published_time" content="${esc(published)}">
  <meta property="article:modified_time" content="${esc(modified || published)}">` : '';
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="${esc(robots)}">
  <link rel="canonical" href="${esc(canonical)}">
  <link rel="icon" href="/assets/favicon.png" type="image/png">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="${esc(SITE_NAME)}">
  <meta property="og:type" content="${esc(ogType)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${esc(canonical)}">
  ${imageTags}
  <meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  ${articleTags}
  ${extraHead}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&amp;family=Plus+Jakarta+Sans:wght@500;600;700;800&amp;display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/blog/blog.css">
  ${jsonLd ? jsonLdScript(jsonLd) : ''}
</head>
<body>
${header(active)}
${body}
${footer()}
</body>
</html>
`;
}

function card(post) {
  return `<article class="card">
  <a class="card-media" href="${esc(post.path)}" tabindex="-1" aria-hidden="true"><img src="${esc(post.cover)}" alt="" width="1600" height="900"></a>
  <div class="card-body">
    <a class="pill small" href="/blog/categoria/${esc(post.categorySlug)}/">${esc(post.category)}</a>
    <h2><a href="${esc(post.path)}">${esc(post.title)}</a></h2>
    <p>${esc(post.summary)}</p>
    <p class="card-meta"><time datetime="${esc(post.date)}">${esc(formatDate(post.date))}</time> · ${post.minutes} min de leitura</p>
  </div>
</article>`;
}

function pager(base, page, total) {
  if (total <= 1) return '';
  const prev = page > 1 ? `<a href="${esc(pagePath(base, page - 1))}" rel="prev">Anterior</a>` : '<span>Anterior</span>';
  const next = page < total ? `<a href="${esc(pagePath(base, page + 1))}" rel="next">Próxima</a>` : '<span>Próxima</span>';
  return `<nav class="pager" aria-label="Paginação">${prev}<span>Página ${page} de ${total}</span>${next}</nav>`;
}

function chips(posts, currentSlug) {
  const present = new Set(posts.map((post) => post.category));
  const items = [`<a class="chip${currentSlug ? '' : ' is-active'}" href="/blog/">Todas</a>`];
  for (const name of CATEGORIES) {
    if (!present.has(name)) continue;
    const slug = CATEGORY_SLUGS[name];
    items.push(`<a class="chip${slug === currentSlug ? ' is-active' : ''}" href="/blog/categoria/${slug}/">${esc(name)}</a>`);
  }
  items.push('<a class="rss-link" href="/blog/rss.xml">RSS</a>');
  return `<div class="toolbar">${items.join('')}</div>`;
}

function listingJsonLd(name, url, description, posts) {
  return {
    '@context': 'https://schema.org',
    '@type': ['Blog', 'CollectionPage'],
    name,
    url,
    description,
    inLanguage: 'pt-BR',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE + '/' },
    publisher: publisher(),
    blogPost: posts.slice(0, PER_PAGE).map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: absUrl(post.path),
      datePublished: isoDateTime(post.date),
      image: absUrl(post.og),
    })),
  };
}

function publisher() {
  return {
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE + '/',
    logo: {
      '@type': 'ImageObject',
      url: absUrl('/assets/logo-inrev.png'),
    },
  };
}

function renderListing({ posts, pageItems, page, total, base, title, description, h1, kicker, currentSlug }) {
  const pathname = pagePath(base, page);
  const canonical = absUrl(pathname);
  const prev = page > 1 ? `<link rel="prev" href="${esc(absUrl(pagePath(base, page - 1)))}">` : '';
  const next = page < total ? `<link rel="next" href="${esc(absUrl(pagePath(base, page + 1)))}">` : '';
  const grid = pageItems.length
    ? `<div class="cards">${pageItems.map(card).join('')}</div>`
    : '<p class="empty">Nenhuma notícia publicada ainda.</p>';
  const body = `<main id="conteudo">
  <div class="wrap">
    <header class="page-intro">
      <p class="kicker">${esc(kicker)}</p>
      <h1>${esc(h1)}</h1>
      <p class="lede">${esc(description)}</p>
      ${chips(posts, currentSlug)}
    </header>
    ${grid}
    ${pager(base, page, total)}
  </div>
</main>`;
  return layout({
    title,
    description,
    canonical,
    active: 'blog',
    extraHead: `${prev}${next}<link rel="alternate" type="application/rss+xml" title="Blog da Inrev" href="${esc(absUrl('/blog/rss.xml'))}">`,
    jsonLd: listingJsonLd(h1, canonical, description, pageItems),
    body,
  });
}

function credit(post) {
  if (!post.coverCredit && !post.coverCreditUrl) return '';
  const bits = [esc(post.coverCredit)];
  if (post.coverCreditUrl) {
    bits.push(`<a href="${esc(post.coverCreditUrl)}" target="_blank" rel="noopener noreferrer">arquivo original</a>`);
  }
  if (post.coverLicenseUrl) {
    bits.push(`<a href="${esc(post.coverLicenseUrl)}" target="_blank" rel="noopener noreferrer">${esc(post.coverLicense || 'licença')}</a>`);
  }
  return `<p class="credit">Foto: ${bits.filter(Boolean).join(' · ')}</p>`;
}

function related(post, posts) {
  const same = posts.filter((item) => item.slug !== post.slug && item.category === post.category);
  const rest = posts.filter((item) => item.slug !== post.slug && item.category !== post.category);
  const picks = [...same, ...rest].slice(0, 3);
  if (!picks.length) return '';
  return `<section class="related"><div class="wrap"><h2>Continuar lendo</h2><div class="cards">${picks.map(card).join('')}</div></div></section>`;
}

function renderArticle(post, posts) {
  const canonical = absUrl(post.path);
  const shareText = encodeURIComponent(`${post.title} ${canonical}`);
  const shareUrl = encodeURIComponent(canonical);
  const also = [
    post.instagramUrl ? `<a href="${esc(post.instagramUrl)}" target="_blank" rel="noopener noreferrer">Instagram</a>` : '',
    post.linkedinUrl ? `<a href="${esc(post.linkedinUrl)}" target="_blank" rel="noopener noreferrer">LinkedIn</a>` : '',
  ].filter(Boolean);
  const sources = post.sources.length
    ? `<section class="sources"><h2>Fontes</h2><ul>${post.sources.map((source) => `<li><a href="${esc(source.url)}" target="_blank" rel="noopener nofollow noreferrer">${esc(source.name)}</a></li>`).join('')}</ul></section>`
    : '';
  const body = `<main id="conteudo">
  <article class="wrap">
    <header class="article-head">
      <p class="crumb"><a href="/">Início</a> · <a href="/blog/">Blog</a> · <a href="/blog/categoria/${esc(post.categorySlug)}/">${esc(post.category)}</a></p>
      <a class="pill" href="/blog/categoria/${esc(post.categorySlug)}/">${esc(post.category)}</a>
      <h1>${esc(post.title)}</h1>
      <p class="lede">${esc(post.summary)}</p>
      <p class="byline"><time datetime="${esc(post.date)}">${esc(formatDate(post.date))}</time> · ${post.minutes} min de leitura · <strong>${esc(post.author)}</strong></p>
    </header>
    <figure class="cover-frame">
      <img src="${esc(post.cover)}" alt="${esc(post.coverAlt)}" width="1600" height="900">
      ${credit(post)}
    </figure>
    <div class="prose">${renderMarkdown(post.before)}</div>
    ${post.callout ? `<aside class="callout">
      <h2>O que isso muda para a sua empresa</h2>
      <div class="prose">${renderMarkdown(post.callout)}</div>
    </aside>` : ''}
    ${post.after ? `<div class="prose">${renderMarkdown(post.after)}</div>` : ''}
    ${sources}
    <section class="share">
      <h2>Compartilhar</h2>
      <div class="share-row">
        <a class="share-btn" href="https://wa.me/?text=${shareText}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
        <a class="share-btn" href="https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a class="share-btn" href="https://twitter.com/intent/tweet?url=${shareUrl}&amp;text=${encodeURIComponent(post.title)}" target="_blank" rel="noopener noreferrer">X</a>
        <button class="share-btn" type="button" data-copy>Copiar link</button>
      </div>
    </section>
    ${also.length ? `<p class="also">Este tema também está no ${also.join(' e no ')}.</p>` : ''}
    <p class="follow">Acompanhe a Inrev no <a href="${INSTAGRAM}" target="_blank" rel="noopener noreferrer">Instagram @inrev_cm</a>.</p>
    <aside class="cta">
      <h2>Vamos aplicar isso na sua operação?</h2>
      <p>A Inrev apoia PMEs em estratégia, cultura, automação e dados com inteligência artificial.</p>
      <div class="cta-actions">
        <a class="header-cta" href="${WHATSAPP}?text=${encodeURIComponent('Olá, li o artigo "' + post.title + '" no blog da Inrev e quero conversar.')}" target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
        <a class="ghost" href="/#contact">Ou envie uma mensagem</a>
      </div>
    </aside>
  </article>
  ${related(post, posts)}
</main>
<script>
document.querySelector('[data-copy]')?.addEventListener('click', async function (event) {
  var button = event.currentTarget;
  try {
    await navigator.clipboard.writeText(location.href);
    button.textContent = 'Link copiado';
  } catch (err) {
    button.textContent = 'Copie a URL do navegador';
  }
});
</script>`;
  return layout({
    title: `${post.title} | Blog da Inrev`,
    description: post.summary,
    canonical,
    active: 'blog',
    ogType: 'article',
    image: absUrl(post.og),
    imageAlt: post.coverAlt,
    imageWidth: '1200',
    imageHeight: '630',
    published: isoDateTime(post.date),
    modified: isoDateTime(post.modified),
    extraHead: `<link rel="alternate" type="application/rss+xml" title="Blog da Inrev" href="${esc(absUrl('/blog/rss.xml'))}">`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: post.title,
      description: post.summary,
      image: [absUrl(post.og), absUrl(post.cover)],
      datePublished: isoDateTime(post.date),
      dateModified: isoDateTime(post.modified),
      inLanguage: 'pt-BR',
      mainEntityOfPage: canonical,
      articleSection: post.category,
      keywords: post.tags.join(', '),
      author: { '@type': 'Organization', name: post.author, url: SITE + '/' },
      publisher: publisher(),
    },
    body,
  });
}

function legalLayout(title, description, pathname, inner) {
  const body = `<main id="conteudo"><div class="wrap narrow">
    <p class="crumb"><a href="/">Início</a> · ${esc(title)}</p>
    <h1>${esc(title)}</h1>
    <p class="byline">Atualizada em 26 de novembro de 2026</p>
    <div class="prose">${inner}</div>
  </div></main>`;
  return layout({
    title: `${title} | ${SITE_NAME}`,
    description,
    canonical: absUrl(pathname),
    body,
  });
}

function privacyHtml() {
  return `<p>A Inrev Control &amp; Management, nome fantasia de Inrev Gestão e Desenvolvimento LTDA, CNPJ 42.388.088/0001-00, com endereço na Av. Antônio Diederichsen, 400, Ribeirão Preto/SP, é a controladora dos dados pessoais tratados em conexão com este site. Para pedidos sobre privacidade, escreva para <a href="mailto:vinicius@inrev.com.br">vinicius@inrev.com.br</a>.</p>
<h2>Quais dados entram em contato conosco</h2>
<p>O formulário do site não grava dados em banco da Inrev. Ao enviar, o navegador abre o seu programa de e-mail para vinicius@inrev.com.br, com o nome, o e-mail, o telefone e a mensagem que você escreveu. A partir daí, a mensagem fica na caixa de e-mail usada para responder contatos.</p>
<p>A hospedagem é da Cloudflare. A entrega e a proteção do site podem tratar endereço IP e dados técnicos da requisição, segundo a política da própria Cloudflare. Este site, nesta versão, não instala ferramenta de analytics, pixel de anúncio nem cookie de marketing.</p>
<h2>Para que usamos</h2>
<ul>
  <li>Responder o contato e, se for o caso, preparar uma proposta.</li>
  <li>Manter o site no ar e protegido.</li>
  <li>Cumprir obrigação legal ou pedido de autoridade.</li>
</ul>
<h2>Bases da LGPD</h2>
<p>Conforme o caso, o tratamento se apoia em procedimentos preliminares ou execução de contrato, legítimo interesse (segurança do site e resposta a quem nos procura) ou obrigação legal. Quando uma atividade depender de consentimento, ele será pedido de forma específica.</p>
<h2>Com quem compartilhamos</h2>
<p>Não vendemos dados pessoais. A mensagem que você envia chega à caixa indicada acima e passa pelo provedor de e-mail. A Cloudflare trata dados técnicos da hospedagem. Só compartilhamos dado com autoridade quando a lei exigir.</p>
<h2>Por quanto tempo</h2>
<p>Mensagens de contato ficam pelo tempo necessário para responder e para o registro comercial ou legal correspondente. Não mantemos cadastro próprio de navegação neste site.</p>
<h2>Seus direitos</h2>
<p>Você pode pedir confirmação de tratamento, acesso, correção, anonimização, portabilidade, eliminação, informação sobre compartilhamento e revogação de consentimento, nos termos da Lei 13.709/2018. Escreva para vinicius@inrev.com.br. Também é possível peticionar à Autoridade Nacional de Proteção de Dados.</p>
<h2>Segurança e crianças</h2>
<p>O site é servido com HTTPS e o acesso à caixa de contato é restrito. Nenhum meio eletrônico é isento de risco. Este site não se dirige a crianças.</p>
<h2>Atualizações</h2>
<p>Se esta política mudar, a data no topo da página muda junto. O uso do site depois da publicação indica ciência da nova versão. Se a mudança exigir consentimento, pediremos antes de seguir.</p>
<p>Veja também a <a href="/politica-de-cookies/">Política de Cookies</a>.</p>`;
}

function cookiesHtml() {
  return `<p>A Inrev Control &amp; Management (Inrev Gestão e Desenvolvimento LTDA, CNPJ 42.388.088/0001-00) usa esta página para explicar cookies neste site. Dúvidas: <a href="mailto:vinicius@inrev.com.br">vinicius@inrev.com.br</a>.</p>
<h2>O que é um cookie</h2>
<p>Cookie é um pequeno arquivo que o site pode gravar no navegador. Serve para lembrar uma escolha, manter uma sessão ou, em outros sites, medir audiência e anúncio. Há também tecnologias parecidas, como armazenamento local.</p>
<h2>O que este site usa hoje</h2>
<p>O site da Inrev não instala cookie de analytics, de publicidade nem de rede social. Não há banner de consentimento porque não há esse tipo de cookie da Inrev para aceitar.</p>
<p>A hospedagem na Cloudflare pode usar cookie estritamente necessário à segurança e ao funcionamento da rede, por exemplo para distinguir tráfego automatizado. Esse uso é da infraestrutura, não é medição de audiência da Inrev. Detalhes estão na documentação pública da Cloudflare.</p>
<h2>Como controlar no navegador</h2>
<p>Você pode apagar ou bloquear cookies nas configurações do navegador. Bloquear cookies necessários da rede pode afetar a abertura do site. Como não usamos cookie de marketing, recusar esse tipo de cookie não muda o conteúdo público das páginas.</p>
<h2>Se isso mudar</h2>
<p>Se no futuro passarmos a usar analytics ou outro cookie não essencial, esta política será atualizada antes, e o aviso exigido pela LGPD será mostrado na hora. Até lá, o tratamento de dados de contato está na <a href="/politica-de-privacidade/">Política de Privacidade</a>.</p>`;
}

function render404() {
  const body = `<main id="conteudo"><div class="wrap narrow">
    <p class="kicker">Erro 404</p>
    <h1>Página não encontrada</h1>
    <p class="lede">Esse endereço não existe no site da Inrev. A home e o blog continuam no ar.</p>
    <p class="cta-actions" style="margin-top:24px">
      <a class="header-cta" href="/">Ir para a home</a>
      <a class="ghost" href="/blog/" style="color:#0F1926">Ver o blog</a>
    </p>
  </div></main>`;
  return layout({
    title: `Página não encontrada | ${SITE_NAME}`,
    description: 'O endereço não existe no site da Inrev.',
    canonical: absUrl('/404.html'),
    robots: 'noindex,follow',
    body,
  });
}

function robotsTxt() {
  return `# robots.txt da Inrev.
# Em produção, a Cloudflare pode servir um robots.txt gerido (Content Signals,
# hoje search=yes, ai-train=no, use=reference, com Disallow para crawlers de treino).
# Este arquivo repete o sinal e publica o Sitemap. Não afrouxa ai-train.
# Depois do deploy, confira https://www.inrev.com.br/robots.txt: o bloco gerido
# e a linha Sitemap precisam continuar visíveis.

User-agent: *
Content-Signal: search=yes, ai-train=no, use=reference
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;
}

function sitemap(posts) {
  const last = posts[0]?.date || '2026-11-26';
  const urls = [
    { loc: SITE + '/', lastmod: last, priority: '1.0' },
    { loc: absUrl('/blog/'), lastmod: last, priority: '0.8' },
    ...[...new Set(posts.map((post) => post.categorySlug))].map((slug) => ({
      loc: absUrl(`/blog/categoria/${slug}/`),
      lastmod: posts.find((post) => post.categorySlug === slug).date,
      priority: '0.5',
    })),
    ...posts.map((post) => ({ loc: absUrl(post.path), lastmod: post.modified, priority: '0.7' })),
    { loc: absUrl('/politica-de-privacidade/'), lastmod: '2026-11-26', priority: '0.3' },
    { loc: absUrl('/politica-de-cookies/'), lastmod: '2026-11-26', priority: '0.3' },
  ];
  const body = urls.map((url) => `  <url><loc>${xml(url.loc)}</loc><lastmod>${xml(url.lastmod)}</lastmod><priority>${url.priority}</priority></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function rss(posts) {
  const last = posts[0] ? rfc822(posts[0].date) : rfc822('2026-11-26');
  const items = posts.map((post) => `  <item>
    <title>${xml(post.title)}</title>
    <link>${xml(absUrl(post.path))}</link>
    <guid isPermaLink="true">${xml(absUrl(post.path))}</guid>
    <pubDate>${xml(rfc822(post.date))}</pubDate>
    <category>${xml(post.category)}</category>
    <description>${xml(post.summary)}</description>
  </item>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>Blog da Inrev</title>
  <link>${xml(absUrl('/blog/'))}</link>
  <description>Notícias e análises da Inrev sobre inteligência artificial para PMEs.</description>
  <language>pt-BR</language>
  <lastBuildDate>${xml(last)}</lastBuildDate>
${items}
</channel>
</rss>
`;
}

const PAGES_PRIVATE_FILES = [
  'package.json',
  'package-lock.json',
  'README.md',
  '.gitignore',
  '.node-version',
  '.DS_Store',
  '.thumbnail',
  'app.jsx',
  'sections.jsx',
  'contact-footer.jsx',
  'globe.jsx',
  'space-field.jsx',
  'assets/logo-base64.txt',
];

function stripRepoFilesFromPagesOutput() {
  // A Pages não aplica status 404 em _redirects (só 301/302/307/308 e proxy 200).
  // Com a saída na raiz, apagar estes arquivos no build da Pages faz o caminho
  // cair na 404.html. O build local não apaga o repositório.
  if (process.env.CF_PAGES !== '1') {
    console.log('arquivos do repositório mantidos (build fora da Cloudflare Pages)');
    return;
  }
  for (const rel of PAGES_PRIVATE_FILES) fs.rmSync(inside(rel), { force: true });
  for (const rel of ['scripts', 'content', 'src', 'node_modules']) {
    fs.rmSync(inside(rel), { recursive: true, force: true });
  }
  console.log('arquivos do repositório removidos da saída da Pages');
}

function main() {
  const homePath = inside('index.html');
  const homeBefore = fs.readFileSync(homePath);
  cleanOutput();
  fs.copyFileSync(inside('scripts/blog.css'), inside('blog/blog.css'));

  const posts = loadPosts();
  const blogDescription = 'Notícias e análises da Inrev sobre inteligência artificial para PMEs: agentes, ferramentas, regulação e o que muda na operação.';

  const blogPages = chunk(posts);
  blogPages.forEach((pageItems, index) => {
    const page = index + 1;
    const html = renderListing({
      posts,
      pageItems,
      page,
      total: blogPages.length,
      base: '/blog/',
      title: page === 1 ? `Blog | ${SITE_NAME}` : `Blog — página ${page} | ${SITE_NAME}`,
      description: blogDescription,
      h1: 'Blog',
      kicker: 'Inrev',
      currentSlug: '',
    });
    write(page === 1 ? 'blog/index.html' : `blog/page/${page}/index.html`, html);
  });

  const byCategory = new Map();
  for (const post of posts) {
    if (!byCategory.has(post.category)) byCategory.set(post.category, []);
    byCategory.get(post.category).push(post);
  }
  for (const [category, items] of byCategory) {
    const slug = CATEGORY_SLUGS[category];
    const description = `Artigos da Inrev sobre ${category}: o que muda para PMEs.`;
    const pages = chunk(items);
    pages.forEach((pageItems, index) => {
      const page = index + 1;
      const html = renderListing({
        posts,
        pageItems,
        page,
        total: pages.length,
        base: `/blog/categoria/${slug}/`,
        title: page === 1 ? `${category} | Blog da Inrev` : `${category} — página ${page} | Blog da Inrev`,
        description,
        h1: category,
        kicker: 'Categoria',
        currentSlug: slug,
      });
      const rel = page === 1
        ? `blog/categoria/${slug}/index.html`
        : `blog/categoria/${slug}/page/${page}/index.html`;
      write(rel, html);
    });
  }

  for (const post of posts) write(`blog/${post.slug}/index.html`, renderArticle(post, posts));

  write('politica-de-privacidade/index.html', legalLayout(
    'Política de Privacidade',
    'Como a Inrev Control & Management trata dados pessoais neste site, em linha com a LGPD.',
    '/politica-de-privacidade/',
    privacyHtml(),
  ));
  write('politica-de-cookies/index.html', legalLayout(
    'Política de Cookies',
    'Cookies usados no site da Inrev Control & Management e como controlá-los no navegador.',
    '/politica-de-cookies/',
    cookiesHtml(),
  ));
  write('404.html', render404());
  write('sitemap.xml', sitemap(posts));
  write('blog/rss.xml', rss(posts));
  write('robots.txt', robotsTxt());

  const homeAfter = fs.readFileSync(homePath);
  if (!homeBefore.equals(homeAfter)) fail('o build alterou index.html');
  stripRepoFilesFromPagesOutput();
  for (const post of posts) {
    console.log(`${post.date} ${post.slug} · ${post.wordCount} palavras · ${post.minutes} min`);
  }
  console.log(`build ok: ${posts.length} artigo(s), saída na raiz`);
}

main();
