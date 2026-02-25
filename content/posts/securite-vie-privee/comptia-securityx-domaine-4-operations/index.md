---
title: "CompTIA SecurityX — Domaine 4 : Security Operations"
date: 2026-02-25
categories: ["Securite-Vie-Privee"]
tags: ["SecurityX", "CASP+", "CompTIA", "SecOps", "Threat Hunting", "Certification"]
description: "Fiche de révision SecurityX (ex CASP+) — Domaine 4 : opérations sécurité, analyse de données, threat hunting et réponse aux incidents."
showOnHome: true
pageClass: "fiche-revision"
---

# DOMAIN 4 -- SECURITY OPERATIONS

> Analyser les données de sécurité, identifier les vulnérabilités, conduire le threat hunting, et analyser les artefacts en support de la réponse aux incidents dans un environnement d'entreprise.

---

## OBJECTIF 4.1 -- Analyze Data to Enable Monitoring and Response Activities

*Given a Scenario, Analyze Data to Enable Monitoring and Response Activities*

### 4.1.1 SIEM (Security Information and Event Management)

**Définition** : solution de cybersécurité qui collecte, normalise, corrèle et analyse les logs et événements de sécurité provenant de sources multiples (firewalls, IDS, EDR, serveurs, endpoints) pour fournir un monitoring en temps réel, une détection des menaces et une capacité de réponse aux incidents.

---

#### Event Parsing

Les logs arrivent dans des formats variés selon le vendor ou le système. Le SIEM doit effectuer le **parsing** pour interpréter ces données correctement, en extraire les champs pertinents et les mapper vers un format commun (JSON, modèle d'événement structuré).

**Mécanismes de parsing** : règles prédéfinies, parsers de logs, expressions régulières (regex). Des règles supplémentaires peuvent être ajoutées par les analystes pour les formats non supportés. Les SIEM avancés utilisent le ML et l'IA pour interpréter dynamiquement de nouveaux formats.

**Exemple concret** : un log firewall (`SRC=192.168.1.10 DST=10.0.0.5 PROTO=TCP DPT=443`), un log IDS (`ALERT: SQL Injection from 192.168.1.15`) et un log Windows (`EventID=4625, LogonType=3, Status=Failed`) sont parsés et normalisés vers un schéma commun avec des champs standardisés (timestamp, device_type, event_type, source_ip, etc.).

**Impact d'un mauvais parsing** : un règle de parsing mal configurée peut interpréter un Event ID 4625 (failed logon) comme un login réussi. Résultat : une attaque brute force passe inaperçue (faux négatif) tandis que des événements bénins déclenchent des alertes (faux positifs), provoquant de l'alert fatigue.

---

#### Event Duplication

Même événement loggé plusieurs fois, encombrant le SIEM et dégradant les performances.

**Processus de déduplication** :
1. **Normalization** : le SIEM parse et identifie les champs clés (event type, source IP, username, timestamp)
2. **Correlation rule / Thresholding** : règle de type "si plus de 5 failed logins depuis la même IP en 1 minute, générer une alerte agrégée"
3. **Suppression / Event aggregation** : au lieu de 100 alertes, une seule alerte avec métadonnées (IP source, hôte, nombre total de tentatives, plage temporelle)

Résultat : réduction de l'alert fatigue, amélioration du triage et accélération du temps de réponse.

---

#### Non-Reporting Devices

Composants réseau ou endpoints qui cessent d'envoyer des logs au SIEM en raison de mauvaises configurations, pannes réseau ou compromissions.

**Risque** : angles morts empêchant la détection d'incidents. Exemple : un firewall de succursale avec un niveau de log configuré trop bas (emergency only) ou une IP Syslog de destination incorrecte. Un port scan ciblant ce réseau passerait totalement inaperçu.

**Mitigation** : auditer et vérifier régulièrement toutes les sources de logs attendues. Configurer des alertes pour détecter l'absence de logs depuis un dispositif.

---

#### Retention

Durée de conservation des logs et données d'événements. Essentielle pour la conformité, les investigations forensiques et l'analyse historique.

**Exigences réglementaires de rétention** :

| Régulation | Durée minimale |
|-----------|---------------|
| **PCI DSS** | 1 an minimum, dont 3 mois immédiatement accessibles |
| **FISMA** (US Government) | 3 ans minimum (guidance NARA) |
| **SOX** (Sarbanes-Oxley) | 7 ans pour les logs liés aux transactions financières |
| **CJIS** (US Law Enforcement) | 1 an minimum pour tous les logs d'activité système |

**Cas d'usage** : un prestataire de santé découvre un comportement suspect sur un serveur en juin 2024. L'enquête suggère que la compromission remonte à janvier. Grâce à une politique de rétention de 180 jours, les logs sont encore disponibles pour reconstituer la chaîne d'attaque complète (accès initial par phishing, mouvement latéral, exfiltration).

---

#### False Positives / False Negatives

**False positive** : événement bénin incorrectement signalé comme menace. Conséquence : investigations inutiles, alert fatigue, risque d'ignorer des alertes réelles.

**False negative** : menace réelle non détectée. Conséquence : l'attaquant opère sans être repéré.

**Réduction** : fine-tuning des règles de détection, ML pour l'analyse comportementale, alerting context-aware intégrant les baselines d'activité normale, intégration de threat intelligence feeds.

---

### 4.1.2 Aggregate Data Analysis

Les cybermenaces sont rarement détectables via un seul point de données. L'analyse agrégée consiste à collecter et analyser de grands volumes de données de sécurité provenant de sources variées pour identifier des patterns, des tendances et des menaces cachées.

**Exemple -- détection d'insider threat** : individuellement, un téléchargement de fichiers (log serveur), un accès VPN depuis un pays inhabituel (log VPN), et des emails avec pièces jointes vers des domaines externes (log mail) semblent bénins. Agrégés et corrélés, ces événements révèlent un pattern d'exfiltration de données par un employé sur le départ.

#### Correlation

Processus d'identification de connexions entre des événements de sécurité provenant de sources différentes pour détecter des patterns d'attaque.

**Exemple** : login réussi à 2h13 (inhabituel) + connexion VPN depuis un pays étranger (jamais vu) + accès et compression de documents confidentiels sur un file server = alerte haute priorité pour compromission de compte et exfiltration. Chaque événement seul aurait pu être ignoré ; corrélés par compte utilisateur, horodatage et IP source, ils forment un signal fort.

#### Audit Log Reduction

Filtrage et synthèse des données de logs pour supprimer les éléments redondants, non pertinents ou de faible priorité.

**Techniques** :
- **Filtering** : suppression des entrées de faible valeur (logins réussis routiniers, heartbeats système)
- **Aggregation** : regroupement d'événements similaires dans une fenêtre temporelle (1000 failed logins -> un seul événement résumé)
- **Deduplication** : élimination des doublons générés par des systèmes redondants
- **Normalization** : conversion vers un format commun pour faciliter la comparaison
- **Tagging / Enrichment** : ajout de métadonnées contextuelles (criticité de l'asset, rôle de l'utilisateur)

Résultat : focus sur les événements clés, réduction des besoins de stockage, efficacité accrue dans les investigations forensiques et audits de conformité.

#### Prioritization

Classement des événements, vulnérabilités ou menaces par sévérité, impact et probabilité d'exploitation.

**Facteurs de priorisation** :
- **Criticality** : importance du système affecté pour les opérations business
- **Impact** : dommage potentiel (breach, disruption, réputation)
- **Asset type** : les alertes sur les domain controllers ou bases de données clients sont prioritaires
- **Residual risk** : niveau de risque après application des contrôles existants
- **Data classification** : les alertes impliquant des PII, données financières ou propriété intellectuelle exigent une attention immédiate

#### Trends

Monitoring des données de sécurité dans le temps pour identifier des patterns récurrents, des menaces émergentes et des évolutions dans les méthodologies d'attaque.

**Exemple** : une augmentation des attaques de phishing utilisant des QR codes signale un changement tactique des attaquants, justifiant un renforcement de la sensibilisation et des filtres email.

Essentielle pour la threat intelligence, le reporting de conformité et la planification sécuritaire à long terme.

---

### 4.1.3 Behavior Baselines and Analytics

Établissement de patterns normaux d'activité sur l'ensemble de l'environnement IT pour détecter les anomalies et les menaces potentielles. Les données sont collectées sur des semaines ou des mois pour comprendre les patterns opérationnels normaux.

**Outils** : SIEM, **UEBA** (User and Entity Behavior Analytics), NTA (Network Traffic Analysis), IAM. Utilisent le ML, l'analyse statistique et la modélisation comportementale par IA.

#### Network Behavior Baselines

Définissent les patterns de trafic normaux : bande passante typique, protocoles courants, connexions internes/externes habituelles. Établis via IDS, SIEM et NTA.

**Anomalies détectées** : pics de trafic inhabituels, activité sur des ports inattendus, connexions non autorisées -> signaux de DDoS, mouvement latéral ou exfiltration.

#### System Behavior Baselines

Définissent les opérations normales des serveurs, endpoints et environnements cloud : utilisation des ressources (CPU, mémoire, disque), exécution de processus, patterns d'accès.

**Anomalies détectées** : pics de consommation, installations logicielles non autorisées, connexions persistantes vers des serveurs externes inconnus -> signaux de malware, compromission ou escalade de privilèges.

#### User Behavior Baselines

**UBA (User Behavior Analytics)** établit les patterns normaux pour chaque utilisateur : localisation de login, horaires de travail, accès aux fichiers, interactions système.

**Anomalies détectées** : login depuis une localisation géographique inhabituelle, transferts de données excessifs, accès à des fichiers restreints -> signaux d'insider threat, vol de credentials ou compte compromis.

**Contextualisation ML** : le système différencie un changement légitime (voyage d'affaires déclaré, appareil corporate avec certificat correct) d'une menace réelle (appareil inconnu, région à haut risque, accès anormal à des données financières sensibles).

#### Application and Service Behavior Baselines

Définissent les comportements opérationnels attendus : appels API normaux, requêtes DB, volumes de transactions, temps de réponse.

**Outils** : **WAF**, **RASP** (Runtime Application Self-Protection), APM (Application Performance Monitoring).

**Anomalies détectées** : requêtes API non autorisées, tentatives d'injection SQL, disruptions de service inattendues.

Les baselines doivent être **périodiquement mises à jour** pour refléter les nouvelles activités, mises à jour système ou changements réseau.

---

### 4.1.4 Incorporating Diverse Data Sources

Un SOC efficace agrège des données de sources multiples pour une visibilité complète.

**Third-party Reports and Logs** -- Rapports et logs de MSSPs (Managed Security Service Providers), fournisseurs cloud et vendors de sécurité externes. Contiennent des analyses forensiques, des indicateurs d'attaque et des stratégies de remédiation. Outils d'ingestion : Splunk, IBM QRadar, Microsoft Sentinel.

**Threat Intelligence Feeds** -- Mises à jour en temps réel sur les acteurs malveillants, patterns d'attaque et IoCs connus. Sources : commerciales, OSINT, gouvernementales. Plateformes : **Anomali ThreatStream**, **Recorded Future**, Palo Alto Networks AutoFocus. S'intègrent aux SIEM et XDR pour enrichir les alertes.

**Vulnerability Scans** -- Identification des faiblesses exploitables dans l'infrastructure. Outils : **Tenable Nessus**, **Qualys**, Rapid7 InsightVM. Les données sont corrélées avec la threat intelligence et les logs endpoints.

**CVE Details** -- Enregistrements détaillés des failles de sécurité publiquement divulguées. Sources : **NVD** (National Vulnerability Database, NIST), **MITRE CVE database**, Kenna Security (Cisco), VulnDB. Les TIPs et SIEM ingèrent automatiquement les CVEs pour les croiser avec les événements internes.

**Bounty Programs** -- Programmes de bug bounty permettant aux chercheurs en sécurité d'identifier des failles. Plateformes : **HackerOne**, **Bugcrowd**, Synack. Fournissent des PoC exploits permettant aux SOC de prioriser le patching.

**DLP Data** -- Les solutions DLP (Data Loss Prevention) surveillent et préviennent l'exfiltration non autorisée de données. Outils : **Microsoft Purview DLP**, Symantec DLP (Broadcom). Détectent les insider threats, le cloud storage mal configuré et les transferts de fichiers non autorisés.

**Endpoint Logs** -- Visibilité détaillée sur l'activité des workstations et serveurs. Solutions EDR/XDR : **CrowdStrike Falcon**, **Microsoft Defender for Endpoint**, SentinelOne.

**Infrastructure Device Logs** -- Logs des firewalls, IDS/IPS, NAC. Monitoring des patterns de trafic et détection d'anomalies via le SIEM.

**Application Logs** -- Événements d'authentification, appels API, activité utilisateur anormale. Solutions WAF/RASP : Akamai Kona Site Defender, AWS WAF. Détection des injections SQL, XSS, credential stuffing.

**CSPM Data (Cloud Security Posture Management)** -- Évaluation continue des misconfigurations, violations de conformité et risques dans les environnements cloud. Outils : **Microsoft Defender for Cloud**. Identification des assets cloud exposés, enforcement du least privilege, mitigation des menaces cloud-native (container escape, API abuse).

---

### 4.1.5 Alerting

#### False Positives et False Negatives dans l'alerting

Faux positifs : alertes sur activité bénigne -> alert fatigue -> les analystes ignorent les alertes critiques. Faux négatifs : menaces non détectées -> breaches non identifiées.

Réduction : fine-tuning des règles, ML pour l'analyse comportementale, alerting context-aware basé sur les baselines.

#### Alert Failures

Échec de génération ou de routage des alertes. Causes : règles de détection mal configurées, SIEM surchargé, manque d'intégration entre outils, erreurs humaines dans le triage.

**Mitigation** : test et validation réguliers des mécanismes d'alerting, exercices red team pour simuler des attaques, systèmes d'alerting avec failover.

#### Facteurs de priorisation des alertes

| Facteur | Description |
|---------|-------------|
| **Criticality** | Importance du système affecté pour les opérations business |
| **Impact** | Dommage potentiel (breach, disruption, réputation) |
| **Asset type** | Alertes sur domain controllers ou bases de données clients = priorité haute |
| **Residual risk** | Risque restant après application des contrôles existants |
| **Data classification** | PII, données financières, propriété intellectuelle = attention immédiate |

#### Malware Detection and Alerting

Les malwares modernes utilisent le **fileless execution** (opère en mémoire sans écrire sur disque), le **polymorphic code** (modifie son code à chaque exécution pour échapper aux signatures) et les communications **C2** (canaux chiffrés ou couverts : DNS tunneling, HTTPS).

L'alerting malware efficace nécessite l'analyse comportementale, la détection heuristique et l'EDR. Mécanismes de containment automatisé : segmentation réseau et quarantaine de fichiers pour prévenir le mouvement latéral.

#### Vulnerability Alerting

Notification proactive des faiblesses exploitables dans les systèmes, applications et configurations réseau.

**Exemple -- Log4Shell** : une plateforme de vulnerability management, intégrée avec un threat intelligence feed et la base CVE, détecte qu'une application Java interne utilise Apache Log4j 2.14, vulnérable à l'exécution de code à distance (CVE-2021-44228, CVSS 10.0). L'alerte est corrélée avec des logs de trafic sortant, révélant des requêtes DNS vers des domaines suspects.

---

### 4.1.6 Reporting and Metrics

**Reporting** : résumés structurés et périodiques des données de sécurité. **Metrics** : indicateurs quantifiables de performance et de risque.

**Métriques de sécurité courantes** :
- Nombre de menaces détectées
- **MTTD** (Mean Time To Detect) : temps moyen de détection
- **MTTR** (Mean Time To Respond) : temps moyen de réponse
- Volume d'alertes par source
- Taux de faux positifs / faux négatifs

#### Visualization

Transformation des données brutes en formats visuels (graphiques, heat maps, timelines). Permet de repérer rapidement les anomalies, facilite l'interprétation par les stakeholders non techniques.

**Exemple** : un pic de failed logins visualisé sur une timeline attire immédiatement l'attention sur une potentielle attaque brute force.

#### Dashboards

Interface visuelle en temps réel consolidant les données de sécurité de sources multiples (SIEM, firewalls, EDR, threat intelligence, vulnerability scanners) dans une vue centralisée.

**Caractéristiques** : personnalisables par rôle (analystes : tendances malware / managers : statut conformité), mise à jour en temps réel, agrégation de métriques (alert counts, failed logins, endpoint statuses, intrusion attempts) mappées à des KPIs.

---
---

## OBJECTIF 4.2 -- Analyze Vulnerabilities and Attacks, Recommend Solutions

*Given a Scenario, Analyze Vulnerabilities and Attacks, and Recommend Solutions to Reduce the Attack Surface*

### 4.2.1 Vulnérabilités et attaques

#### Injection

Les attaques par injection (SQL, command, LDAP) surviennent quand l'input utilisateur non validé est passé directement à un interpréteur, permettant l'exécution de commandes arbitraires.

**SQL Injection** : un champ de login non sanitisé permet à un attaquant d'injecter `' OR '1'='1` dans le champ username, transformant la requête SQL en condition toujours vraie et contournant l'authentification.

**Commandes SQL dangereuses** : `INSERT` (créer un compte backdoor), `DELETE` (supprimer des enregistrements), `UPDATE` (modifier un mot de passe admin), `DROP TABLE` (détruire une table entière).

**Impact** : accès non autorisé, fuite de données, prise de contrôle totale du système.

#### Cross-Site Scripting (XSS)

Injection de scripts malveillants dans du contenu délivré aux utilisateurs. Le script s'exécute dans le navigateur de la victime.

**Trois types** :
- **Stored XSS** : le script malveillant est stocké de manière permanente (base de données, commentaire, forum) et exécuté chaque fois qu'un utilisateur consulte la page
- **Reflected XSS** : le script est inclus dans l'URL ou la requête et renvoyé immédiatement dans la réponse
- **DOM-based XSS** : le script manipule le Document Object Model côté client sans interaction serveur

**Impact** : vol de tokens de session, redirection vers des sites de phishing, défacement. Les plateformes SaaS patchent régulièrement de nouvelles variantes XSS.

#### Unsafe Memory Utilization

Manipulation mémoire non sécurisée créant des opportunités d'injection de code ou d'élévation de privilèges.

**Buffer Overflow** : écriture au-delà de la taille allouée d'un buffer, corrompant la mémoire adjacente. En C : `char buffer[10]; gets(buffer);` -- aucune vérification de la taille de l'input, un attaquant peut écraser l'adresse de retour et rediriger l'exécution vers du code malveillant.

**Dangling Pointer** : pointeur qui pointe vers un emplacement mémoire après sa libération (`free(ptr); *ptr = 100;`). Un attaquant peut exploiter cette condition pour écraser de la mémoire sensible.

**Use-After-Free** : accès à la mémoire après sa libération. Si un attaquant parvient à allouer ses propres données dans le bloc libéré (**heap spraying**), il peut injecter et exécuter du code arbitraire.

Prévalent dans les langages à gestion manuelle de la mémoire (C, C++). Outils de détection : **Valgrind**, protections compilateur (stack canaries, ASLR).

#### Race Conditions

Deux opérations concurrentes dont le timing ou la séquence produit un comportement imprévisible. L'attaquant exploite la fenêtre temporelle entre deux étapes.

**Exemple** : une application bancaire vérifie le solde puis effectue le transfert. En envoyant des requêtes multiples en parallèle (scripts, onglets), l'attaquant peut contourner la vérification de solde avant que la déduction soit complétée, retirant plus que le solde réel.

#### CSRF (Cross-Site Request Forgery)

Exploite les sessions authentifiées en forçant l'utilisateur à soumettre une requête non intentionnelle. Si l'utilisateur est connecté à sa banque et visite un site malveillant, ce site peut déclencher un transfert de fonds à l'insu de l'utilisateur -- le navigateur inclut automatiquement les cookies de session.

**Différence avec XSS** : le CSRF n'exige pas de voler des cookies ; il exploite la confiance que le site accorde aux requêtes provenant du navigateur de l'utilisateur.

**Mitigations** : **CSRF tokens** (jetons uniques par requête/session), **same-site cookies**.

#### SSRF (Server-Side Request Forgery)

L'attaquant trompe le serveur pour qu'il envoie des requêtes en son nom, accédant à des ressources internes normalement non exposées (services cloud internes, APIs backend, metadata services).

**Cas réel -- Capital One (2019)** : une vulnérabilité SSRF dans l'application web a permis à l'attaquant d'accéder au service de metadata AWS (`http://169.254.169.254`), de voler les credentials IAM role, et de télécharger les données de plus de 100 millions de clients depuis des buckets S3.

Particulièrement critique dans les architectures cloud-native et microservices.

#### Insecure Configuration

Ports ouverts, credentials par défaut, messages d'erreur verbeux, permissions mal configurées. Fréquent dans les pipelines DevOps et les déploiements cloud où le provisioning est rapide mais le hardening en retard.

Affecte les trois piliers du CIA triad. Répertorié OWASP Top 10 (A05:2021).

#### Embedded Secrets

Credentials hardcodés, clés API ou secrets cryptographiques laissés dans le code source ou les fichiers de déploiement. Peuvent être exposés dans des repos Git publics ou packagés accidentellement dans des conteneurs et apps mobiles.

Outil de détection : **TruffleHog** (scanne les repos Git pour les secrets exposés).

#### Outdated / Unpatched Software and Libraries

Logiciels non patchés vulnérables à des exploits connus avec PoC publiquement disponibles. Les attaquants priorisent ces cibles.

#### End-of-Life (EOL) Software

Logiciel n'ayant plus de mises à jour de sécurité, devenant une cible persistante à haut risque. Persiste souvent pour des raisons de compatibilité ou de coût.

**Cas réel -- WannaCry / NHS (2017)** : les machines Windows XP (EOL) du système de santé britannique ont subi des pannes massives lors de l'épidémie de ransomware WannaCry.

#### Poisoning

Attaques manipulant des inputs de confiance dans des systèmes ou algorithmes.

**DNS Poisoning** : injection de faux enregistrements DNS dans le cache d'un résolveur, redirigeant les utilisateurs vers des sites malveillants. Cas réel : **MyEtherWallet (2018)** -- redirection vers un site de phishing, vol de $150K en crypto.

**Web Cache Poisoning** : stockage de contenu malveillant dans un cache web (CDN, reverse proxy) pour que les utilisateurs futurs reçoivent la réponse empoisonnée au lieu de la réponse légitime. L'attaquant manipule les headers HTTP pour que le cache stocke une réponse contenant du JavaScript malveillant, des cookies volés ou des redirections.

**ML Poisoning** : insertion de données malveillantes dans le dataset d'entraînement d'un modèle ML. Le modèle apprend de fausses corrélations. Exemple : altérer les images d'entraînement pour que le système de reconnaissance d'un véhicule autonome confonde des panneaux stop avec des panneaux de limitation de vitesse.

#### Directory Service Misconfiguration

Les services d'annuaire (LDAP, Active Directory) gèrent les identités, credentials, rôles et permissions. Des misconfigurations créent des vecteurs d'attaque majeurs.

**Problèmes courants** : privilèges excessifs (surface d'attaque élargie), **anonymous LDAP binds** (requêtes non authentifiées révélant usernames, structures de groupes), auditing désactivé (pas de visibilité sur les activités suspectes), manque de segmentation (mouvement latéral facilité).

**Scénario** : un attaquant compromet un compte de bas niveau, découvre des comptes à hauts privilèges par énumération LDAP, exploite des permissions mal configurées (unconstrained delegation, writable group memberships) pour devenir domain admin.

#### Overflows

**Buffer Overflow** : écriture au-delà de la capacité d'un buffer, corrompant la mémoire adjacente. **Stack Overflow** : overflow spécifiquement dans la zone de pile (stack) du programme, écrasant l'adresse de retour de la fonction. L'attaquant peut rediriger l'exécution vers un shellcode.

Particulièrement dangereux dans les systèmes embedded et legacy sans mitigations modernes. Références : CWE-119, CWE-121, CWE-122.

#### Deprecated Functions

Fonctions de code obsolètes ne recevant plus de mises à jour ni de revues de sécurité. Exemple : utilisation de MD5 pour l'authentification, vulnérable aux collisions et aux attaques par impersonation.

#### Vulnerable Third Parties

Les applications modernes dépendent fortement de librairies et services tiers.

**Outdated or Unpatched Libraries** -- Composants avec des CVEs connues non corrigées. Même si le code propre est sécurisé, la faille dans la librairie expose tout le système. Exemple : **Spring4Shell** (RCE via une ancienne version de Spring Framework). Mitigation : **SCA** (Software Composition Analysis) régulière.

**Insecure APIs or Integrations** -- APIs mal sécurisées : absence d'authentification, contrôle d'accès faible, retour d'informations excessives, manque de rate limiting, communications non chiffrées, credentials hardcodées. Exemple : une API de paiement sans validation de token permet l'accès aux factures d'autres utilisateurs par modification de l'userID dans l'URL.

**Weak Vendor Security Posture** -- Vendors avec des contrôles inadéquats (accès non restreint, pas de chiffrement, pas de monitoring). Mène à des **supply chain attacks**. Exemple : un fournisseur stocke du code source sur un serveur exposé, un attaquant y injecte une backdoor.

#### TOCTOU (Time of Check, Time of Use)

Race condition où un système vérifie une condition (TOC) puis effectue une action (TOU) sans garantir que l'état n'a pas changé entre les deux.

**Exploitation** : entre la vérification et l'utilisation, l'attaquant remplace le fichier par un symlink vers un fichier sensible (ex: `/etc/shadow`), modifie des permissions ou supprime le fichier original.

**Risque supplémentaire** : dans les systèmes de sécurité séquentiels, un malware peut être exécuté (TOU) avant que le scan ne soit terminé (TOC). Un fichier est sauvegardé à 15h02, le scan démarre à 15h03, le fichier est exécuté à 15h05, et le scan ne détecte le malware qu'à 15h10 -- trop tard.

**Mitigation** : **opérations atomiques** (indivisibles et sans interruption).

#### Deserialization

La désérialisation reconstruit un objet à partir de données sérialisées (JSON, XML, binaire). Si le processus exécute automatiquement des méthodes (Java, PHP, .NET), un attaquant peut fournir un payload malveillant déclenchant l'exécution de code.

**Gadget chains** : combinaisons de classes permettant à l'attaquant d'enchaîner des appels de méthodes pour aboutir à une exploitation.

**Mitigations** : ne jamais désérialiser de données provenant de sources non fiables, implémenter un whitelisting de classes autorisées, vérifier l'intégrité via des signatures cryptographiques.

#### Weak Ciphers

RC4, DES, MD5 ne sont plus sécurisés. Leur utilisation expose à des attaques brute force, collision et downgrade. RC4 a été déprécié dans SSL/TLS après la publication de vulnérabilités permettant le session hijacking.

#### Confused Deputy

Un composant système à hauts privilèges est trompé pour effectuer des actions au nom d'un utilisateur à bas privilèges. Souvent lié au SSRF, à l'escalade de privilèges ou à l'exposition de données. Mitigation : contrôles d'accès et vérifications d'identité à **chaque couche**, pas seulement aux points d'entrée.

#### Implants

Malware persistant (rootkits, backdoors firmware) conçu pour éviter la détection et maintenir un contrôle à long terme. Utilisé dans les APTs et le cyber-espionnage.

**Cas réel -- MoonBounce (2022)** : implant UEFI découvert par Kaspersky, résidant dans le firmware de la carte mère (mémoire non volatile). Survit aux reboots et réinstallations d'OS.

---

### 4.2.2 Mitigations

#### Input Validation

S'assurer que les données fournies par l'utilisateur correspondent aux formats et valeurs attendus avant traitement. Principe : **accept known good** plutôt que block known bad. Valider côté client ET serveur.

Prévient : injections, buffer overflows, erreurs logiques.

#### Output Encoding

Neutralisation des caractères potentiellement dangereux avant leur affichage. Les caractères spéciaux (`<`, `>`, `'`, `"`, `&`) sont convertis en équivalents sûrs (`&lt;`, `&gt;`, etc.) que le navigateur n'interprète pas comme du code.

Prévient : XSS. L'encoding doit être adapté au contexte de rendu (HTML, JavaScript, URL).

#### Safe Functions

Pratiques de programmation sécurisées :
- **Atomic functions** : opérations s'exécutant sans interruption, prévenant les race conditions
- **Memory-safe functions** : `strncpy` au lieu de `strcpy` pour prévenir les buffer overflows
- **Thread-safe functions** : protègent la mémoire partagée dans les environnements multi-thread
- Langages memory-safe (Rust, Go), smart pointers en C++ (`std::unique_ptr`, `std::shared_ptr`)
- Nullifier les pointeurs après `free()`, runtime protections (AddressSanitizer, control-flow integrity)

#### Security Design Patterns

Solutions réutilisables à des problèmes de sécurité courants en architecture logicielle :

| Pattern | Description |
|---------|-------------|
| **Authentication Enforcer** | Authentification obligatoire avant accès aux ressources protégées (OAuth, SSO) |
| **Secure Logger** | Logging tamper-proof et privacy-aware (pas de passwords ni PII dans les logs) |
| **Secure Pipe** | Transmission sécurisée entre composants (TLS pour confidentialité et intégrité) |
| **Check-then-Act** | Validation des inputs et conditions juste avant l'action (contre-mesure TOCTOU) |
| **RBAC** | Accès basé sur les rôles plutôt que sur l'identité individuelle |
| **Sandboxing** | Isolation de l'exécution de code ou processus non fiable |
| **Input Validation** | Vérification de tous les inputs externes pour leur correction et sécurité |

Utilisés dans les architecture reviews, code reviews et SSDLC (Secure Software Development Life Cycle).

#### Updating / Patching

Application de correctifs à différents niveaux : patches OS (kernel, escalade de privilèges), patches logiciels (erreurs logiques, vulnérabilités), patches hyperviseur (VM escape, resource exhaustion), **patches firmware** (BIOS, UEFI, contrôleurs embedded). Les images de base doivent être versionnées et à jour.

#### Least Privilege

Utilisateurs et processus n'ont que les permissions strictement nécessaires. Limite le mouvement latéral et réduit l'impact d'un compte compromis. Implémenté via RBAC et séparation des devoirs.

#### Fail Secure / Fail Safe

**Fail secure** : en cas de panne, le système maintient les contrôles de sécurité même au détriment de la disponibilité. Exemple : une porte de datacenter reste **verrouillée** lors d'une coupure de courant. Priorité : confidentialité et intégrité.

**Fail safe** : en cas de panne, le système se met dans un état sûr qui évite les dommages, même si la sécurité est réduite. Exemple : une porte de sortie de secours d'hôpital se **déverrouille** automatiquement en cas d'incendie. Priorité : sécurité humaine et disponibilité.

Le choix dépend de la tolérance au risque, de la criticité de la sécurité et des exigences de sûreté.

#### Secrets Management

Stockage, accès et contrôle sécurisés des credentials et tokens sensibles. Outils : **HashiCorp Vault**, **AWS Secrets Manager**.

**Key Rotation** : remplacement régulier des clés de chiffrement ou de signature pour limiter la fenêtre d'exposition. Types : automatique (planifiée, ex: tous les 30 jours), manuelle/forcée (après un incident), rolling (mise à jour progressive sans interruption).

#### Least Function / Functionality

Les systèmes ne doivent être configurés qu'avec les fonctionnalités strictement nécessaires. Désactiver les modules inutiles (FTP, WebDAV sur un serveur web), les langages de scripting non nécessaires (PowerShell, Python sur un poste utilisateur), les interfaces sans fil non requises (Bluetooth), les outils de gestion distante non utilisés sur les IoT. En cloud : déployer des conteneurs minimaux avec uniquement les librairies requises.

#### Defense-in-Depth

Application de couches de sécurité multiples et superposées. Si un contrôle échoue, les autres restent en place.

| Couche | Implémentation |
|--------|---------------|
| **Perimeter security** | Firewalls, segmentation réseau, protection DDoS |
| **Network security** | IDS/IPS, VLANs, zero trust |
| **Endpoint security** | Antivirus, EDR, device control |
| **Application security** | Input validation, secure coding, WAF |
| **Data security** | Chiffrement at rest/in transit, DLP |
| **Access control** | MFA, RBAC, least privilege |
| **Monitoring/logging** | SIEM, anomaly detection, audit trails |
| **Human layer** | Security awareness training, phishing simulations, insider threat monitoring |

#### Dependency Management

Contrôle, suivi et mise à jour des librairies, packages et frameworks tiers.

**Best practices** : inventaire complet (direct et transitif) via **SBOM** (Software Bill of Materials), scanning de vulnérabilités (Snyk, Dependabot, OWASP Dependency-Check, GitHub Advanced Security), **version pinning** (verrouiller les versions), patching régulier avec tests de compatibilité, automatisation via pipelines CI/CD, évaluation avant adoption (réputation, fréquence de mise à jour, licence).

#### Code Signing

Signature numérique du code assurant la provenance et l'intégrité. Les certificats de signature doivent être stockés de manière sécurisée et révisés périodiquement.

#### Encryption

Protection de la confidentialité des données at rest et in transit. Algorithmes forts (AES-256, TLS 1.2+) et gestion de clés appropriée.

#### Indexing

Organisation et tagging des données (logs, alertes, fichiers, indicateurs de menace) pour une recherche, un filtrage et une corrélation rapides. Essentiel pour l'incident response : sans indexation, chercher dans des téraoctets de données brutes prendrait des heures ; avec indexation, cela prend des minutes.

**Outils** : **ElasticSearch (ELK Stack)**, **Splunk**, **Microsoft Sentinel**.

#### Allow Listing

Contrôle de sécurité n'autorisant que les entités explicitement approuvées (applications, IPs, domaines, expéditeurs email). Tout ce qui n'est pas sur la liste est refusé par défaut.

| Contexte | Application |
|----------|-------------|
| **Endpoint Security** | Seules les applications pré-approuvées peuvent s'exécuter |
| **Network Security** | Connexions sortantes uniquement vers les domaines approuvés |
| **Email Security** | Acceptation uniquement des domaines/adresses vérifiés |
| **Cloud/API Security** | Accès API uniquement depuis les ranges IP de confiance |

Implémentation : **WDAC** (Windows Defender Application Control). Avantages : contrôle préventif fort, réduit les faux positifs par rapport au blocklisting, aligné avec le Zero Trust (deny by default).

---
---

## OBJECTIF 4.3 -- Threat Hunting and Threat Intelligence

*Given a Scenario, Apply Threat-Hunting and Threat Intelligence Concepts*

### 4.3.1 Sources d'intelligence internes

#### Adversary Emulation Engagements

Exercices structurés où des équipes simulent les actions d'acteurs de menace réels en utilisant les tactiques du **MITRE ATT&CK**. Différent du simple red teaming : l'objectif est d'émuler des comportements adverses spécifiques pour tester si les outils de détection (SIEM, EDR) et les analystes SOC peuvent identifier et répondre à des attaques sophistiquées.

**Exemple** : émuler un groupe ransomware pour tester la rapidité de détection du mouvement latéral. MITRE ATT&CK T1486 décrit les techniques de chiffrement de données. Familles suivies : INC, Clop, Conti, LockBit 3.0, Royal, Akira.

#### Internal Reconnaissance

Version blue team du mapping du terrain : scans internes, revue de logs, inventaire d'assets, analyse des flux de données. Objectif : comprendre comment un attaquant pourrait se déplacer après une compromission initiale. Identifie : shadow IT, services mal configurés, systèmes legacy, credentials exposés.

#### Hypothesis-Based Searches

Investigations proactives et méthodiques construites autour d'hypothèses de menace. Les analystes forment des hypothèses basées sur le comportement connu des attaquants, les risques spécifiques à l'environnement ou les alertes récentes, puis cherchent des preuves dans les logs et les données télémétriques.

**Exemple** : hypothèse "un credential compromis a été réutilisé" -> chercher des requêtes Kerberos TGT anomales traversant des sous-réseaux non liés.

#### Honeypots

Système ou service délibérément vulnérable placé dans le réseau (ou DMZ) pour attirer les attaquants. Aucun utilisateur légitime ne devrait interagir avec ; tout trafic est donc suspect par défaut.

**Utilité** : détection de scans non autorisés, tentatives brute force, exploitation de zero-day. Collecte des TTPs des attaquants dans un environnement à risque contrôlé.

**Exemple** : un faux service SSH exposé sur internet avec des credentials faibles (admin:admin). Outil : **Cowrie** (simule un shell complet sans donner accès au système réel). Les logs enregistrent : IPs des attaquants, tentatives de login, commandes exécutées, malware/scripts déposés.

#### Honeynets

Extension des honeypots : création d'un **réseau complet simulé** avec utilisateurs, fichiers et services fictifs. Utile pour étudier les attaquants avancés capables de détecter un simple honeypot. Permet d'observer des attaques multi-étapes : mouvement latéral, escalade de privilèges, exfiltration.

**Exemple** : un Active Directory honeynet complet avec de faux credentials et des file shares leurres pour observer l'énumération interne.

Les logs des honeynets alimentent les signatures IoC, les règles firewall et les modèles ML de détection d'anomalies.

#### User Behavior Analytics (UBA)

Utilise le ML et la modélisation statistique pour définir le comportement "normal" de chaque utilisateur, puis signaler les anomalies pour investigation.

Le système analyse chaque événement dans le contexte plus large du comportement habituel de l'utilisateur spécifique, réduisant les faux positifs et surfaçant les risques réels.

**Exemple** : un employé téléchargeant 10 Go de données à 3h du matin depuis un nouvel appareil déclenche une alerte UBA.

---

### 4.3.2 Sources d'intelligence externes

#### OSINT (Open Source Intelligence)

Collecte et analyse d'informations provenant de sources publiquement accessibles.

| Source | Description |
|--------|-------------|
| **Sites/blogs sécurité** | Divulgation de vulnérabilités, PoC exploits, tendances d'attaques |
| **Forums / dark web** | Credentials volées, discussions de planification d'attaques, ventes de malware |
| **Social media** | Informations sensibles exposées involontairement, campagnes de phishing discutées |
| **Code repos** (GitHub, GitLab) | Secrets exposés accidentellement (API keys, clés privées, tokens d'accès) |
| **DNS records / WHOIS** | Propriété de domaines, infrastructure, hébergeurs, sous-domaines liés à des services internes |
| **News feeds / alertes sécurité** | RSS feeds, advisories CERT, bulletins vendeurs -- alertes précoces de nouvelles vulnérabilités |

**Outils OSINT** : VirusTotal, abuse.ch (phishing domains), WHOIS, Reddit, dark web forums, X/Twitter (IoCs partagés par des chercheurs).

#### Dark Web Monitoring

Services et outils surveillant les hidden services (sites .onion sur Tor) pour détecter les mentions des assets d'une organisation : noms de domaine, IPs, credentials, propriété intellectuelle.

**Utilité** : détection de la vente de données clients, de la préparation d'attaques ciblant le secteur.

#### ISACs (Information Sharing and Analysis Centers)

Organisations sectorielles facilitant le partage de threat intelligence entre membres d'une même industrie.

**Exemples** : **FS-ISAC** (Financial Services -- alertes sur banking malware et DDoS), **Health-ISAC** (Healthcare -- alertes ransomware ciblant les systèmes EHR).

Fournissent : rapports de menace vérifiés, IoCs, vulnérabilités, alertes précoces basées sur les inputs des membres et les feeds gouvernementaux.

#### Reliability Factors

Toute intelligence n'est pas également fiable. Le **code Amirauté (Admiralty Code)** assigne un code à deux caractères évaluant la fiabilité de la source (A-F) et la crédibilité de l'information (1-6).

**Fiabilité de la source** :

| Code | Signification |
|------|--------------|
| **A** | Complètement fiable (source de confiance prouvée) |
| **B** | Habituellement fiable |
| **C** | Assez fiable (précision mixte) |
| **D** | Habituellement non fiable |
| **E** | Non fiable (connue pour être incorrecte) |
| **F** | Fiabilité impossible à juger |

**Crédibilité de l'information** :

| Code | Signification |
|------|--------------|
| **1** | Confirmée par d'autres sources indépendantes |
| **2** | Probablement vraie (cohérente avec d'autres informations) |
| **3** | Possiblement vraie (logique mais non vérifiée) |
| **4** | Douteuse (contredite ou sans support) |
| **5** | Improbable (incohérente avec les faits connus) |
| **6** | Impossible à juger |

**Exemples combinés** : A1 = source de confiance, information confirmée (très fort) ; B2 = bonne source, probablement valide ; F6 = source inconnue, information non vérifiée (prudence maximale).

Autres facteurs : **timeliness** (l'information est-elle encore actuelle ?) et **relevance** (applicable à votre environnement ?).

---

### 4.3.3 Counterintelligence and Operational Security

#### Counterintelligence

Identification active des situations où un adversaire collecte des informations sur votre organisation, et perturbation de ce processus.

**Actions** : monitoring des activités de reconnaissance (domain lookups, port scanning), déploiement de techniques de déception (honeypots, faux credentials) pour induire les attaquants en erreur, analyse du comportement et des intentions adverses via la threat intelligence.

**Exemple** : un attaquant effectue des lookups DNS sur `vpn.company.com` -> réponse CI : déployer une fausse page de login monitorée pour capturer les tentatives de connexion.

#### OPSEC (Operational Security)

Processus de protection des informations critiques en identifiant et contrôlant ce qui est exposé à travers les opérations régulières.

**Les 5 étapes du processus OPSEC** :

1. **Identify critical information** : déterminer quelles informations, si exposées, seraient précieuses pour un adversaire (schémas réseau, credentials, calendriers de déploiement, configurations de sécurité)
2. **Analyze threats** : évaluer qui sont les adversaires potentiels, leurs capacités et leurs objectifs
3. **Analyze vulnerabilities** : identifier les faiblesses (mots de passe faibles, communications non chiffrées, cloud mal configuré, oversharing sur les réseaux sociaux, repos GitHub avec API keys hardcodées)
4. **Assess risks** : évaluer la probabilité et l'impact de l'exploitation des vulnérabilités identifiées
5. **Apply countermeasures** : implémenter des contrôles techniques, administratifs ou procéduraux (RBAC, désactivation des ports USB, formation OPSEC régulière)

---

### 4.3.4 Threat Intelligence Platforms (TIPs)

Outils spécialisés qui agrègent, normalisent, analysent et opérationnalisent les données de threat intelligence de sources multiples. Centralisent l'intelligence interne (logs, alertes) et externe (OSINT, ISACs, feeds payants).

**Fonctions** : ingestion d'indicateurs (IPs, domaines, hashes), corrélation avec la télémétrie interne (alertes SIEM, EDR), scoring et priorisation par fiabilité et pertinence, partage automatisé des IoCs vers les outils de défense (firewalls, SIEM).

#### Third-Party Vendors

| Vendor | Spécialité |
|--------|-----------|
| **Recorded Future** | Threat intelligence en temps réel, risk scores, contexte géopolitique |
| **Anomali** | Agrégation de feeds, intégration SIEM/SOAR |
| **ThreatConnect** | Intelligence + orchestration et automatisation |
| **Intel 471** | Dark web et monitoring d'infrastructure adversaire |
| **Mandiant** (Google Cloud) | Profiling d'acteurs de menace, analyse malware, rapports stratégiques |
| **Flashpoint** | Intelligence de forums fermés et marketplaces illicites (fraude, insider threat) |
| **Kaspersky Threat Intelligence** | Télémétrie globale, sandbox analysis, enrichissement IoC |
| **AlienVault OTX** | Plateforme open source de partage d'IoCs communautaire |

**Avantages** : visibilité globale, traitement plus rapide, alertes enrichies avec TTPs (MITRE ATT&CK), intégration automatisée, support du threat hunting proactif.

**Limites** : coût élevé, personnalisation limitée, intégration complexe, risque de bruit et de faux positifs, dépendance excessive envers un fournisseur externe.

---

### 4.3.5 IoC Sharing -- STIX et TAXII

#### STIX (Structured Threat Information eXpression)

Langage standardisé (développé par MITRE, maintenu par **OASIS**) pour représenter la threat intelligence cyber de manière cohérente et machine-readable.

**Permet de décrire** : IoCs, TTPs, acteurs de menace, campagnes, et les **relations** entre ces éléments (quel malware est utilisé par quel groupe).

**Objets STIX principaux** :
- **Indicator** : décrit un indicateur technique (IP malveillante, hash, URL)
- **Malware** : décrit une famille de malware (nom, type, description)
- **Relationship** : relie les objets entre eux (ex: l'indicateur IP "indique" le malware Emotet)

L'interopérabilité STIX permet l'analyse et l'enrichissement automatisés entre systèmes hétérogènes.

#### TAXII (Trusted Automated Exchange of Indicator Information)

Protocole de transport conçu pour l'échange sécurisé et automatisé de threat intelligence formatée en STIX.

**STIX** = *quoi* est partagé (les données de menace). **TAXII** = *comment* c'est partagé (le transport).

**Fonctionnement** : API RESTful permettant aux systèmes de sécurité (SIEM, TIPs) de push, pull ou s'abonner à des données STIX. Les objets STIX sont stockés dans des **TAXII collections** (repositories de CTI). Supporte RBAC et HTTPS pour un partage sécurisé. Pagination, filtrage et delta queries (récupérer uniquement les nouveaux objets).

**Flux typique** : un ISAC partage des indicateurs STIX via une collection TAXII -> le TIP de l'entreprise se connecte au serveur TAXII et récupère les derniers indicateurs -> le SIEM ingère ces objets STIX et active les règles de détection automatiquement.

---

### 4.3.6 Rule-Based Languages

Langages de règles utilisés pour définir des patterns, conditions ou comportements permettant de détecter l'activité malveillante.

#### Sigma

Standard ouvert pour décrire des règles de détection basées sur les logs de manière **SIEM-agnostique**. Sigma est aux logs ce que Snort est aux paquets réseau. Règles écrites en **YAML**, convertibles en requêtes pour des plateformes spécifiques (Splunk, Elastic, etc.).

**Exemple** -- détection de l'exécution de Mimikatz : surveille l'Event ID 4688 (nouveau processus créé) avec un nom de processus contenant `mimikatz.exe`, niveau `high`.

Permet de détecter les techniques MITRE ATT&CK avec le même jeu de règles sur différents SIEM.

#### YARA (Yet Another Recursive Acronym)

Outil de pattern-matching basé sur des règles, utilisé principalement pour la **classification de malware et l'analyse de fichiers**. Scanne des fichiers ou de la mémoire pour des patterns binaires ou textuels.

**Structure d'une règle YARA** : des **strings** (textes, patterns hexadécimaux) et des **conditions** (conditions de correspondance). Utilisé pour la threat intelligence, le reverse engineering de malware, et intégré dans les moteurs antivirus.

**Différence clé Sigma vs YARA** : Sigma est typiquement **behavior-based** (séquence d'actions dans les logs). YARA est typiquement **signature-based** (pattern binaire ou textuel exact dans les fichiers).

#### RITA (Real Intelligence Threat Analytics)

Outil de post-traitement pour l'analyse de logs de trafic réseau, spécialisé dans la détection de communications **C2** et de comportements suspects.

RITA n'intercepte pas le trafic lui-même : il analyse les logs générés par **Zeek** (anciennement Bro), un outil de capture de metadata réseau. RITA applique des modèles statistiques et des heuristiques pour identifier le **beaconing** (communications régulières à intervalles fixes vers un serveur externe), les connexions de longue durée, le DNS tunneling et d'autres signes de compromission.

**Exemple** : un analyste SOC utilise RITA pour scanner 48h de logs Zeek et identifie un hôte établissant des connexions sortantes vers une IP suspecte toutes les 600 secondes -- pattern typique de beaconing **Cobalt Strike**.

Outil open source maintenu par **Black Hills Information Security (BHIS)**.

#### Snort

Premier IDS open source, créé par Martin Roesch, acquis par Cisco en 2013 (intégré dans Firepower). Système de détection et prévention d'intrusion réseau en temps réel utilisant un langage de règles pour inspecter les paquets.

**Fonctionnement** : les règles matchent les patterns de trafic contre les signatures de menaces connues. Snort peut alerter, dropper ou logger les paquets.

**Exemple** -- détection de scan Nmap : alerte quand plus de 5 paquets TCP SYN depuis la même source en 2 secondes (signe de port scan). Le `sid` identifie uniquement la règle.

| Outil | Focus primaire | Cas d'usage |
|-------|---------------|-------------|
| **Sigma** | Règles de détection sur les logs | Logique de détection générique pour SIEM |
| **YARA** | Analyse de malware / fichiers | Pattern matching dans les binaires ou la mémoire |
| **RITA** | Analytics de comportement réseau | Détection C2, beaconing, DNS tunneling |
| **Snort** | Inspection de paquets (IDS/IPS) | Détection et blocage de menaces réseau en temps réel |

---

### 4.3.7 Indicators of Attack (IoAs)

Les IoAs sont des indices comportementaux suggérant qu'un attaquant est **activement en train d'exécuter** une attaque. Contrairement aux IoCs (qui reflètent qu'un événement s'est déjà produit -- hash de malware, domaine C2), les IoAs se concentrent sur l'**intention, les patterns d'activité et la logique d'attaque en cours**.

**Caractéristiques** : se concentrent sur ce que l'attaquant fait et comment, détection en temps réel de l'intention malveillante, plus résilients que les IoCs car ils détectent des comportements plutôt que des artefacts statiques (facilement modifiables par l'attaquant).

**Exemple** : un document Word reçu par email ouvre un processus PowerShell caché, qui se connecte à une IP externe, télécharge un script encodé en Base64, puis crée une tâche planifiée pour la persistence. L'IoA révèle l'intention (exécution de code à distance + persistence) même si le malware est inédit.

---

### 4.3.8 TTPs (Tactics, Techniques, and Procedures)

Description structurée du mode opératoire des adversaires, largement utilisée dans le framework **MITRE ATT&CK**.

**Tactics** -- Les objectifs de haut niveau de l'attaquant (le **pourquoi**). Exemples : Initial Access, Lateral Movement, Exfiltration.

**Techniques** -- Les méthodes spécifiques pour atteindre un objectif (le **comment**). Exemples MITRE ATT&CK : Phishing (T1566), Credential Dumping (T1003), Data Staged (T1074).

**Procedures** -- Les implémentations concrètes des techniques (les **outils et commandes réels**). Exemples : utiliser Mimikatz pour dumper les credentials depuis LSASS, envoyer des spear-phishing avec un document Word contenant une macro, utiliser des scripts PowerShell pour le mouvement latéral.

**Utilité** : threat modeling, red/purple teaming, construction de détections basées sur les techniques (pas sur les outils spécifiques), mapping des menaces réelles vers une taxonomie commune.

---
---

## OBJECTIF 4.4 -- Analyze Data and Artifacts for Incident Response

*Given a Scenario, Analyze Data and Artifacts in Support of Incident Response Activities*

### 4.4.1 Malware Analysis

Processus d'examen de logiciels malveillants pour comprendre leur comportement, leur objectif, leur origine et leur impact potentiel.

#### Detonation

Exécution intentionnelle de malware dans un environnement contrôlé pour observer son comportement en toute sécurité. Souvent automatisée dans les email security gateways et les outils de protection avancée. Révèle : manipulation de fichiers, exfiltration de données, communications C2.

**Outil** : **Cuckoo Sandbox** (open source), **Joe Sandbox** (commercial).

#### IoC Extraction

Identification et collecte de détails techniques à partir d'un fichier suspect : adresses IP, noms de domaine, file hashes, clés de registre, URLs, strings uniques.

**Exemple** : l'analyse d'un ransomware permet d'extraire les adresses Bitcoin wallet, les IPs et les domaines email, partagés ensuite pour aider d'autres organisations à détecter et prévenir les infections.

**Outil** : **VirusTotal** (analyse de fichiers, URLs et IPs contre de multiples moteurs antivirus). Attention : ne pas uploader de fichiers sensibles (les soumissions sont publiques par défaut).

#### Sandboxing

Environnement sécurisé et isolé pour exécuter et monitorer du code ou des fichiers non fiables sans risque pour le système hôte ou le réseau. Le terme **sandbox detonation** combine l'action de détonation et l'environnement isolé.

Les sandbox modernes utilisent des VMs ou des conteneurs. Windows inclut un **Windows Sandbox** intégré (aucun résidu de données après fermeture). Outils de monitoring dans la sandbox : **Sysinternals Process Explorer**.

#### Code Stylometry

Analyse du style de codage, de la structure et des caractéristiques uniques du malware pour identifier des relations entre échantillons ou attribuer le malware à des acteurs de menace spécifiques. Analogue à l'analyse linguistique de l'écriture humaine.

**Variant Matching** -- Déterminer si un nouvel échantillon est une variante ou une évolution d'une famille de malware connue en comparant les caractéristiques structurelles et fonctionnelles du code. Outil : **IDA Pro** (désassembleur avancé).

**Code Similarity** -- Mesure de la proximité entre deux échantillons de malware basée sur les similitudes de code. Outils : **BinDiff** (Google, comparaison binaire), **Ghidra** (toolkit de reverse engineering open source).

**Malware Attribution** -- Liaison d'un malware ou d'une cyberattaque à un groupe de menace, un adversaire ou un État-nation spécifique, basée sur les signatures de code uniques, la stylométrie, la réutilisation d'infrastructure ou les méthodes opérationnelles. Outils : **Intezer Analyze** (analyse génétique de malware), **Maltego** (outil visuel reliant les indicateurs techniques aux acteurs de menace).

---

### 4.4.2 Reverse Engineering

Désassemblage d'un logiciel, d'un code ou d'un malware pour comprendre son fonctionnement, ses capacités et son objectif.

**Disassembly** -- Conversion du code binaire compilé (machine code) en instructions assembleur lisibles par l'humain. Spécifique à l'architecture (x86, ARM). Outils : **IDA Pro**, **Ghidra**.

**Decompilation** -- Conversion du code binaire ou byte code en représentations de code source de plus haut niveau (C, C++, Java, Python). Plus facile à lire que l'assembleur. Outil : **Ghidra**.

**Binary** -- Fichier exécutable compilé directement par le CPU (`.exe` Windows, `.elf` Linux, `.dll` librairies dynamiques). Dépendant de l'architecture, difficile à analyser sans outils.

**Byte Code** -- Représentation intermédiaire entre le code source et le machine code, exécutée par des machines virtuelles ou interpréteurs (pas directement par le hardware). Typiquement platform-independent. Exemples : fichiers `.class` Java (JVM), fichiers `.pyc` Python.

---

### 4.4.3 Volatile / Non-Volatile Storage Analysis

**Volatile storage** : données temporaires en mémoire (RAM) -- processus en cours, connexions réseau actives, fichiers ouverts, contenu du clipboard, sessions utilisateur. Perdues à l'extinction ou au reboot. Analyse cruciale immédiatement après un incident.

**Non-volatile storage** : données persistantes sur disques durs, SSDs, USB. Techniques : disk imaging (copie bit-à-bit), file carving, analyse de logs et de structures de filesystem.

**Order of Volatility (RFC 3227)** -- Les preuves les plus susceptibles d'être détruites doivent être collectées en premier :

| Priorité | Type de données |
|----------|----------------|
| 1 | Registres CPU et cache |
| 2 | Table de routage, cache ARP, table des processus, statistiques kernel |
| 3 | Mémoire (RAM) |
| 4 | Filesystem temporaire |
| 5 | Disque |
| 6 | Données de logging et monitoring distant |
| 7 | Configuration physique et topologie réseau |
| 8 | Médias d'archivage |

Standard de référence : **IETF RFC 3227**.

---

### 4.4.4 Network Analysis

Examen du trafic réseau capturé (fichiers PCAP), logs de firewalls/routeurs, alertes IDS et données de flux réseau. Détecte les communications C2, les activités d'exfiltration, les tentatives de reconnaissance et le mouvement latéral.

**Exemple** : des requêtes DNS répétées vers des domaines suspects indiquent un comportement de beaconing malware vers un serveur C2.

---

### 4.4.5 Host Analysis

Examen approfondi des endpoints individuels (workstations, serveurs) impliqués dans un incident pour identifier les signes de compromission, l'accès non autorisé ou la persistence de l'attaquant.

**Éléments inspectés** : event logs locaux, entrées de registre, tâches planifiées, processus en cours, modules chargés, configurations système, historique navigateur, applications récemment exécutées.

**Exemple d'investigation** :
1. **Event log review** : tentatives de login échouées suivies d'une connexion RDP réussie depuis une IP interne inhabituelle
2. **Scheduled tasks** : nouvelle tâche `update_task1` exécutant un script PowerShell toutes les 30 minutes
3. **Running processes** : processus suspect (`msupdater.exe`) sans éditeur vérifié
4. **Registry entries** : mécanismes de persistence dans la clé Run
5. **Browser history** : accès à un site de partage de fichiers non autorisé
6. **Recently executed applications** : le dossier Prefetch indique l'exécution de `mimikatz.exe` (credential dumping)

Conclusion : l'attaquant a obtenu un accès via credentials volés, établi la persistence, et utilisé Mimikatz pour extraire des credentials. L'hôte est isolé, les credentials réinitialisés, l'incident escaladé.

---

### 4.4.6 Metadata Analysis

Examen des données embarquées dans les fichiers numériques fournissant un contexte au-delà du contenu visible.

**Email Header** -- Détails cachés : IP de l'expéditeur, horodatages, chemins de routage, informations serveur, résultats d'authentification. Révèle l'origine des tentatives de phishing et des emails spoofés. Outils : **MxToolbox**, **Google Messageheader**.

**Images** -- Données **EXIF** embarquées : date de création, paramètres caméra, coordonnées GPS, identifiants d'appareil. Permet de vérifier l'authenticité, de tracer l'origine d'une fuite. Outil : **ExifTool**.

**Audio/Video** -- Metadata embarquées : codec, paramètres d'encodage, horodatages, données GPS, logiciel d'édition. Détection de falsification et de tampering. Outils : **MediaInfo**, **ffprobe**.

**Files/Filesystem** -- Propriétés des fichiers et informations du filesystem : timestamps (created, modified, accessed), propriétaire, permissions, alternate data streams (ADS), entrées de journal, historiques de versions. Outils forensiques : **Autopsy / The Sleuth Kit** (suites forensiques complètes), **FTK Imager** (extraction de metadata et fichiers supprimés), **Windows Sysinternals Suite** (`streams` pour identifier les ADS dans NTFS).

---

### 4.4.7 Hardware Analysis

Examen des appareils physiques (serveurs, routeurs, smartphones, IoT, systèmes embedded) pour détecter les signes de compromission, les implants malveillants, les modifications non autorisées ou le tampering.

#### JTAG (Joint Test Action Group)

Protocole standard industriel (IEEE 1149.1) pour le debugging hardware, le test et la programmation de circuits intégrés. En cybersécurité, JTAG permet des examens forensiques profonds, la récupération de données depuis des appareils embedded, ou l'identification de code malveillant implanté dans le firmware ou les puces mémoire.

**Accès direct** aux composants internes des circuits intégrés via des connecteurs spécialisés. Permet de : dumper le firmware et le contenu mémoire, examiner ou modifier les états internes des processeurs, récupérer des données depuis des appareils endommagés ou inaccessibles, identifier des implants firmware ou des modifications malveillantes.

**Outils** : **JTAGulator** (identification d'interfaces OCD), **Bus Pirate** (analyse de microcontrôleurs et circuits industriels).

---

### 4.4.8 Data Recovery and Extraction

Récupération d'informations numériques critiques depuis des systèmes compromis ou endommagés.

**Activités clés** :
- **Disk imaging** : copies forensiques bit-à-bit
- **Volatile memory (RAM) analysis** : capture de données live, clés de chiffrement, processus en cours
- **Deleted file recovery / file carving** : reconstruction de fichiers supprimés
- **Encrypted data recovery** : si les clés ou mécanismes de récupération sont disponibles
- **Database / storage extraction** : extraction de données critiques pour le contexte de l'investigation

**Exemple** : après une attaque ransomware, les analystes forensiques récupèrent des données chiffrées depuis des systèmes de backup ou des shadow copies pour restaurer les services sans payer la rançon.

---

### 4.4.9 Threat Response

Actions immédiates et décisions tactiques une fois qu'une menace ou un breach est identifié.

**Phases** :
1. **Containment** : isolation des systèmes infectés, segmentation réseau, isolation d'endpoint
2. **Eradication** : suppression du malware, des points d'accès non autorisés et des backdoors
3. **Recovery** : patching des vulnérabilités, restauration des systèmes, validation de la posture de sécurité
4. **Communication** : coordination entre les équipes de réponse, les stakeholders, les équipes juridiques et relations publiques

---

### 4.4.10 Preparedness Exercises

Activités structurées de formation et de simulation pour tester et améliorer les capacités de réponse aux incidents avant qu'un incident réel ne survienne.

**Types** :
- **Tabletop exercises** : discussions scénarisées (walk-through) sans manipulation technique
- **Simulated incident drills** : simulations en temps réel (épidémie ransomware, campagne phishing)
- **Red / Blue / Purple teams** : tests offensifs et défensifs pratiques

**Bénéfices** : identification des gaps dans les processus de détection, containment et recovery, renforcement de la préparation de l'équipe, construction de réflexes (muscle memory), clarification des rôles de chaque stakeholder, amélioration de la cyber-résilience globale.

---

### 4.4.11 Timeline Reconstruction

Assemblage et organisation chronologique des données d'événements pour clarifier les actions de l'attaquant, les comportements et la progression de l'incident.

**Processus** :
1. **Log aggregation** : collecte depuis les firewalls, endpoints, SIEM, devices réseau
2. **Timestamp correlation** : corrélation des horodatages entre les sources
3. **Milestone identification** : accès initial, mouvement latéral, exfiltration
4. **Visual timeline** : création d'une chronologie graphique montrant chaque étape, les sources, les IPs, les horodatages et les systèmes impactés

**Exemple -- breach dans un hôpital** :
- 01:23 -- connexion entrante depuis une IP étrangère vers le portail patient
- 01:24 -- injection SQL réussie sur un endpoint vulnérable
- 01:25 -- déploiement d'un reverse shell
- 01:30 -- création d'un nouveau compte admin
- 01:35 -- mouvement latéral via RDP vers le serveur EMR (Electronic Medical Records)
- 01:40 -- exfiltration de 2 Go de données patient via un script PowerShell
- 01:45 -- alerte SIEM sur un volume de trafic sortant anormal

La timeline fournit un récit clair pour l'équipe IR, aide au containment, informe les équipes juridiques/law enforcement, et identifie les gaps de monitoring et de patching.

---

### 4.4.12 Root Cause Analysis (RCA)

Identification des causes profondes ayant conduit à un incident de sécurité, au-delà des symptômes immédiats.

**Processus** : identifier les vulnérabilités exploitées (logiciel non patché, mauvaise configuration), analyser les TTPs de l'attaquant, revoir les contrôles administratifs, techniques et physiques pour détecter les gaps, documenter les findings pour améliorer les politiques et processus, engager des actions de sensibilisation et de formation.

**Exemple** : après une fuite de données liée au phishing, la RCA révèle un filtrage email inadéquat et une formation utilisateur insuffisante comme causes profondes.

---

### 4.4.13 CWPP (Cloud Workload Protection Platform)

Solution de sécurité spécialisée pour la protection des workloads et applications dans les environnements cloud (AWS, Azure, GCP).

**Activités clés** :
- **Vulnerability management** et compliance scanning des ressources cloud
- **Runtime protection** : détection et prévention de menaces au niveau du workload
- **Configuration security and governance** : conformité aux best practices
- **Continuous monitoring and automated response** : détection rapide et mitigation

---

### 4.4.14 Insider Threat

Risque posé par des individus internes ou proches de l'organisation (employés, sous-traitants, partenaires).

**Deux types** : intentionnel (insiders malveillants) ou involontaire (insiders négligents).

**Mitigations** :
- Monitoring avec **UBA** (User Behavior Analytics)
- IAM et **least privilege** rigoureux
- Background checks et vetting continu
- Formation de sensibilisation aux insider threats avec mécanismes de signalement clairs
- Technologies **DLP** pour prévenir la perte de données non autorisée
- Outil : **Microsoft Purview Insider Risk Management** (monitoring via les signaux Microsoft 365 : email, Teams, SharePoint, OneDrive)

---
---

## MNEMONIQUES ET AIDE-MEMOIRE

**SIEM Pipeline** : Collect > Parse > Normalize > Correlate > Alert > Report

**Audit Log Reduction** (5 techniques) : Filtering, Aggregation, Deduplication, Normalization, Tagging/Enrichment

**4 types de baselines** : Network, System, User, Application/Service

**Alert Prioritization** (5 facteurs) : Criticality, Impact, Asset type, Residual risk, Data classification

**OPSEC -- 5 étapes** : Identify > Analyze Threats > Analyze Vulnerabilities > Assess Risks > Apply Countermeasures

**STIX vs TAXII** : STIX = le *quoi* (format des données de menace) / TAXII = le *comment* (protocole de transport)

**Rule-Based Languages** : Sigma (logs, YAML, SIEM-agnostic) / YARA (fichiers, patterns binaires) / RITA (trafic réseau, beaconing C2, Zeek logs) / Snort (paquets réseau, IDS/IPS temps réel)

**IoC vs IoA** : IoC = artefact statique post-événement (hash, domaine C2) / IoA = comportement en cours révélant l'intention (séquence d'actions suspecte)

**TTPs** : Tactics = pourquoi / Techniques = comment / Procedures = avec quoi (outils et commandes)

**Admiralty Code** : Source A-F (fiabilité) + Information 1-6 (crédibilité). A1 = le plus fort / F6 = le plus incertain

**Order of Volatility (RFC 3227)** : Registers/Cache > Routing/ARP/Process tables > RAM > Temp FS > Disk > Remote logs > Physical config > Archival

**Incident Response Phases** : Containment > Eradication > Recovery > Communication

**Fail Secure vs Fail Safe** : Secure = reste verrouillé (protège les données) / Safe = se déverrouille (protège les personnes)

**Malware Analysis Methods** : Detonation (exécution contrôlée) > IoC Extraction (collecte d'indicateurs) > Sandboxing (environnement isolé) > Code Stylometry (attribution par style de code)

**Reverse Engineering** : Disassembly (binaire -> assembleur) / Decompilation (binaire -> code source de haut niveau)

**CSRF vs XSS** : CSRF exploite la confiance du site envers le navigateur de l'utilisateur / XSS exploite la confiance de l'utilisateur envers le site

**SSRF vs Confused Deputy** : SSRF = le serveur envoie des requêtes pour l'attaquant / Confused Deputy = un composant privilégié agit pour un acteur non privilégié (SSRF est une forme de confused deputy)

**Sigma vs YARA** : Sigma = behavior-based (logs) / YARA = signature-based (fichiers)