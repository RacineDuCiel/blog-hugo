# RacineDuCiel — personnaliser et maintenir le site

Le site reste un projet Hugo, sans CMS ni service supplémentaire. Les articles, leurs adresses, leurs catégories et leurs images d’origine n’ont pas été modifiés.

## Les deux espaces personnels

Dans le dossier `content/fragments/` :

- `ouverture/index.md` apparaît avant les articles récents ;
- `interlude/index.md` apparaît après les articles. Il est désactivé au départ.

Chaque espace se compose d’un fichier Markdown et, si nécessaire, d’images placées dans le même dossier. Exemple de configuration :

```yaml
---
headless: true
enabled: true
image: portrait.jpg
alt: "Description de l’image pour les personnes qui ne la voient pas."
typography: handwritten
caption: ""
link: ""
linkLabel: ""
---
Ton texte personnel, avec du **Markdown** si tu le souhaites.
```

- `enabled: false` masque complètement l’espace.
- `image` contient le nom d’une image locale JPG, PNG ou WebP. Mets `image: ""` pour ne garder que le texte. L’image est redimensionnée automatiquement, sans recadrage forcé.
- `alt` décrit l’image ; laisse-le vide uniquement pour une image purement décorative.
- `typography` accepte `standard` ou `handwritten`.
- `caption` ajoute une petite légende sous le texte.
- `link` ajoute un lien facultatif ; `linkLabel` en précise le libellé.
- Le texte après le deuxième `---` est le contenu affiché. Il peut être vide pour ne montrer que l’image.

Un emplacement sans texte ni image disparaît. Une image déclarée mais introuvable provoque une erreur de compilation explicite. Garde `headless: true` et le fichier `content/fragments/_index.md` : ils empêchent la création de pages indépendantes et l’apparition de ces fragments dans la recherche, les flux et le sitemap.

Ces espaces ne sont pas secrets : leur contenu est visible sur l’accueil et leurs images restent accessibles publiquement après publication.

## Articles et apparence

Continue à écrire les articles comme auparavant dans `content/posts/`. Les réglages `showOnHome`, `pinned`, `pinCategories`, `pageClass` et les shortcodes existants sont conservés.

Le thème conserve Hugo et les ressources utiles d’ablog. L’habillage est maintenant défini dans les gabarits locaux de `layouts/` et les modules suivants :

- `assets/sass/site/_foundation.scss` : couleurs et règles communes ;
- `assets/sass/site/_shell.scss` : navigation, accueil et listes ;
- `assets/sass/site/_prose.scss` et `_reading.scss` : articles et lecture.

Les modules `media.scss`, `calculator.scss`, `tor-circuit.scss`, `onion-rendezvous.scss` et `search.scss` ne sont chargés que sur les pages concernées. N’ajoute pas une nouvelle couche globale de corrections : modifie le composant concerné.

Les polices sont locales. Le thème suit la préférence système jusqu’au choix manuel du lecteur. Les préférences de police et de taille restent mémorisées dans son navigateur. Les données du calculateur ne sont pas transmises à un service externe.

## Prévisualiser et vérifier

Depuis le dossier du projet, avec Hugo Extended 0.162.0 :

```sh
hugo server --bind 127.0.0.1 --port 1313 --disableLiveReload
```

Ouvre `http://127.0.0.1:1313/`. Enregistre tes modifications, puis actualise la page. Si ce port est déjà utilisé par la prévisualisation livrée, utilise `--port 1316`. Arrête ton serveur avec `Ctrl+C`.

Avant publication :

```sh
hugo --minify
python3 scripts/verify.py public
python3 scripts/test_fragments.py
```

Le premier contrôle vérifie la structure HTML, les ressources et liens locaux, les ancres, la recherche, les flux et le sitemap. Le second teste huit variantes de fragments dans des dossiers temporaires sans toucher au contenu réel.

Le workflow GitHub effectue ces contrôles sur les pull requests. Seul un push ou un lancement manuel sur `main` peut déclencher le déploiement. La refonte livrée est locale : aucun push ni déploiement n’a été effectué.
