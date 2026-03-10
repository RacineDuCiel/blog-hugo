# Homepage Redesign v2 — Brutalist Split

## Principe
Hero split vertical 50/50, avatar pleine hauteur à gauche, "HUMAN" qui déborde sur l'image. Listing en grille asymétrique. Exécution pro, cyber/destructuré sans bruit.

## 1. Hero — Split vertical

### Layout
- CSS Grid `grid-template-columns: 1fr 1fr`, `min-height: 85vh`
- Fond noir `#080810` fullwidth

### Panneau gauche (`.hb-panel--avatar`)
- Avatar remplit tout le panneau : `object-fit: cover`, `width: 100%`, `height: 100%`
- Hugo image processing : `.Fill "800x1000 center webp"` pour format tall
- Filter NB : `grayscale(1) contrast(1.4) brightness(0.85)`
- Mask-image fade vers la droite : `linear-gradient(to right, black 60%, transparent 100%)`
- Pas de cadre, pas de bordure — l'image saigne

### Panneau droit (`.hb-panel--text`)
- Centré verticalement (`align-self: center`), padding `0 5vw`
- `> WHAT DOES IT MEAN TO BE` : JetBrains Mono, 0.75rem, opacity 0.4
- `HUMAN` : Metal Mania, `clamp(5rem, 14vw, 10rem)`, rouge `#e8193c`, text-shadow glow
- **Débordement brutalist** : `HUMAN` a `margin-left: -15%` pour chevaucher l'avatar

### Glitch
- JS existant (scramble + `.is-glitching` sur `.hb-q-word` et `.hb-frame`)
- `::before` cyan unique, activé par `.is-glitching` (transition 80ms)
- `.hb-frame.is-glitching .hb-main` : brightness boost

### Séparateur
- `border-bottom: 1px solid rgba(232, 25, 60, 0.3)` — rouge sang fin

### Mobile (<640px)
- Stack vertical : `grid-template-columns: 1fr`
- Avatar en haut, max-height 50vh
- Mask-image fade vers le bas (au lieu de vers la droite)
- HUMAN : pas de margin-left négatif, taille réduite

## 2. Listing Articles — Grille asymétrique

### Structure HTML (index.html)
- Premier article séparé : `post-item post-item--featured`
  - `grid-column: span 2` sur grille 3 colonnes
  - Titre 1.4rem
- Articles 2-5 : `post-item` normal, 1 colonne chacun

### CSS
- `.home-grid` : `display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem`
- Section headers : JetBrains Mono, uppercase, 0.72rem, opacity 0.5 (existant)
- Hover : border-left accent (existant)

### Partages
- Même traitement, section séparée

## 3. Fichiers impactés
- `layouts/partials/bio.html` — refonte HTML complète (structure split 2 panneaux)
- `assets/sass/hero-bio.scss` — réécriture (split grid, débordement, responsive)
- `layouts/index.html` — grille articles, premier article featured
- `assets/sass/theme-colors.scss` — déjà modifié (hover border-left)
