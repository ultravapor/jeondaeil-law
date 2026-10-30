// 빌드 결과(dist)를 크롤러의 눈으로 점검한다. 하나라도 어긋나면 실패.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';

const site = 'https://ywdaeillaw.com';
const dist = new URL('../dist/', import.meta.url);
const root = fileURLToPath(dist);
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
}
const pages = new Map();
const titles = new Set();
const descriptions = new Set();
const authorId = site + '/#lawyer';
for (const file of walk(root).filter(f => f.endsWith('.html'))) {
  const path = '/' + relative(root, file).split(sep).join('/').replace(/index\.html$/, '');
  if (path === '/404.html') continue;
  const $ = load(readFileSync(file, 'utf8'));
  const canonical = site + path;
  assert.equal($('h1').length, 1, `${path}: one H1`);
  assert.equal($('link[rel=canonical]').attr('href'), canonical, `${path}: canonical`);
  assert.equal($('meta[property="og:url"]').attr('content'), canonical);
  assert(!$('meta[name=robots]').attr('content').includes('noindex'), `${path}: indexable`);
  const title = $('title').text();
  const description = $('meta[name=description]').attr('content');
  assert(title && !titles.has(title), `${path}: unique title`);
  assert(description && !descriptions.has(description), `${path}: unique description`);
  titles.add(title); descriptions.add(description);
  // 본문이 JS 없이 HTML에 있어야 한다
  assert($('main').text().trim().length > 200, `${path}: main text present`);
  // 전역 엔티티는 @graph 한 덩어리로 출력되므로 펼쳐서 본다
  const blocks = $('script[type="application/ld+json"]').toArray().flatMap(e => { const j = JSON.parse($(e).text()); return j['@graph'] ?? [j]; });
  const person = blocks.find(b => b['@type'] === 'Person');
  const website = blocks.find(b => b['@type'] === 'WebSite');
  const office = blocks.find(b => b['@type'] === 'LegalService');
  assert.equal(person['@id'], authorId);
  assert.equal(website.publisher['@id'], authorId);
  assert.equal(office.employee['@id'], authorId, `${path}: LegalService → Person`);
  assert($('body').text().includes(office.telephone.replace('+82-', '0')), `${path}: phone visible`);
  for (const faq of blocks.filter(b => b['@type'] === 'FAQPage')) {
    const visible = $('.faq details').toArray().map(e => ({ q: $(e).find('summary').text(), a: $(e).find('p').text() }));
    assert.deepEqual(faq.mainEntity.map(q => ({ q: q.name, a: q.acceptedAnswer.text })), visible, `${path}: FAQ matches visible content`);
  }
  const article = blocks.find(b => b['@type'] === 'Article' && b.author);
  if (article) {
    assert.equal(article.url, canonical);
    assert.equal(article.headline, $('h1').text(), `${path}: headline = H1`);
    assert.equal(article.author['@id'], authorId);
    assert(new Date(article.dateModified) >= new Date(article.datePublished));
    assert($('.answer').text().trim(), `${path}: direct answer present`);
  }
  pages.set(path, $);
}
for (const [path, $] of pages) {
  for (const e of $('a[href]').toArray()) {
    const url = new URL($(e).attr('href'), site + path);
    if (url.origin !== site) continue;
    const target = pages.get(url.pathname);
    assert(target || existsSync(join(root, url.pathname)), `${path}: broken internal link ${url.href}`);
  }
}
const sitemap = load(readFileSync(new URL('sitemap-0.xml', dist), 'utf8'), { xmlMode: true });
assert.deepEqual(
  new Set(sitemap('loc').toArray().map(e => sitemap(e).text())),
  new Set([...pages.keys()].map(p => site + p)),
  'sitemap = all pages',
);
const robots = readFileSync(new URL('robots.txt', dist), 'utf8');
assert.match(robots, /User-agent: OAI-SearchBot\s+Allow: \//);
assert.match(robots, /Sitemap: https:\/\/ywdaeillaw.com\/sitemap-index.xml/);
const llms = readFileSync(new URL('llms.txt', dist), 'utf8');
for (const [, url] of llms.matchAll(/\]\((https:[^)]+)\)/g)) assert(pages.has(new URL(url).pathname), `llms.txt: missing ${url}`);
for (const p of pages.keys()) if (p !== '/') assert(llms.includes(site + p), `llms.txt: ${p} not listed`);
console.log(`SEO checks passed: ${pages.size} pages, unique metadata, canonical/sitemap parity, JSON-LD/FAQ, internal links, robots, llms.txt.`);
