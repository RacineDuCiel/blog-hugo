# Mettre à jour Musique

La page utilise `albums.yaml` dans `content/posts/musique/recommandations-musique/`. Les pochettes se placent dans le même dossier et l’introduction se règle dans `index.md`.

## Ajouter une écoute

Ajoute chaque écoute **à la fin de `ecoutes`**. Le dernier bloc apparaît en tête du fil. Au premier ajout, remplace `ecoutes: []` par `ecoutes:`, puis indente les blocs avec deux espaces.

```yaml
ecoutes:
  - artist: "Nom du groupe"
    title: "Titre du disque"
    cover: "nom-du-groupe-titre-du-disque.jpg"
    note: "Quelques mots sur ton écoute."
  - album: "architects-holy-hell"
    note: "Une nouvelle écoute d’un disque recommandé."
```

Une nouvelle fiche contient `artist` et `title`. `cover` et `note` sont facultatifs. Pour ajouter une écoute d’un disque déjà défini, indique son `id` dans `album`. Donne un `id` unique à une nouvelle fiche si tu souhaites la citer dans des écoutes ultérieures. Chaque écoute peut avoir sa propre note.

## Gérer les recommandations

Ajoute directement dans `recommandes` les disques que tu veux présenter dans la colonne de gauche. Pour recommander un disque déjà saisi dans `ecoutes`, ajoute `collection: recommandes` à sa fiche. Elle alimentera la sélection et le fil.

La page affiche la liste entière dans l’ordre de `recommandes`, puis les recommandations issues du fil.

## Prévisualiser

Utilise `hugo server -D` pour vérifier la page. Hugo redimensionne les pochettes locales et génère leurs miniatures WebP. Indique le nom exact du fichier si tu ajoutes une pochette. Les tests d’albums utilisent une copie du contenu et s’exécutent dans GitHub Actions.
