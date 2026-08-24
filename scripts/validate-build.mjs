import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { gzipSync } from "node:zlib";

const root = resolve(process.argv[2] || "public");
const project = resolve(new URL("..", import.meta.url).pathname);
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

function walk(directory, extension, files = []) {
  for (const name of readdirSync(directory)) {
    const file = join(directory, name);
    if (statSync(file).isDirectory()) walk(file, extension, files);
    else if (file.endsWith(extension)) files.push(file);
  }
  return files;
}

assert(existsSync(root), `Build introuvable : ${root}`);
if (!existsSync(root)) process.exit(1);
for (const file of ["CNAME", "index.xml", "sitemap.xml", "robots.txt", "index.json", "og.png", "site.webmanifest"]) {
  assert(existsSync(join(root, file)), `Fichier de distribution manquant : ${file}`);
}
assert(!existsSync(join(root, "series")), "La taxonomie Dossiers ne doit plus être publiée");
if (existsSync(join(root, "CNAME"))) assert(readFileSync(join(root, "CNAME"), "utf8").trim() === "racineduciel.fr", "CNAME invalide");

const legacyURLs = readFileSync(join(project, "tests/legacy-urls.txt"), "utf8").split(/\r?\n/).filter(Boolean);
for (const url of legacyURLs) {
  const relativePath = decodeURIComponent(url).replace(/^\//, "");
  const file = join(root, relativePath, "index.html");
  assert(existsSync(file), `URL historique absente : ${url}`);
}

const titles = new Map();
const canonicals = new Map();
for (const file of walk(root, ".html")) {
  const html = readFileSync(file, "utf8");
  const name = relative(root, file);
  const isAlias = /http-equiv=["']?refresh/i.test(html);
  const title = html.match(/<title>(.*?)<\/title>/i)?.[1]?.trim();
  const descriptionMatch = html.match(/<meta\s+name=["']?description["']?\s+content=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i);
  const canonicalMatch = html.match(/<link\s+rel=["']?canonical["']?\s+href=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i);
  const description = descriptionMatch?.slice(1).find(Boolean)?.trim();
  const canonical = canonicalMatch?.slice(1).find(Boolean)?.trim();
  assert(title, `Titre HTML manquant : ${name}`);
  assert(canonical, `Canonical manquant : ${name}`);
  assert(!/unsafe-inline/.test(html), `CSP relâchée avec unsafe-inline : ${name}`);
  if (!isAlias) assert(description, `Meta description manquante : ${name}`);
  if (!isAlias && title) {
    assert(!titles.has(title), `Titre HTML dupliqué : ${title} (${titles.get(title)}, ${name})`);
    titles.set(title, name);
  }
  if (!isAlias && canonical) {
    assert(!canonicals.has(canonical), `Canonical dupliqué : ${canonical} (${canonicals.get(canonical)}, ${name})`);
    canonicals.set(canonical, name);
  }
}

if (existsSync(join(root, "index.json"))) {
  const index = JSON.parse(readFileSync(join(root, "index.json"), "utf8"));
  const required = ["title", "url", "description", "body", "tags", "category", "format", "date", "readingTime"];
  const allowedTags = new Set(["certification", "cryptographie", "cybersécurité", "dostoïevski", "écologie", "intelligence artificielle", "littérature", "musique", "philosophie", "santé", "société", "vie privée"]);
  assert(Array.isArray(index) && index.length > 0, "Index de recherche vide");
  for (const item of index) {
    for (const field of required) assert(Object.hasOwn(item, field), `Champ ${field} absent de l’index : ${item.title || item.url}`);
    assert(!Object.hasOwn(item, "series"), `Champ Dossiers encore présent dans l’index : ${item.title || item.url}`);
    assert(item.tags.length <= 3, `Plus de trois tags dans l’index : ${item.title || item.url}`);
    for (const tag of item.tags) assert(allowedTags.has(tag), `Tag non normalisé dans l’index (${tag}) : ${item.title || item.url}`);
  }
}

const globalCSS = walk(join(root, "css"), ".css").filter((file) => /site\.min\./.test(file));
const globalJS = walk(join(root, "js"), ".js").filter((file) => /\/(site|theme-init)\.min\./.test(file));
const cssGzip = Math.max(0, ...globalCSS.map((file) => gzipSync(readFileSync(file)).length));
const jsGzip = globalJS.reduce((sum, file) => sum + gzipSync(readFileSync(file)).length, 0);
assert(cssGzip <= 25 * 1024, `CSS global trop lourd : ${cssGzip} octets gzip`);
assert(jsGzip <= 15 * 1024, `JavaScript global trop lourd : ${jsGzip} octets gzip`);

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`Build validé : ${legacyURLs.length} URLs historiques, ${titles.size} pages, CSS ${cssGzip} o gzip, JS ${jsGzip} o gzip.`);
