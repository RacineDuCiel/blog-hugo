---
title: "CompTIA SecurityX — Domaine 1 : Governance, Risk & Compliance"
date: 2026-02-25
categories: ["Securite-Vie-Privee"]
tags: ["SecurityX", "CASP+", "CompTIA", "GRC", "Certification"]
description: "Fiche de révision SecurityX (ex CASP+) — Domaine 1 : gouvernance, gestion des risques, conformité, threat modeling et sécurité IA."
showOnHome: true
pageClass: "fiche-revision"
---

# DOMAIN 1 -- GOVERNANCE, RISK & COMPLIANCE

> Implémenter les composants de gouvernance appropriés, gérer les risques, comprendre l'impact de la conformité sur les stratégies de sécurité, effectuer le threat modeling et adresser les défis de sécurité liés à l'adoption de l'IA.

---

## OBJECTIF 1.1 -- Implement Appropriate Governance Components

*Given a Set of Organizational Security Requirements, Implement the Appropriate Governance Components*

### 1.1.1 Security Program Documentation

La documentation du programme de sécurité est le socle fondamental de la gouvernance. Elle fournit les directives, standards et procédures régissant les pratiques de sécurité. De nombreux programmes de conformité exigent des preuves documentées que les politiques clés sont activement implémentées.

**Policies (Politiques)** -- Documents formels et obligatoires qui définissent le **QUOI** : ce qui doit être fait. Elles fixent la direction stratégique et les exigences de sécurité de l'organisation. Exemple : "Le MFA est obligatoire pour accéder aux systèmes critiques."

**Procedures** -- Définissent le **COMMENT** : les étapes détaillées à suivre pour appliquer une politique. Elles sont opérationnelles et prescriptives. Exemple : procédure de réponse aux incidents -- isoler le système, contenir la menace, notifier les parties prenantes.

**Standards** -- Benchmarks et normes d'industrie adoptés par l'organisation comme exigences minimales. Ils sont obligatoires et mesurables. Exemples : ISO/IEC 27001, PCI DSS, NIST SP 800-53.

**Guidelines** -- Recommandations non obligatoires aidant à interpréter et appliquer les politiques. Elles offrent de la flexibilité tout en orientant les bonnes pratiques. Exemple : recommandations pour créer des mots de passe forts (longueur, complexité, rotation).

**Stockage** : les documents de politique sont conservés dans un **DMS (Document Management System)** centralisé et sécurisé (SharePoint, OpenText, Documentum). Le DMS assure le contrôle d'accès, le suivi des versions, et la conformité aux politiques de rétention.

---

### 1.1.2 Security Program Management

Le programme de sécurité décrit l'approche globale pour protéger les actifs, les données et les opérations. Il doit être aligné avec les objectifs business -- sans cet alignement, risque de perte de soutien du management, ralentissement des opérations, exposition aux risques et violations de conformité.

#### Awareness & Training

Les employés constituent la première ligne de défense. Domaines clés de formation :

**Social Engineering / Phishing** -- Simulations de phishing régulières suivies de debriefings. Apprendre à identifier : URLs non concordantes, requêtes inhabituelles, fautes de frappe, sentiment d'urgence artificiel.

**Privacy (Confidentialité)** -- Formation RGPD/CCPA, anonymisation des datasets, sécurisation des fichiers physiques, importance du consentement explicite avant collecte de données personnelles.

**Data Security** -- Tutoriels sur le chiffrement, protocoles de communication sécurisée, vérification SSL/TLS, usage des VPN, classification des données.

**OPSEC (Operational Security)** -- Protéger l'information sensible au quotidien : pas de discussions confidentielles en public, écrans de confidentialité (privacy screens), utilisation de canaux chiffrés, clean desk policy.

**Situational Awareness** -- Être attentif à son environnement physique et numérique : poste non verrouillé, badge sans surveillance, tailgating (suivre quelqu'un à travers une porte sécurisée). Récompenser la vigilance des employés qui signalent des comportements suspects.

#### Communication

Plan de communication structuré et adapté aux audiences :

- **Dirigeants** : rapports de risque haut niveau, posture de sécurité globale, ROI des investissements sécurité
- **Équipes IT** : threat intelligence technique, bulletins de vulnérabilité, procédures de réponse
- **Employés** : sensibilisation sécurité, bonnes pratiques, alertes phishing

**Fréquences recommandées** : mises à jour hebdomadaires sur les menaces, formations mensuelles, briefings trimestriels pour les dirigeants, exercices annuels de réponse aux incidents.

#### Reporting

| Entité | Responsabilité |
|--------|---------------|
| **CISO / Leadership** | Rapports stratégiques pour les dirigeants et le conseil : posture de risque, conformité, incidents majeurs |
| **SOC Team** | Threat intelligence temps réel, rapports de réponse aux incidents, alertes SIEM |
| **Risk & Compliance** | Conformité réglementaire (GDPR, HIPAA, ISO 27001), évaluations de risques, résultats d'audit |
| **IT / Infrastructure** | Gestion des patchs, vulnérabilités systèmes, état de la sécurité réseau |
| **GRC Platforms** | Rapports automatisés sur les métriques de sécurité, application des politiques, tendances de risque |

#### Management Commitment

La direction senior doit être pleinement engagée : allocation de budget pour les initiatives de sécurité, participation aux programmes de sensibilisation, approbation formelle des politiques. Le conseil d'administration est responsable de la conformité réglementaire. La non-conformité peut entraîner des pénalités financières (RGPD : jusqu'à 4% du CA mondial), des poursuites pénales et une atteinte à la réputation.

#### Matrice RACI

Outil d'attribution des responsabilités pour chaque tâche ou processus :

- **R (Responsible)** : exécute la tâche
- **A (Accountable)** : responsable ultime du résultat (un seul par tâche)
- **C (Consulted)** : fournit avis et expertise (communication bidirectionnelle)
- **I (Informed)** : tenu informé du progrès (communication unidirectionnelle)

**Création** : 1) Identifier les tâches/processus -> 2) Identifier les rôles -> 3) Assigner RACI -> 4) Revoir et valider (un seul Accountable par tâche, pas de surcharge de rôles).

---

### 1.1.3 Governance Frameworks

#### COBIT (Control Objectives for Information and Related Technologies)

Créé par **ISACA**. Framework globalement reconnu pour la gouvernance et la gestion IT. Version actuelle : **COBIT 2019**. Aligne l'IT avec les objectifs business. Contient 40 objectifs de contrôle répartis en 5 domaines.

| Domaine | Nom complet | Focus |
|---------|-------------|-------|
| **EDM** | Evaluate, Direct, Monitor | Gouvernance : évaluer les risques, diriger les initiatives IT, surveiller conformité et performance |
| **APO** | Align, Plan, Organize | Planification : budget IT, allocation ressources, gestion risques, fournisseurs, qualité, sécurité |
| **BAI** | Build, Acquire, Implement | Développement : développement systèmes, gestion du changement, pratiques d'implémentation |
| **DSS** | Deliver, Service, Support | Opérations : livraison services IT, gestion incidents, sécurité, continuité |
| **MEA** | Monitor, Evaluate, Assess | Surveillance : monitoring de performance, audits internes, vérifications de conformité |

**Modèle de maturité COBIT** -- Échelle à 6 niveaux (0-5) pour évaluer la capacité des processus IT : 0 = Incomplete, 1 = Initial/Ad hoc, 2 = Repeatable but informal, 3 = Defined process, 4 = Managed and measurable, 5 = Optimized.

**Exemple APO12 (Manage Risk)** : APO12.01 Collect data -> APO12.02 Analyze risk -> APO12.03 Maintain risk profile -> APO12.04 Define risk management action portfolio -> APO12.05 Respond to risk -> APO12.06 Articulate risk. Utilise matrice RACI + KPIs pour mesurer les résultats.

#### ITIL (Information Technology Infrastructure Library)

Contrairement à COBIT (gouvernance IT stratégique), ITIL est focalisé sur l'optimisation de la livraison des services IT au quotidien. Gère le cycle de vie complet des services IT.

| Étape | Description |
|-------|-------------|
| **Service Strategy** | Définir la stratégie : quels services sont nécessaires, alignement avec objectifs long terme |
| **Service Design** | Concevoir/modifier les services : architecture, processus, politiques, documentation |
| **Service Transition** | Construire, tester, déployer les services en environnement live |
| **Service Operation** | Gestion quotidienne : qualité de service, réponse aux incidents, stabilité opérationnelle |
| **CSI (Continual Service Improvement)** | Évaluation et amélioration continues : analyser performance, identifier améliorations, implémenter changements |

**ITIL Incident Management** : les incidents sont loggés dans un outil ITSM, catégorisés (réseau, logiciel, hardware), priorisés (impact + urgence). L'équipe suit les SOPs et workflows prédéfinis. Protocoles d'escalade pour incidents critiques. Post-incident review pour root cause analysis.

**COBIT vs ITIL** : COBIT = approche holistique gouvernance/stratégie IT alignée avec le business. ITIL = optimisation opérationnelle des services IT au jour le jour. Les deux sont complémentaires.

---

### 1.1.4 Change / Configuration Management

Les changements IT doivent être planifiés, testés, approuvés et documentés pour minimiser les vulnérabilités et les erreurs de configuration. Même les ajustements mineurs peuvent avoir des impacts significatifs sur la sécurité du réseau.

#### Processus de gestion du changement (8 étapes)

1. **RFC (Request For Change)** -- Identification et documentation formelle du besoin de changement
2. **Change Evaluation** -- Analyse d'impact potentiel sur la sécurité, les performances et les opérations
3. **Change Approval** -- Revue et approbation par le **CAB (Change Advisory Board)** ou le management
4. **Change Planning** -- Planification détaillée : horaire, tâches assignées, communication avec parties prenantes, plan de rollback
5. **Change Testing** -- Test en environnement contrôlé (staging/test) avant mise en production
6. **Change Implementation** -- Mise en oeuvre selon le plan, surveillance étroite pendant et après le déploiement
7. **Change Review** -- Revue post-implémentation, documentation des leçons apprises
8. **Change Closure** -- Clôture formelle, mise à jour du CMDB

#### Asset Management Life Cycle (5 phases)

1. **Approval & Acquisition** -- Procurement suivant les politiques organisationnelles ; considérer fournisseurs, conformité, accords de licence
2. **Deployment** -- Installation, configuration, documentation dans le système de gestion d'actifs (numéro de série, configs, propriétaire, localisation)
3. **Monitoring & Tracking** -- Surveillance continue : performance, usage, statut sécurité. Outils automatisés de monitoring
4. **Upgrade or Replacement** -- Évaluations périodiques : performance, coût, conformité, sécurité. Décision de mise à jour ou remplacement
5. **Disposal & Decommissioning** -- Data wiping, sanitization, destruction sécurisée conforme aux politiques. Mise à jour du registre d'actifs

#### CMDB (Configuration Management Database)

Base de données centralisée qui suit tous les actifs IT et leurs configurations. Chaque **CI (Configuration Item)** contient : ID unique, nom, type, propriétaire, statut, adresse IP, date d'installation, dernière mise à jour, dépendances inter-systèmes.

**Utilité en incident response** : si un serveur est compromis, le CMDB identifie immédiatement tous les systèmes dépendants, permettant une évaluation rapide de l'impact et un containment ciblé.

#### Inventory

Maintenir un inventaire à jour de tous les actifs logiciels et matériels. Empêche les appareils non autorisés de se connecter au réseau. Assure que tous les systèmes sont correctement licenciés et patchés. Outil d'automatisation : **Lansweeper** pour scans automatisés des actifs réseau.

---

### 1.1.5 GRC Tools

Outils de gestion unifiée de la Gouvernance, du Risque et de la Conformité. Exemples : **SAP GRC**, **IBM OpenPages**, **RSA Archer**. Les CSPs (Azure, AWS) fournissent aussi des dashboards de reporting intégrés.

| Fonction GRC | Description |
|-------------|-------------|
| **Mapping** | Audit des objectifs de contrôle vs contrôles déployés. Mapping des exigences réglementaires vers les contrôles spécifiques (ex : exigences GDPR -> contrôles de protection des données) |
| **Automation** | Automatisation des vérifications de conformité (ex : scans de vulnérabilités réguliers via Tenable Nessus) |
| **Compliance Tracking** | Suivi de la conformité aux standards (ex : PCI DSS). Vérification que tous les contrôles sont en place et fonctionnels |
| **Documentation** | Documentation de toutes les activités GRC -- essentiel pour les audits et revues réglementaires |
| **Continuous Monitoring** | Surveillance continue du trafic réseau et des logs système. Détection et réponse en temps réel |

---

### 1.1.6 Data Governance in Staging Environments

| Environnement | Mesures de sécurité clés |
|---------------|-------------------------|
| **Production** | RBAC (principe du moindre privilège), chiffrement at rest + in transit, surveillance et audit continus, accès just-in-time si nécessaire |
| **Development** | Remplacer les vraies données par des données anonymisées/obfusquées/fictives (dummy data). Limiter l'accès aux développeurs qui en ont besoin |
| **Testing** | Appliquer des contrôles similaires à la production. **Data masking** : substituer les données sensibles par des données fictives mais réalistes |
| **QA** | Tests de sécurité (pentest, vulnerability assessment) avant déploiement. Datasets contrôlés (masqués, anonymisés, synthétiques) |

Le principe directeur : les données sensibles de production ne doivent jamais être exposées dans les environnements inférieurs sans protection adéquate (masking, anonymisation, données synthétiques).

#### Data Life Cycle Management (6 phases)

| Phase | Gouvernance clé |
|-------|----------------|
| **Create** | Définir ownership, classification, règles de validation. Tagging des métadonnées, tracking de la lignée des données |
| **Store** | Chiffrement, contrôles d'accès, politiques de redondance et backup. La classification détermine le tiering de stockage |
| **Use** | Définir qui accède, sous quelles conditions, pour quel but. Pistes d'audit et monitoring des accès |
| **Share** | Mécanismes de partage sécurisés (APIs, chiffrement, modèles fédérés). Conformité GDPR/HIPAA/PCI DSS. Masquage et anonymisation si nécessaire |
| **Archive** | Conformité stockage long terme, politiques de rétention, intégrité (validation checksum, standardisation format). Récupérable sous conditions définies |
| **Destroy** | Destruction sécurisée : cryptographic wiping, degaussing, shredding physique. Logs de destruction et pistes d'audit pour prouver la conformité |

---
---

## OBJECTIF 1.2 -- Perform Risk Management Activities

*Given a Set of Organizational Security Requirements, Perform Risk Management Activities*

### 1.2.1 Impact Analysis (BIA -- Business Impact Analysis)

Évaluation des conséquences potentielles d'un incident cyber sur les actifs, opérations et réputation de l'organisation. L'objectif : s'assurer que les mitigations appropriées sont en place. Un risque n'est significatif que par l'impact qu'il crée.

**Étapes clés** :

1. **Identify Critical Assets** -- Quels systèmes, données et processus sont vitaux ? Quel impact si perdus ou compromis ?
2. **Assess Vulnerabilities** -- Identifier les faiblesses exploitables dans l'infrastructure
3. **Determine Potential Consequences** -- Analyser l'impact sur la CIA (Confidentiality, Integrity, Availability) : financier, opérationnel, réputationnel, légal

#### Extreme But Plausible Scenarios

Scénarios hautement improbables mais possibles et très disruptifs. Utilisés pour tester la résilience des défenses, la réponse aux incidents et les plans de continuité :

- **Zero-day exploits** -- Vulnérabilité inconnue dans une mise à jour logicielle, exploitée avant qu'un patch ne soit disponible
- **Ransomware attacks** -- Chiffrement de données critiques, impact sur toute la supply chain
- **Nation-state cyber-attacks** -- Attaques coordonnées contre les infrastructures critiques nationales, avec des ressources et une sophistication très élevées

---

### 1.2.2 Risk Assessment & Management

| Aspect | Quantitatif | Qualitatif |
|--------|-------------|------------|
| **Focus** | Valeurs numériques, monétaires | Perceptions, scénarios, descriptions |
| **Data** | Données statistiques, coûts financiers, probabilités | Jugements subjectifs, opinions d'experts, matrices de risque |
| **Résultat** | Impact quantifiable clair et probabilité | Liste classée de risques par sévérité et probabilité |
| **Exemples** | ALE, ROI, SLE, ARO | SWOT, risk matrices, heat maps |

#### Quantitative Risk Analysis -- Formules clés

| Métrique | Définition | Formule / Exemple |
|----------|-----------|-------------------|
| **AV** (Asset Value) | Valeur monétaire d'un actif | Base de données clients = $50.5M (coût dev + valeur info) |
| **EF** (Exposure Factor) | % de la valeur de l'actif perdu si la menace se réalise | Inondation détruit 50% du data center -> EF = 0.5 |
| **SLE** (Single Loss Expectancy) | Perte pour UN incident | `SLE = AV x EF` -> $100,000 x 0.3 = $30,000 |
| **ARO** (Annualized Rate of Occurrence) | Nombre estimé d'occurrences par an | Malware infecte le réseau 2 fois/an -> ARO = 2 |
| **ALE** (Annualized Loss Expectancy) | Impact financier projeté par an | `ALE = SLE x ARO` -> $30,000 x 2 = $60,000/an |

**Exemple d'examen** : Organisation financière : AV = $10M, EF = 10%, 4 breaches en 2 ans. SLE = $10M x 0.1 = $1M (perte par breach). ARO = 4/2 = 2 (2 breaches/an). ALE = $1M x 2 = **$2M/an** (coût annuel estimé des breaches).

#### Qualitative Risk Analysis

Utilise la **likelihood (probabilité)** et l'**impact**. Méthode subjective (deux évaluateurs peuvent ne pas être d'accord). Résultats affichés via risk matrices et heat maps. Plus rapide et plus facile que le quantitatif, mais peut introduire des biais cognitifs.

#### Risk Assessment Frameworks

| Framework | Description | Application |
|-----------|-------------|-------------|
| **NIST RMF** | Intègre le risk management dans le cycle de développement. 7 étapes : Prepare -> Categorize -> Select -> Implement -> Assess -> Authorize -> Monitor | Gouvernement US, défense, toute organisation |
| **ISO 27001** | Standard international pour l'ISMS et la gestion des risques | Tous secteurs, conformité internationale |
| **OCTAVE** | Évaluation des risques organisationnels et identification des menaces IT, approche centrée sur les assets | Organisations de toutes tailles, PME |
| **COBIT** | Aligne la gestion des risques IT avec les objectifs business | Grandes entreprises, rôle IT critique |

#### Risk Appetite vs Risk Tolerance

**Risk Appetite** = niveau de risque qu'une organisation est prête à accepter globalement pour atteindre ses objectifs. C'est une décision stratégique de haut niveau définie par le conseil d'administration.

**Risk Tolerance** = degré de variabilité acceptable pour des risques individuels spécifiques. C'est la marge opérationnelle autour du risk appetite.

Exemple : une start-up technologique aura un risk appetite élevé (innovation, time-to-market). Une institution financière réglementée aura un risk appetite faible (stabilité, conformité, protection des dépôts).

#### Risk Prioritization & Severity Impact

| Niveau | Impact |
|--------|--------|
| **Low** | Impact minimal, récupération facile (glitch système mineur) |
| **Medium** | Impact modéré, perturbation mais gérable (perte temporaire d'un système non-critique) |
| **High** | Impact significatif, perturbation substantielle, action rapide requise (panne majeure des applications critiques) |
| **Critical** | Impact sévère, potentiellement catastrophique, attention immédiate (breach exposant des données clients sensibles) |

#### Remediation & Validation

**Remediation** = actions correctives pour traiter les risques identifiés : patching, chiffrement, reconfiguration, formation des employés, renforcement des contrôles d'accès.

**Validation** = vérifier l'efficacité des remédiations déployées : penetration testing, security audits, code reviews, vulnerability scanning, tests de régression.

---

### 1.2.3 Third-Party Risk Management

#### Supply Chain Risk

Risques provenant des logiciels, matériels et services tiers : backdoors, composants contrefaits, firmware compromis. Nécessite une visibilité complète sur la supply chain, des audits et évaluations réguliers des fournisseurs, et des exigences cyber contractuelles.

**Cas réel -- SolarWinds (2020)** : code malveillant inséré dans la mise à jour d'Orion software. L'attaque supply chain a affecté de nombreuses agences gouvernementales US et entreprises privées, restant indétectée pendant des mois.

#### Vendor Risk

Risques des fournisseurs cloud (IaaS/SaaS). Processus de gestion :

1. **Due Diligence** -- Évaluer la posture sécurité, les pratiques de protection des données, l'historique de breaches, les certifications
2. **Due Diligence Checklist** -- Vérifier : certifications (SOC 2, ISO 27001), plan de réponse aux incidents, architecture sécurité réseau, politiques de chiffrement
3. **Continuous Monitoring** -- Questionnaire sécurité annuel, suivi des changements de politiques, monitoring des ratings de sécurité (SecurityScorecard, RiskRecon)
4. **Classification** -- Classifier les fournisseurs par niveau de risque : fournisseurs critiques = exigences plus strictes + audits plus fréquents

**Cas réel -- Accellion FTA (2020-2021)** : vulnérabilité zero-day dans un produit legacy de 20 ans. Plus de 100 organisations affectées. Settlement de $8.1M.

#### Subprocessor Risk

Les fournisseurs ont leurs propres sous-traitants (subprocessors). Risque si ces entités ne respectent pas les mêmes standards de sécurité. Sous GDPR, les organisations sont responsables de la protection des données personnelles indépendamment de qui les traite réellement.

**Mitigations** : exiger des fournisseurs qu'ils divulguent leurs subprocessors, imposer des **DPAs (Data Processing Agreements)** obligatoires couvrant toute la chaîne, auditer les sous-traitants critiques.

**Cas réel -- Blackbaud (2020)** : ransomware sur ce cloud provider pour universités/non-profits. Notification retardée aux clients, violation de l'Article 33 GDPR (obligation de notification sous 72h).

---

### 1.2.4 Availability Risk Considerations

#### BC/DR (Business Continuity / Disaster Recovery)

**Business Continuity** = stratégies pour que les fonctions essentielles continuent pendant et après un désastre. Focus : minimiser le downtime et les pertes financières. Couvre l'ensemble de l'organisation (personnes, processus, technologie).

**Disaster Recovery** = récupération spécifique des systèmes IT, applications et données après un désastre. Focus : minimiser la perte de données et le temps de restauration. Sous-ensemble du BC.

**Métriques clés** :

**RPO (Recovery Point Objective)** = durée maximale de perte de données tolérable. Exemple : RPO de 4h = on peut perdre jusqu'à 4h de données. RPO regarde en ARRIERE (combien de données perdues depuis le dernier backup).

**RTO (Recovery Time Objective)** = durée maximale pour restaurer le système. Exemple : RTO de 2h = le système doit être opérationnel en 2h maximum. RTO regarde en AVANT (combien de temps pour revenir en ligne).

#### BC/DR Testing -- 3 niveaux

| Type de test | Description | Niveau de risque |
|-------------|-------------|-----------------|
| **Tabletop Exercise** | Discussion en salle. L'équipe parcourt un scénario simulé et discute des rôles, actions, communication. Identifie les lacunes dans un environnement sans stress. | Faible |
| **Simulation** | Environnement contrôlé mimant des conditions réelles (pannes systèmes, défis de communication). Toutes les équipes participent. Données live possibles avec précautions. | Moyen |
| **Full-Scale Operational Test** | Validation live end-to-end : arrêt réel du data center primaire, failover vers le site secondaire, restauration des données, relocalisation du personnel. Vérifie RTO/RPO en conditions réelles. | Élevé |

#### Data Backups -- Connected vs Disconnected

| Type | Avantages | Inconvénients |
|------|-----------|---------------|
| **Connected Backups** | Temps réel ou quasi, RPO proche de zéro, automatisé, perte de données minimale | Vulnérable aux mêmes menaces que le système primaire (ransomware peut chiffrer les backups). Corruption peut être répliquée |
| **Disconnected Backups** | Isolé du réseau (air-gapped), immunisé contre ransomware et pannes système. Backup propre et non corrompu toujours disponible | RPO plus long (backups non continus). Processus manuels, plus lent et plus sujet aux erreurs |

**Best practices** : approche hybride (connected pour le quotidien, disconnected pour les données critiques). Tester régulièrement les deux types de restauration. Chiffrer tous les backups. Redondance géographique (copies dans différents lieux physiques).

---

### 1.2.5 Confidentiality Risk Considerations

**Data Leak Response** : Detection (systèmes DLP) -> Containment (révoquer accès, isoler les systèmes) -> Notification (légale si requise) -> Investigation (cause racine, intentionnel ou accidentel) -> Remediation (améliorer contrôles, renforcer formation).

**Sensitive/Privileged Data Breach** : protéger avec des contrôles d'accès (MFA + RBAC), data masking, chiffrement, monitoring et logging continus.

**Incident Response Testing** : exercices structurés (tabletop, walkthroughs, drills live) pour valider la préparation. Souvent mandaté par les régulateurs (HIPAA, PCI DSS).

**Reporting** : notification interne (prompte, aux équipes appropriées) + notification externe (autorités réglementaires, clients affectés). GDPR : notification sous 72h maximum après découverte de la breach.

#### Encryption

Transforme les données en format codé, accessible uniquement avec la clé de déchiffrement.

**Data at rest** : BitLocker (AES-256, Windows), FileVault (macOS), EFS (Encrypting File System, Windows). **Data in transit** : SSL/TLS, IPsec VPN. Conformité : HIPAA et GDPR exigent le chiffrement des données sensibles. Gestion des clés : stockage sécurisé (HSM), rotation régulière, accès limité au personnel autorisé.

---

### 1.2.6 Integrity Risk Considerations

**Remote Journaling** -- Copie continue des logs de transactions vers un site distant. Assure l'intégrité et la disponibilité des enregistrements même après un incident majeur. Particulièrement utilisé dans le secteur financier pour maintenir les enregistrements de transactions critiques.

**Hashing** -- Technique cryptographique convertissant les données en chaîne de longueur fixe (hash value/digest). Tout changement, même mineur, produit un hash complètement différent. Algorithmes recommandés : **SHA-256**, **SHA-3** (MD5 est legacy et vulnérable aux collisions). Commandes : `Get-FileHash` (Windows PowerShell), `sha256sum` (Linux).

**Interference** -- Altération non autorisée des données pendant la transmission (ex : attaque Man-in-the-Middle). Protection : combinaison de chiffrement + hashing + signatures digitales pour garantir l'intégrité de bout en bout.

**Antitampering** -- Protection contre les modifications non autorisées à plusieurs niveaux. Hardware : sceaux physiques, packaging tamper-evident, détecteurs d'ouverture. Software : integrity checks, digital signatures, **secure boot** (seul le code vérifié cryptographiquement est exécuté au démarrage). Essentiel pour maintenir la confiance dans les systèmes et les données.

---

### 1.2.7 Privacy Risk Considerations

#### Data Subject Rights

| Droit | Description |
|-------|-------------|
| **Right to Access** | Droit de savoir quelles données personnelles sont détenues et comment elles sont traitées. Demander une copie complète |
| **Right to Rectification** | Droit de faire corriger ou mettre à jour des données incorrectes ou incomplètes |
| **Right to Erasure (Right to be Forgotten)** | Droit de demander la suppression de ses données quand elles ne sont plus nécessaires ou si le consentement est retiré |
| **Right to Data Portability** | Recevoir ses données dans un format structuré et lisible par machine. Transférer sans obstacle à un autre fournisseur |
| **Right to Object** | S'opposer au traitement pour le marketing direct ou la prise de décision automatisée/profilage |

GDPR : réponse obligatoire sous **1 mois** à une demande d'accès.

#### Data Sovereignty

Les données personnelles sont soumises aux lois du pays où elles sont collectées, stockées ou traitées. Les organisations multinationales doivent se conformer aux lois de chaque juridiction.

**Mécanismes de transfert transfrontalier** : **SCCs (Standard Contractual Clauses)**, **BCRs (Binding Corporate Rules)**, décisions d'adéquation de la Commission européenne. GDPR : les données de citoyens UE doivent être stockées dans l'EEA ou dans un pays disposant d'un niveau de protection adéquat.

#### Biometrics

Empreintes digitales, reconnaissance faciale, scan d'iris, reconnaissance vocale. Données hautement sensibles car elles ne peuvent pas être changées si compromises (contrairement à un mot de passe).

**Exigences** : stockage sécurisé et chiffré, consentement explicite avant collecte, minimisation de la collecte (ne collecter que ce qui est strictement nécessaire).

**Réglementations spécifiques** : GDPR (catégorie spéciale de données) + **BIPA (Illinois Biometric Information Privacy Act)** : consentement écrit obligatoire, politique publique de rétention et de destruction.

---

### 1.2.8 Crisis Management

Processus et stratégies pour préparer, répondre et se remettre d'incidents cyber significatifs dépassant le scope des opérations quotidiennes.

**Composants clés** :

- **Preparation** -- Plan de gestion de crise documenté (politiques, procédures, arbre de communication). Testé et mis à jour régulièrement
- **Incident Response Team (IRT)** -- Équipe dédiée multi-départementale : IT, juridique, communications, direction, RH
- **Communication Plan** -- Protocole de partage d'information en interne (employés) et en externe (clients, parties prenantes, public, régulateurs). Porte-paroles désignés, messages pré-approuvés

---

### 1.2.9 Breach Response (6 étapes)

| Étape | Actions |
|-------|---------|
| **1. Detection & Identification** | Surveiller les activités inhabituelles via IDS/SIEM/EDR. Former le personnel à reconnaître les signes de compromission |
| **2. Containment** | Isoler et contrôler : déconnecter les systèmes affectés, fermer les services compromis, déployer firewalls/ACLs d'urgence |
| **3. Eradication** | Supprimer la menace : supprimer fichiers malveillants, patcher les vulnérabilités, améliorer les contrôles défaillants |
| **4. Recovery** | Restaurer les systèmes depuis backups vérifiés, tests de sécurité post-restauration, surveillance résiduelle renforcée |
| **5. Notification** | Notifier les individus affectés, clients, régulateurs selon les exigences légales. Transparent et en temps voulu |
| **6. Post-Breach Analysis** | Analyse détaillée : comment l'attaque s'est produite, quelles vulnérabilités exploitées, comment prévenir à l'avenir. Mise à jour des politiques et plans |

**Cas réel -- Yahoo (2013-2014)** : 3 milliards de comptes affectés. Détection seulement en 2016 (3 ans après). Communication limitée et vague. Pas de plan de réponse clair. Résultat : amende SEC de $35M pour non-divulgation aux investisseurs. Leçon : la réponse rapide et transparente est essentielle.

---
---

## OBJECTIF 1.3 -- How Compliance Affects InfoSec Strategies

*Explain How Compliance Affects Information Security Strategies*

### 1.3.1 Industry-Specific Compliance

| Industrie | Réglementations | Focus sécurité |
|-----------|----------------|---------------|
| **Healthcare** | **HIPAA** (protection ePHI), **HITECH** (étend HIPAA, adoption dossiers électroniques) | Safeguards techniques (chiffrement, access controls, audit controls), risk assessments réguliers, plan incident response |
| **Financial** | **GLBA** (protection données clients), **SOX** (contrôles internes reporting financier), **PCI DSS** (sécurité cartes de crédit) | Accès restreint aux données sensibles, chiffrement at rest + in transit, audits réguliers |
| **Government** | **FISMA** (programmes sécurité info fédéraux), **NIST SP 800-53** (catalogue contrôles), **CMMC** (DoD, protection CUI) | Contrôles de sécurité adaptés au risk assessment, monitoring continu, formation régulière |
| **Utilities** | **NERC CIP** (infrastructure électrique), **NIST CSF** (recommandé) | Catégorisation actifs (High/Medium/Low), segmentation réseau, IAM, accès distant sécurisé, gestion fournisseurs. Amendes jusqu'à **$1M/jour/violation** |

**Contrôles NERC CIP** : segmentation réseau et protection périmétrique, IAM rigoureuse, accès distant sécurisé avec monitoring, gestion des risques tiers/fournisseurs, hardening système et continuité opérationnelle.

---

### 1.3.2 Industry Standards

#### PCI DSS (Payment Card Industry Data Security Standard)

Standards de sécurité pour toutes les entreprises qui traitent des cartes de crédit. Créé par le PCI Security Standards Council (Visa, Mastercard, Amex, Discover, JCB).

**Best practices** : firewalls, chiffrement des données cardholder at rest + in transit, accès limité sur le principe du besoin d'en connaître, IDs uniques pour chaque utilisateur, monitoring et logging de tous les accès aux ressources réseau et aux données cardholder, tests de sécurité réguliers, programme de gestion des vulnérabilités, politique de sécurité formelle.

**Non-conformité** : amendes de $5,000 à $100,000/mois, frais de transaction majorés, révocation de la capacité à traiter les paiements.

#### ISO/IEC 27000 Series

**ISO 27001** = standard international pour créer, déployer, gérer et améliorer un **ISMS (Information Security Management System)**. Plus de 200 objectifs de contrôle organisés en annexes. Certification par organisme indépendant accrédité, valide 3 ans avec audits de surveillance annuels.

**ISO 27002** = guide de mise en oeuvre des contrôles d'ISO 27001. ISO 27001 définit le QUOI (exigences). ISO 27002 définit le COMMENT (implémentation pratique).

**Parcours de certification** : Gap analysis -> Risk assessments -> Développement des politiques/procédures -> Audit interne -> Certification externe.

#### DMA (Digital Markets Act -- EU)

Cible les grandes entreprises digitales désignées comme **"gatekeepers"** : Alphabet, Amazon, Apple, ByteDance, Meta, Microsoft, Booking.com.

**Exigences** : transparence sur les algorithmes de classement, interdiction des pratiques discriminatoires, portabilité des données utilisateurs, interdiction du bundling restrictif, consentement explicite pour le tracking publicitaire.

**Amendes** : jusqu'à 10% du CA mondial, pénalités récurrentes de 5% du CA quotidien en cas de non-conformité persistante.

---

### 1.3.3 Security & Reporting Frameworks

#### Benchmarks

Standards de référence pour mesurer et comparer la performance sécurité.

**DISA STIGs (Security Technical Implementation Guides)** -- Baselines de sécurité pour le gouvernement US et le DoD. Configurations de hardening spécifiques par technologie (OS, applications, réseaux).

**CIS Benchmarks (Center for Internet Security)** -- Guidelines consensus-driven et vendor-neutral. Deux niveaux : **Level 1** (foundational, faible impact sur l'usabilité, applicable à la plupart des organisations) et **Level 2** (rigoureux, environnements haute sécurité, peut impacter l'usabilité). Couvrent : Windows, Linux, macOS, AWS, Azure, GCP, M365, Docker, Kubernetes. Outils d'évaluation : **CIS-CAT Pro**, Ansible, Chef. Format XCCDF pour compatibilité avec les scanners SCAP.

#### SOC 2 (Service Organization Control Type 2)

Créé par l'**AICPA (American Institute of CPAs)**. Évalue les contrôles d'une organisation sur 5 critères (Trust Services Criteria). Particulièrement pertinent pour les fournisseurs de services stockant des données clients dans le cloud.

| Critère | Objectif | Contrôles clés |
|---------|----------|---------------|
| **Security** | Protéger contre accès non autorisé et menaces | Access controls, firewalls, IDS, network monitoring, incident response |
| **Availability** | Systèmes accessibles et fonctionnels comme convenu | DR plans, failover, backup, réplication, performance monitoring |
| **Processing Integrity** | Traitement complet, correct, légitime et dans les temps | Data validation, error handling, reconciliation, monitoring |
| **Confidentiality** | Protéger les informations confidentielles | Chiffrement, data masking, transmission sécurisée, classification |
| **Privacy** | Données personnelles gérées conformément aux politiques | Privacy policies, consent management, data subject rights, incident response |

**Non-conformité** : perte de confiance des clients, perte de contrats commerciaux, exposition à des poursuites. Un rapport SOC 2 favorable est souvent un prérequis pour les partenariats B2B.

#### NIST CSF (Cybersecurity Framework)

Framework volontaire (non réglementaire) largement adopté pour la gestion des risques de cybersécurité, particulièrement pour les infrastructures critiques.

**5 fonctions fondamentales** :

| Fonction | Description |
|----------|-------------|
| **Identify (ID)** | Comprendre l'environnement : inventaire des actifs, risk assessment, gouvernance, stratégie de gestion des risques |
| **Protect (PR)** | Mettre en place les safeguards : access control, awareness training, data security, maintenance, technologies de protection |
| **Detect (DE)** | Identifier les événements de sécurité : monitoring continu, processus de détection, anomalies et événements |
| **Respond (RS)** | Agir face aux incidents : planification de la réponse, communications, analyse, mitigation, améliorations |
| **Recover (RC)** | Restaurer les capacités : planification de la récupération, améliorations, communications post-incident |

#### CSA STAR (Cloud Security Alliance)

Standards et best practices pour la sécurité cloud. Le programme **STAR (Security, Trust, Assurance and Risk)** permet aux fournisseurs cloud de démontrer leur adhérence aux bonnes pratiques.

La **CCM (Cloud Controls Matrix)** couvre 16 domaines : Application & Interface Security, Audit & Compliance, Business Continuity, Change Control, Data Security, Datacenter Security, Encryption & Key Management, GRC, HR Security, IAM, Infrastructure & Virtualization, Interoperability & Portability, Mobile Security, Incident Management, Supply Chain Management, Threat & Vulnerability Management.

---

### 1.3.4 Audits vs Assessments vs Certifications

| Type | But | Scope |
|------|-----|-------|
| **Audit** | Vérifier la conformité avec standards/réglementations. Identifier les gaps et non-conformités | Revue formelle et systématique des politiques, pratiques et contrôles. Généralement externe pour objectivité |
| **Assessment** | Identifier les vulnérabilités, risques et gaps. Guider les améliorations futures | Évaluation plus exploratoire, ciblée ou large. Souvent utilisée pour préparer les audits |
| **Certification** | Reconnaissance formelle du respect de standards spécifiques. Construire la confiance | Évaluation rigoureuse contre des critères prédéfinis (ex : ISO 27001 pour ISMS) |

**Externe** : organismes tiers indépendants, requis pour conformité réglementaire ou certification. Objectif et non biaisé. **Interne** : équipe d'audit/sécurité interne. Vérifie conformité aux politiques internes, prépare les audits externes, identifie les problèmes tôt.

---

### 1.3.5 Privacy Regulations

| Réglementation | Portée | Points clés | Amendes |
|---------------|--------|-------------|---------|
| **GDPR** (EU, 2018) | Organisations dans l'UE ou ciblant des résidents UE | Data minimization, right to be forgotten, consentement explicite, notification breach 72h, DPO obligatoire, DPIA | Jusqu'à **EUR 20M ou 4% CA mondial** |
| **CCPA** (California, 2020) | Entreprises servant des résidents californiens | Right to know, right to delete, right to opt-out de la vente, right to non-discrimination | $2,500/violation, $7,500/violation intentionnelle. Consommateurs : $100-$750/personne |
| **LGPD** (Brésil, 2020) | Traitement de données d'individus au Brésil | Similaire au GDPR. Consentement, droits des individus, notification de breach, DPO obligatoire | Jusqu'à 2% du CA au Brésil, max 50M reais (~$10M) |
| **COPPA** (US, 1998) | Sites/services ciblant les enfants <13 ans | Consentement parental vérifiable, politique de confidentialité claire, minimisation données | Pénalités civiles FTC. Ex : Google/YouTube finés $170M |

---

### 1.3.6 Cross-Jurisdictional Compliance

| Concept | Description |
|---------|-------------|
| **E-discovery** | Identification, collecte et production d'ESI (Electronically Stored Information) pour procédures juridiques. GDPR limite l'export de données personnelles, ce qui peut conflictuer avec les demandes US |
| **Legal Holds** | Suspension de la suppression de données en anticipation d'un litige. Doit concilier rétention légale avec les limites de durée de rétention (CCPA, GDPR) |
| **Due Diligence** | Lors de M&A ou évaluations de tiers : vérifier la conformité avec les lois de toutes les juridictions impliquées. Évaluation proactive des risques |
| **Due Care** | Responsabilité de prendre des mesures raisonnables pour protéger données et systèmes. Standard de soin rehaussé par le multi-juridictionnel -- appliquer les contrôles les plus stricts parmi toutes les juridictions applicables |
| **Export Controls** | Contrôle du transfert de technologies sensibles, données crypto, matériaux dual-use. Lois : US **EAR/ITAR**, UK Export Control Act, EU **Dual-Use Regulation**. Enforcement par le BIS (Bureau of Industry and Security, US) |
| **Contractual Obligations** | Clauses reflétant les obligations légales multi-juridictionnelles : résidence des données, délais de notification de breach, transparence des sous-traitants, droit d'audit |

**Cas réel -- Meta (2023)** : amende record de EUR 1.2 milliard par le DPC irlandais pour transfert illégal de données Facebook EU vers les US. Les SCCs utilisées ne protégeaient pas adéquatement les données contre la surveillance gouvernementale américaine.

---
---

## OBJECTIF 1.4 -- Perform Threat-Modeling Activities

*Given a Scenario, Perform Threat-Modeling Activities*

### 1.4.1 Threat Actor Characteristics

#### Motivations (5 catégories CAS-005)

| Motivation | Description | Exemples |
|-----------|-------------|----------|
| **Financial** | Vol d'argent, fraude, extorsion, ransomware | Ryuk ransomware -- cible les organisations prêtes à payer de grosses sommes |
| **Geopolitical** | Avantages stratégiques nationaux, cyber espionnage, sabotage d'infrastructures | Attaque sur le réseau électrique ukrainien (2015) par des hackers russes (BlackEnergy) |
| **Activism (Hacktivism)** | Objectifs idéologiques/politiques, disruption, fuite d'informations pour influencer l'opinion | Anonymous -- opérations contre gouvernements et entreprises |
| **Notoriety** | Reconnaissance, statut dans la communauté hacker, démonstration de compétences | LulzSec -- attaques high-profile sur Sony et CIA "for the lulz" |
| **Espionage** | Vol de propriété intellectuelle, secrets commerciaux, avantage concurrentiel | APT1 (lié à l'armée chinoise) -- vol de PI chez de nombreuses entreprises occidentales |

Les motivations ne sont pas exclusives : un acteur peut combiner motivations financières et géopolitiques (ex : groupes ransomware sponsorisés par un État).

#### Resources

**Temps** : les nation-states peuvent planifier sur des mois/années avec reconnaissance extensive et développement d'outils custom. Les cybercriminels opportunistes agissent dans des délais courts.

**Finances** : déterminent la capacité à acheter des outils avancés, acquérir des zero-day sur le marché noir, embaucher des spécialistes. Exemple : **DarkSide** -- ransomware-as-a-service (RaaS), opération business avec service client et partage de revenus.

#### Capabilities

Niveau de connaissance technique déterminant la sophistication des attaques. Spectre allant du script kiddie (utilisation d'outils pré-fabriqués) aux APTs étatiques (exploitation supply chain, zero-day hoarding, malware custom, évasion de détection avancée).

**Exemples d'acteurs très capables** : **APT29 (Cozy Bear)** -- espionnage russe sophistiqué, compromission de SolarWinds. **Stuxnet** -- malware étatique US/israélien utilisant multiple zero-day pour saboter les centrifugeuses du programme nucléaire iranien.

#### Attack Patterns

Les patterns d'attaque décrivent les méthodes et stratégies utilisées par les acteurs de menace pour exploiter les vulnérabilités. L'analyse des patterns permet d'identifier les tactiques courantes et de développer des contre-mesures appropriées. Par exemple, observer une augmentation des attaques de phishing ciblant le secteur fintech permet d'implémenter des solutions de filtrage email avancées.

---

### 1.4.2 Threat Modeling Frameworks

#### MITRE ATT&CK

Taxonomie complète des TTPs (Tactics, Techniques, Procedures) des attaquants. Base de connaissance vivante et régulièrement mise à jour.

- **Tactics** (préfixe TA) = objectifs stratégiques -- le POURQUOI (ex : Reconnaissance, Lateral Movement)
- **Techniques** (préfixe T) = méthodes pour atteindre les objectifs -- le COMMENT (ex : Phishing T1566, Credential Dumping T1003)
- **Sub-techniques** = descriptions plus spécifiques d'une technique
- **Procedures** = étapes concrètes suivies par les attaquants (outils et commandes réels)

Fournit aussi des méthodes de détection et des mitigations pour chaque technique.

**14 Tactics MITRE ATT&CK** :

| Tactic (ID) | Description |
|-------------|-------------|
| **TA0043: Reconnaissance** | Collecte d'information sur la cible |
| **TA0042: Resource Development** | Préparation des ressources d'attaque (domaines, comptes, outils) |
| **TA0001: Initial Access** | Obtenir l'accès initial (Phishing, exploitation de services publics) |
| **TA0002: Execution** | Exécuter du code malveillant sur le système cible |
| **TA0003: Persistence** | Maintenir l'accès dans le temps (tâches planifiées, clés de registre) |
| **TA0004: Privilege Escalation** | Obtenir des privilèges plus élevés |
| **TA0005: Defense Evasion** | Éviter la détection par les outils de sécurité |
| **TA0006: Credential Access** | Voler des identifiants (Mimikatz, keyloggers) |
| **TA0007: Discovery** | Explorer l'environnement compromis |
| **TA0008: Lateral Movement** | Se déplacer entre les systèmes du réseau |
| **TA0009: Collection** | Collecter les données ciblées |
| **TA0011: Command & Control** | Communiquer avec les systèmes compromis (C2) |
| **TA0010: Exfiltration** | Exfiltrer les données hors du réseau |
| **TA0040: Impact** | Perturber/détruire systèmes et données (ransomware, wiper) |

#### CAPEC (Common Attack Pattern Enumeration and Classification)

Catalogue de patterns d'attaque communs maintenu par MITRE. Aide à prédire comment les systèmes pourraient être ciblés en décrivant les méthodes d'attaque de manière structurée.

Exemples : CAPEC-19 (Data Interception), CAPEC-62 (SQL Injection), CAPEC-137 (Cache Poisoning), CAPEC-160 (DoS), CAPEC-209 (XSS), CAPEC-310 (Privilege Escalation), CAPEC-438 (Phishing), CAPEC-559 (Malware Injection), CAPEC-616 (Social Engineering).

#### Cyber Kill Chain (Lockheed Martin)

Modèle linéaire en 7 étapes décrivant la progression d'une cyberattaque, de la reconnaissance à l'objectif final :

1. **Reconnaissance** -- Collecte d'information sur la cible (OSINT, scanning)
2. **Weaponization** -- Création de la charge malveillante (exploit + payload)
3. **Delivery** -- Transmission à la cible (email, USB, web)
4. **Exploitation** -- Déclenchement de la vulnérabilité
5. **Installation** -- Installation du malware ou de la backdoor
6. **Command & Control** -- Établissement du canal C2
7. **Actions on Objectives** -- Exécution de l'objectif final (exfiltration, destruction, ransomware)

**Valeur défensive** : permet de disrupter l'attaque à n'importe quelle étape. Exemple : si on détecte le phishing (delivery), on neutralise avant l'installation du malware.

#### Diamond Model of Intrusion Analysis

Analyse les relations entre 4 éléments fondamentaux d'une intrusion : **Adversary** (qui attaque) <-> **Infrastructure** (quels outils/serveurs) <-> **Victim** (qui est ciblé) <-> **Capabilities** (quelles compétences/techniques).

Permet de comprendre le contexte large d'une attaque et d'identifier des patterns pour prédire les menaces futures. S'enrichit avec le renseignement MITRE ATT&CK. Utile pour le pivot d'investigation (à partir d'un élément connu, déduire les autres).

#### STRIDE

Framework de threat modeling développé par Microsoft, catégorisant 6 types de menaces :

| Menace | Description | Mitigation |
|--------|-------------|-----------|
| **S - Spoofing** | Usurper l'identité d'un autre utilisateur ou système | MFA, protection des credentials, certificats |
| **T - Tampering** | Modifier données ou code sans autorisation | Integrity checks, signatures digitales, access controls |
| **R - Repudiation** | Actions qui ne peuvent être tracées à leur auteur | Logging, auditing, signatures digitales, timestamping |
| **I - Information Disclosure** | Exposer des informations à des parties non autorisées | Chiffrement at rest + in transit, least privilege |
| **D - Denial of Service** | Rendre un service indisponible | Rate limiting, throttling, DDoS protection, CDN |
| **E - Elevation of Privilege** | Obtenir des droits d'accès non autorisés | Least privilege, RBAC, patching, sandboxing |

#### OWASP Top 10

Les 10 risques de sécurité les plus critiques pour les applications web (mise à jour périodique) :

1. **Broken Access Control** -- Défaillance des restrictions d'accès
2. **Cryptographic Failures** -- Exposition de données sensibles par chiffrement faible ou absent
3. **Injection** -- SQL, NoSQL, OS command, LDAP injection
4. **Insecure Design** -- Failles de conception architecturale
5. **Security Misconfiguration** -- Configurations par défaut, permissives ou incomplètes
6. **Vulnerable & Outdated Components** -- Librairies et composants non patchés
7. **Identification & Authentication Failures** -- Authentification faible ou cassée
8. **Software & Data Integrity Failures** -- Absence de vérification d'intégrité (CI/CD, updates)
9. **Security Logging & Monitoring Failures** -- Détection et réponse insuffisantes
10. **SSRF (Server-Side Request Forgery)** -- Le serveur est trompé pour faire des requêtes non autorisées

---

### 1.4.3 Attack Surface Determination

| Composant | Description |
|-----------|-------------|
| **Architecture Reviews** | Évaluation structurée du design, infrastructure, contrôles. Examiner topologie réseau, dépendances, modèles d'authentification, stockage, intégrations tiers |
| **Data Flows** | Analyser comment les données circulent dans et hors de l'organisation. Identifier où les données sensibles peuvent être exposées ou interceptées |
| **Trust Boundaries** | Lignes de démarcation entre niveaux de confiance différents. Identifier où des contrôles supplémentaires sont nécessaires (ex : frontière réseau interne/externe, API gateway) |
| **Code Reviews** | Revue du code source pour détecter SQL injection, XSS, buffer overflows avant exploitation. Peut être manuelle ou automatisée (SAST/DAST) |
| **User Factors** | Comportement utilisateurs, patterns d'accès. Identifier insider threats ou abus de privilèges. Outils : UEBA (User & Entity Behavior Analytics) |
| **Organizational Changes** | **Mergers** (intégration systèmes hétérogènes, legacy tech), **Acquisitions** (héritage de la posture sécurité de la cible), **Divestitures** (séparation IT, risque d'accès résiduel), **Staffing changes** (onboarding/offboarding, rotation, insider threats) |

#### Attack Surface Categories

**Internal assets** : bases de données internes, intranets, serveurs de fichiers. **External assets** : sites web publics, serveurs email, VPN gateways. **Third-party connections** : accès réseau/données des partenaires et fournisseurs. **Unsanctioned assets/accounts** : shadow IT, appareils et comptes non approuvés. **Cloud service discovery** : inventaire des services cloud, détection du shadow IT cloud. **Public digital presence** : sites web, réseaux sociaux, forums, code repos publics.

#### Enumeration/Discovery Tools

**Nmap/Zenmap** -- Scan réseau, découverte ports/services. **Nessus** -- Scanner vulnérabilités. **OpenVAS** -- Scanner open source. **Shodan** -- Moteur de recherche appareils connectés exposés. **Metasploit** -- Plateforme pentest. **SecurityScorecard / RiskRecon** -- Rating et gestion du risque cyber tiers. **Darktrace** -- Détection par IA en temps réel. **Azure Security Center / Google SCC** -- Gestion sécurité cloud native. **Recorded Future** -- Threat intelligence. **Maltego** -- OSINT et link analysis.

---

### 1.4.4 Methods for Identifying Threats

**Abuse Cases** -- Scénarios structurés montrant comment un attaquant pourrait mal utiliser un système (opposé des use cases fonctionnels). Couvrent différents vecteurs : accès non autorisé, breach, DoS. Utilisés pour concevoir les contrôles de sécurité dès la phase de design.

**Antipatterns** -- Pratiques courantes mais contre-productives en sécurité. Exemples : supposer que le périmètre est sécurisé (Assuming Perimeter Is Secure), se concentrer uniquement sur les contrôles techniques (Over-Focus on Technical Controls Only), modélisation dirigée par les outils sans compréhension (Tool-Driven Modeling), threat modeling unique et non itératif (One-Time Threat Modeling), surestimer les menaces à faible probabilité (Overestimating Low-Likelihood Threats), ignorer le comportement adversaire (Ignoring Adversary Behavior), ne pas impliquer les bonnes parties prenantes (Not Involving the Right Stakeholders).

**Attack Trees** -- Représentation hiérarchique (arbre) des chemins d'attaque possibles. Le noeud racine (root node) = objectif de l'attaquant. Les branches = tactiques et sous-objectifs. Pas de cycles, pas de réutilisation de noeuds. Idéal pour la planification haut niveau et le scoring de risque.

**Attack Graphs** -- Représentation en réseau (graphe) des chemins d'attaque. Supporte les cycles et la réutilisation de noeuds (un même système peut être traversé plusieurs fois). Idéal pour l'analyse détaillée, la simulation de mouvement latéral et l'analyse d'attaque réseau.

**Différence clé** : Attack Trees = hiérarchiques, sans cycles, vue haut niveau. Attack Graphs = maillés, avec cycles, vue détaillée des chemins réels.

#### Modeling Applicability of Threats

**With existing system** -- Focus sur la sélection des contrôles appropriés pour adresser les vulnérabilités identifiées dans l'infrastructure existante. Exemple : une banque identifie que son MFA est vulnérable au phishing -> implémente un MFA adaptatif basé sur le risque.

**Without existing system** -- Identifier les risques potentiels et incorporer les contrôles de sécurité dès la conception (security by design). Exemple : une start-up IoT implémente le chiffrement de bout en bout et le secure boot dès la phase de design du produit.

---
---

## OBJECTIF 1.5 -- AI Adoption Security Challenges

*Summarize the Information Security Challenges Associated with AI Adoption*

### 1.5.1 Legal & Privacy Implications

L'IA nécessite de gros volumes de données d'entraînement, créant des risques de conformité avec GDPR, CCPA, HIPAA. Problèmes : collecte de PII sans consentement éclairé, difficulté du data minimization (les modèles performent mieux avec plus de données), données historiques difficilement effaçables ou anonymisables (right to be forgotten vs modèle déjà entraîné). La responsabilité légale reste ambiguë (développeur, déployeur ou utilisateur final ?). Risques de biais algorithmique et discrimination systémique.

**Potential Misuse** -- IA pour créer du contenu trompeur (deepfakes), désinformation à grande échelle, manipulation des marchés financiers par trading algorithmique malveillant. Contrer avec des outils de détection de deepfakes et des réglementations émergentes.

**Explainable vs Non-Explainable** -- **XAI (Explainable AI)** = transparence sur le processus décisionnel, auditabilité des résultats. **Black box** (deep neural networks) = modèle opaque dont les décisions ne sont pas interprétables. Les secteurs critiques (santé, finance, justice) nécessitent l'explicabilité pour conformité réglementaire et confiance des utilisateurs. Solution : utiliser des decision-tree models ou des méthodes d'interprétabilité post-hoc (LIME, SHAP) pour les cas nécessitant une haute explicabilité.

**Organizational AI Policies** -- Politiques claires et formalisées sur : conditions de déploiement de l'IA, collecte et utilisation des données, gestion du consentement, audit régulier des modèles, procédures de retrait en cas de biais. Cas réel : Amazon a dû retirer son outil de recrutement IA après découverte d'un biais systémique contre les candidates féminines.

**Ethical Governance** -- Principes **FAT : Fairness, Accountability, Transparency**. Comités d'éthique IA dédiés, mécanismes proactifs de détection de biais (bias testing sur des populations diverses), oversight humain systématique pour les décisions à fort impact. Audits réguliers par des experts externes indépendants.

---

### 1.5.2 Threats to the AI Model

| Menace | Description | Mitigation |
|--------|-------------|-----------|
| **Prompt Injection** | Input malveillant qui trompe un NLP model pour exécuter des commandes non prévues ou divulguer des informations sensibles (jailbreaking) | Validation et sanitization d'input rigoureuses, prompt filtering |
| **Unsecured Output Handling** | Outputs IA non nettoyés contenant info sensible, contenu offensant, ou code exploitable | Post-processing checks, filtres automatisés avant utilisation, output validation |
| **Training Data Poisoning** | Manipulation des données d'entraînement pour introduire des biais, des backdoors ou des vulnérabilités dans le modèle | Validation des données, sources multiples et vérifiées, détection d'anomalies statistiques |
| **Model DoS** | Submerger le modèle avec des requêtes excessives ou malformées pour provoquer crash, dégradation ou indisponibilité | Rate limiting, input validation, resource monitoring, auto-scaling |
| **Supply Chain Vulnerabilities** | Composants tiers compromis : bibliothèques ML, datasets pré-entraînés, hardware spécialisé | Vendeurs de confiance, audits réguliers, code signing, vérification d'intégrité des modèles |
| **Model Theft (Model Extraction)** | Duplication du modèle par queries multiples et observation systématique des outputs pour recréer la logique | Query rate limiting, ajout de bruit aux outputs, watermarking du modèle, monitoring des patterns d'accès |
| **Model Inversion** | Reverse-engineering des données d'entraînement à partir des outputs du modèle, exposant des données sensibles | **Differential privacy** (ajout de bruit statistique), limitation de la granularité des outputs |

---

### 1.5.3 AI-Enabled Attacks

| Attaque | Description | Mitigation |
|---------|-------------|-----------|
| **Unsecured Plugin Design** | Plugins IA mal sécurisés créant des vulnérabilités (injection code, accès non autorisé via CRM/CMS connectés) | Évaluations de sécurité des plugins, mises à jour régulières, code reviews, sandboxing |
| **Deepfakes (Digital Media)** | Vidéos/images/voix faux ultra-réalistes via GANs. Désinformation, fraude identitaire, diffamation, chantage | Modèles de détection de deepfakes, watermarking digital (ex : **Google SynthID**), formation à la vérification |
| **Deepfakes (Interactivity)** | Deepfakes en temps réel dans vidéoconférences, bypass de l'authentification biométrique faciale/vocale. +700% de tentatives de fraude deepfake en 2024 | Détection d'incohérences faciales/lip-sync/artefacts vocaux, liveness detection |
| **AI Pipeline Injection** | Injection de données ou code malveillant dans le pipeline d'entraînement ou d'inférence IA | Validation/sanitization des données à chaque étape, audits réguliers des datasets et outputs |
| **Social Engineering** | IA pour créer des profils synthétiques réalistes, personnaliser le spear-phishing à grande échelle, automatiser les interactions trompeuses | MFA, formation régulière des employés, outils de détection de contenu généré par IA |
| **Automated Exploit Generation** | IA qui découvre automatiquement les vulnérabilités et génère les exploits plus rapidement qu'un humain | Monitoring continu, patching rapide, outils de sécurité IA-based défensifs, bug bounty programs |

---

### 1.5.4 Risks of AI Usage

| Risque | Description | Mitigation |
|--------|-------------|-----------|
| **Overreliance on AI** | Dépendance excessive créant un faux sentiment de sécurité. L'IA peut échouer sur des patterns d'attaque nouveaux ou des cas edge | Approche hybride : IA + jugement humain. Les analystes vérifient les alertes critiques |
| **Sensitive Info Disclosure TO the Model** | Données sensibles fournies au modèle sans protection adéquate, risque d'exposition ou de mémorisation | Anonymisation, chiffrement avant utilisation, contrôles d'accès robustes, politiques de data handling |
| **Sensitive Info Disclosure FROM the Model** | Le modèle mémorise/overfit les données d'entraînement et peut divulguer des infos sensibles dans ses outputs (model inversion). Cas : GitHub Copilot leaking secrets | **Differential privacy**, tests de fuite rigoureux, Copilot Secret Scanning |
| **Excessive Agency** | Trop d'autonomie sans oversight humain, décisions non alignées avec les valeurs ou l'éthique organisationnelle. Cas : IA qui auto-prescrit des médicaments sans revue d'un médecin | Feedback loops, revue humaine régulière, guidelines éthiques claires, **Partnership on AI (PAI)** |

---

### 1.5.5 AI-Enabled Assistants / Digital Workers

**Access / Permissions** -- Les assistants IA nécessitent des niveaux d'accès variés aux systèmes et données. Risque majeur si pas correctement géré. Implémenter **RBAC**, principe du moindre privilège, audits réguliers des permissions accordées aux agents IA.

**Guardrails (Garde-fous)** -- Politiques et mesures techniques pour que l'IA opère dans des limites prédéfinies :

| Type de guardrail | Exemple |
|------------------|---------|
| **Access control** | Limiter l'accès aux données ou systèmes (ex : read-only, pas d'écriture en base) |
| **Prompt filtering** | Bloquer les prompts dangereux ou manipulatifs (jailbreak attempts, profanité) |
| **Response filtering** | Empêcher la sortie de réponses toxiques, biaisées ou juridiquement risquées |
| **Behavioral boundaries** | Définir ce que l'IA peut ou ne peut pas faire (pas d'achats auto, pas de conseil juridique) |
| **Rate limiting** | Prévenir l'exécution rapide et répétée de commandes sensibles |
| **Audit logging** | Tracer tous les inputs, outputs et décisions pour transparence et responsabilité |
| **Human oversight** | Approbation manuelle requise avant toute action critique |

**HITL (Human-in-the-Loop)** -- Oversight humain obligatoire pour les décisions à haut risque. Les outputs incertains sont flaggés, les décisions critiques sont escaladées vers des superviseurs humains avant exécution. Essentiel dans les domaines réglementés (santé, finance, juridique).

**Data Loss Prevention (DLP)** -- Surveiller et contrôler les transferts de données traités par l'IA. Chiffrer ou rédiger automatiquement les informations sensibles (PII, données financières, propriété intellectuelle) avant traitement par le modèle. Outils : Symantec DLP, Microsoft Purview.

**Disclosure of AI Usage** -- Transparence obligatoire : les utilisateurs doivent savoir quand ils interagissent avec une IA, quelles données sont collectées et comment elles sont utilisées. Disclaimers clairs et mécanismes d'opt-in.

**Référence NIST** : **NIST AI 600-1** -- Artificial Intelligence Risk Management Framework. Guide complet pour identifier et gérer les risques liés au déploiement de l'IA en entreprise.

---
---

## MNEMONIQUES ET AIDE-MEMOIRE

**Documentation hierarchy** : Policies (QUOI) > Standards (benchmarks) > Procedures (COMMENT) > Guidelines (recommandations)

**RACI** : Responsible (exécute) / Accountable (responsable ultime, 1 seul) / Consulted (avis) / Informed (notifié)

**5 domaines COBIT** : EDM (Evaluate, Direct, Monitor) / APO (Align, Plan, Organize) / BAI (Build, Acquire, Implement) / DSS (Deliver, Service, Support) / MEA (Monitor, Evaluate, Assess)

**Maturité COBIT** : 0-Incomplete / 1-Initial / 2-Repeatable / 3-Defined / 4-Managed / 5-Optimized

**5 étapes ITIL** : Service Strategy > Service Design > Service Transition > Service Operation > CSI

**8 étapes Change Management** : RFC > Evaluate > Approve > Plan > Test > Implement > Review > Close

**Data Life Cycle** : Create > Store > Use > Share > Archive > Destroy

**Formules quantitatives** : SLE = AV x EF / ALE = SLE x ARO

**RPO vs RTO** : RPO = données perdues (regarde en arrière) / RTO = temps de restauration (regarde en avant)

**7 étapes NIST RMF** : Prepare > Categorize > Select > Implement > Assess > Authorize > Monitor

**5 fonctions NIST CSF** : Identify > Protect > Detect > Respond > Recover

**6 étapes Breach Response** : Detect > Contain > Eradicate > Recover > Notify > Post-Analysis

**STRIDE** : Spoofing / Tampering / Repudiation / Information Disclosure / Denial of Service / Elevation of Privilege

**Cyber Kill Chain** : Reconnaissance > Weaponization > Delivery > Exploitation > Installation > C2 > Actions on Objectives

**Diamond Model** : Adversary <-> Infrastructure <-> Victim <-> Capabilities

**Attack Trees vs Attack Graphs** : Trees = hiérarchiques, sans cycles / Graphs = maillés, avec cycles

**SOC 2 Trust Services** : Security / Availability / Processing Integrity / Confidentiality / Privacy

**Ethical AI (FAT)** : Fairness / Accountability / Transparency

**AI Threats** : Prompt Injection / Unsecured Output / Data Poisoning / Model DoS / Supply Chain / Model Theft / Model Inversion

**Modeling applicability** : With existing system = sélection de contrôles / Without = security by design

**Risk Appetite vs Risk Tolerance** : Appetite = stratégique, global / Tolerance = opérationnel, par risque

**Due Diligence vs Due Care** : Diligence = évaluation proactive / Care = actions raisonnables de protection