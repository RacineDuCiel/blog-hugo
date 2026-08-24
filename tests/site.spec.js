const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;

const articleURL = "/posts/lecture/la-metamorphose-kafka/";
const viewports = [
  { width: 375, height: 812 },
  { width: 768, height: 900 },
  { width: 1440, height: 1000 }
];

test("l’accueil et l’article restent sans débordement aux trois largeurs", async ({ page }) => {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const url of ["/", articleURL]) {
      await page.goto(url);
      await expect(page.locator("h1")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    }
  }
});

test("l’accueil expose immédiatement six textes récents et les univers ne contiennent aucun doublon", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const latest = page.locator(".latest .story-row");
  await expect(latest).toHaveCount(6);
  const latestLinks = await latest.locator("h3 a").evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  expect(new Set(latestLinks).size).toBe(6);
  const dates = await latest.locator("time").evaluateAll((times) => times.map((time) => time.getAttribute("datetime")));
  expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)));
  expect((await page.getByRole("heading", { name: "Derniers textes" }).boundingBox()).y).toBeLessThan(1000);
  await expect(page.getByText("À la une", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Dossiers", { exact: true })).toHaveCount(0);
  await expect(page.locator("a[href^='/series/']")).toHaveCount(0);
  expect(await page.locator(".home-intro").evaluate((element) => getComputedStyle(element).borderBottomWidth)).toBe("0px");

  for (const url of ["/categories/lettres-idees/", "/categories/tech-cyber/", "/categories/corps-sante/", "/categories/musique/"]) {
    await page.goto(url);
    const links = await page.locator(".term-all .story-row h2 a").evaluateAll((items) => items.map((item) => item.getAttribute("href")));
    expect(new Set(links).size).toBe(links.length);
    await expect(page.locator(".term-selection")).toHaveCount(0);
    await expect(page.locator(".term-all > .eyebrow")).toHaveCount(0);
  }
});

test("les tags restent limités au vocabulaire éditorial normalisé", async ({ page }) => {
  await page.goto("/");
  const index = await page.evaluate(() => fetch("/index.json").then((response) => response.json()));
  const expected = ["certification", "cryptographie", "cybersécurité", "dostoïevski", "écologie", "intelligence artificielle", "littérature", "musique", "philosophie", "santé", "société", "vie privée"];
  const tags = [...new Set(index.flatMap((item) => item.tags))].sort((a, b) => a.localeCompare(b, "fr"));
  expect(tags).toEqual([...expected].sort((a, b) => a.localeCompare(b, "fr")));
  expect(index.every((item) => item.tags.length <= 3)).toBe(true);
  expect(index.every((item) => !("series" in item))).toBe(true);

  await page.goto("/search/");
  await page.locator("[data-search-input]").focus();
  const options = page.locator("[data-search-tag] option:not([value='all'])");
  await expect(options).toHaveCount(expected.length);
  const searchTags = await options.allTextContents();
  expect(searchTags).toEqual([...expected].sort((a, b) => a.localeCompare(b, "fr")));
});

test("Carmin est le thème par défaut, Cobalt migre et Graphite persiste", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-palette", "carmin");
  expect(await page.evaluate(() => localStorage.getItem("rdc:palette"))).toBe("carmin");
  await page.evaluate(() => localStorage.setItem("rdc:palette", "cobalt"));
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-palette", "carmin");
  expect(await page.evaluate(() => localStorage.getItem("rdc:palette"))).toBe("carmin");

  await page.getByRole("button", { name: "Apparence" }).click();
  await page.getByRole("button", { name: "Sombre" }).click();
  await page.getByRole("button", { name: "Graphite" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-appearance", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-palette", "graphite");
  await expect(page.locator("meta[name='theme-color']")).toHaveAttribute("content", "#151515");
});

test("la recherche reste accessible au clavier", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press(process.platform === "darwin" ? "Meta+K" : "Control+K");
  await page.getByRole("searchbox").fill("metamorphose");
  await expect(page.getByRole("link", { name: "La Métamorphose — Kafka" }).first()).toBeVisible();
  await page.getByRole("button", { name: "Fermer la recherche" }).click();
});

test("la bibliothèque explique ses états, compte, retire et confirme l’effacement", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.getByRole("button", { name: "Ouvrir la bibliothèque" }).click();
  const library = page.getByRole("dialog", { name: "Bibliothèque" });
  await expect(library.getByText("Vos textes enregistrés et votre historique, stockés uniquement sur cet appareil.")).toBeVisible();
  await expect(library.getByRole("heading", { name: "Aucun texte enregistré" })).toBeVisible();
  await expect(library.getByText("Ajouter à la bibliothèque", { exact: false })).toBeVisible();
  await expect(library.locator("[data-library-clear]")).toBeHidden();
  await page.getByRole("button", { name: "Fermer la bibliothèque" }).click();

  await page.goto(articleURL);
  await page.getByRole("button", { name: "Ajouter à la bibliothèque" }).click();
  await expect(page.getByRole("button", { name: "Dans la bibliothèque" })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Texte ajouté à votre bibliothèque.");
  await page.getByRole("button", { name: /Ouvrir la bibliothèque, 1 texte enregistré/ }).click();
  await expect(library.getByText("La Métamorphose — Kafka")).toBeVisible();
  await expect(library.getByRole("tab", { name: /Enregistrés 1/ })).toBeVisible();
  await library.getByRole("button", { name: /Retirer « La Métamorphose — Kafka »/ }).click();
  await expect(library.getByRole("heading", { name: "Aucun texte enregistré" })).toBeVisible();

  await page.getByRole("button", { name: "Fermer la bibliothèque" }).click();
  await page.getByRole("button", { name: "Ajouter à la bibliothèque" }).click();
  await page.getByRole("button", { name: /Ouvrir la bibliothèque, 1 texte enregistré/ }).click();
  await library.getByRole("button", { name: "Effacer les textes enregistrés" }).click();
  await expect(library.getByRole("button", { name: "Confirmer l’effacement" })).toBeVisible();
  await expect(library.getByText("La Métamorphose — Kafka")).toBeVisible();
  await library.getByRole("button", { name: "Confirmer l’effacement" }).click();
  await expect(library.getByRole("heading", { name: "Aucun texte enregistré" })).toBeVisible();
  await page.setViewportSize({ width: 375, height: 812 });
  const sheet = await library.boundingBox();
  expect(Math.round(sheet.x)).toBe(0);
  expect(Math.round(sheet.width)).toBe(375);
  expect(sheet.y + sheet.height).toBeGreaterThan(805);
});

test("l’historique de la bibliothèque conserve la progression", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(articleURL);
  await page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * 0.35));
  await page.waitForTimeout(1700);
  await page.getByRole("button", { name: "Ouvrir la bibliothèque" }).click();
  const library = page.getByRole("dialog", { name: "Bibliothèque" });
  await library.getByRole("tab", { name: /Historique 1/ }).click();
  await expect(library.getByText("La Métamorphose — Kafka")).toBeVisible();
  await expect(library.getByText(/\d+ % lu/)).toBeVisible();
});

test("la reprise de lecture reste explicite", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(articleURL);
  await page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * 0.42));
  await page.waitForTimeout(1700);
  await page.goto("/");
  await page.goto(articleURL);
  await expect(page.getByRole("button", { name: /Reprendre à 42 %/ })).toBeVisible();
  expect(await page.evaluate(() => scrollY)).toBe(0);
});

test("les pages représentatives ne présentent aucune violation Axe sérieuse", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const url of ["/", articleURL, "/categories/", "/search/"]) {
    await page.goto(url);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact))).toEqual([]);
  }
});

test("les expériences interactives historiques restent actives", async ({ page }) => {
  await page.goto("/posts/sport-sante/tdee/");
  await expect(page.locator("#tdee-results")).toContainText("TDEE estimé");
  await expect(page.locator(".tdee-bar-fill")).toHaveCount(4);

  await page.goto("/posts/securite-vie-privee/reseau-tor/");
  await expect(page.locator(".tor-circuit")).toBeVisible();
  await page.getByRole("button", { name: "2 Trouver" }).click();
  await expect(page.getByRole("button", { name: "2 Trouver" })).toHaveClass(/active/);

  await page.goto("/posts/musique/recommandations-musique/");
  await expect(page.locator(".album-card")).toHaveCount(16);
  await expect(page.locator(".album-cover-img").first()).toHaveJSProperty("complete", true);
});

test("les quatre combinaisons visuelles de thème sont capturées", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Une baseline unique évite les écarts de rendu entre moteurs.");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  for (const appearance of ["Clair", "Sombre"]) {
    for (const palette of ["Carmin", "Graphite"]) {
      const themeToggle = page.getByRole("button", { name: "Apparence" });
      await themeToggle.click();
      await page.getByRole("button", { name: appearance }).click();
      await page.getByRole("button", { name: palette }).click();
      await themeToggle.click();
      await expect(page).toHaveScreenshot(`accueil-${appearance.toLowerCase()}-${palette.toLowerCase()}.png`, { animations: "disabled" });
    }
  }
});

test("le site reste lisible sans stockage et navigable sans JavaScript", async ({ browser, page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error("stockage désactivé"); };
    Storage.prototype.setItem = () => { throw new Error("stockage désactivé"); };
    Storage.prototype.removeItem = () => { throw new Error("stockage désactivé"); };
  });
  await page.goto(articleURL);
  await expect(page.locator("h1")).toHaveText("La Métamorphose — Kafka");
  await page.getByRole("button", { name: "Ajouter à la bibliothèque" }).click();
  await page.getByRole("button", { name: "Ouvrir la bibliothèque" }).click();
  await expect(page.getByRole("dialog", { name: "Bibliothèque" }).getByRole("heading", { name: "Bibliothèque indisponible" })).toBeVisible();
  await expect(page.locator(".article-prose")).toBeVisible();

  const noScriptContext = await browser.newContext({ javaScriptEnabled: false, locale: "fr-FR" });
  const noScriptPage = await noScriptContext.newPage();
  await noScriptPage.goto("http://127.0.0.1:1414/search/");
  await expect(noScriptPage.locator("noscript a[href='/categories/']")).toBeVisible();
  await expect(noScriptPage.locator("noscript a[href='/posts/']")).toBeVisible();
  await noScriptContext.close();
});
