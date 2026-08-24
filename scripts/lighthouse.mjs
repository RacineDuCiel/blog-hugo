import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

const port = 1415;
const origin = `http://127.0.0.1:${port}`;
const output = resolve(".lighthouseci/site");
const reports = resolve(".lighthouseci/reports");
const urls = ["/", "/posts/lecture/la-metamorphose-kafka/"];
const failures = [];
mkdirSync(reports, { recursive: true });

const build = spawnSync("hugo", ["--gc", "--minify", "--destination", output], { stdio: "inherit" });
if (build.status !== 0) process.exit(build.status || 1);

const serveBinary = resolve("node_modules/.bin/serve");
const server = spawn(serveBinary, ["-s", output, "--listen", String(port), "--no-clipboard"], { stdio: "ignore" });
let chrome;

async function waitForServer() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try { if ((await fetch(origin)).ok) return; } catch {}
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  }
  throw new Error("Le serveur Lighthouse n’a pas démarré.");
}

try {
  await waitForServer();
  chrome = await chromeLauncher.launch({
    chromePath: chromium.executablePath(),
    chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"]
  });

  for (const pathname of urls) {
    const runs = [];
    for (let run = 1; run <= 2; run += 1) {
      const result = await lighthouse(`${origin}${pathname}`, {
        port: chrome.port,
        output: "json",
        logLevel: "error",
        onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
        formFactor: "mobile",
        screenEmulation: { mobile: true, width: 375, height: 812, deviceScaleFactor: 1, disabled: false },
        throttlingMethod: "simulate"
      });
      const report = typeof result.report === "string" ? result.report : JSON.stringify(result.lhr);
      writeFileSync(resolve(reports, `${pathname === "/" ? "accueil" : "article"}-${run}.json`), report);
      runs.push(result.lhr);
    }

    const minimumScore = (category) => Math.min(...runs.map((run) => run.categories[category].score));
    const maximumAudit = (audit) => Math.max(...runs.map((run) => run.audits[audit].numericValue));
    const scores = {
      performance: minimumScore("performance"),
      accessibility: minimumScore("accessibility"),
      bestPractices: minimumScore("best-practices"),
      seo: minimumScore("seo")
    };
    const lcp = maximumAudit("largest-contentful-paint");
    const cls = maximumAudit("cumulative-layout-shift");
    for (const [category, score] of Object.entries(scores)) if (score < .95) failures.push(`${pathname} ${category}: ${Math.round(score * 100)} < 95`);
    if (lcp > 2500) failures.push(`${pathname} LCP: ${Math.round(lcp)} ms > 2500 ms`);
    if (cls > .05) failures.push(`${pathname} CLS: ${cls.toFixed(3)} > 0.05`);
    console.log(`${pathname} — P${Math.round(scores.performance * 100)} A${Math.round(scores.accessibility * 100)} BP${Math.round(scores.bestPractices * 100)} SEO${Math.round(scores.seo * 100)} · LCP ${Math.round(lcp)} ms · CLS ${cls.toFixed(3)}`);
  }
} finally {
  if (chrome) await chrome.kill();
  server.kill("SIGTERM");
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}
