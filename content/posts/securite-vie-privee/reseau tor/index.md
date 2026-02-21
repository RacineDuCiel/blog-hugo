---
title: "Réseau Tor : architecture, protocoles et implications de sécurité"
date: 2025-12-06
categories: ["Securite-Vie-Privee"]
showOnHome: true
description: "Plongée technique dans le réseau Tor : architecture en oignon, protocoles cryptographiques (Curve25519, ntor), services cachés v3 et modèles de menace."
---

## 1. Introduction

Chaque fois que vous visitez un site web, votre adresse IP — identifiant unique attribué par votre fournisseur d'accès — est transmise au serveur distant. Votre FAI, lui, voit l'intégralité de vos destinations. Ces **métadonnées** (qui parle à qui, quand, à quelle fréquence) sont souvent plus révélatrices que le contenu lui-même : elles dessinent une carte de vos relations, de vos centres d'intérêt, de vos habitudes.

Le réseau Tor (*The Onion Router*) est conçu précisément pour briser ce lien entre identité et activité. Contrairement au chiffrement classique (HTTPS, par exemple) qui protège le *contenu* des échanges, Tor vise à dissimuler les *métadonnées* en interposant plusieurs relais entre l'utilisateur et sa destination, de sorte qu'aucun point du réseau ne dispose à lui seul de l'information complète.

Cet article propose une dissection technique du réseau : origines, architecture, cryptographie, services cachés, contournement de la censure, vecteurs d'attaque contemporains et perspectives d'avenir.

### 1.1 Origines : du laboratoire naval à la société civile

Le concept du routage en oignon a été théorisé au milieu des années 1990 par trois chercheurs du **U.S. Naval Research Laboratory (NRL)** : Paul Syverson, David Goldschlag et Mike Reed. Leur publication fondatrice, *Hiding Routing Information* (1996), posait le problème en ces termes : comment protéger les communications militaires et de renseignement contre l'analyse de trafic, même lorsque le contenu est chiffré ?

Le premier prototype, déployé en interne au NRL, souffrait de limitations architecturales (réseau centralisé, absence de *forward secrecy*). C'est en 2002 que **Roger Dingledine** et **Nick Mathewson** (MIT), en collaboration avec Syverson, ont développé la seconde génération du protocole — baptisée simplement **Tor**. Le code source a été publié sous licence libre (BSD) en **septembre 2002**, et la conception formelle présentée dans l'article *Tor: The Second-Generation Onion Router* au symposium USENIX Security 2004.

Un paradoxe fondamental se cache dans les origines de Tor : un réseau d'anonymat ne protège personne s'il n'est utilisé que par une seule organisation. Les communications sensibles doivent se fondre dans un « bruit de fond » suffisamment diversifié pour rendre l'analyse statistique impraticable. C'est pourquoi le NRL a choisi de publier le code et d'encourager son adoption civile — un cas rare où l'intérêt militaire et l'intérêt public convergeaient directement.

La gestion du projet a d'abord transité par l'**Electronic Frontier Foundation (EFF)**, avant la création de **The Tor Project, Inc.** en 2006, organisation à but non lucratif basée aux États-Unis.

### 1.2 Financement et gouvernance

La viabilité de Tor repose sur un financement diversifié. Historiquement, une part significative provenait d'agences fédérales américaines — notamment le Département d'État (via le Bureau de la Démocratie, des Droits de l'Homme et du Travail) et la DARPA. Cette dualité — financement étatique pour un outil qui défie la surveillance — illustre le statut de Tor comme technologie **« à double usage »** (*dual-use*) : elle sert les intérêts diplomatiques américains (promotion de la liberté d'expression dans les régimes autoritaires) autant que la confidentialité des citoyens, y compris face à la surveillance domestique.

Depuis les années 2010, le Tor Project a diversifié ses sources : fondation Mozilla, dons individuels, programmes européens (Horizon 2020), et organisations de défense des droits numériques (OTF, Freedom of the Press Foundation). Cette diversification réduit la dépendance à un bailleur unique et renforce la légitimité du projet.

### 1.3 Qui utilise Tor, et pourquoi ?

Avant de plonger dans la mécanique interne, il est utile de rappeler la diversité des usages légitimes :

- **Journalistes et lanceurs d'alerte** : communication sécurisée avec des sources (SecureDrop, utilisé par le New York Times, The Guardian, etc.)
- **Dissidents et activistes** : contournement de la censure dans les régimes autoritaires (Chine, Iran, Russie, Biélorussie)
- **Citoyens ordinaires** : protection contre le traçage publicitaire et la surveillance de masse
- **Chercheurs en sécurité** : analyse de menaces, veille sur les marchés noirs
- **Forces de l'ordre** : enquêtes sous couverture nécessitant l'anonymat
- **Entreprises** : veille concurrentielle sans révéler l'origine des requêtes

Cette diversité est elle-même une propriété de sécurité : plus le réseau est utilisé par des profils variés, plus il est difficile de présumer qu'un utilisateur donné a un motif « suspect ».

---

## 2. Modèle de menace

Avant de détailler l'architecture, il est essentiel de comprendre **contre quoi** Tor protège — et contre quoi il ne protège pas. Tout système de sécurité se définit par son **modèle de menace** (*threat model*), c'est-à-dire les hypothèses sur les capacités de l'adversaire.

### 2.1 Ce que Tor suppose

Le modèle de menace de Tor repose sur plusieurs hypothèses centrales :

1. **Adversaire local ou partiel** : Tor est conçu pour résister à un adversaire qui contrôle *une partie* du réseau — votre FAI, un relais malveillant, un point d'accès Wi-Fi compromis — mais pas l'intégralité. Il ne garantit pas l'anonymat face à un **adversaire global passif** capable d'observer simultanément l'ensemble du trafic Internet.

2. **Cryptographie solide** : les primitives cryptographiques utilisées (Curve25519, AES-128, SHA-256, Ed25519) sont supposées résistantes. Une percée en cryptanalyse invaliderait ces garanties.

3. **Logiciel non compromis** : Tor suppose que le client et le système d'exploitation de l'utilisateur ne sont pas infectés par un malware. Un keylogger ou un cheval de Troie rend toute couche réseau inutile.

4. **Comportement utilisateur raisonnable** : l'anonymat technique peut être annulé par un comportement imprudent — se connecter à un compte personnel, utiliser le même pseudonyme sur Tor et sur le web classique, etc.

### 2.2 Adversaires types

| Adversaire | Capacités | Tor protège ? |
|---|---|---|
| FAI / opérateur Wi-Fi | Voit les connexions sortantes | ✓ (contenu et destination masqués) |
| Site web visité | Voit l'IP de connexion | ✓ (voit l'IP du nœud de sortie) |
| Relais Tor isolé (malveillant) | Voit une portion du circuit | ✓ (information partielle, inexploitable seule) |
| Adversaire contrôlant entrée ET sortie | Corrélation temporelle | ⚠ Partiellement (attaque de corrélation) |
| Adversaire global passif (NSA-tier) | Surveillance de masse du trafic | ⚠ Protection limitée |
| Malware sur la machine | Accès complet au système | ✗ |
| Surveillance physique | Observation directe | ✗ |

Cette grille permet de calibrer ses attentes : Tor offre une protection forte contre la surveillance « ordinaire » (FAI, sites web, Wi-Fi public), mais ses garanties s'érodent face à des adversaires dotés de capacités d'observation réseau étendues.

---

## 3. Architecture fondamentale

Le réseau Tor est un **réseau superposé** (*overlay network*) fonctionnant au-dessus de TCP/IP. Il encapsule le trafic applicatif dans des tunnels chiffrés multi-sauts. En 2025, le réseau compte plus de **7 000 relais** opérés par des volontaires à travers le monde, et dessert quotidiennement environ **2 à 3 millions d'utilisateurs**.

### 3.1 Routage en oignon : principe fondamental

Dans une connexion Internet classique, chaque paquet transporte les adresses IP source et destination en clair. Votre FAI voit où vous allez ; le serveur distant voit d'où vous venez. Tor remplace ce modèle direct par un **circuit à 3 sauts** (relais), de sorte qu'aucun nœud intermédiaire ne dispose à lui seul de l'information complète.

{{< tor-circuit >}}

L'analogie de l'oignon décrit la structure des données transmises. Imaginons un message que l'on souhaite envoyer à travers trois relais (A → B → C) vers une destination D :

1. Le client **chiffre le message trois fois**, en commençant par la couche la plus intérieure :
   - Chiffrement pour C (couche interne)
   - Chiffrement pour B (couche médiane)
   - Chiffrement pour A (couche externe)

2. Le **nœud A** (Guard) déchiffre la couche externe. Il découvre l'adresse de B, mais pas le contenu ni la destination finale. Il transmet le paquet restant à B.

3. Le **nœud B** (Middle) déchiffre la couche médiane. Il découvre l'adresse de C, mais ne connaît ni l'expéditeur original ni la destination finale. Il transmet à C.

4. Le **nœud C** (Exit) déchiffre la dernière couche et découvre le message original (ou la requête HTTPS). Il le transmet à la destination D.

**Propriété fondamentale — séparation de la connaissance** :

| Nœud | Connaît l'utilisateur ? | Connaît la destination ? |
|---|---|---|
| Guard (A) | ✓ | ✗ |
| Middle (B) | ✗ | ✗ |
| Exit (C) | ✗ | ✓ |

Aucun nœud individuel ne peut associer un utilisateur à sa destination. C'est cette propriété qui fonde la sécurité de Tor.

> **Analogie** : imaginez que vous envoyez une lettre en la plaçant dans trois enveloppes emboîtées, chacune adressée à un intermédiaire différent. Le premier intermédiaire ouvre l'enveloppe externe, trouve une deuxième enveloppe adressée au suivant, et la lui transmet — sans jamais voir le contenu ni le destinataire final. Chaque intermédiaire ne voit que l'étape précédente et l'étape suivante.

### 3.2 Types de relais

Le réseau Tor distingue plusieurs rôles fonctionnels pour ses relais. Comprendre ces rôles est essentiel pour saisir les propriétés de sécurité du système.

#### 3.2.1 Nœud d'entrée (Guard)

Le premier saut du circuit est le plus sensible : c'est le seul relais qui connaît l'adresse IP réelle de l'utilisateur. Pour cette raison, Tor ne choisit pas les Guards au hasard parmi l'ensemble des relais, mais les sélectionne parmi des relais à **haute stabilité** :

- Uptime élevé (disponibilité continue)
- Bande passante suffisante (> 2 MB/s)
- Présence dans le réseau depuis suffisamment longtemps pour avoir acquis le flag `Guard`

**Guard Pinning** : pour contrer les attaques de rotation, un client Tor conserve le même Guard pendant environ **4 mois** (paramètre configurable). Le raisonnement est probabiliste : si un adversaire contrôle une fraction *f* des Guards, chaque changement de Guard expose l'utilisateur à une probabilité *f* de tomber sur un Guard malveillant. Conserver le même Guard pendant une longue durée transforme ce risque en un événement unique (soit le Guard initial est compromis, soit il ne l'est pas) plutôt qu'en une série de tirages indépendants dont la probabilité cumulée croît avec le temps.

#### 3.2.2 Nœud médian (Middle)

Le relais médian sert de **tampon** entre le Guard et l'Exit. Sa fonction est d'empêcher le nœud de sortie de connaître le Guard (et donc, indirectement, l'utilisateur). N'importe quel relais disposant des flags `Running` et `Valid` peut servir de Middle.

Du point de vue de la sécurité, le Middle est le nœud le moins « intéressant » pour un attaquant : il ne voit ni l'utilisateur ni la destination. Cependant, sa présence est indispensable pour garantir la séparation des connaissances.

#### 3.2.3 Nœud de sortie (Exit)

Le nœud de sortie est la passerelle vers l'Internet public. C'est lui qui initie la connexion TCP finale vers le serveur de destination.

**Visibilité du trafic** : si la connexion finale n'est pas chiffrée (HTTP), l'Exit peut lire le contenu en clair. C'est pourquoi l'utilisation de HTTPS (ou de services .onion, qui chiffrent de bout en bout) est indispensable.

**Risques opérationnels** : l'adresse IP du nœud de sortie apparaît dans les logs du serveur cible. L'opérateur du relais est donc exposé aux plaintes légales (notifications DMCA, enquêtes policières) pour le trafic qu'il relaye, bien qu'il n'en soit pas l'auteur. Ce risque juridique explique la relative pénurie de nœuds de sortie par rapport aux autres types de relais — les Exits représentent environ 15 à 20 % du réseau.

**Politiques de sortie** : chaque opérateur définit les ports TCP autorisés. La **Reduced Exit Policy** recommandée bloque les ports à risque (25 pour le spam SMTP, ports P2P courants) tout en laissant passer le trafic web (80, 443), XMPP, IRC et SSH.

#### 3.2.4 Bridges (Ponts)

Les ponts sont des relais **non listés dans le consensus public**. Ils servent de point d'entrée alternatif pour les utilisateurs dont l'accès aux relais Tor publics est bloqué (censure étatique). Nous les détaillerons dans la section 7 consacrée au contournement de la censure.

### 3.3 Structure des données : cellules

Toutes les données transitant par Tor sont segmentées en **cellules** (*cells*) de taille fixe : **514 octets** (512 octets de payload + 2 octets d'en-tête sur les liens). Cette taille uniforme est un choix de conception délibéré : elle empêche l'analyse de trafic basée sur la taille des paquets. Un observateur ne peut pas distinguer une cellule transportant une page HTML d'une cellule transportant une image, puisqu'elles ont toutes la même taille.

On distingue deux familles de cellules :

**Cellules de contrôle** — gestion du circuit :
- `CREATE` / `CREATED` : établissement d'un nouveau saut (handshake cryptographique)
- `DESTROY` : fermeture du circuit
- `PADDING` : cellules vides pour brouiller l'analyse temporelle

**Cellules de relais** (*relay cells*) — données de bout en bout, encapsulées dans le tunnel chiffré :
- `RELAY_BEGIN` : ouvrir une connexion TCP vers une destination
- `RELAY_DATA` : données applicatives (le contenu réel)
- `RELAY_END` : fermer un flux TCP
- `RELAY_SENDME` : contrôle de flux (fenêtre glissante)
- `RELAY_RESOLVE` : résolution DNS via le circuit

### 3.4 Résolution DNS

Un détail souvent négligé mais critique : la résolution DNS. Si votre navigateur résout les noms de domaine *avant* d'envoyer la requête dans le tunnel Tor, votre FAI voit les domaines que vous visitez — ce qui annule une grande partie de l'anonymat.

Tor résout ce problème en **proxifiant les requêtes DNS** à travers le circuit. Le client Tor envoie le nom de domaine non résolu au nœud de sortie, qui effectue la résolution DNS à sa place. C'est le nœud de sortie — et non l'utilisateur — qui contacte le serveur DNS.

Le Tor Browser est configuré pour cela par défaut (via le proxy SOCKS5 avec résolution distante). En revanche, les applications tierces mal configurées peuvent provoquer des **fuites DNS** (*DNS leaks*), révélant les sites visités au FAI malgré l'utilisation de Tor.

### 3.5 Contrôle de congestion

Les premières versions de Tor utilisaient un contrôle de flux rudimentaire basé sur des fenêtres fixes de cellules `SENDME`. Ce mécanisme, hérité de la conception originale, causait des inefficacités notables : les circuits à haute latence sous-utilisaient la bande passante, tandis que les circuits rapides saturaient les buffers des relais.

En **2023**, Tor a déployé un nouveau mécanisme de **contrôle de congestion basé sur le RTT** (*Round-Trip Time*), inspiré des algorithmes modernes de contrôle de congestion TCP (Vegas/BBR). Chaque circuit mesure dynamiquement son temps aller-retour et ajuste sa fenêtre d'émission en conséquence. Ce changement a significativement amélioré les performances du réseau, réduisant la latence et augmentant le débit effectif, en particulier pour les connexions longues (téléchargements, streaming).

---

## 4. Cryptographie

La sécurité de Tor repose sur plusieurs couches de cryptographie, chacune servant un objectif distinct. Cette section détaille les protocoles utilisés pour l'établissement des circuits et la protection des données en transit.

### 4.1 Évolution des protocoles de handshake

Le protocole de **handshake** est le mécanisme par lequel le client et un relais négocient une clé de chiffrement partagée, sans qu'un observateur puisse la déduire.

#### TAP (obsolète)

Le protocole original, **TAP** (*Tor Authentication Protocol*), reposait sur RSA-1024 et Diffie-Hellman classique. Il a été progressivement abandonné en raison de la taille excessive des clés RSA et de la lenteur des opérations modulaires, mais surtout parce que RSA-1024 est aujourd'hui considéré comme insuffisamment sûr.

#### ntor (standard actuel)

Le protocole **ntor**, déployé depuis 2013, utilise la cryptographie sur courbes elliptiques. Il est à la fois plus rapide et plus sûr que TAP :

- **Curve25519** pour l'échange de clés Diffie-Hellman sur courbe elliptique (X25519)
- **HKDF** (HMAC-based Key Derivation Function) sur SHA-256 pour dériver les clés de session
- **AES-128-CTR** pour le chiffrement symétrique des cellules en transit

**Déroulement simplifié du handshake ntor** :

1. Le client génère une **paire de clés éphémères** Curve25519 : (x, X) où x est la clé privée et X = x·G la clé publique.
2. Le client envoie une cellule `CREATE2` contenant : l'identité du relais, la clé publique permanente B du relais (obtenue via le consensus), et X.
3. Le relais génère sa propre paire éphémère (y, Y), puis calcule le **secret partagé** à partir de deux opérations ECDH combinées : une avec la clé éphémère du client et la clé permanente du relais, et une entre les deux clés éphémères.
4. Le relais répond avec `CREATED2` contenant Y et un **authentificateur** (MAC) prouvant qu'il possède la clé privée correspondant à B.
5. Les deux parties dérivent indépendamment les **clés de session** (chiffrement + intégrité) via HKDF.

Le double calcul ECDH (éphémère-permanent + éphémère-éphémère) garantit deux propriétés :
- **Authentification** : seul le relais légitime (possédant b, la clé privée de B) peut calculer le bon secret.
- **Confidentialité persistante** (*Forward Secrecy*) : les clés éphémères (x, y) sont supprimées après l'établissement du circuit. Même si la clé permanente b du relais est compromise ultérieurement, les sessions passées restent indéchiffrables.

#### ntor-v3 (services onion v3)

Pour les services onion v3, une variante du protocole ntor a été introduite, permettant d'inclure des **données supplémentaires dans le handshake** (extensions de protocole). Le principe cryptographique reste identique, mais le format des messages est étendu pour supporter les besoins spécifiques du rendez-vous (voir section 6).

### 4.2 Hiérarchie des clés

Chaque relais Tor maintient une hiérarchie de clés cryptographiques, chacune ayant un rôle et une durée de vie distincts :

| Clé | Algorithme | Rôle | Rotation |
|---|---|---|---|
| **Master Identity Key** | Ed25519 | Identité racine du relais. Signe la Signing Key. Stockée hors-ligne chez les opérateurs sérieux. | Jamais (sauf compromission) |
| **Signing Key** | Ed25519 | Signe les descripteurs publiés dans le consensus. | Régulière (jours/semaines) |
| **Link Key** | RSA + TLS | Chiffre le tunnel TCP entre relais adjacents. | À chaque connexion TLS |
| **Onion Key** | Curve25519 | Utilisée dans le handshake ntor pour négocier les clés de circuit. | Rotative (~semaines) pour garantir la *forward secrecy* |

La séparation entre Identity Key (permanente, hors-ligne) et Signing Key (rotative, en ligne) permet à un opérateur de révoquer une Signing Key compromise sans perdre l'identité de son relais — un mécanisme analogue à celui des certificats intermédiaires dans l'infrastructure PKI du web.

### 4.3 Chiffrement en transit

Une fois le circuit établi (trois handshakes successifs, un par saut), le client dispose de **trois paires de clés symétriques** (une par relais). Chaque cellule envoyée est chiffrée trois fois par le client (couche la plus externe pour le Guard, intermédiaire pour le Middle, interne pour l'Exit). Chaque relais ne retire que sa propre couche.

Le chiffrement utilise **AES-128-CTR** (Counter Mode), un mode de chiffrement par flux qui ne nécessite pas de padding et permet le traitement octet par octet. L'intégrité des cellules de relais est vérifiée par un digest incrémental (SHA-1 dans le protocole actuel, en cours de migration vers SHA-3/256).

---

## 5. Gouvernance du réseau : autorités d'annuaire

Le fonctionnement de Tor repose sur une question de confiance fondamentale : comment un client sait-il quels relais existent, lesquels sont fiables, et quelles sont leurs clés publiques ? La réponse passe par les **Directory Authorities** (DirAuths).

### 5.1 Les 9 autorités

La confiance dans Tor est ancrée dans **9 serveurs d'autorité** (*Directory Authorities*) dont les clés publiques sont **codées en dur** dans le code source du logiciel. Ces autorités sont opérées par des membres de confiance de la communauté Tor, répartis géographiquement (principalement aux États-Unis et en Europe).

Ce choix de conception est un compromis pragmatique : un système entièrement décentralisé (type blockchain) serait plus résistant à la coercition, mais introduirait des problèmes de cohérence et de latence. Les 9 DirAuths constituent un **point de confiance centralisé**, atténué par le fait qu'un consensus nécessite l'accord de la majorité.

### 5.2 Protocole de consensus

Chaque heure, les autorités produisent collectivement un **document de consensus** décrivant l'état du réseau :

1. **Mesure** : chaque autorité (et des *bandwidth authorities* dédiées) scanne indépendamment les relais pour mesurer leur disponibilité, leur bande passante et leur comportement.

2. **Attribution des flags** : en fonction des mesures, chaque autorité attribue des drapeaux aux relais :
   - `Running` : le relais est joignable
   - `Valid` : le relais se comporte conformément au protocole
   - `Guard` : éligible comme nœud d'entrée (stabilité, bande passante)
   - `Exit` : autorise le trafic sortant
   - `Stable` : uptime élevé
   - `HSDir` : participe au stockage des descripteurs de services onion
   - `BadExit` : relais de sortie identifié comme malveillant (MitM, sniffing)

3. **Vote** : chaque autorité publie son vote (liste des relais avec leurs flags et poids).

4. **Consensus** : les votes sont agrégés par calcul majoritaire. Un relais obtient un flag si la majorité des autorités le lui attribue. Le document final est signé par les autorités participantes.

5. **Distribution** : le consensus (valide 3 heures, renouvelé chaque heure) est distribué aux clients, soit directement, soit via des **directory mirrors** (caches).

### 5.3 Sélection de chemin

Les clients ne choisissent pas les relais uniformément au hasard, mais de manière **pondérée par la bande passante** mesurée. Ce choix est essentiel pour deux raisons :

- **Performance** : sans pondération, les relais à faible bande passante seraient autant sollicités que les relais puissants, dégradant les performances pour tous.
- **Sécurité** : paradoxalement, la pondération par bande passante *améliore* la sécurité. Un adversaire qui déploie de nombreux relais à faible bande passante obtient un poids total limité, donc une faible probabilité d'être sélectionné.

Le consensus contient des **poids de position** (Wgg, Wgm, Wee, Wem, etc.) qui ajustent la probabilité de sélection en fonction du rôle : un relais flaggé `Exit` sera favorisé en position de sortie plutôt qu'en position de Guard, afin de préserver la capacité de sortie (ressource rare) pour son usage effectif.

---

## 6. Services Onion v3

Jusqu'ici, nous avons décrit comment Tor protège l'identité du *client*. Les **services onion** (anciennement « services cachés ») étendent cette protection au *serveur* : un site web ou tout autre service peut être accessible sans révéler son adresse IP ni sa localisation physique.

### 6.1 Pourquoi des services onion ?

Les services onion offrent plusieurs avantages par rapport à une connexion Tor classique vers un site public :

- **Anonymat bidirectionnel** : ni le client ni le serveur ne connaissent l'IP de l'autre.
- **Chiffrement de bout en bout** : le trafic ne quitte jamais le réseau Tor, éliminant le risque d'interception au nœud de sortie.
- **Auto-authentification** : l'adresse .onion est dérivée de la clé publique du service. Le client vérifie cryptographiquement qu'il parle au bon serveur — sans aucune autorité de certification tierce.
- **Résistance à la censure** : aucun nom de domaine DNS à saisir, aucun hébergeur à contraindre.

### 6.2 Adressage cryptographique

La version 3 des services onion (obligatoire depuis octobre 2021, la v2 ayant été dépréciée) utilise des adresses de **56 caractères** suivies de `.onion` :

```
p53lf57qovyuvwsc6xnrppyply3vtqm7l6pcobkmyqsiofyeznfu5uqd.onion
```

Cette adresse n'est pas arbitraire : elle encode directement l'identité cryptographique du service. En décodant le base32, on obtient **35 octets** :

| Champ | Taille | Contenu |
|---|---|---|
| Clé publique | 32 octets | Clé Ed25519 du service |
| Checksum | 2 octets | SHA-3 tronqué (intégrité) |
| Version | 1 octet | `0x03` (v3) |

**Propriété d'auto-authentification** : l'adresse *est* la clé publique. Lorsque le client se connecte, il utilise cette clé pour vérifier que le serveur distant possède la clé privée correspondante. Ce mécanisme élimine entièrement le besoin de certificats TLS émis par des autorités de certification — un avantage architectural majeur sur le web classique.

### 6.3 Protocole de rendez-vous

La connexion à un service onion implique un « ballet » cryptographique en plusieurs étapes, conçu pour qu'aucune partie (et aucun relais intermédiaire) ne puisse associer l'identité du client à celle du serveur.

{{< onion-rendezvous >}}

**Étape 1 — Publication du descripteur** :
Le service onion choisit un ensemble de relais comme **Introduction Points** (IPs) et construit des circuits vers eux. Il génère un **descripteur** contenant sa clé publique et la liste de ses Introduction Points, puis le publie sur le **HSDir** — une table de hachage distribuée (DHT) formée par les relais portant le flag `HSDir`. Le descripteur est **chiffré** : seul un client connaissant l'adresse .onion peut le déchiffrer, ce qui empêche l'énumération des services.

**Étape 2 — Récupération par le client** :
Le client qui connaît l'adresse .onion calcule l'emplacement du descripteur dans le HSDir, le télécharge et le déchiffre. Il obtient ainsi la clé publique du service et la liste des Introduction Points.

**Étape 3 — Établissement du point de rendez-vous** :
Le client choisit un relais arbitraire comme **Rendezvous Point** (RP) et y établit un circuit. Il génère un **cookie de rendez-vous** (secret aléatoire de 20 octets) qu'il envoie au RP.

**Étape 4 — Introduction** :
Le client construit un message `INTRODUCE1` contenant : l'adresse du RP, le cookie de rendez-vous, et la première moitié d'un handshake Diffie-Hellman (ntor-v3). Ce message est **chiffré pour le service** (avec sa clé publique Ed25519) et envoyé via l'Introduction Point.

**Étape 5 — Jonction** :
Le service déchiffre le message d'introduction, construit un circuit vers le RP, et lui envoie le message `RENDEZVOUS1` contenant le cookie (preuve qu'il est le bon destinataire) et la seconde moitié du handshake.

**Étape 6 — Tunnel établi** :
Le RP **relie** (*splice*) les deux circuits. Le client et le service communiquent désormais via un tunnel chiffré de bout en bout, sans que le RP, les Introduction Points, ou tout autre relais intermédiaire ne puisse lire le contenu ni identifier les deux parties.

Au total, une connexion à un service onion traverse **6 relais** (3 côté client + 3 côté service), ce qui explique la latence plus élevée par rapport à une connexion Tor classique.

### 6.4 Vanguards : protection contre la découverte du Guard

Une menace spécifique aux services onion est l'**attaque de découverte du Guard**. Un adversaire qui contrôle un relais malveillant utilisé comme Introduction Point peut tenter de remonter le circuit du service pour identifier son Guard — et par extension, localiser le serveur.

Pour contrer cette menace, Tor implémente le mécanisme **Vanguards** (activé par défaut depuis Tor 0.4.7) :

- Le service utilise un ensemble restreint et stable de relais en **deuxième position** (Layer 2 Guards), en plus du Guard traditionnel en première position.
- Ces relais Layer 2 sont conservés pendant des semaines, et les relais Layer 3 pendant des jours, réduisant la probabilité qu'un adversaire occupe simultanément plusieurs positions stratégiques.
- Le résultat est une **cascade de Guards** qui multiplie le coût de l'attaque : l'adversaire doit contrôler des relais à plusieurs niveaux simultanément, une tâche exponentiellement plus difficile.

### 6.5 Proof-of-Work : défense contre les attaques DoS

Les services onion sont traditionnellement vulnérables aux attaques par déni de service (DoS) : un attaquant peut submerger les Introduction Points ou le service lui-même de requêtes inutiles, à faible coût.

Depuis **2023**, Tor intègre un mécanisme de **Proof-of-Work (PoW)** optionnel pour les services onion, basé sur l'algorithme **Equi-X**. Le principe :

- En conditions normales, la preuve de travail requise est nulle ou triviale (aucun impact sur l'utilisateur légitime).
- Lorsque le service détecte une surcharge, il augmente dynamiquement la difficulté du puzzle cryptographique.
- Les clients légitimes (avec un navigateur Tor à jour) résolvent automatiquement le puzzle avant de se connecter.
- Les attaquants, qui doivent résoudre un puzzle par requête, voient le coût de leur attaque augmenter proportionnellement.

Ce mécanisme rend les attaques DoS économiquement non viables sans pénaliser les utilisateurs en conditions normales.

---

## 7. Contournement de la censure

Dans les pays à censure stricte (Chine, Iran, Russie, Turkménistan, Biélorussie...), l'accès aux relais Tor publics est activement bloqué. Les adresses IP des relais étant listées dans le consensus public, un censeur peut simplement les ajouter à une liste noire. Tor déploie plusieurs contre-mesures.

### 7.1 Bridges (ponts)

Les **bridges** sont des relais Tor dont l'adresse IP n'est **pas publiée** dans le consensus. Ils servent de point d'entrée secret pour les utilisateurs en zone censurée.

Le défi est de distribuer les adresses des bridges aux utilisateurs légitimes sans qu'un censeur puisse toutes les collecter. Tor utilise plusieurs canaux de distribution :

- **BridgeDB** : service web qui distribue un petit nombre de bridges par requête, en limitant le débit par IP et par cookie.
- **Email** : envoi de bridges par email à des adresses Gmail/Riseup (les censeurs hésitent à bloquer l'intégralité de Gmail).
- **Moat** : protocole intégré au Tor Browser permettant de demander des bridges directement depuis l'interface, via un mécanisme CAPTCHA.
- **Telegram** : distribution via bot Telegram, difficile à bloquer sans couper l'accès à Telegram lui-même.

### 7.2 Transports pluggables (Pluggable Transports)

Même avec des bridges, un censeur sophistiqué peut reconnaître le *protocole* Tor par analyse approfondie des paquets (**DPI** — *Deep Packet Inspection*). Les **transports pluggables** masquent l'empreinte réseau de Tor pour la rendre indiscernable d'un trafic anodin.

#### obfs4

Le transport pluggable standard et le plus déployé :

- **Obfuscation du handshake** : utilise **Elligator 2**, une technique mathématique qui encode les clés publiques Curve25519 de manière **indiscernable de données aléatoires**. Un censeur ne peut pas distinguer un handshake obfs4 d'un flux de données aléatoires.
- **Obfuscation du trafic** : les paquets sont paddés à des tailles aléatoires.
- **Mode IAT** (*Inter-Arrival Time*) : perturbe le timing entre les paquets pour contrer l'analyse temporelle (fingerprinting statistique du trafic).

#### Snowflake

Conçu pour les environnements où même les bridges classiques sont détectés et bloqués :

- **Proxies éphémères** : le client ne se connecte pas à un serveur fixe mais à un **volontaire** dont l'IP change constamment. N'importe qui peut devenir proxy Snowflake en installant une extension de navigateur ou en visitant une page web dédiée.
- **WebRTC** : le transport utilise le protocole WebRTC (utilisé pour la visioconférence), qu'un censeur ne peut bloquer sans casser les applications de communication légitimes (Google Meet, Zoom, etc.).
- **Broker centralisé** : un serveur de coordination (le *broker*) met en relation les clients et les proxies. Le broker utilise le **domain fronting** — une technique où la requête HTTPS semble adressée à un CDN majeur (Google, Azure, Fastly) mais est en réalité routée vers le broker Tor.

#### WebTunnel

Transport plus récent qui encapsule le trafic Tor dans des **connexions WebSocket HTTPS** standard. Pour un observateur, le trafic ressemble à une navigation web ordinaire vers un site légitime.

#### Comparaison des transports

| Transport | Résistance au DPI | Résistance au blocage IP | Déploiement |
|---|---|---|---|
| obfs4 | Élevée (indiscernable de l'aléatoire) | Moyenne (IP de bridge fixe) | Mature, largement déployé |
| Snowflake | Moyenne (WebRTC identifiable) | Très élevée (IP éphémères, impossibles à lister) | Mature |
| WebTunnel | Élevée (ressemble à du HTTPS normal) | Élevée (adossé à des sites web réels) | En déploiement |

---

## 8. Vulnérabilités et attaques

Aucun système de sécurité n'est invulnérable. Comprendre les faiblesses de Tor est indispensable pour l'utiliser correctement et calibrer ses attentes.

### 8.1 Corrélation de trafic (attaque fondamentale)

La menace la plus fondamentale contre Tor — et contre tout réseau d'anonymat à faible latence — est la **corrélation de trafic** (*traffic correlation* ou *end-to-end correlation*).

**Principe** : un adversaire capable d'observer simultanément le trafic *entrant* dans le réseau Tor (côté utilisateur) et le trafic *sortant* (côté nœud de sortie ou service de destination) peut corréler les motifs temporels (timing, volumes, rafales) pour relier les deux bouts du circuit.

Tor est un réseau à **faible latence** (*low-latency*) : il transmet les données en temps quasi-réel, sans les mélanger avec celles d'autres utilisateurs ni introduire de délais artificiels significatifs. Ce choix de conception, nécessaire pour offrir une expérience de navigation utilisable, rend le réseau intrinsèquement vulnérable à la corrélation temporelle.

**Qui peut mener cette attaque ?**

- **Fournisseurs d'accès Internet (FAI)** : un FAI qui observe le trafic de l'utilisateur *et* le trafic vers le serveur cible.
- **Opérateurs de systèmes autonomes (AS)** : les recherches de Sun et al. (« **RAPTOR** », USENIX 2015) montrent que les grands opérateurs de transit Internet peuvent exploiter l'asymétrie du routage BGP pour se positionner sur les chemins d'entrée *et* de sortie d'un circuit Tor, même sans contrôler directement les relais.
- **Agences de renseignement** : un adversaire disposant d'une capacité d'écoute massive (tap sur les fibres optiques internationales) pourrait théoriquement corréler à grande échelle.

**Contre-mesures** :
- Le Guard pinning limite la fenêtre d'attaque (un adversaire doit contrôler le Guard spécifique de l'utilisateur).
- Le padding de cellules et les mécanismes anti-timing brouillent les motifs, mais ne les éliminent pas entièrement.
- La recherche active explore les techniques de **padding adaptatif** et de mélange (*mixing*), au prix d'une latence accrue.

### 8.2 Relais malveillants

Un adversaire peut déployer ses propres relais Tor pour intercepter ou manipuler le trafic.

**Attaques Exit** : un nœud de sortie malveillant peut effectuer du *SSL stripping* (forcer le passage de HTTPS à HTTP), injecter du contenu dans les pages non chiffrées, ou journaliser le trafic en clair. En 2020, un groupe identifié sous le nom de **KAX17** a opéré simultanément jusqu'à ~900 relais malveillants (dont des exits, des guards et des HSDir), représentant une fraction significative du réseau. Leur objectif apparent était la **désanonymisation par corrélation**.

**Contre-mesures** :
- Les *bandwidth authorities* et des outils de détection (comme **OrNetRadar**) surveillent les anomalies (création soudaine de relais, concentration dans un même sous-réseau).
- Le flag `BadExit` permet d'exclure les relais de sortie identifiés comme malveillants.
- La diversité des opérateurs est encouragée : le Tor Project publie des métriques sur la concentration des relais par AS, pays et opérateur.

### 8.3 Cas d'étude : Boystown (2021–2024)

Le démantèlement de la plateforme d'abus « Boystown » par les autorités allemandes (BKA), rendu public en 2024, illustre l'efficacité potentielle des **attaques temporelles dans la pratique**.

Selon les éléments disponibles :
- Les autorités ont surveillé le trafic entrant et sortant de nœuds Tor opérés en Allemagne pendant plusieurs mois.
- L'application **Ricochet** (messagerie instantanée utilisant les services onion) utilisée par le suspect n'implémentait pas de padding suffisant entre les messages.
- La corrélation de micro-délais (timing des paquets à l'entrée du réseau vs. timing au niveau du service onion) a permis de lier un utilisateur spécifique à son activité.

Le Tor Project a réagi en soulignant que cette attaque exploitait des **failles applicatives** (insuffisance du padding dans Ricochet, version ancienne de Tor) plutôt qu'une rupture fondamentale du protocole. Cependant, ce cas démontre que face à un adversaire disposant d'une vue réseau étendue (un pays avec de nombreux relais domestiques) et de suffisamment de temps, la corrélation temporelle est une menace réelle.

Depuis, Ricochet a été mis à jour (Ricochet-Refresh) avec un padding amélioré, et les mécanismes Vanguards sont activés par défaut.

### 8.4 Exploits navigateur (NIT)

Le **Tor Browser** est basé sur Firefox ESR (*Extended Support Release*) avec des modifications de sécurité. Malgré ces durcissements, il hérite des vulnérabilités potentielles du moteur de rendu de Firefox.

Les **NIT** (*Network Investigative Techniques*) sont des exploits déployés par les forces de l'ordre pour désanonymiser les utilisateurs de Tor. Le scénario type :

1. Les enquêteurs prennent le contrôle d'un site .onion illégal.
2. Ils injectent un exploit ciblant une vulnérabilité de Firefox (exemple : **CVE-2024-9680**, une faille *use-after-free* dans le moteur d'animations CSS).
3. L'exploit exécute du code sur la machine de l'utilisateur, **contournant le proxy Tor** et contactant directement un serveur contrôlé par les enquêteurs — révélant l'IP réelle.

**Contre-mesures** :

- **Maintenir le Tor Browser à jour** : les correctifs sont publiés rapidement après la découverte de vulnérabilités.
- **Security Level: Safest** : désactive JavaScript, ce qui neutralise la majorité des exploits navigateur.
- **Tails OS** ou **Whonix** : systèmes d'exploitation qui routent *tout* le trafic via Tor au niveau du système, empêchant un exploit de contourner le proxy même s'il exécute du code.

### 8.5 Attaques par empreinte de site web (Website Fingerprinting)

Même sans voir le contenu, un observateur local (votre FAI) peut tenter de deviner quels sites vous visitez en analysant les **motifs de trafic** : taille cumulée des données, nombre de paquets, séquence temporelle, direction des échanges. Chaque site web produit une « empreinte » caractéristique lors du chargement.

Les recherches académiques montrent que cette attaque est efficace en laboratoire (taux de détection > 90 % dans certaines configurations) mais beaucoup plus difficile en conditions réelles (trafic concurrent, onglets multiples, variations de latence). Les contre-mesures actuelles incluent le padding des cellules et la normalisation du trafic, mais restent un domaine de recherche actif.

---

## 9. Aspects légaux

### 9.1 Légalité de l'utilisation de Tor

L'utilisation de Tor est **légale dans la plupart des juridictions** démocratiques (États-Unis, Union Européenne, Canada, etc.). Tor est un outil de protection de la vie privée, au même titre qu'un VPN ou le chiffrement HTTPS. Cependant :

- En **Chine** et en **Russie**, l'utilisation d'outils de contournement de la censure est formellement restreinte ou interdite, bien que l'application varie.
- Dans certains contextes, l'utilisation de Tor peut attirer l'attention des services de renseignement, même si elle n'est pas illégale *per se*.
- L'activité menée *à travers* Tor reste soumise aux lois applicables : Tor protège l'anonymat, pas l'impunité.

### 9.2 Risques pour les opérateurs de relais

#### Nœuds de sortie (Exit)

L'IP du nœud de sortie apparaît comme source de tout trafic sortant dans les logs des serveurs de destination. L'opérateur peut recevoir :

- Des **notifications DMCA** (droit d'auteur)
- Des **plaintes pour abus** (spam, tentatives de connexion non autorisées)
- Des **réquisitions judiciaires** dans le cadre d'enquêtes

La jurisprudence tend, aux États-Unis comme en Europe, vers la reconnaissance du statut de **« simple transporteur »** (*mere conduit*), analogue à celui d'un fournisseur d'accès Internet — l'opérateur transporte le trafic sans en connaître ni contrôler le contenu. Toutefois, le harcèlement juridique (même infondé) et les saisies de matériel restent des risques concrets.

L'**EFF** et le **Tor Project** publient des guides juridiques pour les opérateurs et recommandent d'informer l'hébergeur de l'activité Tor, d'afficher une page d'information sur l'IP du relais, et d'enregistrer une entité légale distincte.

#### Relais non-Exit (Guard, Middle)

Les relais qui ne transportent pas de trafic en clair vers Internet présentent un risque juridique nettement plus faible. Leur IP n'apparaît pas dans les logs des serveurs externes. Opérer un relais Middle ou Guard est un moyen de contribuer au réseau avec un risque minimal.

---

## 10. Tor, VPN et autres réseaux d'anonymat

Une question fréquente mérite d'être traitée : quel est le rapport entre Tor et les VPN ? Et comment Tor se compare-t-il à d'autres réseaux d'anonymat ?

### 10.1 Tor vs VPN

| Critère | Tor | VPN |
|---|---|---|
| **Modèle de confiance** | Distribué (aucun nœud unique ne voit tout) | Centralisé (le fournisseur VPN voit tout) |
| **Anonymat** | Fort (séparation des connaissances) | Faible (le VPN connaît votre IP *et* vos destinations) |
| **Vérifiabilité** | Code ouvert, audité, réseau transparent | Politique « no-log » invérifiable |
| **Performance** | Latence élevée (~200-600 ms), débit limité | Latence faible, haut débit |
| **Cas d'usage** | Anonymat fort, contournement de la censure | Confidentialité basique, contournement géographique |
| **Coût** | Gratuit | Payant (généralement) |

**Point clé** : un VPN *déplace* la confiance de votre FAI vers le fournisseur VPN. Il ne l'*élimine* pas. Si le fournisseur VPN est compromis, coopère avec les autorités, ou journalise le trafic malgré ses promesses, votre anonymat s'effondre. Tor élimine ce point unique de défaillance par sa conception distribuée.

**Faut-il utiliser un VPN avec Tor ?** La réponse est nuancée. Le Tor Project ne le recommande généralement pas : un VPN ajouté avant Tor (VPN → Tor) ne fait que déplacer la confiance du FAI vers le VPN, et peut introduire un point de corrélation supplémentaire. Un VPN après Tor (Tor → VPN) est techniquement complexe et rarement justifié. Exceptions : un VPN peut être utile pour masquer le *fait* d'utiliser Tor à votre FAI (si les bridges ne suffisent pas).

### 10.2 Tor vs I2P

**I2P** (*Invisible Internet Project*) est un réseau d'anonymat avec une philosophie différente :

- I2P est optimisé pour les services internes au réseau (*eepsites*) plutôt que pour l'accès au web classique.
- I2P utilise un routage en **« ail »** (*garlic routing*) : les messages de plusieurs sources sont agrégés dans un même paquet chiffré, offrant une résistance accrue à l'analyse de trafic.
- I2P est entièrement décentralisé (pas d'autorités d'annuaire centrales).
- En revanche, I2P a une base d'utilisateurs beaucoup plus petite (ce qui réduit l'anonymat par la taille du réseau) et un écosystème moins mature.

### 10.3 Tor vs mixnets

Les **réseaux de mixage** (Nym, Katzenpost) sacrifient la latence pour obtenir des garanties d'anonymat plus fortes que Tor. Chaque message est retardé et mélangé avec ceux d'autres utilisateurs dans des « lots » (*batches*), rendant la corrélation temporelle beaucoup plus difficile — voire théoriquement impossible pour certains modèles.

Le coût est une latence de l'ordre de la seconde ou de la minute, ce qui les rend inadaptés à la navigation web interactive, mais potentiellement intéressants pour le courrier électronique ou la messagerie asynchrone.

---

## 11. Bonnes pratiques de sécurité opérationnelle (OPSEC)

L'anonymat fourni par Tor est **probabiliste, pas absolu**. Le protocole peut être parfait ; votre comportement peut le compromettre. Cette section rassemble les pratiques essentielles.

### 11.1 Règles fondamentales

**Navigateur et système** :
- **Utiliser exclusivement le Tor Browser** pour la navigation anonyme. Les navigateurs ordinaires (Chrome, Firefox standard) ne sont pas configurés pour éviter les fuites.
- **Ne jamais redimensionner** la fenêtre du Tor Browser. La résolution de la fenêtre est un vecteur de fingerprinting : Tor Browser démarre avec une taille standardisée pour que tous les utilisateurs aient la même empreinte.
- **Maintenir le logiciel à jour**. Les correctifs de sécurité sont critiques (cf. exploits NIT en section 8.4).
- **Ne pas modifier les paramètres par défaut** du Tor Browser (plugins, extensions, about:config). Chaque modification augmente la singularité de votre empreinte.
- **Activer le niveau de sécurité « Safest »** sur les sites sensibles. Ce niveau désactive JavaScript, les polices distantes, et de nombreux vecteurs d'attaque.

**Comportement en ligne** :
- **Ne pas se connecter à des comptes personnels** (Google, Facebook, email nominatif) via Tor. Ces comptes sont liés à votre identité réelle ; les utiliser via Tor annule l'anonymat.
- **Ne pas mélanger les identités** : ne pas utiliser le même pseudonyme sur Tor et sur le web classique.
- **Ne pas télécharger de fichiers et les ouvrir hors Tor**. Les fichiers (PDF, DOCX, vidéos) peuvent contenir des liens vers des ressources externes que votre système récupérera *hors du tunnel Tor*, révélant votre IP.
- **Préférer les sites .onion ou HTTPS**. Sur les connexions HTTP non chiffrées, le nœud de sortie peut lire le contenu en clair.

**Réseau** :
- **Utiliser des bridges** en zone censurée ou si vous souhaitez masquer l'utilisation de Tor à votre FAI.
- **Éviter le torrent** via Tor. Le protocole BitTorrent envoie votre IP réelle dans les paquets d'extension DHT, contournant le proxy. De plus, le torrent consomme une bande passante disproportionnée et dégrade le réseau pour les autres utilisateurs.

### 11.2 Pour un anonymat renforcé

Si votre modèle de menace implique un adversaire déterminé (État, organisation criminelle), des précautions supplémentaires s'imposent :

- **Tails OS** : système d'exploitation live (depuis clé USB) qui route *tout* le trafic via Tor au niveau du noyau, ne laisse aucune trace sur le disque, et isole les applications.
- **Whonix** : système en deux machines virtuelles (Gateway + Workstation) où la Gateway gère exclusivement le routage Tor. Même un exploit avec exécution de code sur la Workstation ne peut pas contourner le proxy Tor car celui-ci s'exécute sur une machine séparée.
- **Compartimenter les identités** : utiliser des sessions ou des machines virtuelles distinctes pour chaque identité en ligne.
- **Éviter les motifs de comportement** : horaires de connexion réguliers, style d'écriture identifiable (*stylometry*), habitudes de navigation.

### 11.3 Ce que Tor ne protège pas

| Menace | Protection Tor |
|---|---|
| Malware / keylogger sur votre machine | ✗ Aucune |
| Surveillance physique (caméra, regard) | ✗ Aucune |
| Compromission du service de destination | ✗ Aucune |
| Identification par le contenu (login personnel, etc.) | ✗ Aucune |
| Corrélation temporelle par adversaire à vue réseau étendue | ⚠ Limitée |
| Fingerprinting de site web par observateur local | ⚠ Partielle |
| Analyse stylométrique (style d'écriture) | ✗ Aucune |

---

## 12. Perspectives d'avenir

### 12.1 Arti : la réécriture en Rust

Le client Tor historique est écrit en C — un langage performant mais propice aux bugs de gestion mémoire (buffer overflows, use-after-free, etc.), qui sont la source de nombreuses vulnérabilités de sécurité.

Le Tor Project développe depuis 2020 **Arti**, une réécriture complète du client Tor en **Rust**, un langage offrant des garanties de sécurité mémoire au niveau du compilateur. Arti vise à devenir le client Tor de référence, avec une architecture plus modulaire, plus testable, et mieux adaptée à l'intégration dans d'autres applications (bibliothèque Rust importable). Les premières versions expérimentales sont fonctionnelles, et la transition progressive est en cours.

### 12.2 Cryptographie post-quantique

Les ordinateurs quantiques, s'ils atteignent une taille suffisante, pourront casser les algorithmes à clé publique actuels (RSA, courbes elliptiques, Diffie-Hellman) via l'algorithme de Shor. Cela menace spécifiquement la **confidentialité persistante** (*forward secrecy*) : un adversaire qui enregistre le trafic Tor aujourd'hui pourrait le déchiffrer rétroactivement lorsque les ordinateurs quantiques seront disponibles (attaque *harvest now, decrypt later*).

Le Tor Project travaille à l'intégration de mécanismes de **Key Encapsulation** post-quantiques (basés sur des treillis, comme les candidats NIST ML-KEM) dans le protocole de handshake. L'approche envisagée est un **hybride** : combiner un échange de clés classique (Curve25519) avec un échange post-quantique, de sorte que la sécurité soit garantie même si l'un des deux est brisé.

### 12.3 Protection avancée contre l'analyse temporelle

L'analyse temporelle assistée par apprentissage automatique (machine learning) représente une menace croissante. Des modèles de classification peuvent exploiter des motifs subtils (microbursts, inter-packet delays) avec une précision supérieure aux méthodes statistiques classiques.

Les pistes de recherche incluent le **padding adaptatif** (injection de trafic factice calibré dynamiquement), les **circuits à délai** (introduction de latence contrôlée), et l'**obfuscation de motifs de trafic** au niveau du protocole. Le défi est d'améliorer la résistance sans dégrader les performances au point de rendre le réseau inutilisable.

### 12.4 Décentralisation des autorités d'annuaire

Les 9 Directory Authorities constituent un point de centralisation souvent critiqué. Des propositions explorent l'utilisation de mécanismes de consensus distribués (Byzantine Fault Tolerance, arbres de Merkle vérifiables) pour réduire la dépendance à ce petit groupe d'opérateurs de confiance. Ce chantier est complexe : il faut concilier cohérence du réseau, résistance aux attaques Sybil, et performance.

---

## 13. Ressources

### Documentation officielle

- [Tor Project](https://www.torproject.org) — Site principal, téléchargements
- [Tor Specifications](https://spec.torproject.org) — Spécifications techniques complètes du protocole
- [Tor Metrics](https://metrics.torproject.org) — Statistiques en temps réel du réseau (relais, utilisateurs, bande passante)
- [Tor Browser Manual](https://tb-manual.torproject.org) — Guide utilisateur du navigateur
- [Tor Community](https://community.torproject.org) — Guides pour opérateurs de relais et développeurs
- [Arti](https://gitlab.torproject.org/tpo/core/arti) — Dépôt du client Tor en Rust

### Publications académiques fondamentales

- Syverson, Goldschlag, Reed — *Hiding Routing Information* (Workshop on Information Hiding, 1996) — L'article fondateur du routage en oignon.
- Dingledine, Mathewson, Syverson — *Tor: The Second-Generation Onion Router* (USENIX Security, 2004) — La conception de Tor tel que nous le connaissons.
- Johnson et al. — *Users Get Routed: Traffic Correlation on Tor by Realistic Adversaries* (CCS, 2013) — Démonstration de la faisabilité de la corrélation de trafic par des adversaires réalistes (opérateurs AS).
- Sun et al. — *RAPTOR: Routing Attacks on Privacy in Tor* (USENIX Security, 2015) — Exploitation de l'asymétrie BGP pour la corrélation.
- Jansen, Hopper — *Shadow: Running Tor in a Box for Accurate and Efficient Experimentation* (NDSS, 2012) — Simulateur de réseau Tor pour la recherche.

### Outils complémentaires

- [Tails OS](https://tails.net) — Système d'exploitation live amnésique, routant tout le trafic via Tor
- [Whonix](https://www.whonix.org) — Système d'exploitation en machines virtuelles isolées pour l'anonymat
- [OnionShare](https://onionshare.org) — Partage de fichiers anonyme via services onion
- [SecureDrop](https://securedrop.org) — Plateforme de lanceurs d'alerte (New York Times, Guardian, etc.)

---

## 14. Conclusion

Tor demeure, après trois décennies de développement et d'audit, l'infrastructure d'anonymat la plus robuste et la plus éprouvée disponible publiquement. Son architecture — fondée sur la séparation des connaissances, le chiffrement en couches et la distribution de la confiance — résiste à l'examen continu de la communauté cryptographique et des adversaires les plus sophistiqués.

Cependant, l'anonymat qu'il procure n'est ni magique ni absolu. Il dépend fondamentalement de trois facteurs :

La **diversité du réseau** : plus le nombre d'utilisateurs et d'opérateurs de relais est grand et varié, plus l'ensemble d'anonymat est large et plus il est difficile d'isoler un individu. Chaque utilisateur et chaque relais supplémentaire renforce la sécurité de tous les autres.

La **vigilance des utilisateurs** : le protocole peut être irréprochable ; un comportement imprudent (login personnel, téléchargement hors Tor, mélange d'identités) suffit à annuler la protection. L'OPSEC n'est pas un supplément optionnel, c'est une condition nécessaire.

La **maintenance active** du logiciel et du protocole face à l'évolution des menaces — cryptographie post-quantique, analyse temporelle assistée par IA, surveillance réseau à grande échelle.

Tor n'est pas une solution miracle — c'est un outil qui, utilisé avec discernement et en connaissance de ses limites, offre une protection substantielle contre la surveillance de masse et constitue un pilier essentiel de la liberté numérique.