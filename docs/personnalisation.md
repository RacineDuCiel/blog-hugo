# RacineDuCiel — personnaliser et maintenir le site

Le site est un projet Hugo sans CMS. Les articles gardent leurs adresses sous `/posts/`.

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

Continue à écrire les articles dans `content/posts/`. `showOnHome` règle leur présence sur l’accueil. Dans la recherche par thème, `pinned: true` place les articles épinglés en tête de liste quand le champ de recherche est vide.

### Choisir un thème

La question « What does it mean to be human…? » donne une direction au site. Les thèmes partent du sujet précis que le lecteur peut explorer dans chaque texte.

| Thème | Ce qu’il rassemble |
| --- | --- |
| Littérature | Les romans et les portraits d’écrivains. Kafka, Dostoïevski et `Crime et châtiment` éclairent des questions humaines par la fiction. |
| Écologie et société | Les textes sur les modes de vie et leurs effets collectifs. L’essai de Keucheyan y trouve sa place par son sujet, la fabrication des besoins, la consommation et leurs conséquences écologiques. |
| Cybersécurité et vie privée | Les fiches SecurityX et l’analyse de Tor abordent la sécurité des systèmes et la protection des données. « Certification » désignait le format des fiches, déjà reconnaissable à leur titre. |
| Intelligence artificielle | Les bases de l’IA et de l’apprentissage automatique. Le nom développé remplace les deux entrées « IA ». |
| Musique | Les sélections et recommandations personnelles d’albums. |
| Corps et santé | La dépense énergétique, la nutrition et la pratique physique. |

Indique le sujet principal dans le front matter, par exemple `themes: ["litterature"]`. Les identifiants et les textes de présentation sont dans `content/themes/`. Garde les noms d’auteurs, d’œuvres et les notions précises dans le titre, le résumé ou le texte, où la recherche les retrouve. Un nouveau thème doit ouvrir une piste de lecture assez claire pour accueillir plusieurs articles au fil du temps.

La page Recherche réunit les filtres par thème. Les liens de thème sur les articles ouvrent la recherche avec le filtre déjà actif. Les anciennes adresses d’archives et les flux RSS conduisent au même endroit. Un lien de recherche avec `?tags=` est converti en `?themes=`, ce qui peut élargir un ancien filtre très précis. Choisir plusieurs thèmes affiche les articles qui relèvent de l’un d’eux.

Le thème conserve Hugo et les ressources utiles d’ablog. L’habillage est maintenant défini dans les gabarits locaux de `layouts/` et les modules suivants :

- `assets/sass/site/_foundation.scss` : couleurs et règles communes ;
- `assets/sass/site/_shell.scss` : navigation, accueil et listes ;
- `assets/sass/site/_prose.scss` et `_reading.scss` : articles et lecture.

Les modules `media.scss`, `calculator.scss`, `tor-circuit.scss`, `onion-rendezvous.scss` et `search.scss` ne sont chargés que sur les pages concernées. N’ajoute pas une nouvelle couche globale de corrections : modifie le composant concerné.

Les polices sont locales. Le thème suit la préférence système jusqu’au choix manuel du lecteur. Les préférences de police et de taille restent mémorisées dans son navigateur. Les données du calculateur ne sont pas transmises à un service externe.

## Prévisualiser et vérifier

Depuis le dossier du projet, avec Hugo 0.170.0 et Dart Sass :

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

Le workflow GitHub effectue ces contrôles sur les pull requests. Un push ou un lancement manuel sur `main` déclenche le déploiement.
