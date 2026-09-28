# Ajouter ou modifier un album

Tout se trouve dans `content/posts/musique/recommandations-musique/` :

- `albums.yaml` contient la sélection ;
- les fichiers JPG/PNG/WebP sont les pochettes ;
- `index.md` contient l’introduction et les titres des sections.

## Ajouter un album

1. Déposer la pochette dans ce dossier, nommée `artiste-titre.ext` : minuscules, sans accents, mots séparés par des tirets (ex. `architects-holy-hell.jpg`).
2. Copier un bloc de trois lignes dans `albums.yaml`, sous `classiques` ou `recommandes`.
3. Remplacer l’artiste, le titre et le nom du fichier :

```yaml
classiques:
  - artist: "Architects"
    title: "Holy Hell"
    cover: "architects-holy-hell.jpg"
```

Les trois champs sont obligatoires. Garder l’indentation avec des espaces. Mettre les valeurs entre guillemets permet notamment d’utiliser un deux-points dans un titre ; écrire `\"` pour un guillemet à l’intérieur d’une valeur. Le nom du fichier doit correspondre exactement, majuscules comprises.

L’ordre des blocs est l’ordre d’affichage. Pour déplacer un album, déplacer son bloc entier. Il n’y a aucun HTML à écrire ni aucune miniature à fabriquer.

## Texte et présentation

Le Markdown appelle les collections sous les titres existants :

```go-html-template
## Classiques
{{< albums "classiques" >}}

## Hautement recommandés
{{< albums "recommandes" >}}
```

Conserver `pageClass: "music-recs"` dans les métadonnées. Les pochettes classiques ont deux grandes colonnes sur ordinateur, les recommandations trois. Sur tablette et mobile, les deux collections ont deux colonnes, puis une sous 360 px.

## Images et maintenance

Une pochette carrée de 800 à 1000 px convient bien. Les fichiers plus petits fonctionnent aussi. Hugo génère les WebP nécessaires, conserve l’image entière et n’agrandit pas les sources. Il réutilise son cache ; inutile de convertir les images à la main. Les deux premières pochettes de la première collection sont chargées immédiatement, les suivantes à l’approche de l’écran.

Une pochette absente, un champ manquant ou une collection inconnue bloque la compilation avec un message indiquant le problème. Les anciens shortcodes `album` et `grid` restent compatibles ; utiliser la liste YAML pour cette page.

Le rendu commun est dans `layouts/partials/albums/`, la présentation dans `assets/sass/music.scss`. Le fichier `image.html` centralise les dimensions et les indications de taille pour le navigateur ; les adapter si les colonnes CSS changent.

Prévisualisation : `hugo server`.

Vérification avant publication :

```sh
hugo --minify
python3 scripts/verify.py public
python3 scripts/test_albums.py
```

Les tests utilisent une copie temporaire du contenu et ne modifient pas les albums réels. Ils sont également exécutés dans la validation GitHub. La publication reste distincte.
