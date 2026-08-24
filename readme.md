# RacineDuCiel

Revue personnelle francophone consacrée aux livres, aux idées, aux systèmes, au corps et à la musique.

Le site repose sur Hugo et un thème propriétaire sans framework JavaScript, sans suivi publicitaire et sans service tiers. Les préférences d'apparence, la bibliothèque et la progression de lecture restent locales au navigateur.

## Développement

```sh
hugo server
```

Le build de production valide le contrat éditorial des articles publiés :

```sh
hugo --gc --minify
```

Un article publié doit définir `title`, `date`, `description`, un univers (`lettres-idees`, `tech-cyber`, `corps-sante` ou `musique`) et un format (`essai`, `note`, `guide`, `fiche` ou `selection`). `hugo new posts/chemin/index.md` crée ce front matter normalisé en brouillon.

## Qualité

```sh
pnpm install
pnpm exec playwright install chromium firefox webkit
pnpm test:e2e
pnpm test:lighthouse
```

La suite couvre Chromium, Firefox et WebKit à 375, 768 et 1440 px, les audits Axe, les quatre combinaisons de thème, les replis sans stockage/JavaScript et les budgets Lighthouse. Les pull requests construisent et testent le site ; seul `main` peut déployer GitHub Pages.

**Site** → [racineduciel.fr](https://racineduciel.fr)
