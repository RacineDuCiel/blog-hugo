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

test("les thèmes, la recherche et la bibliothèque persistent localement", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.getByRole("button", { name: "Thème" }).click();
  await page.getByRole("button", { name: "Sombre" }).click();
  await page.getByRole("button", { name: "Carmin" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-appearance", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-palette", "carmin");

  await page.keyboard.press(process.platform === "darwin" ? "Meta+K" : "Control+K");
  await page.getByRole("searchbox").fill("metamorphose");
  await expect(page.getByRole("link", { name: "La Métamorphose — Kafka" }).first()).toBeVisible();
  await page.getByRole("button", { name: "Fermer la recherche" }).click();

  await page.goto(articleURL);
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await page.getByRole("button", { name: "Ouvrir la bibliothèque" }).click();
  await expect(page.getByRole("dialog", { name: "Votre bibliothèque" }).getByText("La Métamorphose — Kafka")).toBeVisible();
  await page.getByRole("button", { name: "Tout effacer" }).click();
  await expect(page.getByText("Aucun texte enregistré pour le moment.")).toBeVisible();
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
    for (const palette of ["Cobalt", "Carmin"]) {
      const themeToggle = page.getByRole("button", { name: "Thème" });
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
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.locator(".article-prose")).toBeVisible();

  const noScriptContext = await browser.newContext({ javaScriptEnabled: false, locale: "fr-FR" });
  const noScriptPage = await noScriptContext.newPage();
  await noScriptPage.goto("http://127.0.0.1:1414/search/");
  await expect(noScriptPage.locator("noscript a[href='/categories/']")).toBeVisible();
  await expect(noScriptPage.locator("noscript a[href='/posts/']")).toBeVisible();
  await noScriptContext.close();
});
