---
title: "Réseau Tor : architecture, protocoles et implications de sécurité"
date: 2025-12-06
categories: ["Sécurité/Vie Privée"]
showOnHome: true
---

## **1. Introduction et genèse historique**

Le réseau Tor, acronyme de *The Onion Router*, constitue l'une des infrastructures les plus sophistiquées et résilientes dédiées à l'anonymat des communications sur Internet. Contrairement aux solutions de chiffrement point-à-point conventionnelles qui protègent le contenu des messages (confidentialité), Tor est conçu pour dissimuler les métadonnées de communication, à savoir l'identité des interlocuteurs et la nature de leurs échanges (anonymat et non-traçabilité). Cet article propose une dissection technique exhaustive du fonctionnement du réseau, de ses protocoles cryptographiques sous-jacents, de son modèle de services cachés (Onion Services), ainsi que des vecteurs d'attaque contemporains et des stratégies de contournement de la censure.

### **1.1 Origines : du laboratoire naval à la société civile**

L'histoire de Tor débute paradoxalement au sein du complexe militaro-industriel américain. Le concept fondamental du "routage en oignon" a été théorisé et développé au milieu des années 1990 par des mathématiciens et ingénieurs du **U.S. Naval Research Laboratory (NRL)**, spécifiquement par Paul Syverson, David Goldschlag et Mike Reed. L'objectif initial était stratégique : protéger les communications du renseignement américain et des opérations militaires. Cependant, un réseau utilisé exclusivement par des militaires serait aisément identifiable par l'analyse de trafic ; pour qu'un réseau d'anonymat soit efficace, il nécessite une diversité d'utilisateurs générant un "bruit de fond" constant dans lequel les communications sensibles peuvent se fondre.

En 2002, Roger Dingledine et Nick Mathewson, chercheurs diplômés du MIT, ont rejoint le projet pour développer la seconde génération du protocole, baptisée Tor. Le code source a été publié sous licence libre (BSD) en octobre 2002, marquant son ouverture au grand public. La gestion du projet a transité par l'Electronic Frontier Foundation (EFF) avant la constitution formelle de **The Tor Project, Inc.** en 2006, une organisation à but non lucratif basée dans le Massachusetts.

### **1.2 Structure de financement et gouvernance**

La viabilité économique de Tor repose sur une structure de financement diversifiée qui fait souvent l'objet d'analyses géopolitiques. Bien que l'organisation se présente comme un outil de lutte contre la censure étatique, une part substantielle de son financement provient historiquement d'agences fédérales américaines.

Cette dualité — un financement par l'État américain pour un outil qui défie souvent la surveillance des États (y compris celle des États-Unis) — souligne la position unique de Tor comme technologie "à double usage" (dual-use), servant à la fois les intérêts de la diplomatie américaine (liberté d'expression à l'étranger) et les besoins de confidentialité des citoyens.

## **2. Architecture fondamentale et topologie du réseau**

Le réseau Tor est un réseau superposé (overlay network) qui fonctionne au-dessus de la couche de transport TCP/IP standard. Il ne modifie pas le protocole IP lui-même mais encapsule le trafic dans des tunnels chiffrés virtuels. Le réseau est constitué, en 2025, de plus de 7 000 relais (nœuds) opérés par des volontaires à travers le monde.

### **2.1 Le principe du routage en oignon**

Le cœur du fonctionnement de Tor réside dans la séparation de l'identification et du routage. Dans une connexion Internet standard, chaque paquet de données contient l'adresse IP source et destination, permettant un traçage trivial. Tor remplace ce modèle direct par un circuit à sauts multiples (multi-hop circuit), généralement composé de trois nœuds distincts.

L'analogie de l'oignon décrit la structure des données : le client (Onion Proxy) chiffre les données de manière itérative. Pour un chemin passant par les nœuds A, B et C, le client chiffre le message d'abord pour C (la destination de sortie), puis chiffre le résultat pour B, et enfin pour A.

$$Message_{envoyé} = E_A(E_B(E_C(Data)))$$  
Lorsque le paquet transite par le réseau :

1. Le nœud A reçoit le paquet, déchiffre la couche externe ($D_A$), découvre qu'il doit transmettre le résultat au nœud B.  
2. Le nœud B reçoit le paquet (qui est encore chiffré pour B et C), déchiffre sa couche ($D_B$), et transmet au nœud C.  
3. Le nœud C déchiffre la dernière couche ($D_C$) et transmet les données originales à la destination finale.

Aucun nœud ne connaît le chemin complet. Le nœud A connaît l'utilisateur mais pas la destination. Le nœud C connaît la destination mais pas l'utilisateur. Le nœud B ne connaît ni l'un ni l'autre.

### **2.2 Typologie et rôles des relais**

La sécurité et la performance du circuit dépendent des caractéristiques spécifiques des relais sélectionnés.

#### **2.2.1 Nœud d'entrée (guard relay)**

Le premier saut du circuit est critique pour l'anonymat. Le client sélectionne un "Guard" parmi une liste restreinte de relais ayant démontré une haute stabilité (uptime élevé) et une bande passante suffisante.

* **Mécanisme de "Guard Pinning" :** Pour contrer les attaques de profilage, un client Tor conserve le même nœud d'entrée pendant une période prolongée (2 à 3 mois). Cette persistance réduit la surface d'attaque : si un utilisateur changeait de garde à chaque connexion, il finirait statistiquement par tomber sur un garde malveillant contrôlé par un adversaire, ce qui, combiné à un nœud de sortie malveillant, permettrait une corrélation de trafic.  
* **Algorithme de Sélection :** Un relais obtient le drapeau Guard si son "Weighted Fractional Uptime" est supérieur à la médiane des relais familiers et si sa bande passante est adéquate (généralement \> 2 MB/s ou dans le top 25%).

#### **2.2.2 Nœud médian (middle relay)**

Ce relais agit comme un tampon entre l'entrée et la sortie. N'importe quel relais "Running" et "Valid" peut servir de nœud médian. Sa fonction principale est d'empêcher le nœud de sortie de connaître le nœud d'entrée, ce qui briserait l'anonymat.

#### **2.2.3 Nœud de sortie (exit relay)**

Le nœud de sortie est la passerelle vers l'internet public (le Clearnet). C'est le nœud qui initie la connexion TCP finale vers le serveur cible.

* **Risques opérationnels :** L'adresse IP du nœud de sortie est celle qui apparaît dans les logs du serveur cible. L'opérateur du relais est donc exposé aux plaintes légales (DMCA, enquêtes policières) pour le trafic qu'il relaie.  
* **Politiques de sortie (exit policies) :** Chaque opérateur définit une politique de sortie spécifiant les ports et adresses IP autorisés. La "Reduced Exit Policy" est souvent recommandée pour minimiser les abus (blocage du port 25 pour le spam, des ports BitTorrent, etc.) tout en autorisant le trafic web (80, 443).

### **2.3 Structure des données : cellules et circuits**

Dans Tor, les données sont segmentées en unités appelées **cellules (cells)**. Pour empêcher l'analyse de trafic basée sur la taille des paquets, toutes les cellules avaient historiquement une taille fixe de 512 octets. Les versions modernes utilisent des tailles légèrement variables mais standardisées pour accommoder une cryptographie plus lourde tout en maintenant l'uniformité.

Il existe deux catégories de cellules :

1. **Cellules de contrôle (control cells) :** Interprétées par le nœud qui les reçoit. Elles servent à la signalisation.  
   * CREATE / CREATE2 : Pour initier un handshake et établir un circuit.  
   * DESTROY : Pour fermer un circuit.  
2. **Cellules de relais (relay cells) :** Transportent les données de bout en bout. Le nœud intermédiaire ne fait que "déchiffrer et transmettre" (ou "chiffrer et transmettre" dans le sens retour).  
   * RELAY\_BEGIN : Demande au nœud de sortie d'ouvrir une connexion TCP.  
   * RELAY\_DATA : Contient les données applicatives.  
   * RELAY\_END : Ferme le flux.  
   * RELAY\_SENDME : Utilisé pour le contrôle de flux et la congestion.

## **3. Cryptographie et protocoles de sécurité**

La sécurité de Tor repose sur l'évolution constante de ses primitives cryptographiques pour résister aux capacités de calcul croissantes des adversaires.

### **3.1 Le handshake ntor : Standard actuel**

Le protocole original TAP (Tor Authentication Protocol), basé sur RSA-1024, a été remplacé par le protocole **ntor**, plus rapide et plus sécurisé, utilisant la cryptographie sur les courbes elliptiques (ECC).

Le handshake ntor utilise :

* **Curve25519** pour l'échange de clés Diffie-Hellman (ECDH).  
* **HKDF (HMAC-based Key Derivation Function)** sur SHA-256 pour la dérivation des clés.  
* **AES-256** ou **ChaCha20** pour le chiffrement symétrique des flux.

**Détail technique du handshake ntor :**

1. Le client génère une paire de clés éphémère $x, X$ (où $X$ est la clé publique sur la courbe).  
2. Le client connaît l'identité du relais $ID$ et sa clé publique ntor $B$.  
3. Le client envoie une cellule CREATE2 contenant : $ID, B, X$.  
4. Le relais génère une paire éphémère $y, Y$.  
5. Le relais calcule le secret partagé en utilisant les exposants : $(X^y)$ et $(X^b)$.  
6. Le relais répond avec CREATED2 contenant $Y$ et un authentificateur (Auth).  
7. Les deux parties dérivent les clés de session (clés de chiffrement avant/arrière et clés d'intégrité) à partir du secret partagé.

Ce protocole garantit la **confidentialité persistante (Forward Secrecy)** : comme les clés $x$ et $y$ sont éphémères et supprimées après la fermeture du circuit, la compromission future de la clé privée à long terme du relais ne permet pas de déchiffrer les communications passées.

### **3.2 Identités et gestion des clés**

Les relais Tor utilisent une hiérarchie de clés pour authentifier leur participation au réseau :

* **Master Identity Key (Ed25519) :** La clé racine qui identifie le relais de manière unique. Elle signe la clé de signature.  
* **Signing Key (Ed25519) :** Une clé à moyen terme, renouvelée régulièrement, utilisée pour signer les descripteurs du relais.  
* **Link Key (TLS) :** Utilisée pour chiffrer le tunnel TCP entre deux relais (protection contre l'écoute sur le lien).  
* **Onion Key (Curve25519) :** Utilisée pour le handshake ntor lors de la création de circuits. Cette clé est rotative (changée régulièrement) pour assurer la forward secrecy.

## **4. Gouvernance du réseau : autorités d'annuaire et consensus**

La confiance dans le réseau Tor est ancrée dans un système centralisé de **directory authorities (DirAuths)**. Il existe neuf autorités de confiance (opérées par des entités distinctes comme le Tor Project, des universités ou des groupes de confiance) dont les clés publiques sont codées en dur dans le logiciel Tor.

### **4.1 Le protocole de vote (consensus voting)**

Chaque heure, les autorités participent à un protocole de vote complexe pour s'accorder sur l'état du réseau.

1. **Mesure :** Chaque autorité scanne indépendamment le réseau pour tester la disponibilité, la bande passante et l'intégrité des relais.  
2. **Vote (vote document) :** Chaque autorité publie un document de "vote" listant les relais qu'elle a vus et les drapeaux (flags) qu'elle leur attribue.  
3. **Consensus :** Les autorités téléchargent les votes des autres, calculent le résultat majoritaire pour chaque relais et génèrent un document de **consensus**.  
4. **Signature :** Le consensus est signé par la majorité des autorités. Les clients téléchargent ce document pour avoir une vue certifiée du réseau.

### **4.2 Algorithme de sélection de chemin et poids de bande passante**

Pour équilibrer la charge sur le réseau, les clients ne choisissent pas les relais de manière purement aléatoire, mais de manière pondérée par la bande passante. Le consensus contient des **poids de bande passante (bandwidth weights)** qui ajustent la probabilité de sélection en fonction du rôle du relais.

Les variables clés incluent :

* $W_{gg}$ : Poids pour un relais Guard dans la position de Guard.  
* $W_{gm}$ : Poids pour un relais Guard dans la position de Middle.  
* $W_{gd}$ : Poids pour un relais Guard+Exit dans la position de Guard.  
* $W_{ee}$ : Poids pour un relais Exit dans la position d'Exit.

Ces poids permettent aux autorités de diriger le trafic. Par exemple, si les relais Exit sont rares, le système ajustera les poids pour décourager l'utilisation des relais Exit comme nœuds médians, réservant leur capacité pour la sortie.

## **5. Les services onion (hidden services) v3 : architecture détaillée**

Les "Services Onion" permettent aux serveurs de proposer des services (Web, SSH, Chat) sans révéler leur adresse IP. La version v3 du protocole, devenue le standard obligatoire, a introduit des améliorations cryptographiques majeures par rapport à la v2 (dépréciée).

### **5.1 Adressage cryptographique**

Une adresse Onion v3 est composée de 56 caractères alphanumériques suivis de .onion (ex: vww6ybal4...d7sz.onion).

* **Dérivation :** L'adresse correspond à l'encodage en base32 de la clé publique **Ed25519** du service, suivi d'un checksum et d'un numéro de version.  
* **Propriété d'Auto-Authentification :** L'adresse *est* la clé. Lorsqu'un client se connecte à cette adresse, il utilise la clé contenue dans l'adresse pour vérifier que le serveur possède la clé privée correspondante. Cela élimine le besoin d'une autorité de certification (CA) tierce comme pour les domaines HTTPS classiques.

### **5.2 Le protocole de rendez-vous**

La connexion à un service caché est un ballet cryptographique complexe conçu pour qu'aucune partie ne connaisse l'IP de l'autre. Le processus se décompose en six étapes techniques :

1. Publication du descripteur :  
   Le service Onion génère un descripteur contenant sa clé publique et une liste de Points d'Introduction (Introduction Points - IP) qu'il a sélectionnés. Ce descripteur est signé et uploadé sur une table de hachage distribuée (DHT) formée par les relais ayant le drapeau HSDir. L'emplacement dans la DHT est déterminé par un hachage de la clé publique et de l'heure actuelle, rendant l'emplacement imprévisible pour un attaquant ne connaissant pas l'adresse.  
2. Récupération du Descripteur :  
   Le client interroge le HSDir responsable pour obtenir le descripteur chiffré.  
3. Point de Rendez-vous (RP) :  
   Le client choisit un relais aléatoire pour servir de Point de Rendez-vous. Il établit un circuit vers ce relais et lui communique un "Cookie de Rendez-vous" (un secret aléatoire).  
4. Introduction :  
   Le client construit un circuit vers l'un des Points d'Introduction du service. Il envoie une cellule INTRODUCE1 contenant l'adresse de son Point de Rendez-vous, le cookie, et la première partie d'un handshake DH, le tout chiffré avec la clé publique du service.  
5. Jonction :  
   Le service reçoit l'introduction, déchiffre le message, et décide d'accepter la connexion. Il construit un circuit vers le Point de Rendez-vous spécifié par le client et envoie une cellule RENDEZVOUS1 contenant le cookie et la seconde partie du handshake DH.  
6. Établissement du tunnel :  
   Le Point de Rendez-vous vérifie le cookie et connecte ("splice") les deux circuits. Le client et le serveur partagent désormais un canal chiffré de bout en bout sans jamais avoir échangé leurs adresses IP.

## **6. Mécanismes de contournement de la censure (anti-censorship)**

Dans les pays exerçant une censure stricte (Chine, Iran, Russie), l'accès direct aux relais Tor publics est souvent bloqué. Tor déploie des contre-mesures sophistiquées.

### **6.1 Les ponts (bridges) et transports pluggables**

Les ponts sont des relais non listés dans l'annuaire public. Leur distribution se fait via des canaux discrets (Email, Telegram, Moat). Cependant, un simple pont peut être détecté par Deep Packet Inspection (DPI) à cause de l'empreinte de son handshake TLS. Les "Transports Pluggables" (PT) servent à masquer cette empreinte.

### **6.2 Analyse approfondie d'obfs4**

**obfs4** est le protocole d'obfuscation standard actuel. Il modifie le flux de données pour qu'il ressemble à du bruit aléatoire cryptographique.

* **Elligator 2 :** Cette technique mathématique permet de représenter les clés publiques Curve25519 (qui ont une structure mathématique distinguable) sous forme de chaînes de bits indiscernables de l'aléatoire uniforme. Cela empêche les censeurs de détecter le handshake initial.  
* **IAT Mode (Inter-Arrival Time) :** obfs4 peut modifier le timing entre les paquets pour perturber l'analyse de trafic basée sur le rythme des flux.   

### **6.3 Snowflake : l'utilisation de webrtc**

**Snowflake** est une innovation majeure pour les environnements hautement censurés.

* **Architecture :** Au lieu de se connecter à un serveur, le client Tor se connecte à un "proxy" éphémère hébergé par un volontaire (souvent une simple extension de navigateur sur un ordinateur résidentiel dans un pays libre).  
* **WebRTC :** La connexion utilise le protocole WebRTC (conçu pour la vidéo/audio peer-to-peer), qui est difficile à bloquer sans casser les applications de visioconférence légitimes.  
* **Broker et Domain Fronting :** Pour trouver un proxy, le client contacte un "Broker" en utilisant le Domain Fronting (se faisant passer pour du trafic vers Google ou Microsoft Azure), empêchant le censeur de bloquer le canal de signalisation.

## **7. Analyse des vulnérabilités et vecteurs d'attaque**

Aucun système n'est infaillible. La sécurité de Tor est constamment mise à l'épreuve par la recherche académique et les agences de renseignement.

### **7.1 Corrélation de trafic de bout en bout (end-to-end correlation)**

C'est la menace fondamentale pour les réseaux à faible latence. Si un adversaire (Global Passive Adversary) peut observer le trafic entrant chez l'utilisateur et le trafic sortant du nœud de sortie, il peut corréler les motifs (timing et volume) pour lier l'utilisateur à sa destination, même sans casser le chiffrement.

* **Attaques au niveau AS (Autonomous System) :** Des recherches comme "Raptor" ont montré que les adversaires contrôlant de grands systèmes autonomes Internet peuvent exploiter l'asymétrie du routage BGP pour se positionner sur les chemins d'entrée et de sortie plus souvent que prévu par le hasard.

### **7.2 Étude de cas : l'opération "boystown" et les attaques temporelles**

En 2024, des révélations sur le démantèlement de la plateforme "Boystown" par la police allemande ont mis en lumière l'efficacité des **attaques temporelles (Timing Analysis)**.

* **Mécanisme :** Les autorités auraient surveillé le trafic de nœuds Tor situés en Allemagne. En analysant les micro-délais et les motifs temporels des paquets envoyés par un utilisateur suspect (utilisant une version obsolète de la messagerie *Ricochet*), ils ont pu corréler son activité avec celle d'un service caché sous surveillance.
* **Facteur aggravant :** L'application *Ricochet* utilisée n'implémentait pas de trafic de couverture (padding) suffisant, rendant ses signatures temporelles très distinctives. Le Projet Tor a souligné que cette attaque exploitait une faille d'application spécifique (OpSec) plutôt qu'une rupture du protocole Tor lui-même, mais l'incident démontre la fragilité de l'anonymat face à un adversaire disposant d'une vue globale sur une partie du réseau.

### **7.3 Exploitation des navigateurs (browser exploits)**

Le Tor Browser étant basé sur Firefox ESR, il hérite de ses vulnérabilités. Les forces de l'ordre utilisent fréquemment des "Network Investigative Techniques" (NIT) qui consistent à exploiter une faille dans le moteur de rendu du navigateur (ex: CVE-2024-9680, une faille *use-after-free*) pour injecter un malware. Ce malware contourne alors la couche Tor et envoie l'adresse IP réelle de la machine à un serveur contrôlé par les enquêteurs.

## **8. Aspects opérationnels et légaux**

L'opération de relais Tor, en particulier les nœuds de sortie, comporte des risques juridiques et techniques.

### **8.1 Risques légaux pour les opérateurs de sortie**

L'adresse IP de l'opérateur de sortie apparaît comme la source de tout trafic sortant du réseau. Cela entraîne fréquemment :

* Des notifications DMCA pour violation de droits d'auteur.  
* Des plaintes pour abus (spam, tentatives de piratage).  
* Des enquêtes policières.

Bien que la jurisprudence (notamment aux États-Unis et en Europe) tende à reconnaître le statut de "simple transporteur" (mere conduit) aux opérateurs, les protégeant de la responsabilité du contenu, le harcèlement légal et la saisie de matériel restent des risques réels.

### **8.2 Atténuation : la reduced exit policy**

Pour réduire ces risques, la communauté a défini une "Reduced Exit Policy". Cette politique de configuration bloque les ports communément associés aux abus (port 25 pour le mail/spam, ports 465/587, ports de partage de fichiers P2P) tout en laissant ouverts les ports essentiels pour la navigation Web (80, 443\) et la messagerie instantanée (XMPP). Cela réduit considérablement le volume de plaintes reçues par les opérateurs.

## **9. Conclusion et perspectives**

Le réseau Tor demeure, à ce jour, la technologie d'anonymat la plus robuste et la plus largement déployée au monde. Son architecture, fruit de trois décennies de recherche, a résisté à l'examen minutieux de la communauté cryptographique et aux tentatives répétées de censure étatique.

Cependant, Tor n'est pas une solution magique. L'anonymat qu'il procure est probabiliste et non absolu. Il dépend de la diversité du réseau, de la vigilance des utilisateurs et de la maintenance constante du code face aux nouvelles attaques (analyse temporelle assistée par IA, attaques au niveau BGP...).

Les développements futurs, tels que la transition vers la cryptographie post-quantique (pour remplacer les courbes actuelles qui seront vulnérables aux futurs ordinateurs quantiques) et l'amélioration des protocoles de transport pour mieux résister à l'analyse de trafic, seront déterminants pour la survie de cet outil essentiel à la liberté numérique dans un monde sous surveillance croissante.