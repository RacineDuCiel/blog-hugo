# RacineDuCiel

Blog personnel construit avec [Hugo](https://gohugo.io/) et le thème [hugo-blog-awesome](https://github.com/hugo-sid/hugo-blog-awesome).

**Site** → [racineduciel.fr](https://racineduciel.fr)

---

## Prérequis

- [Hugo Extended](https://gohugo.io/installation/) ≥ 0.148.0

## Développement local

```bash
# Cloner avec le sous-module thème
git clone --recurse-submodules <repo-url>
cd blog-hugo

# Lancer le serveur avec les brouillons
hugo server -D

# Build de production (minification + GC)
hugo --gc --minify
```

Le site est accessible sur `http://localhost:1313`.

## Créer du contenu

```bash
# Nouvel article
hugo new posts/<categorie>/<slug>/index.md

# Nouveau partage (YouTube, lien, album...)
hugo new --kind partage partages/<slug>.md
```

### Catégories disponibles

- `posts/ia/` — Intelligence artificielle
- `posts/musique/` — Musique & albums
- `posts/securite-vie-privee/` — Sécurité & vie privée
- `posts/sport-sante/` — Sport & santé

### Frontmatter d'un article

```yaml
---
title: "Mon article"
date: 2025-01-01
categories: ["IA"]
description: "Description courte (160 car. max) pour le SEO."
# Options avancées :
# math: true          # Active KaTeX pour les formules LaTeX
# showDate: false     # Cache la date
# pinned: true        # Épingle dans les listes de catégorie
# pinCategories: ["IA"]
---
```

> **Note** : le support LaTeX (KaTeX) est désactivé globalement pour la performance.
> Activer `math: true` uniquement dans le frontmatter des articles qui en ont besoin.

### Shortcodes disponibles

| Shortcode | Usage |
|-----------|-------|
| `{{< calculator >}}` | Calculateur TDEE |
| `{{< tor-circuit >}}` | Schéma circuit Tor |
| `{{< onion-rendezvous >}}` | Protocole Hidden Service |
| `{{< youtube-card id="..." title="..." >}}` | Carte vidéo YouTube |
| `{{< youtube-playlist id="..." >}}` | Playlist embarquée |
| `{{< album cover="..." artist="..." title="..." >}}` | Carte album musique |
| `{{< cover src="..." alt="..." >}}` | Image de couverture |
| `{{< grid >}}...{{< /grid >}}` | Grille responsive |

## Déploiement

Le déploiement est automatique via GitHub Actions sur chaque push vers `main`.
Le pipeline : build Hugo → upload artifact → déploiement GitHub Pages.

## Structure du projet

```
├── assets/
│   ├── js/          # JavaScript (calculator, search, onion-rendezvous)
│   └── sass/        # Styles SCSS (un fichier par composant)
├── content/
│   ├── posts/       # Articles par catégorie
│   └── partages/    # Partages (vidéos, liens, albums)
├── layouts/
│   ├── _default/    # Templates Hugo (baseof, list, single, search)
│   ├── partials/    # Composants réutilisables
│   └── shortcodes/  # Shortcodes custom
├── static/          # Fichiers statiques (CNAME)
└── themes/ablog/    # Thème hugo-blog-awesome (sous-module git)
```
