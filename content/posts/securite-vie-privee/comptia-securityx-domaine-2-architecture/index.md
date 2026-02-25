---
title: "CompTIA SecurityX — Domaine 2 : Security Architecture"
date: 2026-02-25
categories: ["Securite-Vie-Privee"]
tags: ["SecurityX", "CASP+", "CompTIA", "Architecture", "Zero Trust", "Certification"]
description: "Fiche de révision SecurityX (ex CASP+) — Domaine 2 : architecture sécurisée, Zero Trust, cloud, authentification et cycle de vie des systèmes."
showOnHome: true
pageClass: "fiche-revision"
---

# DOMAIN 2 -- SECURITY ARCHITECTURE

> Concevoir des systèmes résilients, intégrer la sécurité dans le cycle de vie des systèmes, implémenter des contrôles dans l'architecture sécurisée, appliquer les concepts d'accès/authentification/autorisation, sécuriser les environnements cloud, et intégrer les concepts Zero Trust.

---

## OBJECTIF 2.1 -- Analyze Requirements to Design Resilient Systems

*Given a Scenario, Analyze Requirements to Design Resilient Systems*

### 2.1.1 Firewalls

Un firewall régule le trafic entrant et sortant selon des règles basées sur les adresses IP, protocoles et ports. Trois formats de déploiement :

| Format | Particularité | Usage type |
|--------|--------------|-----------|
| **Hardware** | Appliance dédiée (CPU/RAM propres), performance maximale | Périmètre entreprise (Cisco ASA, Check Point) |
| **Software** | Tourne sur l'OS hôte, partage les ressources | Defense-in-depth sur endpoints (Windows Defender Firewall, iptables) |
| **Virtual** | Appliance sur hyperviseur, performance dépend des ressources allouées | Data centers, microsegmentation cloud |

#### Les trois générations de firewalls

| Génération | Nom technique | Ce qu'il inspecte | Ajout par rapport au précédent |
|-----------|--------------|-------------------|-------------------------------|
| 1ère | **Static Packet Filtering** | En-têtes de paquets (IP, port, protocole) | Base |
| 2ème | **Stateful Inspection** | En-têtes + état de la connexion (state table) | Suivi des sessions TCP, ouverture dynamique de ports |
| 3ème | **NGFW (Next-Generation)** | Paquets en profondeur (DPI) | VPN, antivirus, DLP, IPS intégrés |

La **state table** d'un firewall stateful enregistre pour chaque connexion : IP/port source, IP/port destination, protocole, et état de connexion. États TCP clés : **ESTABLISHED** (connexion active, données échangées), **SYN_SENT** (SYN initial envoyé, connexion en cours), **TIME_WAIT** (connexion fermée, attente derniers paquets), **FIN_WAIT_1** (FIN envoyé, fermeture en cours).

**Distinction NGFW / UTM** : les deux sont multifonctionnels, mais le NGFW est conçu avec la performance comme priorité de conception (hardware dédié optimisé pour le DPI). L'UTM est plus adapté aux PME avec un budget limité.

#### iptables -- syntaxe de base

Flags essentiels : `-A` (append à une chaîne), `-p` (protocole), `-d` (IP destination), `--dport` (port destination), `-j ACCEPT` (autoriser), `-j DROP` (rejeter silencieusement, aucune réponse envoyée).

Règle critique : la dernière règle doit toujours être un **implicit deny all** : `iptables -A INPUT -j DROP`.

---

### 2.1.2 IDS / IPS

Un IDS détecte les intrusions et alerte. Un IPS détecte et bloque en temps réel.

| | IDS | IPS |
|--|-----|-----|
| **Mode** | Passif (alerte seulement) | Actif (bloque le trafic) |
| **Placement réseau** | Hors-bande, via port mirroring / SPAN | Inline, derrière le firewall |
| **Variante réseau** | NIDS | NIPS |

Le NIDS analyse des copies du trafic live -- il ne bloque rien. Le NIPS reçoit le trafic réel inline -- il peut le bloquer.

#### Quatre techniques de détection

| Technique | Quoi | Exemple | Limite principale |
|-----------|------|---------|------------------|
| **Signature-based** | Patterns/signatures connues | Hash MD5, regex, chaîne malware | Ne voit pas les zero-day |
| **Anomaly-based** | Déviation par rapport à un profil de normalité | SMTP passe de 23% à 70% du trafic | Faux positifs élevés, phase d'apprentissage |
| **Behavior-based (heuristic)** | Patterns logiques de mauvais usage | Échecs de login répétés suivis d'un succès | Peut manquer des attaques totalement inédites |
| **Hybrid** | Combinaison des trois techniques | -- | Plus complexe à maintenir |

#### WIPS (Wireless IPS)

Détecte et atténue : réseaux ad hoc (P2P), rogue APs, evil-twin APs, APs mal configurés, client misassociation, attaques MitM, MAC spoofing, DoS sur AP.

---

### 2.1.3 Vulnerability Scanner

Scanne les IP, ports et services du réseau et compare l'état détecté contre la base CVE. Identifie les ports ouverts, firmware non patché, misconfigurations, logiciels obsolètes. Génère des rapports par sévérité (Critical / High / Medium / Low).

Outils : **Nessus**, **OpenVAS**, **QualysGuard**, **Rapid7 Nexpose**. De nombreux frameworks réglementaires (PCI DSS, HIPAA) exigent des vulnerability assessments réguliers.

---

### 2.1.4 VPN et IPsec

Un VPN crée un tunnel chiffré sur un réseau non fiable. Un **always-on VPN** établit automatiquement la connexion dès que l'appareil s'allume, empêchant les fuites de données et le contournement des politiques. La configuration **full-tunnel** route tout le trafic via le VPN (default gateway sur l'interface VPN).

Solutions enterprise : Microsoft DirectAccess, Cisco AnyConnect, OpenVPN.

#### IPsec

Suite de protocoles sécurisant les communications IP. Obligatoire pour IPv6, optionnel pour IPv4. Processus en trois temps :

1. **Negotiation** -- IKE (Internet Key Exchange) établit les SA (Security Associations) qui définissent comment le trafic sera protégé
2. **Authentication et chiffrement** -- Application de AH ou ESP sur les paquets
3. **Data protection** -- Chiffrement symétrique (AES), intégrité (HMAC), protection anti-replay

| | AH | ESP |
|--|----|----|
| **Confidentialité (chiffrement)** | Non | Oui |
| **Authentification** | Oui | Oui (si configuré) |
| **Intégrité** | Oui | Oui |
| **Anti-replay** | Oui | Oui |
| **Compatible NAT** | Non | Oui |

**ESP** est le protocole dominant dans les VPNs modernes grâce à ses capacités de chiffrement et sa compatibilité NAT.

IPsec peut aussi être utilisé en interne entre VLANs quand le chiffrement est requis : les VLANs séparent logiquement mais ne chiffrent pas le trafic. Quiconque a accès à un switch ou port miroir peut sniffer le trafic VLAN.

---

### 2.1.5 NAC et 802.1X

802.1X est un standard IEEE de **port-based network access control (PNAC)**. Trois composants :

1. **Supplicant** -- logiciel client sur l'appareil demandant l'accès
2. **Authenticator** -- switch, point d'accès ou VPN concentrator (intermédiaire)
3. **Authentication Server** -- serveur AAA, typiquement RADIUS (ex : Microsoft NPS)

#### Protocoles d'authentification (du moins au plus sécurisé)

| Protocole | Mécanisme | Sécurité | Note |
|-----------|-----------|----------|------|
| **PAP** | Credentials en clair | Très faible | À éviter absolument |
| **CHAP** | Challenge MD5 | Faible | Vulnérable au pass-the-hash |
| **LEAP** | WEP + MS-CHAPv1 (Cisco) | Faible | Déprécié, vulnérable au credential cracking |
| **PEAP** | Tunnel TLS, certificat serveur seul | Fort | Développé par Microsoft/Cisco/RSA |
| **EAP-FAST** | PAC géré par le serveur AAA (Cisco) | Fort | Alternative à PEAP pour environnements Cisco |
| **EAP-TTLS** | Extension d'EAP-TLS, certificat serveur possible seul | Fort | Plus flexible que EAP-TLS |
| **EAP-TLS** | Certificats mutuels (client + serveur) | Très fort | **Gold standard** -- authentification mutuelle |

EAP est un **framework** (cadre extensible), pas un protocole unique. EAP-TLS est le choix optimal pour la sécurité maximale. **SCEP** peut provisionner les certificats automatiquement via MDM.

---

### 2.1.6 WAF (Web Application Firewall)

Opère au niveau applicatif (couche 7 -- HTTP/HTTPS). Protège contre : SQL injection, XSS, CSRF, malicious file execution, broken authentication, insecure communications.

Trois modes de déploiement : **appliance** (AWS WAF, F5 BIG-IP ASM, Imperva), **plugin** (ModSecurity, Wordfence), **filter** (Azure WAF).

Architecture AWS WAF type : End User -> CloudFront (CDN) -> AWS WAF (Web ACL avec règles) -> ALB -> Web App Instances -> WAF Logs (S3, CloudWatch, Kinesis).

**ModSecurity** : WAF open source populaire, règles disponibles via l'**OWASP Core Rule Set (CRS)**. Les WAFs nécessitent un tuning constant (menaces évolutives, risque de blocage de trafic légitime -- faux positifs).

---

### 2.1.7 Proxies

| Type | Direction du trafic | Fonctions principales |
|------|-------------------|----------------------|
| **Forward proxy** | Outbound (clients -> internet) | Filtrage URL/contenu, anonymat (masque IP client), cache, application des politiques web |
| **Reverse proxy** | Inbound (internet -> serveurs internes) | Load balancing, cache de contenu statique, SSL offloading, couche de sécurité supplémentaire |
| **SWG (Secure Web Gateway)** | Outbound avancé | URL filtering + scan malware + DLP + monitoring données sensibles |

**Distinction proxy / firewall** : un firewall peut bloquer une connexion sortante vers un port et une IP, mais n'offre pas le filtrage de contenu granulaire d'un proxy (inspection du contenu web, filtrage par catégorie de site).

Solutions reverse proxy : HAProxy, Squid (open source). Solutions SWG : Zscaler Internet Access (cloud-based), Cisco Umbrella (sécurité DNS).

---

### 2.1.8 API Gateway

Médiateur entre clients et services backend (microservices). Fonctions de sécurité : authentification (API keys, OAuth, JWT), rate limiting, throttling, validation d'input, logging détaillé (request paths, response codes, identités).

Fonctionne aussi comme reverse proxy : cache les détails internes des services backend, route les requêtes selon le chemin. Impose le chiffrement HTTPS/TLS. Supporte : data residency, data masking, audit logs, anomaly detection, compliance.

Protège contre les abus (DDoS) via rate limiting et throttling.

---

### 2.1.9 Network TAP (Test Access Point)

Dispositif hardware inséré directement sur un lien réseau (fibre, Ethernet). Crée une copie physique complète de tout le trafic passant -- sans interruption, sans altération, sans latence ajoutée.

**Distinction TAP / SPAN (port mirroring)** : le SPAN peut perdre des paquets sous forte charge et ajouter de la latence. Le TAP fournit une vue complète et non altérée -- supérieur pour le monitoring de sécurité. Alimente les IDS, IPS et analyseurs réseau.

---

### 2.1.10 Data Collectors

Collectent, stockent et analysent les données réseau (flux, métriques de performance, events sécurité, logs). Deux méthodes de collecte :

- **Push (temps réel)** : les devices envoient directement les logs sécurité au collecteur
- **Pull (périodique)** : le collecteur récupère les données SNMP à intervalles réguliers

Le collecteur agrège les données dans une base centralisée, les normalise et analyse pour détecter les anomalies. S'intègre avec le SIEM pour une vue unifiée. Peut automatiser des réponses (blocage IP, isolation de devices compromis).

---

### 2.1.11 CDN (Content Delivery Network)

Réseau de serveurs distribués géographiquement (edge servers) qui cachent le contenu statique (images, CSS, JS, HTML) près des utilisateurs.

**Avantages** : réduction de la latence (contenu servi depuis l'edge server le plus proche), load balancing (distribution du trafic sur plusieurs serveurs), haute disponibilité (redirection vers serveur disponible si panne), scaling automatique lors de pics de trafic.

**Sécurité** : SSL/TLS, intégration WAF, protection DDoS intégrée (absorbe et distribue le trafic malveillant). Supporte désormais aussi la livraison de contenu dynamique.

Exemples : Netflix (cache vidéo mondial), Amazon CloudFront, Cloudflare, Akamai.

---

### 2.1.12 Availability and Integrity Design Considerations

#### Load Balancing

Distribution du trafic réseau sur plusieurs serveurs pour éviter la surcharge. Types : hardware, software, cloud-based. Opère en Layer 4 (transport -- basé sur IP/port) ou Layer 7 (application -- basé sur URL, headers, cookies). Outils : NGINX, AWS Elastic Load Balancing, HAProxy.

#### Recoverability

Capacité d'un système à restaurer ses fonctionnalités après une panne ou catastrophe. Inclut : backups, disaster recovery sites, redondance. Solutions cloud : AWS Disaster Recovery, Azure Site Recovery.

#### Interoperability

Capacité de systèmes divers à collaborer efficacement indépendamment du vendeur. S'appuie sur des standards ouverts : RESTful APIs, OAuth 2.0, OpenID Connect. Essentielle dans les environnements multi-cloud et hybrides.

#### Geographical Considerations

Latence, disaster recovery et conformité réglementaire locale (ex : GDPR en Europe, data sovereignty) dépendent de la localisation des données et des services. Déployer des ressources proches des utilisateurs et maintenir une redondance géographique. Solutions : CDN (Cloudflare, Akamai), déploiement multi-région (AWS, Azure, GCP).

#### Vertical vs Horizontal Scaling

| | Vertical (scale up) | Horizontal (scale out) |
|--|---------------------|----------------------|
| **Méthode** | Ajouter CPU/RAM/stockage au serveur existant | Ajouter des serveurs/instances supplémentaires |
| **Limite** | Capacité hardware maximale | Théoriquement illimitée |
| **Cloud** | Moins courant | Préféré (ex : EC2 Auto Scaling) |
| **Transition** | Souvent le premier recours | Solution quand les limites verticales sont atteintes |

#### Persistence vs Non-Persistence

| | Persistence (sticky sessions) | Non-persistence |
|--|-------------------------------|----------------|
| **Principe** | Toutes les requêtes d'une session -> même serveur | N'importe quel serveur traite n'importe quelle requête |
| **Avantage** | Données de session cohérentes | Meilleure distribution de charge |
| **Risque** | Distribution inégale | Perte de données de session si mal géré |
| **Cas d'usage** | E-commerce (panier d'achat) | APIs stateless |

Outils : HAProxy sticky sessions, AWS ALB.

---
---

## OBJECTIF 2.2 -- Implement Security in the Early Stages of the Systems Life Cycle

*Given a Scenario, Implement Security in the Early Stages of the Systems Life Cycle and Throughout Subsequent Stages*

### 2.2.1 SDLC (Systems Development Life Cycle)

Sept phases, avec les points d'intégration sécurité à chaque étape :

| Phase | Activité générale | Intégration sécurité |
|-------|-------------------|---------------------|
| **1. Planning** | Scope, objectifs, ressources | Exigences sécurité, risk assessment initial |
| **2. Requirements** | Documentation fonctionnelle et non-fonctionnelle | Exigences sécurité explicites (chiffrement, disponibilité, conformité) |
| **3. Design** | Architecture, UI, sélection techno | Threat modeling (STRIDE), design de l'authentification |
| **4. Implementation** | Codage et intégration | SAST dès cette phase |
| **5. Testing** | Tests unitaires, intégration, performance | DAST (OWASP ZAP), pentests, tests sécurité |
| **6. Deployment** | Mise en production (par phases/beta) | Vérification des configurations de production |
| **7. Maintenance** | Monitoring, patches, nouvelles fonctionnalités | Patches sécurité continus, surveillance des vulnérabilités |

---

### 2.2.2 Security Requirements Definition

**Exigences fonctionnelles** -- Ce que le système doit faire pour se protéger. Exemple : le système supporte le MFA, les transactions sont chiffrées, les logs d'audit sont générés.

**Exigences non-fonctionnelles** -- Comment le système performe tout en étant sécurisé. Exemples : disponibilité 99.99%, résistance aux DDoS, conformité GDPR, support de 100 utilisateurs concurrents, scalabilité horizontale.

**Trade-off sécurité/usabilité** : un système parfaitement sécurisé mais inutilisable est abandonné par les utilisateurs. Un système sans friction est probablement non sécurisé. Le challenge est de trouver l'équilibre adapté au contexte (ex : un clinicien nécessitant un accès rapide aux données patient vs un contrôle d'accès strict).

---

### 2.2.3 Software Assurance -- Les quatre techniques de test

| | SAST | DAST | IAST | RASP |
|--|------|------|------|------|
| **Type de test** | White-box | Black-box | Hybrid (agents) | Embarqué (runtime) |
| **Accès au code source** | Oui | Non | Oui (via agents) | Oui (embarqué) |
| **Exécution runtime** | Non | Oui | Oui | Oui |
| **Phase typique** | Développement (early) | Testing / staging | QA / functional testing | Production |
| **Précision** | Moyenne (faux positifs) | Moyenne | Haute | Haute |
| **Bloque les attaques** | Non | Non | Non | **Oui -- seul à protéger activement** |

**SAST** -- Analyse le code source, bytecode ou binaires sans les exécuter. Utilise le pattern matching pour détecter les pratiques de codage non sécurisées (credentials hardcodées, SQL injection, buffer overflow). Standards de référence : OWASP Top 10, SANS/CWE Top 25.

**DAST** -- Évalue une application en cours d'exécution de l'extérieur. Crawle l'application (mapping pages, APIs, champs input), injecte des inputs malveillants (SQLi, XSS), pratique le fuzzing (inputs pseudo-aléatoires), simule des attaques réelles (session hijacking, authentication bypass). Outils : Acunetix, Veracode, OWASP ZAP.

**IAST** -- Combine SAST et DAST en analysant l'application en temps réel pendant l'exécution via des instrumentation agents. Offre des dashboards temps réel combinant : SAST, SCA, IaC security, container security, DAST/API testing, CSPM, secrets detection. Outils : Aikido, Datadog, SOOS.

**RASP** -- Embarqué directement dans le runtime de l'application (JVM pour Java, CLR pour .NET). Processus : user input -> app runtime -> RASP layer intercepte -> instrumentation spécifique au langage (Java : hook methods, modify bytecode, monitor JVM / .NET : hook IL code, monitor CLR, intercept API) -> moteur de décision (règles, heuristiques, ML) -> enforcement (bloque ou laisse passer). Limites : overhead de performance, support spécifique par langage, ne remplace pas le secure coding. Vendeurs : Contrast Security, Imperva RASP, Sqreen (Datadog), Appdome/Jscrambler (mobile).

#### Autres techniques d'assurance

**Vulnerability analysis** -- Identification et catégorisation systématique des vulnérabilités. Outils : Nessus. Exemple : détection des systèmes affectés par Log4Shell.

**SCA (Software Composition Analysis)** -- Identifie les composants open source et tiers, détecte vulnérabilités connues (via NVD), problèmes de licence, dépendances obsolètes. Outil : Docker Scout, Snyk.

**SBoM (Software Bill of Materials)** -- Liste exhaustive de tous les composants d'un logiciel. Fournit la transparence nécessaire pour identifier rapidement les bibliothèques affectées lors d'une vulnérabilité majeure (Heartbleed, Log4Shell). Formats : SPDX, CycloneDX.

**Formal methods** -- Utilisation de preuves mathématiques pour garantir le comportement correct du logiciel avant exécution. Réservé aux systèmes critiques (pacemakers, navigation aérienne, signalisation ferroviaire) en raison du coût et de la complexité.

---

### 2.2.4 CI/CD et DevSecOps

**DevSecOps** intègre la sécurité dans chaque étape du développement. La sécurité est "baked into" le pipeline CI/CD plutôt qu'ajoutée après coup.

#### Contrôles de sécurité dans le pipeline

| Contrôle | Description |
|----------|-------------|
| **Coding standards et linting** | Standards de codage prédéfinis, détection automatique (ESLint pour JS) -- ex : sanitisation des inputs |
| **Branch protection** | Règles sur le repository : code reviews obligatoires, tests passés, approbation senior avant merge |
| **Continuous improvement** | Raffinement itératif -- ex : intégration de Snyk pour vulnérabilités des dépendances open source |

#### Types de tests dans le CI/CD

| Test | Ce qu'il vérifie |
|------|-----------------|
| **Canary testing** | Déploie une feature à un petit sous-ensemble (~5%) avant rollout complet |
| **Regression testing** | Vérifie que les modifications récentes n'ont pas cassé les fonctionnalités/contrôles existants |
| **Integration testing** | Vérifie que les contrôles de sécurité fonctionnent quand les composants interagissent |
| **Automated testing / Retesting** | Tests automatisés dans le pipeline + retesting pour confirmer la correction des vulnérabilités |
| **Unit testing** | Teste les composants individuels (ex : chiffrement correct des données sensibles) |

**Shift-left** : pratique consistant à intégrer la sécurité le plus tôt possible dans le SDLC (planning, design, développement) plutôt qu'après déploiement. Réduit le coût de correction des vulnérabilités (une faille découverte en production coûte 30x plus à corriger qu'en design).

Réglementation : HIPAA exige risk assessments, threat modeling, secure coding, vulnerability scanning et pentesting dans le SDLC pour les systèmes de santé.

---

### 2.2.5 Supply Chain Risk Management (SCRM)

#### Software supply chain

L'attaque SolarWinds est l'exemple type d'une compromission introduite via la supply chain logicielle : le code malveillant a été injecté dans le processus de build, affectant toutes les organisations utilisant la mise à jour Orion compromise. Mitigation : SCA + SBoM + code-signing + trusted repositories. Guide : **NIST SP 800-161r1** (supply chain risk management).

#### Hardware supply chain

Risques : composants contrefaits, vulnérabilités cachées dans les chipsets ou équipements réseau. Le **Trusted Foundry Program** (secteur défense US) certifie que les composants proviennent de fabricants sécurisés et de confiance. Nécessite des politiques strictes d'approvisionnement et un vetting rigoureux des fournisseurs.

---

### 2.2.6 Hardware Assurance

Valider que le hardware n'a pas été modifié ou compromis à aucun point de la supply chain. Certification par des organismes reconnus : **Trusted Computing Group (TCG)**, entités gouvernementales.

**FIPS 140-2/140-3** : certification validant la sécurité des modules cryptographiques -- requis pour les systèmes fédéraux US. Exemple : une institution financière déployant des HSM (Hardware Security Modules) doit exiger la certification FIPS. **Common Criteria (ISO/IEC 15408)** : évaluation standardisée de la sécurité des produits IT, avec des Evaluation Assurance Levels (EAL1-EAL7).

---

### 2.2.7 EOL (End-of-Life) Considerations

Un produit en EOL ne reçoit plus de mises à jour, patches ou support du fabricant. Les vulnérabilités découvertes après l'EOL restent non corrigées -- risque critique. Exemple : Windows XP utilisé dans les hôpitaux et ATMs bien après son EOL, vecteur de WannaCry en 2017.

**Best practices** : plan de gestion proactif du cycle de vie avec tracking des timelines de support, politique EOL formelle, virtual patching ou isolation réseau comme mesures temporaires, inventaire centralisé de tous les actifs, effacement sécurisé du matériel retiré (DBAN -- Darik's Boot and Nuke, mais la destruction physique reste la meilleure option quand la réutilisation n'est pas nécessaire), exigences de certifications fournisseurs (Common Criteria, ISO 27001).

---
---

## OBJECTIF 2.3 -- Integrate Appropriate Controls in the Design of a Secure Architecture

*Given a Scenario, Integrate Appropriate Controls in the Design of a Secure Architecture*

### 2.3.1 Attack Surface Management and Reduction

#### Vulnerability Management

Processus continu d'identification, classification et remédiation des vulnérabilités. Les responsabilités sont distribuées :

| Rôle | Responsabilité |
|------|---------------|
| **Vulnerability management team** | Propriétaire du cycle de vie des vulnérabilités, coordonne la remédiation |
| **SOC** | Détecte les menaces, corrèle avec les vulnérabilités |
| **TVM (Threat & Vulnerability Mgmt)** | Intègre vulnérabilités + threat intelligence + criticité des actifs |
| **Infrastructure/platform teams** | Applique patches et changements de configuration |
| **AppSec team** | Traite les vulnérabilités dans le code (SAST/DAST) |
| **GRC / Risk teams** | Risk acceptance, conformité, reporting aux auditeurs |
| **DevSecOps / Cloud security** | Scanning et remédiation dans les pipelines CI/CD |

Tâches : scans planifiés + ad-hoc, maintenance des outils (Tenable, Qualys, Rapid7), validation des résultats (filtrage des faux positifs), collaboration avec les asset owners, suivi des métriques (time-to-remediate, exposure windows, recurring issues).

#### Hardening

Désactiver les services inutiles, appliquer des configurations sécurisées, vérifier les misconfigurations et les ports ouverts. Guidelines de référence : **CIS Benchmarks**, **NIST SP 800-53**. Exemples concrets : désactiver les comptes par défaut, imposer des politiques de mots de passe forts, restreindre les règles firewall au strict minimum nécessaire.

#### Defense-in-Depth

Stratégie utilisant plusieurs couches de contrôles de sécurité. Si une couche est franchie, les autres continuent de protéger. Repose sur deux principes : **Redundancy** (plus d'un contrôle protège le même actif) et **Diversity** (différents types de contrôles : technique, administratif, physique).

Les huit couches :

| Couche | Exemples |
|--------|---------|
| **Physique** | Salles serveurs verrouillées, surveillance, biométrie |
| **Réseau** | Firewalls, segmentation, IDS/IPS |
| **Périmètre** | WAFs, VPNs, protection DDoS |
| **Endpoint** | Anti-malware, host-based firewalls, EDR |
| **Application** | Secure coding, RASP, SAST/DAST |
| **Données** | Chiffrement, DLP, contrôle d'accès |
| **Utilisateur** | MFA, RBAC, least privilege |
| **Monitoring et réponse** | SIEM, SOAR, analyse de logs, plans IR |

#### Legacy Components

Isoler via segmentation réseau, restreindre l'accès au strict minimum, appliquer un monitoring renforcé, virtual patching si disponible. ISO/IEC 27001 fournit des contrôles adaptés pour gérer les composants legacy.

---

### 2.3.2 Detection and Threat-Hunting Enablers

**Centralized logging** -- Agrège les logs de toutes les sources (endpoints, applications, réseau, appliances) dans un SIEM. Permet de détecter des patterns d'attaque multi-vecteurs qu'aucune source isolée ne révélerait (ex : failed logins + requête DNS suspecte + port scanning = reconnaissance coordonnée). Outils : Splunk, IBM QRadar, ManageEngine Log360. Framework : MITRE ATT&CK pour mapper les comportements suspects aux patterns d'attaque connus.

**Continuous monitoring** -- Observation constante du réseau, endpoints et environnements cloud. Outils : Nagios, SolarWinds, Microsoft Azure Sentinel. Best practices : CIS Controls + automatisation.

**Alerting** -- Notifications déclenchées quand des menaces ou anomalies sont détectées (via SIEM ou EDR comme CrowdStrike Falcon, Carbon Black). Personnalisable par sévérité. Les CIS Controls fournissent des guidelines pour minimiser les faux positifs.

**Sensor placement** -- Placer des capteurs aux segments clés et aux points d'entrée/sortie. Ne pas se limiter au périmètre : il faut aussi des capteurs internes (entre VLANs, trafic est-ouest dans les data centers) pour détecter le mouvement latéral. Outils : Snort, Suricata. Guide : NIST SP 800-137. Le placement n'est pas statique : réévaluer quand le réseau évolue (ajout de segments cloud, microservices, zones IoT) pour éviter les angles morts.

---

### 2.3.3 Information and Data Security Design

#### Classification -- quatre niveaux

Public -> Internal -> Confidential -> Highly Confidential

| Critère | Public | Internal | Confidential | Highly Confidential |
|---------|--------|----------|-------------|-------------------|
| **Contient des données personnelles** | Non | Non | Oui | Oui |
| **Soumis à réglementations** | Non | Non | Oui | Oui |
| **Impact business si exposé** | Low | Moderate | High | Critical |
| **Accès** | Illimité | Staff interne | Rôles spécifiques | Exécutifs / legal / compliance |
| **Distribution externe** | Oui | Non | Non | Non |
| **Chiffrement** | Optionnel | Recommandé | Requis | Requis + contrôle de clés strict |
| **Monitoring** | Non | Limité | Oui | Oui + audit trail |
| **Contrôles de rétention** | Standard | Standard | Enhanced | Strict (audité) |

Standard : ISO/IEC 27001. Outil d'automatisation : Varonis.

#### Data Labeling et Tagging

**Labeling** : tags metadata indiquant la classification (Confidential, PII) -- peut déclencher un chiffrement automatique ou une restriction d'accès. Outil : Microsoft Purview Information Protection.

**Tagging** : metadata appliquée aux assets (ownership, sensitivity, regulatory requirements) pour suivi du cycle de vie et application des politiques. Outils : AWS tagging, Azure tagging.

---

### 2.3.4 DLP (Data Loss Prevention)

Trois états des données et leurs protections :

| État | Définition | Exemples | Protection |
|------|-----------|----------|-----------|
| **At rest** | Stocké, non en mouvement | Fichiers sur disque, DB, backups, cloud, snapshots | Chiffrement (AES-256), contrôle d'accès, scans (VeraCrypt, Azure Disk Encryption) |
| **In transit** | Transmis sur le réseau | Email, API, transferts internet/LAN | Chiffrement de transport (TLS 1.3, IPsec), monitoring (Wireshark) |
| **In use** | Activement accédé/traité/modifié | Copie/coller, édition, upload, impression | Agents DLP endpoints : monitoring clipboard, interception opérations fichiers, blocage screenshots, blocage impression non autorisée |

Exemple : Microsoft Purview DLP rule bloquant l'envoi de numéros de carte bancaire hors de l'organisation.

#### Data Discovery

Outils (ex : Microsoft Purview) qui scannent et classifient automatiquement les données. Workflow : connecter les sources -> scanner -> découvrir les metadata -> analyser le contenu (AI, pattern recognition, NLP) -> appliquer les labels -> visualiser via data map -> enforcer les contrôles.

Cas d'usage : conformité GDPR/HIPAA, audit shadow IT, inventaires pour privacy impact assessments (PIAs), support incident response.

---

### 2.3.5 Hybrid Infrastructures

Combinaison d'environnements on-premises et cloud. Domaines de contrôle : IAM, réseau, protection des données, monitoring et détection, configuration et posture management, GRC.

Principes de design : visibilité complète des actifs cloud et on-premises, respect du shared responsibility model, automatisation via CI/CD et IaC, intégration avec les processus d'incident response, planification pour la scalabilité et la résilience.

Outil : Microsoft Azure Security Center (Defender for Cloud).

---

### 2.3.6 Third-Party Integrations

| Domaine de contrôle | Méthode |
|---------------------|---------|
| **Access control** | RBAC, scoped tokens |
| **Network security** | DMZ, VPN, zero trust |
| **Authentication et trust** | mTLS, SAML, MFA |
| **API security** | Gateways, schema validation |
| **Data governance** | Masking, DLP, classification |
| **Monitoring et response** | Logging, intégration SIEM |
| **Governance et compliance** | Clauses de sécurité contractuelles, assessments réguliers |

Framework : NIST SP 800-161 (supply chain risk management). Outil : OneTrust.

---

### 2.3.7 Control Effectiveness

**Assessments** -- Pentests et risk assessments réguliers via des tiers. Services : Cobalt.io, Synack.

**Scanning** -- Scans de vulnérabilités automatisés et planifiés. Outils : Tenable Nessus, Qualys.

#### Metrics -- KPI vs KRI

Un **KPI (Key Performance Indicator)** mesure la performance d'une activité de sécurité. Quand cette performance passe sous un seuil critique, le KPI devient un **KRI (Key Risk Indicator)** -- un indicateur que la dégradation opérationnelle s'est transformée en exposition au risque.

| Domaine | KPI (plage normale) | KRI (seuil critique) | Ce que le KRI signale |
|---------|--------------------|--------------------|----------------------|
| **Patch management** | >= 95% systèmes patchés sous 30j | < 80% | Risque d'exploit élevé par backlog de patches |
| **Phishing** | < 5% de clics en simulation | > 15% | Échec de la sensibilisation, risque de social engineering |
| **Access control** | 100% comptes privilégiés revus trimestriellement | < 90% | Risque de privilege misuse |
| **Endpoint security** | >= 98% endpoints avec AV/EDR actif | < 90% | Visibilité et prévention réduites |
| **Incident response** | MTTR haute sévérité < 4h | > 8h | Dwell time attaquant élevé |

Outils d'analyse des métriques : Splunk, ELK Stack.

---
---

## OBJECTIF 2.4 -- Apply Security Concepts to Access, Authentication, and Authorization

*Given a Scenario, Apply Security Concepts to the Design of Access, Authentication, and Authorization Systems*

### 2.4.1 Provisioning / Deprovisioning

**Provisioning** : accorder l'accès approprié selon le rôle. Principes : least privilege, IdP centralisé (Microsoft Entra ID, Okta), MFA dès le provisioning. La **credential issuance** doit être automatisée pour réduire les erreurs humaines. Le **self-provisioning** permet aux utilisateurs de demander eux-mêmes l'accès, soumis à approbation workflow (outil : OneLogin).

**Deprovisioning** : révoquer immédiatement l'accès quand il n'est plus nécessaire (départ, changement de rôle). Risque principal : les **orphaned accounts** -- comptes non révoqués devenant des portes d'entrée pour les attaquants. Challenge additionnel : gestion de l'accès tiers (vendors, contractors). Le deprovisioning doit être auditable (GDPR, HIPAA) et automatisé sur tous les systèmes (cloud + on-premises). Outil : SailPoint.

**Best practices** : automatiser provisioning/deprovisioning via SCIM (System for Cross-domain Identity Management), auditer régulièrement les comptes actifs, lier le deprovisioning aux processus RH (départ = révocation immédiate).

---

### 2.4.2 Federation -- Les trois protocoles clés

#### OpenID Connect (OIDC)

Couche d'identité (authentication) construite au-dessus d'OAuth 2.0. Permet de vérifier l'identité d'un utilisateur et d'obtenir des informations de profil.

Flux : l'utilisateur veut accéder au relying party (ex : Trello) -> redirigé vers l'OpenID provider (ex : Google) -> login + consent -> Google envoie un **ID token (JWT)** -> le RP vérifie le token et connecte l'utilisateur.

#### OAuth 2.0

Framework d'authorization (pas d'authentication). Permet à des applications tierces d'accéder à des ressources de manière limitée sans partager les credentials.

Deux types de tokens :

| Token | Durée de vie | Usage |
|-------|-------------|-------|
| **Access token** | Court (ex : 1 heure) | Accès temporaire, scope défini (read mais pas write) |
| **Refresh token** | Long (jours à mois) | Obtenir un nouveau access token sans ré-authentification |

Les quatre rôles OAuth 2.0 :

| Rôle | Description |
|------|-------------|
| **Resource owner (user)** | Possède les ressources protégées, accorde ou refuse l'accès |
| **Client (application)** | App qui veut accéder aux ressources pour le compte du user |
| **Authorization server** | Émet les access tokens après authentification et consentement |
| **Resource server** | Héberge les ressources, vérifie les tokens présentés |

#### SAML (Security Assertion Markup Language)

Standard ouvert pour le SSO enterprise. L'IdP authentifie l'utilisateur et émet une **SAML assertion** -- document XML signé numériquement contenant :

| Élément | Contenu |
|---------|---------|
| **Issuer** | Identifie l'IdP émetteur |
| **Subject** | Identifiant utilisateur (NameID) |
| **Conditions** | Validité temporelle, restrictions d'audience |
| **AuthnStatement** | Méthode d'authentification utilisée |
| **AttributeStatement** | Attributs (email, rôle, département) |
| **SubjectConfirmation** | Garantit que le token est valide uniquement pour le destinataire prévu |

#### Tableau comparatif -- À ne pas confondre

| | OIDC | OAuth 2.0 | SAML |
|--|------|-----------|------|
| **Fonction principale** | Authentication | Authorization | SSO (authentication + attributes) |
| **Format du token** | JWT | Access token + refresh token | Assertion XML signée |
| **Usage type** | Apps cloud/mobile modernes | Accès délégué à des APIs | SSO enterprise entre IdP et SPs |
| **Relation** | Couche au-dessus d'OAuth | Base d'OIDC | Indépendant |

---

### 2.4.3 Single Sign-On (SSO)

Login unique donnant accès à multiples systèmes sans ré-authentification. Réduit le password fatigue et les risques de phishing/password reuse.

#### Kerberos

Protocole SSO on-premises dominant, développé par MIT et standardisé par l'IETF (RFC 4120). Utilisé par Microsoft Active Directory depuis plus de 20 ans. Supporté par Red Hat, Oracle, IBM.

Principes : authentification par **tickets** (pas de transmission de mots de passe), communication chiffrée, protection anti-replay, **mutual authentication** (client et serveur vérifient l'identité de l'autre).

Contrainte importante : très sensible au temps -- nécessite **NTP (Network Time Protocol)** pour synchroniser les horloges entre tous les participants. Un écart d'horloge trop important provoque l'échec de l'authentification.

---

### 2.4.4 Conditional Access

Politiques de contrôle d'accès basées sur le contexte : localisation, type de device, comportement, statut de conformité. Quand un utilisateur tente d'accéder à une ressource, le PEP collecte les informations contextuelles, les transmet au PDP qui évalue contre les politiques, et retourne une décision allow/deny.

Exemple : un utilisateur se connecte depuis un appareil non conforme (AV obsolète) ou depuis un pays inhabituel -> le système exige un MFA supplémentaire ou refuse l'accès.

Outil : Microsoft Entra ID Conditional Access.

---

### 2.4.5 Identity Provider (IdP) et Service Provider (SP)

| | IdP | SP |
|--|----|----|
| **Rôle** | Vérifie l'identité, émet les tokens d'authentification | S'appuie sur l'IdP, accorde l'accès aux ressources |
| **Exemples** | Microsoft Entra ID, Okta | Salesforce, apps d'entreprise |
| **Actions** | Authentifie, applique les politiques (Conditional Access, complexité MDP, identity proofing) | Redirige vers l'IdP, reçoit les assertions/tokens, valide, accorde ou refuse |

Règle à retenir : **l'IdP authentifie, le SP accorde l'accès**.

#### Attestations

Mécanisme de vérification que des conditions sont remplies avant d'accorder l'accès : device health, patches installés, chiffrement disque activé, firewall actif, politiques de mot de passe respectées, anomalies de localisation ou de comportement.

L'attestation fait partie du processus de décision dans Conditional Access et zero trust. Outil : Microsoft Intune.

---

### 2.4.6 Policy Decision and Enforcement Points

| Point | Rôle |
|-------|------|
| **PEP** (Policy Enforcement Point) | Intercepte la requête d'accès, applique la décision |
| **PDP** (Policy Decision Point) | Évalue la requête contre les politiques définies, rend la décision (allow/deny) |
| **PIP** (Policy Information Point) | Fournit les données contextuelles (rôles, device trust, via LDAP/AD) |
| **PAP** (Policy Administration Point) | Interface pour créer, modifier et gérer les politiques |

Flux complet : user request -> PEP intercepte -> PDP interroge le PIP pour les attributs -> PDP évalue via les politiques du PAP -> décision -> PEP enforce.

---

### 2.4.7 Access Control Models

| Modèle | Accès basé sur | Géré par | Flexibilité | Sécurité | Cas d'usage |
|--------|---------------|----------|-------------|----------|------------|
| **DAC** | Propriété et permissions | Propriétaire de la ressource | Haute (risqué si mal géré) | Low-Medium | NTFS, Unix permissions |
| **MAC** | Labels de sécurité et niveaux d'habilitation | Admin central (système) | Faible (très strict) | Très haute | Militaire, gouvernement (SELinux, Trusted Solaris) |
| **RBAC** | Rôles assignés | Admin de rôles | Moyenne | Moyenne | Active Directory, Okta |
| **ABAC** | Attributs (user, ressource, environnement) | Policy engine | Très haute (dynamique) | High-Very High | AWS IAM, zero trust, cloud hybride |
| **RuBAC** (rule-based) | Règles prédéfinies (temps, IP, localisation) | Admin de règles | Medium-High | Medium-High | Azure Conditional Access, firewalls |

Attention : ne pas confondre **role**-based (RBAC) et **rule**-based (RuBAC). RuBAC se combine souvent avec RBAC pour ajouter une couche de sécurité contextuelle (ex : un manager ne peut modifier la base de données client que depuis le réseau de la banque et pendant les heures de bureau).

Dans MAC, même avec une habilitation élevée, l'accès peut être refusé si l'utilisateur n'a pas le **need-to-know** pour ce type spécifique de données. C'est le principe du "no read up, no write down" (modèle Bell-LaPadula pour la confidentialité).

---

### 2.4.8 Logging and Auditing

Fournit la visibilité sur qui a accédé à quoi, quand, et pourquoi. Assure l'accountability, permet de détecter les patterns inhabituels (accès non autorisé, privilege misuse), essentiel pour les forensics et la conformité (NIST SP 800-53, HIPAA, PCI DSS, ISO 27001).

Outils SIEM : Splunk, IBM QRadar. Best practice : revue régulière des logs d'accès + audits périodiques.

---

### 2.4.9 PKI Architecture

#### Hiérarchie de confiance

Root CA (sommet, hors ligne) -> Intermediate / Issuing CAs -> Certificats end-entity. La Root CA est généralement maintenue hors ligne pour la protéger -- si elle est compromise, toute la chaîne de confiance est détruite.

#### Mécanismes de révocation

**CRL (Certificate Revocation List)** : liste publiée périodiquement des certificats révoqués. Inconvénient : pas temps réel, fichier volumineux.

**OCSP (Online Certificate Status Protocol)** : vérification en temps réel du statut d'un certificat individuel auprès du CA.

**OCSP Stapling** : le serveur web attache la réponse OCSP au TLS handshake -- le client n'a pas besoin d'interroger la CA directement. Avantages : meilleure performance + protection de la vie privée du client (le CA ne sait pas quels sites le client visite).

**RA (Registration Authority)** : vérifie l'identité des demandeurs de certificats. Optionnel, utilisé dans les grands déploiements distribués pour déléguer la validation d'identité.

#### Extensions de certificats

| Extension | Rôle | Si marquée "Critical" |
|-----------|------|----------------------|
| **Key Usage (KU)** | Ce que la clé peut faire au niveau cryptographique (signer, chiffrer) | Le système destinataire doit respecter les usages définis |
| **Extended Key Usage (EKU)** | Ce que la clé peut faire au niveau application (TLS server, code signing) | Même principe |
| **Subject Alternative Name (SAN)** | Domaines/IPs additionnels couverts par le certificat | -- |
| **Basic Constraints** | Indique si le certificat est une CA ou un end-entity | -- |
| **CRL Distribution Point** | URL pour vérifier la révocation | -- |

#### Types de certificats

| Type | Ce qu'il couvre |
|------|---------------|
| **Wildcard** | Tous les sous-domaines d'un domaine (`*.example.com`) |
| **SAN** | Plusieurs domaines complètement différents sous un seul certificat |
| **Smart Card** | Auth via carte physique contenant la clé privée |
| **EV (Extended Validation)** | Confiance maximale -- vérification extensive de l'organisation |
| **DV (Domain Validation)** | Basique -- vérifie seulement la propriété du domaine |
| **OV (Organization Validation)** | Intermédiaire -- vérifie domaine + informations de l'organisation |
| **Code Signing** | Garantit l'intégrité et l'authenticité du code/logiciel |
| **Client** | Authentifie un utilisateur ou device auprès d'un serveur |

Règles à retenir : validité maximale pour SSL/TLS publics = **398 jours** (depuis sept. 2020). Taille RSA minimale recommandée = **2048 bits**.

#### Templates et Deployment

**Templates** : définissent les paramètres et politiques pour l'émission de certificats (taille de clé, période de validité, usages autorisés). Automatisent et standardisent le processus d'émission. Outil : Microsoft AD CS.

**Deployment/Integration** : intégrer la PKI avec les systèmes existants, automatiser l'émission via templates, assurer la compatibilité hybride (on-premises + cloud) via mTLS. **S/MIME** (Secure/Multipurpose Internet Mail Extensions) : PKI intégrée aux plateformes email (Exchange, Google Workspace) pour chiffrer les emails et signer numériquement les messages.

**CLM (Certificate Lifecycle Management)** : Venafi -- automatise issuance, renewal, revocation. OpenSSL pour la gestion manuelle et les opérations de test.

---

### 2.4.10 Access Control Systems

**Physique** : badges, CCTV, biométrie, MFA physique (smart card + PIN). Approche en couches (contrôles externes + internes). Guide : NIST SP 800-116 (systèmes PIV).

**Logique** : contrôle l'accès aux systèmes numériques. Mécanismes : passwords, MFA, SSO. Principe du least privilege (PoLP) -- accès minimum nécessaire. Guide : NIST SP 800-53. Outils : Active Directory, OAuth 2.0, Yubico (FIDO2/WebAuthn).

Challenges communs : équilibre sécurité/usabilité, insider threats, complexité des environnements hybrides (on-premises + cloud nécessitent des politiques uniformes). Solutions IAM hybrides : Microsoft Entra ID, AWS IAM.

---
---

## OBJECTIF 2.5 -- Securely Implement Cloud Capabilities in an Enterprise Environment

*Given a Scenario, Securely Implement Cloud Capabilities in an Enterprise Environment*

### 2.5.1 CASB (Cloud Access Security Broker)

Agent logiciel positionné entre les utilisateurs cloud et les fournisseurs de services cloud. Cinq fonctions : visibilité (apps utilisées, par qui, données transférées), data protection (chiffrement, tokenization, DLP), threat protection (anomaly detection, malware, behavior analysis), access control (politiques basées sur identité/localisation/device + MFA/RBAC), compliance (enforcement, audit reports pour GDPR/HIPAA/PCI-DSS).

| Type | Mécanisme | Avantage | Limite |
|------|-----------|----------|-------|
| **API-based** | S'intègre via APIs aux plateformes cloud | Pas de bottleneck, visibilité profonde (data at rest + user activity) | Pas de contrôle temps réel |
| **Proxy-based** | Intercepte le trafic en temps réel (forward ou reverse proxy) | Contrôle et blocage en temps réel | Peut introduire de la latence |

Best practice : approche hybride combinant les deux. Intégrer les CASBs avec le SIEM. Outils : Microsoft Defender for Cloud Apps, Symantec CloudSOC.

#### Shadow IT Detection

Technologies utilisées sans approbation IT (apps, hardware, cloud services). Risques : data breaches, non-conformité, perte de visibilité. Détection via CASB + monitoring réseau + analyse des logs DNS.

---

### 2.5.2 Shared Responsibility Model

| Responsabilité | IaaS | PaaS | SaaS |
|---------------|------|------|------|
| **Infrastructure physique** | CSP | CSP | CSP |
| **Virtualisation / hypervisor** | CSP | CSP | CSP |
| **Système d'exploitation** | Client | CSP | CSP |
| **Applications** | Client | Client (déploie/configure) | CSP (gère/met à jour) |
| **Données** | Client | Client | Client |

Règle essentielle : la responsabilité du client diminue en montant vers SaaS, mais la protection des données reste **toujours** la responsabilité du client, quel que soit le modèle. Les misconfigurations côté client (ex : S3 bucket public) sont la cause de nombreuses brèches malgré une infrastructure CSP solide.

---

### 2.5.3 Automatisation Cloud

**CI/CD pipeline** -- Automatise build, test, deploy. Intégrer les tests de sécurité (static code analysis, vulnerability scanning) dans le pipeline. Outils : Jenkins, GitLab CI.

**Terraform (IaC)** -- Définit l'infrastructure cloud en code (version-controlled, auditable). Assure des configurations cohérentes entre environnements, réduit l'erreur humaine. Workflow : écrire le code -> push to Git -> `terraform plan` (plan d'exécution) -> `terraform apply` (déploie). Terraform est déclaratif : on décrit l'état désiré, il calcule les changements nécessaires.

**Ansible** -- Outil de configuration management open source. Automatise les tâches IT via des playbooks (YAML) et des inventaires dynamiques (ciblage par tags). Ansible est procédural et agentless (connexion via SSH). Exemple : patcher automatiquement toutes les instances EC2 taguées `PatchGroup=security-patch`.

**Terraform vs Ansible** : Terraform = provisioning d'infrastructure (créer des serveurs, réseaux, storage). Ansible = configuration management (configurer ce qui est déjà provisionné). Les deux sont complémentaires.

**Package monitoring** -- Surveille les packages open source/tiers pour vulnérabilités, licences, obsolescence à toutes les phases du SDLC. Workflow : development (Snyk) -> auto monitoring (Dependabot) -> build (Webpack Bundle Analyzer) -> security checks -> licensing compliance (FOSSA).

---

### 2.5.4 Container Security

Un container empaquette le code applicatif avec toutes ses dépendances dans une unité portable et légère. Construit à partir d'images (snapshots immuables). Géré par des container runtimes (Docker) et orchestré par des plateformes (Kubernetes). Plus légers que les VMs car ils partagent le kernel de l'OS hôte.

**Best practices de sécurité** : scanner les base images pour CVEs (outils : Clair, Aqua Security), least privilege (exécuter les containers en non-root), segmentation réseau entre containers, secrets management via vault externe (jamais hardcoder), runtime monitoring pour détecter les comportements anormaux, registries de confiance (Docker Hub Content Trust, Amazon ECR, Google GCR, Azure ACR, Quay).

#### Container Orchestration (Kubernetes / K8s)

Composants clés : **Pod** (plus petite unité, typiquement 1 container), **Deployment** (rolling updates, replica sets), **Service** (expose les Pods au réseau), **Ingress Controller** (route le trafic externe via HTTPS).

Sécurité K8s : RBAC pour l'accès à l'API Kubernetes, network policies inter-Pods, images signées uniquement, AppArmor/SELinux pour le runtime, TLS entre services (service mesh), secrets via Kubernetes Secrets ou HashiCorp Vault, policy enforcement via **OPA (Open Policy Agent)**, audit régulier des permissions.

---

### 2.5.5 Serverless

Modèle où le CSP gère dynamiquement l'allocation des serveurs. Le développeur écrit du code sans se soucier de l'infrastructure. Caractéristiques : pas de gestion serveur, scaling automatique (y compris vers zéro), paiement à l'exécution, event-driven, stateless. Services : AWS Lambda, Azure Functions, Google Cloud Functions.

#### Trois dimensions serverless

**Serverless workloads** -- Les tâches spécifiques exécutées par les fonctions (data processing, API handling, background jobs). Risques : multi-tenancy (isolation imparfaite entre tenants), cold start exploitation (latence lors du provisioning d'un nouveau container), excessive permissions (fonction sur-privilégiée = vecteur d'attaque si compromise).

**Serverless functions** -- Le code déclenché par des événements (HTTP requests, file uploads, database changes). Vulnérabilités classiques (SQL injection, broken access controls, insecure dependencies) amplifiées par l'environnement dynamique. Susceptibles aux **event injection attacks** (inputs malformés déclenchant des comportements non prévus). Nature éphémère et stateless rendant les contrôles traditionnels (session management) plus difficiles.

**Serverless resources** -- Les services cloud consommés par les fonctions (bases de données, storage, queues). Risques de misconfiguration (permissions trop larges, storage public), data exposure via APIs non sécurisées, coûts incontrôlés via DoS par auto-scaling.

**Sécurité serverless** : least privilege sur chaque fonction, WAF + input validation, rate limiting + quotas, code reviews régulières, chiffrement TLS (transit) + encryption at rest, audit des ressources cloud (AWS Config, Azure Security Center).

---

### 2.5.6 API Security

Menaces : injection (SQL, XML, command), authentification faible, endpoints inconsistants, MitM.

| Contrôle | Fonction |
|----------|---------|
| **Authentication** | OAuth, API keys, JWT |
| **Authorization** | RBAC, ABAC |
| **Rate limiting** | Nombre max de requêtes par période -- bloque au-delà (HTTP 429) |
| **Throttling** | Ralentit les requêtes excessives au lieu de les bloquer |
| **Logging et auditing** | Timestamps, IPs, request/response data (AWS CloudTrail) |
| **API gateway** | Point centralisé pour traffic management, rate limiting, load balancing, auth |
| **Encryption** | HTTPS/TLS obligatoire |
| **Versioning** | Déprécier proprement les anciennes versions non sécurisées |

Distinction rate limiting / throttling : le rate limiting **bloque** (hard cut), le throttling **ralentit** (dégradation progressive).

---

### 2.5.7 Cloud vs Customer-Managed Security

#### Encryption Keys

| | Cloud-managed | Customer-managed (CMEK) |
|--|--------------|------------------------|
| **Gestion** | CSP génère, stocke, gère les clés | Client crée, stocke, fait la rotation |
| **Contrôle** | Délégué au CSP | Granulaire (rotation, accès, audit, intégration HSM) |
| **Risque principal** | Dépendance au CSP | Si clés perdues -> données définitivement inaccessibles |
| **Outils** | -- | AWS KMS, Azure Key Vault |
| **Cas d'usage** | Usage standard | Réglementations strictes (HIPAA), besoin de contrôle total |

#### Licenses

**BYOL (Bring Your Own License)** permet d'utiliser les licences existantes dans le cloud. Intégrer la gestion des licences avec l'inventaire d'actifs, le tracking automatisé et les alertes d'expiration pour éviter les audits, amendes et logiciels non patchés.

---

### 2.5.8 Cloud Data Security Considerations

| Risque | Cause | Mitigation |
|--------|-------|-----------|
| **Data exposure** | Misconfigurations (S3 public, Azure Blob) | Contrôles d'accès, monitoring continu. Cas : breach Capital One (100M clients via WAF mal configuré) |
| **Data leakage** | APIs faibles, contrôles d'accès insuffisants | DLP, classification, auth forte sur API endpoints |
| **Data remanence** | Données résiduelles après suppression sur le stockage cloud | NIST SP 800-88, encryption at rest (si résidu persiste, il est illisible) |
| **Insecure storage** | Stockage partagé sans isolation forte entre tenants | Encryption, ACLs, configuration correcte. Guides : NIST SP 800-144, SP 800-210 |

---

### 2.5.9 Cloud Control Strategies

| Type | Quand | Exemples |
|------|-------|---------|
| **Proactive** | Avant l'incident | Patching automatisé, configurations sécurisées, vulnerability assessments |
| **Detective** | Pendant / après l'incident | Monitoring continu, logging (AWS CloudTrail), SIEM |
| **Preventative** | Empêcher l'incident | Firewalls, MFA, chiffrement, NSGs (Network Security Groups) |

---

### 2.5.10 Connectivity, Integration, Adoption

**Customer-to-cloud connectivity** : VPN (IPsec) ou connexion dédiée (AWS Direct Connect, Azure ExpressRoute). Chiffrer le trafic, tunneling sécurisé, monitoring.

**Cloud service integration** : connexion entre services cloud ou cloud <-> on-premises. Gestion sécurisée des APIs, chiffrement des échanges. Exemple : Salesforce -> API Gateway -> AWS Lambda -> S3/DynamoDB. Best practice : OAuth 2.0 pour la délégation d'accès.

**Cloud service adoption** -- Six étapes du Cloud Adoption Framework :

1. **Strategy et planning** -- Objectifs business, readiness, roadmap
2. **Prepare environment** -- Baselines sécurité/identité/réseau, IAM, VPC
3. **Migrate** -- Lift-and-shift, re-platforming, ou re-architecting
4. **Drive innovation** -- Serverless, AI/ML, containers, microservices
5. **Govern et manage** -- Policies, compliance, guardrails
6. **Manage operations** -- Monitoring continu, cost management, optimisation

---
---

## OBJECTIF 2.6 -- Integrate Zero-Trust Concepts into System Architecture Design

*Given a Scenario, Integrate Zero-Trust Concepts into System Architecture Design*

Principe fondamental : **"Never trust, always verify"** -- applicable que l'entité soit à l'intérieur ou à l'extérieur du réseau.

### 2.6.1 Continuous Authorization

Vérification continue des users, devices et applications pendant toute l'interaction avec un système -- pas seulement au login initial. Incorpore l'analyse comportementale (typing patterns, heures d'accès, profils de navigation) pour détecter les activités suspectes. Détecte : device devenu non-conforme, changement de localisation, déviation comportementale.

---

### 2.6.2 Context-Based Reauthentication

Décisions d'accès dynamiques basées sur le contexte : localisation, device health, environnement réseau. Exemple : un employé se connecte habituellement depuis Londres, puis soudainement depuis un autre continent -> le système exige un MFA supplémentaire. Empêche l'utilisation de credentials compromis depuis des localisations ou devices inconnus.

---

### 2.6.3 Network Architecture

#### Segmentation

Division du réseau en zones distinctes pour limiter le mouvement latéral des attaquants. Implémentation classique : VLANs sur des switches Layer 2. Exemple : Finance séparé de HR et R&D.

#### Microsegmentation

Granularité encore plus fine -- chaque application ou workload isolé dans son propre microsegment avec une firewall ACL dédiée. Bénéfice principal : si un web server est compromis, les database servers restent isolés. Souvent contrôlé par des SDN controllers. S'applique au trafic est-ouest (latéral, au sein du data center), là où la segmentation classique couvre le trafic nord-sud (entrée/sortie).

#### VPN et Always-On VPN

VPN = tunnel chiffré pour accès distant. Always-on VPN = connexion automatique dès que l'appareil se connecte à internet -- protège contre les attaques on-path sur les réseaux non fiables (Wi-Fi public, aéroports, cafés). Solutions : Cisco AnyConnect, Palo Alto GlobalProtect, SonicWall Mobile Connect.

---

### 2.6.4 API Integration and Validation (Zero Trust)

| Principe zero trust | Application aux APIs |
|--------------------|--------------------|
| **Explicit verification** | Authentifier tous les clients, valider les tokens (OAuth, JWT, mTLS) |
| **Least-privilege access** | Tokens scopés, RBAC, contrôles basés sur les claims |
| **Assume breach** | Chaque requête traitée comme potentiellement malveillante -- rate limiting, anomaly detection, validation profonde |
| **Microsegmentation** | API gateways et service meshes contrôlent quelles APIs communiquent avec quels services |
| **Continuous monitoring** | Logs API intégrés au SIEM/SOAR/UEBA pour scoring comportemental |

---

### 2.6.5 Asset Identification, Management, and Attestation

**Identification** : cataloguer chaque device (laptops, mobiles, IoT) qui accède aux systèmes. Aucun device non enregistré ne devrait accéder aux informations sensibles.

**Management** : outils (ex : MDM) assurant que les devices respectent les standards de sécurité (patches, configurations). Exemple : MDM bloquant l'accès si le dernier update OS n'est pas installé.

**Attestation** : monitoring continu de la conformité. Un device non conforme (AV obsolète, firmware non approuvé) est mis en quarantaine ou bloqué jusqu'à mise en conformité.

---

### 2.6.6 Security Boundaries

**Data perimeters** -- Restrictions d'accès spécifiques appliquées à des ensembles de données définis, imposées via des identity-based access controls. Combinent MFA, monitoring continu et accès limité au rôle.

**Secure zones** -- Microsegments du réseau abritant des données ou applications hautement sensibles. Chaque zone a ses propres politiques de sécurité. Chaque interaction doit être authentifiée et autorisée. Exemple : base de données de propriété intellectuelle accessible uniquement par les développeurs avec need-to-know + MFA + device verification + RBAC.

**System components** -- Chaque composant (endpoint, serveur, application) est traité comme non fiable jusqu'à preuve du contraire : scan de vulnérabilités, vérification des patches, connexion via VPN ou trusted network.

---

### 2.6.7 Deperimeterization

Les périmètres traditionnels sont obsolètes dans les environnements hybrides/cloud/remote. Trois technologies clés :

#### SASE (Secure Access Service Edge)

Framework cloud-based combinant des fonctions de sécurité réseau (SWG, ZTNA, CASB, firewalls, DLP) avec des capacités WAN. Offre une interface de gestion consolidée unique pour tous les actifs. Permet aux utilisateurs distants et bureaux distants de se connecter de façon sécurisée sans router tout le trafic par le data center central.

Vendeurs : Palo Alto Prisma SASE, Cisco Umbrella/Secure Access, Fortinet FortiSASE, Cloudflare.

#### SDN (Software-Defined Networking)

Découple le control plane du data plane. Trois couches :

1. **Applications** -- Business apps interagissent avec le SDN controller via APIs (northbound interface)
2. **Control** -- Le SDN controller gère la logique réseau et les décisions (control plane)
3. **Forwarding** -- Switches/routers exécutent le forwarding des paquets (data plane) via interface OpenFlow (southbound interface)

Le SDN controller a une vue globale du réseau en temps réel. Il peut détecter une activité suspecte et automatiquement quarantiner des devices, rérouter le trafic ou bloquer des connexions malveillantes. Simplifie la mise à jour des règles de sécurité et réduit les erreurs de configuration. S'intègre avec firewalls, IDS, IPS.

OS de switches SDN : Cumulus Linux, Open Network Linux (ONL), Cisco NX-OS (avec ACI).

#### SD-WAN (Software-Defined Wide Area Network)

Route le trafic dynamiquement selon le meilleur chemin disponible. Intégré avec les politiques zero trust (chiffrement, authentification). Application-aware routing, failover automatique, QoS. Exemples de politiques : router la vidéo conférence sur MPLS et le web sur broadband, failover vers 4G/LTE si les liens primaires tombent.

#### SDN vs SD-WAN -- Différences essentielles

| Aspect | SDN | SD-WAN |
|--------|-----|--------|
| **Scope** | LAN / data center | WAN (branches, cloud, HQ) |
| **Objectif** | Contrôle centralisé du switching/routing LAN | Optimiser performance WAN, sécurité, coût |
| **Contrôle trafic** | Flow-level, segmentation virtuelle | Application-aware routing, link failover, QoS |
| **Focus déploiement** | Campus LANs, data centers, multi-tenant | Edge-to-cloud (branch to SaaS) |
| **Modèle gestion** | Controller-based (OpenFlow, overlays) | Cloud-first, policy-driven, souvent intégré SASE |

---

### 2.6.8 Subject-Object Relationships

**Subject** = utilisateur, groupe, application, service. **Object** = ressource (database, fichier, système).

Les relations sont basées sur le least-privilege access : chaque subject n'interagit qu'avec les objets nécessaires à son rôle spécifique. L'authentification et la vérification sont continues, pas ponctuelles.

Exemple : dans une université, les étudiants (subject) accèdent uniquement à leurs propres dossiers (object). Les administrateurs (autre groupe de subjects) ont un accès plus large mais toujours limité à ce qui est nécessaire.

---
---

## MNEMONIQUES ET AIDE-MEMOIRE

**Générations de firewalls** : 1ère = Packet Filtering / 2ème = Stateful Inspection / 3ème = NGFW (DPI)

**IDS vs IPS** : IDS = passif (copie du trafic, alerte) / IPS = actif (inline, bloque)

**TAP vs SPAN** : TAP = copie physique complète, sans perte / SPAN = port mirroring, peut perdre des paquets

**IPsec AH vs ESP** : AH = Authentification + Intégrité (pas de chiffrement, pas NAT) / ESP = tout AH + chiffrement + compatible NAT

**802.1X** : Supplicant (client) -> Authenticator (switch/AP) -> Authentication Server (RADIUS)

**EAP hierarchy** : PAP < CHAP < LEAP < PEAP < EAP-FAST < EAP-TTLS < EAP-TLS (gold standard = mutual certs)

**SDLC Security** : Planning (risk assessment) > Requirements (security reqs) > Design (STRIDE) > Implementation (SAST) > Testing (DAST) > Deployment (config check) > Maintenance (patching)

**Software assurance** : SAST (code, white-box, early) / DAST (runtime, black-box, testing) / IAST (hybrid, agents, QA) / RASP (embedded, production, seul qui bloque)

**Shift-left** : sécurité le plus tôt possible dans le SDLC

**Defense-in-depth (8 couches)** : Physical > Network > Perimeter > Endpoint > Application > Data > User > Monitoring

**Classification des données** : Public < Internal < Confidential < Highly Confidential

**DLP 3 états** : At rest (chiffrement) / In transit (TLS) / In use (agents DLP endpoint)

**KPI -> KRI** : un KPI qui passe sous le seuil critique devient un KRI (performance -> risque)

**OIDC vs OAuth vs SAML** : OIDC = authentication (JWT) / OAuth = authorization (tokens) / SAML = SSO enterprise (XML assertions)

**OAuth 4 rôles** : Resource Owner / Client / Authorization Server / Resource Server

**Kerberos** : tickets (pas de mots de passe transmis), mutual auth, nécessite NTP

**Policy points** : PEP (enforce) -> PDP (decide) -> PIP (info contextuelle) -> PAP (admin des politiques)

**Access control models** : DAC (owner) / MAC (system labels, need-to-know) / RBAC (roles) / ABAC (attributes) / RuBAC (rules)

**PKI hierarchy** : Root CA (offline) > Intermediate CA > End-entity certs

**Révocation** : CRL (liste périodique) < OCSP (temps réel) < OCSP Stapling (attaché au TLS handshake)

**Cert validity** : max 398 jours (SSL/TLS public), RSA min 2048 bits

**Shared responsibility** : données = toujours client / IaaS = client gère OS+apps / SaaS = CSP gère presque tout

**Terraform vs Ansible** : Terraform = provisioning (IaC, déclaratif) / Ansible = configuration (playbooks, procédural, agentless)

**Container security** : scan images + non-root + segmentation réseau + vault pour secrets + runtime monitoring

**K8s composants** : Pod (unité) > Deployment (scaling) > Service (exposition) > Ingress (HTTPS externe)

**Serverless threats** : cold start exploitation, multi-tenancy risk, event injection, DoS via auto-scaling, excessive permissions

**Rate limiting vs Throttling** : Rate limiting = bloque (hard cut, HTTP 429) / Throttling = ralentit (dégradation progressive)

**CASB types** : API-based (visibilité profonde, pas temps réel) / Proxy-based (temps réel, latence possible)

**Cloud adoption (6 étapes)** : Strategy > Prepare > Migrate > Innovate > Govern > Manage

**Zero Trust** : Never trust, always verify / Continuous authorization / Context-based reauthentication

**Segmentation vs Microsegmentation** : Segmentation = VLANs, zones (nord-sud) / Microsegmentation = par workload, ACL dédiée (est-ouest)

**SASE** : SWG + ZTNA + CASB + FW + DLP + WAN = gestion consolidée cloud

**SDN 3 couches** : Applications (northbound API) > Control (SDN controller) > Forwarding (OpenFlow, southbound)

**SDN vs SD-WAN** : SDN = LAN/data center / SD-WAN = WAN/branches/cloud

**Data perimeters vs Secure zones** : Perimeters = restrictions par identité sur les données / Zones = microsegments réseau avec politiques propres

**Subject-Object** : Subject (user/app) -> Object (ressource) -- least privilege, vérification continue