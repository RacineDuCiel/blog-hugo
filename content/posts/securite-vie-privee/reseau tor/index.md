---
title: "Réseau Tor : architecture, protocoles et implications de sécurité"
date: 2025-12-06
categories: ["Sécurité/Vie Privée"]
showOnHome: true
---

## 1. Introduction

Le réseau Tor (*The Onion Router*) est l'infrastructure d'anonymat la plus robuste et la plus déployée sur Internet. Contrairement au chiffrement classique qui protège le *contenu* des messages, Tor vise à dissimuler les *métadonnées* : qui parle à qui, quand, et à quelle fréquence.

Cet article propose une dissection technique du réseau : architecture, cryptographie, services cachés, contournement de la censure, et vecteurs d'attaque contemporains.

### 1.1 Origines : du laboratoire naval à la société civile

Le concept du routage en oignon a été théorisé au milieu des années 1990 par des chercheurs du **U.S. Naval Research Laboratory (NRL)** : Paul Syverson, David Goldschlag et Mike Reed. L'objectif initial était stratégique — protéger les communications militaires et de renseignement.

Paradoxalement, un tel réseau ne fonctionne que s'il est utilisé par de nombreux utilisateurs hétérogènes : les communications sensibles doivent se fondre dans un « bruit de fond » civil.

En 2002, Roger Dingledine et Nick Mathewson (MIT) ont développé la seconde génération du protocole, baptisée Tor. Le code a été publié sous licence libre (BSD) en **septembre 2002**. La gestion a ensuite transité par l'Electronic Frontier Foundation avant la création de **The Tor Project, Inc.** en 2006.

### 1.2 Financement et gouvernance

La viabilité de Tor repose sur un financement diversifié, incluant historiquement des agences fédérales américaines. Cette dualité — financement étatique pour un outil qui défie la surveillance — illustre le statut de Tor comme technologie « à double usage » (*dual-use*), servant les intérêts diplomatiques américains (liberté d'expression à l'étranger) autant que la confidentialité des citoyens.

---

## 2. Architecture fondamentale

Le réseau Tor est un réseau superposé (*overlay network*) fonctionnant au-dessus de TCP/IP. Il encapsule le trafic dans des tunnels chiffrés virtuels. En 2025, le réseau compte plus de **7 000 relais** opérés par des volontaires.

### 2.1 Routage en oignon

Le cœur de Tor repose sur la séparation entre identification et routage. Une connexion standard expose les adresses IP source et destination dans chaque paquet. Tor remplace ce modèle direct par un **circuit à 3 sauts**.

{{< tor-circuit >}}

L'analogie de l'oignon décrit la structure des données : le client chiffre le message de manière itérative pour chaque nœud du chemin. Pour un circuit A → B → C :

1. Le client chiffre d'abord pour C, puis pour B, puis pour A
2. Le nœud A déchiffre sa couche, transmet à B
3. Le nœud B déchiffre sa couche, transmet à C
4. Le nœud C déchiffre la dernière couche et transmet à la destination

**Propriété fondamentale** : aucun nœud ne connaît le chemin complet :
- **Guard** : connaît l'utilisateur, pas la destination
- **Middle** : ne connaît ni l'un ni l'autre
- **Exit** : connaît la destination, pas l'utilisateur

### 2.2 Types de relais

#### 2.2.1 Nœud d'entrée (Guard)

Le premier saut est critique. Le client sélectionne un Guard parmi des relais à haute stabilité (uptime élevé, bande passante > 2 MB/s).

**Guard Pinning** : pour contrer les attaques de profilage, un client conserve le même Guard pendant **2 à 3 mois**. Changer de garde à chaque session finirait statistiquement par exposer l'utilisateur à un garde malveillant.

#### 2.2.2 Nœud médian (Middle)

Ce relais sert de tampon. N'importe quel relais « Running » et « Valid » peut servir de Middle. Sa fonction : empêcher le nœud de sortie de connaître le Guard.

#### 2.2.3 Nœud de sortie (Exit)

Passerelle vers l'Internet public. C'est le nœud qui initie la connexion TCP finale vers le serveur cible.

**Risques opérationnels** : l'IP de l'Exit apparaît dans les logs du serveur cible. L'opérateur est exposé aux plaintes légales (DMCA, enquêtes) pour le trafic relayé.

**Politiques de sortie** : chaque opérateur définit les ports autorisés. La « Reduced Exit Policy » bloque les ports à risque (25/spam, P2P) tout en laissant le web (80, 443).

### 2.3 Structure des données

Les données sont segmentées en **cellules (cells)** de taille fixe (~512 octets historiquement) pour empêcher l'analyse de trafic basée sur la taille des paquets.

**Cellules de contrôle** : signalisation (CREATE, DESTROY)

**Cellules de relais** : données de bout en bout
- `RELAY_BEGIN` : ouvrir une connexion TCP
- `RELAY_DATA` : données applicatives
- `RELAY_END` : fermer le flux
- `RELAY_SENDME` : contrôle de congestion

---

## 3. Cryptographie

### 3.1 Protocole ntor (standard actuel)

Le protocole original TAP (basé sur RSA-1024) a été remplacé par **ntor**, utilisant la cryptographie sur courbes elliptiques :

- **Curve25519** pour l'échange de clés (ECDH)
- **HKDF** sur SHA-256 pour la dérivation des clés
- **AES-128-CTR** pour le chiffrement symétrique des cellules

**Déroulement du handshake** :

1. Le client génère une paire éphémère (x, X)
2. Le client envoie CREATE2 avec l'ID du relais, sa clé publique B, et X
3. Le relais génère (y, Y) et calcule le secret partagé
4. Le relais répond avec CREATED2 contenant Y et un authentificateur
5. Les deux parties dérivent les clés de session

**Confidentialité persistante (Forward Secrecy)** : les clés éphémères sont supprimées après fermeture du circuit. La compromission future des clés à long terme ne permet pas de déchiffrer le passé.

### 3.2 Hiérarchie des clés

Chaque relais utilise plusieurs niveaux de clés :

| Clé | Algorithme | Usage |
|-----|------------|-------|
| Master Identity | Ed25519 | Identité racine du relais |
| Signing Key | Ed25519 | Signe les descripteurs (renouvelée régulièrement) |
| Link Key | TLS | Chiffre le tunnel TCP entre relais |
| Onion Key | Curve25519 | Handshake ntor (rotative pour forward secrecy) |

---

## 4. Gouvernance : autorités d'annuaire

La confiance dans Tor repose sur **9 Directory Authorities (DirAuths)** dont les clés publiques sont codées en dur dans le logiciel.

### 4.1 Protocole de consensus

Chaque heure, les autorités votent sur l'état du réseau :

1. **Mesure** : scan indépendant de la disponibilité et bande passante des relais
2. **Vote** : publication d'un document listant les relais et leurs flags
3. **Consensus** : calcul majoritaire et génération du document final
4. **Signature** : le consensus est signé par la majorité et distribué aux clients

### 4.2 Sélection de chemin

Les clients ne choisissent pas les relais au hasard mais de manière **pondérée par la bande passante**. Le consensus contient des poids (Wgg, Wgm, Wee...) permettant d'équilibrer la charge et de réserver la capacité Exit aux sorties effectives.

---

## 5. Services Onion v3

Les Services Onion permettent aux serveurs de proposer des services (web, SSH, chat) sans révéler leur IP. La version v3 (obligatoire depuis 2021) a remplacé la v2 dépréciée.

### 5.1 Adressage cryptographique

Une adresse v3 compte **56 caractères** suivis de `.onion` :

> `p53lf57qov...ncopnpyyd.onion`

Structure de l'adresse (encodage base32) :
- **32 octets** : clé publique Ed25519
- **2 octets** : checksum
- **1 octet** : version (= 3)

**Propriété d'auto-authentification** : l'adresse *est* la clé. Le client utilise directement l'adresse pour vérifier que le serveur possède la clé privée correspondante — aucune CA tierce nécessaire.

### 5.2 Protocole de rendez-vous

La connexion à un service caché implique un « ballet » cryptographique où aucune partie ne connaît l'IP de l'autre.

{{< onion-rendezvous >}}

**Les 6 étapes** :

1. **Publication** : le service génère un descripteur (clé publique + liste des Introduction Points) et l'uploade sur le HSDir (DHT distribuée)

2. **Récupération** : le client interroge le HSDir pour obtenir le descripteur

3. **Point de Rendez-vous** : le client choisit un relais aléatoire comme RP et lui envoie un « cookie » secret

4. **Introduction** : le client envoie une cellule INTRODUCE1 via l'IP (adresse du RP + cookie + début handshake DH), chiffrée pour le service

5. **Jonction** : le service déchiffre, construit un circuit vers le RP et envoie RENDEZVOUS1 avec le cookie

6. **Tunnel** : le RP « splice » les deux circuits. Communication chiffrée de bout en bout.

---

## 6. Contournement de la censure

Dans les pays à censure stricte (Chine, Iran, Russie), l'accès aux relais publics est bloqué. Tor déploie des contre-mesures.

### 6.1 Ponts et transports pluggables

Les **ponts (bridges)** sont des relais non listés publiquement. Distribution via canaux discrets (email, Telegram, Moat).

Les **transports pluggables (PT)** masquent l'empreinte TLS de Tor pour tromper l'inspection profonde de paquets (DPI).

### 6.2 obfs4

Protocole d'obfuscation standard :

- **Elligator 2** : représente les clés Curve25519 sous forme indiscernable de l'aléatoire
- **Mode IAT** : perturbe le timing inter-paquets pour contrer l'analyse temporelle

### 6.3 Snowflake

Innovation pour environnements hautement censurés :

- **Proxies éphémères** : le client se connecte à un volontaire (extension navigateur) dans un pays libre
- **WebRTC** : protocole difficile à bloquer sans casser les visioconférences légitimes
- **Domain Fronting** : le broker utilise ce mécanisme pour sembler communiquer avec Google/Azure

---

## 7. Vulnérabilités et attaques

### 7.1 Corrélation de trafic

Menace fondamentale des réseaux à faible latence. Un adversaire observant le trafic entrant (utilisateur) ET sortant (Exit) peut corréler les motifs temporels.

**Attaques au niveau AS** : des recherches (« Raptor ») montrent que les opérateurs de grands systèmes autonomes peuvent exploiter l'asymétrie BGP pour se positionner sur les chemins d'entrée et sortie.

### 7.2 Cas d'étude : Boystown (2024)

Le démantèlement de la plateforme « Boystown » par la police allemande a révélé l'efficacité des **attaques temporelles**.

- Les autorités ont surveillé le trafic de nœuds Tor allemands
- L'application *Ricochet* utilisée n'implémentait pas de padding suffisant
- La corrélation des micro-délais a permis de lier l'utilisateur au service

Le Tor Project souligne que cette attaque exploitait des failles applicatives (OpSec) plutôt qu'une rupture du protocole — mais démontre la fragilité face à un adversaire avec une vue réseau étendue.

### 7.3 Exploits navigateur

Le Tor Browser (basé sur Firefox ESR) hérite de ses vulnérabilités. Les NIT (*Network Investigative Techniques*) exploitent des failles du moteur de rendu (ex: CVE-2024-9680, use-after-free) pour injecter un malware qui contourne Tor et révèle l'IP réelle.

---

## 8. Aspects légaux

### 8.1 Risques pour les opérateurs Exit

L'IP de l'Exit apparaît comme source de tout trafic sortant :
- Notifications DMCA
- Plaintes pour abus (spam, tentatives de piratage)
- Enquêtes policières

La jurisprudence (USA, Europe) tend vers le statut de « simple transporteur » (*mere conduit*), mais le harcèlement légal reste un risque réel.

### 8.2 Reduced Exit Policy

Configuration recommandée bloquant :
- Port 25 (mail/spam)
- Ports 465/587 (SMTP authentifié)
- Ports P2P courants

Autorisant :
- Ports 80, 443 (web)
- Ports XMPP/IRC

---

## 9. Bonnes pratiques (OPSEC)

L'anonymat de Tor est **probabiliste, pas absolu**. Votre comportement peut le compromettre.

### Règles essentielles

- **Ne jamais redimensionner** la fenêtre Tor Browser (fingerprinting de résolution)
- **Désactiver JavaScript** sur les sites sensibles (Security Level: Safest)
- **Ne pas télécharger** de fichiers et les ouvrir hors Tor (fuite IP via apps externes)
- **Ne pas se connecter** à des comptes personnels (Google, Facebook)
- **Utiliser des bridges** en zone censurée
- **Maintenir le logiciel à jour** (correctifs de sécurité critiques)
- **Ne pas modifier** les paramètres par défaut (augmente la singularité)
- **Éviter HTTP** : préférer les sites .onion ou HTTPS (l'Exit voit le trafic non chiffré)

### Ce que Tor ne protège pas

| Menace | Protection |
|--------|------------|
| Malware sur votre machine | ⛌ |
| Keylogger local | ⛌ |
| Surveillance physique | ⛌ |
| Compromission du service cible | ⛌ |
| Corrélation temporelle par adversaire global | ⚠ Limitée |

---

## 10. Ressources

### Officielles

- [Tor Project](https://www.torproject.org) — Site principal
- [Tor Specs](https://spec.torproject.org) — Spécifications techniques
- [Tor Metrics](https://metrics.torproject.org) — Statistiques du réseau
- [Tor Browser Manual](https://tb-manual.torproject.org) — Guide utilisateur

### Recherche académique

- Syverson, Goldschlag, Reed — *Onion Routing* (NRL, 1996)
- Dingledine, Mathewson, Syverson — *Tor: The Second-Generation Onion Router* (2004)
- Johnson et al. — *Users Get Routed: Traffic Correlation on Tor* (CCS 2013)
- Sun et al. — *RAPTOR: Routing Attacks on Privacy in Tor* (USENIX 2015)

### Outils

- [Onion Share](https://onionshare.org) — Partage de fichiers via .onion
- [Tails OS](https://tails.net) — Système live pré-configuré pour l'anonymat

---

## 11. Conclusion

Tor demeure la technologie d'anonymat la plus robuste et la plus auditée. Son architecture, fruit de trois décennies de recherche, a résisté à l'examen de la communauté cryptographique.

Cependant, l'anonymat qu'il procure dépend de :
- La **diversité** du réseau (plus d'utilisateurs = meilleur bruit de fond)
- La **vigilance** des utilisateurs (OPSEC)
- La **maintenance** du code face aux nouvelles attaques

Les défis futurs incluent la cryptographie **post-quantique** (pour préserver le forward secrecy face aux ordinateurs quantiques) et l'amélioration des protections contre l'analyse temporelle assistée par IA.

Tor n'est pas une solution magique — c'est un outil qui, utilisé correctement et en connaissance de ses limites, offre une protection substantielle contre la surveillance de masse.